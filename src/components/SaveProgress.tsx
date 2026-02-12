"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase-config";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function HeaderAvatar() {
  const { user, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!isFirebaseConfigured() || loading || !user) return null;

  const handleSignOut = async () => {
    setMenuOpen(false);
    setBusy(true);
    try {
      await signOut();
    } catch {
      // handled in AuthContext
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        disabled={busy}
        className="relative disabled:opacity-50"
      >
        {user.photoURL ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.photoURL}
            alt=""
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 text-sm font-medium">
            {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
            <Spinner />
          </div>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-warm-100 py-2 z-50">
          <div className="px-3 py-2 border-b border-warm-100">
            <p className="text-sm font-medium text-stone-700 truncate">
              {user.displayName || "Signed in"}
            </p>
            {user.email && (
              <p className="text-xs text-stone-400 truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-stone-500 hover:bg-warm-50 hover:text-stone-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function HeaderSignIn() {
  const { user, loading, signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!isFirebaseConfigured() || loading || user) return null;

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signIn();
    } catch {
      // handled in AuthContext
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={busy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] text-stone-500 border border-warm-200 hover:border-warm-300 hover:text-stone-700 transition-colors disabled:opacity-50"
    >
      {busy ? (
        <Spinner />
      ) : (
        <>
          <GoogleIcon />
          <span>Save progress</span>
        </>
      )}
    </button>
  );
}
