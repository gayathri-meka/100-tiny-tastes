"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { saveLogs } from "@/lib/storage";

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
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearData = async () => {
    if (!user || clearing) return;
    setClearing(true);
    try {
      const { clearCloudLogs } = await import("@/lib/firestore");
      await clearCloudLogs(user.uid);
      saveLogs([]);
      window.dispatchEvent(new Event("logs-updated"));
    } catch {
      // Will retry on next attempt
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  if (!isFirebaseConfigured() || loading) return null;

  if (user) {
    return (
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-3 px-4 py-3 bg-sage-50 rounded-xl border border-sage-200 text-sm">
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
            onClick={signOut}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors shrink-0"
          >
            Sign out
          </button>
        </div>
        {confirmClear ? (
          <div className="flex items-center justify-between px-4 py-2.5 bg-red-50 rounded-xl border border-red-200 text-sm">
            <span className="text-red-700 text-xs">Clear all taste logs?</span>
            <div className="flex gap-2">
              <button
                onClick={handleClearData}
                disabled={clearing}
                className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg"
              >
                {clearing ? "Clearing..." : "Yes, clear"}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs px-3 py-1 bg-stone-200 text-stone-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-stone-400 hover:text-red-400 transition-colors px-4"
          >
            Clear all data
          </button>
        )}
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
