"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { getLogs, saveLogs } from "@/lib/storage";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function SaveProgress() {
  const { user, loading, signIn, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    try {
      const { fetchCloudLogs, pushLogToCloud } = await import("@/lib/firestore");
      const cloudLogs = await fetchCloudLogs(user.uid);
      const localLogs = getLogs();

      // Merge: keep all cloud logs + any local-only logs
      const cloudIds = new Set(cloudLogs.map((l) => l.id));
      const localOnly = localLogs.filter((l) => !cloudIds.has(l.id));
      saveLogs([...cloudLogs, ...localOnly]);

      // Push local-only logs to cloud
      for (const log of localOnly) {
        await pushLogToCloud(user.uid, log).catch(() => {});
      }

      window.dispatchEvent(new Event("logs-updated"));
    } catch {
      // Sync failed silently — real-time listener will catch up
    } finally {
      setSyncing(false);
    }
  };

  if (!isFirebaseConfigured() || loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 text-sm mb-5">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sage-700">
            Signed in{user.displayName ? ` as ${user.displayName}` : user.email ? ` as ${user.email}` : ""}
          </span>
          <p className="text-xs text-sage-500">Progress saved to Google</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="text-stone-400 hover:text-sage-600 transition-colors shrink-0 p-1"
          aria-label="Sync now"
        >
          <svg
            className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={signOut}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors shrink-0"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-200 hover:border-warm-300 text-sm text-stone-600 hover:text-stone-800 transition-colors mb-5"
    >
      <GoogleIcon />
      Sign in with Google to save your progress
    </button>
  );
}
