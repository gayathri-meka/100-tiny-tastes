"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase-config";

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

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function SettingsPage() {
  const { user, loading, familyId, signIn, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create family state
  const [newBabyName, setNewBabyName] = useState("");

  // Join family state
  const [joinCode, setJoinCode] = useState("");

  // In-family state
  const [familyInfo, setFamilyInfo] = useState<{
    code: string;
    memberCount: number;
    babyName: string | null;
  } | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [infoLoaded, setInfoLoaded] = useState(false);

  // Load family info when in a family
  if (familyId && !infoLoaded) {
    setInfoLoaded(true);
    import("@/lib/family").then(({ getFamilyInfo }) => {
      getFamilyInfo(familyId).then((info) => {
        if (info) {
          setFamilyInfo(info);
          setEditingName(info.babyName || "");
        }
      });
    });
  }

  // Reset info when family changes
  if (!familyId && infoLoaded) {
    setInfoLoaded(false);
    setFamilyInfo(null);
  }

  if (!isFirebaseConfigured() || loading) return null;

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn();
    } catch {
      // handled in AuthContext
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const { createFamily } = await import("@/lib/family");
      const { migrateLogsToCloud } = await import("@/lib/firestore");
      const { getLogs } = await import("@/lib/storage");

      const { familyId: newFamilyId, code } = await createFamily(
        user.uid,
        newBabyName.trim() || undefined
      );

      // Migrate existing logs to family collection
      const localLogs = getLogs();
      if (localLogs.length > 0) {
        await migrateLogsToCloud(user.uid, localLogs, newFamilyId);
      }

      setFamilyInfo({
        code,
        memberCount: 1,
        babyName: newBabyName.trim() || null,
      });
      setEditingName(newBabyName.trim());
      setNewBabyName("");

      window.dispatchEvent(new Event("family-changed"));
    } catch (err) {
      console.error("Create family failed:", err);
      setError("Failed to create family. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!user || !joinCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { lookupFamilyByCode, joinFamily, getFamilyInfo } = await import("@/lib/family");
      const { migrateLogsToCloud } = await import("@/lib/firestore");
      const { getLogs } = await import("@/lib/storage");

      const foundFamilyId = await lookupFamilyByCode(joinCode.trim());
      if (!foundFamilyId) {
        setError("Invalid family code. Please check and try again.");
        setBusy(false);
        return;
      }

      await joinFamily(user.uid, foundFamilyId);

      // Migrate existing logs to family collection
      const localLogs = getLogs();
      if (localLogs.length > 0) {
        await migrateLogsToCloud(user.uid, localLogs, foundFamilyId);
      }

      const info = await getFamilyInfo(foundFamilyId);
      if (info) {
        setFamilyInfo(info);
        setEditingName(info.babyName || "");
      }
      setJoinCode("");

      window.dispatchEvent(new Event("family-changed"));
    } catch (err) {
      console.error("Join family failed:", err);
      setError("Failed to join family. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveFamily = async () => {
    if (!user || !familyId) return;
    setBusy(true);
    setError(null);
    try {
      const { leaveFamily } = await import("@/lib/family");
      const { saveLogs } = await import("@/lib/storage");

      await leaveFamily(user.uid, familyId);

      // Clear local data when leaving family
      saveLogs([]);
      window.dispatchEvent(new Event("logs-updated"));

      setShowLeaveConfirm(false);
      setFamilyInfo(null);

      window.dispatchEvent(new Event("family-changed"));
    } catch (err) {
      console.error("Leave family failed:", err);
      setError("Failed to leave family. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateBabyName = async () => {
    if (!familyId || !editingName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { updateBabyName } = await import("@/lib/family");
      await updateBabyName(familyId, editingName.trim());
      setFamilyInfo((prev) =>
        prev ? { ...prev, babyName: editingName.trim() } : prev
      );
      window.dispatchEvent(new Event("family-changed"));
    } catch (err) {
      console.error("Update baby name failed:", err);
      setError("Failed to update baby name. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = async () => {
    if (!familyInfo) return;
    try {
      await navigator.clipboard.writeText(familyInfo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  // State 1: Not signed in
  if (!user) {
    return (
      <div className="px-4 pt-6 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-100 text-center">
          <p className="text-sm text-stone-500 mb-4">
            Sign in to create or join a family and share your baby&apos;s food log.
          </p>
          <button
            onClick={handleSignIn}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-200 hover:border-warm-300 text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
          >
            {busy ? <Spinner /> : <GoogleIcon />}
            {busy ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    );
  }

  // State 3: In a family
  if (familyId && familyInfo) {
    return (
      <div className="px-4 pt-6 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Baby Name */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Baby&apos;s name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Enter baby's name"
              className="flex-1 px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300"
            />
            <button
              onClick={handleUpdateBabyName}
              disabled={busy || !editingName.trim() || editingName.trim() === (familyInfo.babyName || "")}
              className="px-4 py-2 bg-warm-500 text-white text-sm font-medium rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        {/* Family Code */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Family code
          </label>
          <p className="text-xs text-stone-400 mb-3">
            Share this code with family members so they can join.
          </p>
          <button
            onClick={handleCopyCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-warm-50 border border-warm-200 rounded-lg hover:bg-warm-100 transition-colors"
          >
            <span className="text-2xl font-mono font-bold text-warm-700 tracking-[0.3em]">
              {familyInfo.code}
            </span>
            <svg className="w-5 h-5 text-warm-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
          {copied && (
            <p className="text-xs text-sage-600 text-center mt-2">Copied!</p>
          )}
        </div>

        {/* Member Count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Family members</span>
            <span className="text-sm font-semibold text-warm-700">
              {familyInfo.memberCount}
            </span>
          </div>
        </div>

        {/* Leave Family */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
          {!showLeaveConfirm ? (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full text-sm text-red-500 hover:text-red-700 transition-colors py-1"
            >
              Leave family
            </button>
          ) : (
            <div>
              <p className="text-sm text-stone-600 mb-3">
                Are you sure? Your local data will be cleared.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleLeaveFamily}
                  disabled={busy}
                  className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {busy ? "Leaving..." : "Leave"}
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={busy}
                  className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            setBusy(true);
            try { await signOut(); } catch {} finally { setBusy(false); }
          }}
          disabled={busy}
          className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  // State 2: Signed in, no family
  return (
    <div className="px-4 pt-6 pb-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Create a Family */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">
          Create a family
        </h2>
        <p className="text-xs text-stone-400 mb-3">
          Start a shared food log. You&apos;ll get a code to invite family members.
        </p>
        <input
          type="text"
          value={newBabyName}
          onChange={(e) => setNewBabyName(e.target.value)}
          placeholder="Baby's name (optional)"
          className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 mb-3"
        />
        <button
          onClick={handleCreateFamily}
          disabled={busy}
          className="w-full px-4 py-2.5 bg-warm-500 text-white text-sm font-medium rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50"
        >
          {busy ? "Creating..." : "Create a family"}
        </button>
      </div>

      {/* Join a Family */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">
          Join a family
        </h2>
        <p className="text-xs text-stone-400 mb-3">
          Enter the 6-character code shared by a family member.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ABC123"
            maxLength={6}
            className="flex-1 px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 font-mono tracking-wider text-center uppercase"
          />
          <button
            onClick={handleJoinFamily}
            disabled={busy || joinCode.trim().length !== 6}
            className="px-4 py-2 bg-warm-500 text-white text-sm font-medium rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50"
          >
            {busy ? "Joining..." : "Join"}
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={async () => {
          setBusy(true);
          try { await signOut(); } catch {} finally { setBusy(false); }
        }}
        disabled={busy}
        className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-2"
      >
        Sign out
      </button>
    </div>
  );
}
