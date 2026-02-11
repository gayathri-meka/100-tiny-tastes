"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { getLogs, saveLogs, setCloudMode } from "@/lib/storage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);

        // Clean up previous snapshot listener on auth state change
        unsubscribeSnapshot?.();
        unsubscribeSnapshot = undefined;

        if (firebaseUser) {
          setCloudMode(firebaseUser.uid);
          import("@/lib/firestore").then(({ migrateLogsToCloud, subscribeToCloudLogs }) => {
            const localLogs = getLogs();
            return migrateLogsToCloud(firebaseUser.uid, localLogs).then((merged) => {
              // Re-read local logs to capture any added during async migration
              const currentLocal = getLogs();
              const mergedIds = new Set(merged.map((l) => l.id));
              const addedDuringMigration = currentLocal.filter((l) => !mergedIds.has(l.id));
              const finalLogs = [...merged, ...addedDuringMigration];
              saveLogs(finalLogs);
              window.dispatchEvent(new Event("logs-updated"));

              // Push any logs added during migration to cloud
              for (const log of addedDuringMigration) {
                import("@/lib/firestore").then(({ pushLogToCloud }) => {
                  pushLogToCloud(firebaseUser.uid, log).catch(() => {});
                });
              }

              // Subscribe to real-time cloud changes for cross-device sync
              unsubscribeSnapshot = subscribeToCloudLogs(firebaseUser.uid, (cloudLogs) => {
                const cloudIds = new Set(cloudLogs.map((l) => l.id));
                const localOnly = getLogs().filter((l) => !cloudIds.has(l.id));
                saveLogs([...cloudLogs, ...localOnly]);
                window.dispatchEvent(new Event("logs-updated"));
              });
            });
          }).catch(() => {
            // Cloud sync failed — continue with local data
          });
        } else {
          setCloudMode(null);
        }
      });
    }).catch(() => {
      // Firebase failed to load — fall back to local-only
      setLoading(false);
    });

    return () => {
      unsubscribe?.();
      unsubscribeSnapshot?.();
    };
  }, []);

  const signIn = useCallback(async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      // User closing the popup is not an error
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
      await firebaseSignOut(auth);
    } catch (error) {
      // Still clear cloud mode even if sign-out fails
      setCloudMode(null);
      console.error("Sign-out failed:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
