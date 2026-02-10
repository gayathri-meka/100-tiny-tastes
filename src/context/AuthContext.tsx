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

    Promise.all([
      import("@/lib/firebase"),
      import("firebase/auth"),
    ]).then(([{ getFirebaseAuth }, { onAuthStateChanged }]) => {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setLoading(false);

        if (firebaseUser) {
          // Migrate local logs to cloud in background (non-blocking)
          setCloudMode(firebaseUser.uid);
          import("@/lib/firestore").then(({ migrateLogsToCloud }) => {
            const localLogs = getLogs();
            return migrateLogsToCloud(firebaseUser.uid, localLogs);
          }).then((merged) => {
            saveLogs(merged);
            window.dispatchEvent(new Event("logs-updated"));
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
    };
  }, []);

  const signIn = useCallback(async () => {
    const { getFirebaseAuth } = await import("@/lib/firebase");
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(async () => {
    const { getFirebaseAuth } = await import("@/lib/firebase");
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    const auth = getFirebaseAuth();
    setCloudMode(null);
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
