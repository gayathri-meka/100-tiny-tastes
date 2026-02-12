"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { getLogs, saveLogs, setCloudMode, isPendingPush, isPendingDelete, completePendingPush } from "@/lib/storage";
import { setFamilyId as storeFamilyId, getFamilyId as readFamilyId, setBabyName as storeBabyName } from "@/lib/family";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  familyId: string | null;
  babyName: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  familyId: null,
  babyName: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [babyName, setBabyName] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);

  // Helper to set up cloud sync (migrate + subscribe) for a given familyId
  const setupCloudSync = useCallback(
    (
      firebaseUser: User,
      fId: string | null,
      setUnsub: (fn: (() => void) | undefined) => void
    ) => {
      import("@/lib/firestore").then(({ migrateLogsToCloud, subscribeToCloudLogs }) => {
        const localLogs = getLogs();
        return migrateLogsToCloud(firebaseUser.uid, localLogs, fId).then((merged) => {
          const currentLocal = getLogs();
          const mergedIds = new Set(merged.map((l) => l.id));
          const addedDuringMigration = currentLocal.filter((l) => !mergedIds.has(l.id));
          const finalLogs = [...merged, ...addedDuringMigration];
          saveLogs(finalLogs);
          window.dispatchEvent(new Event("logs-updated"));

          for (const log of addedDuringMigration) {
            import("@/lib/firestore").then(({ pushLogToCloud }) => {
              pushLogToCloud(firebaseUser.uid, log, fId).catch(() => {});
            });
          }

          const unsub = subscribeToCloudLogs(firebaseUser.uid, (cloudLogs) => {
            const cloudIds = new Set(cloudLogs.map((l) => l.id));
            const localPending = getLogs().filter(
              (l) => !cloudIds.has(l.id) && isPendingPush(l.id)
            );
            const activeLogs = cloudLogs.filter((l) => !isPendingDelete(l.id));
            saveLogs([...activeLogs, ...localPending]);
            window.dispatchEvent(new Event("logs-updated"));

            if (localPending.length > 0) {
              import("@/lib/firestore").then(({ pushLogToCloud }) => {
                for (const log of localPending) {
                  pushLogToCloud(firebaseUser.uid, log, fId)
                    .then(() => completePendingPush(log.id))
                    .catch(() => {});
                }
              });
            }
          }, fId);
          setUnsub(unsub);
        });
      }).catch(() => {});
    },
    []
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let unsubscribeSnapshot: (() => void) | undefined;

    Promise.all([
      import("@/lib/firebase"),
      import("firebase/auth"),
    ]).then(([{ getFirebaseAuth }, { onAuthStateChanged }]) => {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        setUser(firebaseUser);
        userRef.current = firebaseUser;
        setLoading(false);

        unsubscribeSnapshot?.();
        unsubscribeSnapshot = undefined;

        if (firebaseUser) {
          setCloudMode(firebaseUser.uid);

          // Check if user belongs to a family
          import("@/lib/family").then(({ fetchUserFamilyId, getFamilyInfo }) => {
            fetchUserFamilyId(firebaseUser.uid).then((fId) => {
              if (fId) {
                storeFamilyId(fId);
                setFamilyId(fId);
                getFamilyInfo(fId).then((info) => {
                  if (info?.babyName) {
                    storeBabyName(info.babyName);
                    setBabyName(info.babyName);
                  }
                }).catch(() => {});
              } else {
                storeFamilyId(null);
                setFamilyId(null);
                storeBabyName(null);
                setBabyName(null);
              }

              setupCloudSync(firebaseUser, fId, (fn) => {
                unsubscribeSnapshot = fn;
              });
            }).catch(() => {
              // Failed to fetch family — continue with personal mode
              setupCloudSync(firebaseUser, null, (fn) => {
                unsubscribeSnapshot = fn;
              });
            });
          });
        } else {
          setCloudMode(null);
          storeFamilyId(null);
          setFamilyId(null);
          storeBabyName(null);
          setBabyName(null);
        }
      });
    }).catch(() => {
      setLoading(false);
    });

    // Listen for family-changed events from Settings page
    const handleFamilyChanged = () => {
      const newFamilyId = readFamilyId();
      setFamilyId(newFamilyId);

      // Update baby name from localStorage
      import("@/lib/family").then(({ getBabyName }) => {
        setBabyName(getBabyName());
      });

      // Re-subscribe to the correct collection
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = undefined;

      if (userRef.current) {
        setupCloudSync(userRef.current, newFamilyId, (fn) => {
          unsubscribeSnapshot = fn;
        });
      }
    };

    window.addEventListener("family-changed", handleFamilyChanged);

    return () => {
      unsubscribe?.();
      unsubscribeSnapshot?.();
      window.removeEventListener("family-changed", handleFamilyChanged);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "auth/popup-closed-by-user"
      ) {
        return;
      }
      console.error("Sign-in failed:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const { signOut: firebaseSignOut } = await import("firebase/auth");
      const auth = getFirebaseAuth();
      setCloudMode(null);
      storeFamilyId(null);
      setFamilyId(null);
      storeBabyName(null);
      setBabyName(null);
      await firebaseSignOut(auth);
    } catch (error) {
      setCloudMode(null);
      storeFamilyId(null);
      setFamilyId(null);
      storeBabyName(null);
      setBabyName(null);
      console.error("Sign-out failed:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, familyId, babyName, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
