"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { FoodCategory, CustomFood } from "@/lib/types";
import { foods, categoryLabels, categoryOrder } from "@/lib/foods";
import {
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
} from "@/lib/custom-foods";
import { generateId } from "@/lib/storage";

const HIDDEN_FOODS_KEY = "tiny-tastes-hidden-foods";

function getHiddenFoodIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(HIDDEN_FOODS_KEY);
  if (!raw) return new Set();
  try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
}

function saveHiddenFoodIds(ids: Set<string>): void {
  localStorage.setItem(HIDDEN_FOODS_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event("custom-foods-updated"));
}

// --- Shared UI ---

const FOOD_EMOJIS = [
  "\u{1F34E}", "\u{1F34F}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F347}", "\u{1F353}", "\u{1FAD0}",
  "\u{1F352}", "\u{1F351}", "\u{1F34D}", "\u{1F965}", "\u{1F95D}", "\u{1F345}", "\u{1F346}", "\u{1F955}",
  "\u{1F33D}", "\u{1F336}", "\u{1FAD1}", "\u{1F952}", "\u{1F96C}", "\u{1F966}", "\u{1F9C5}", "\u{1F9C4}",
  "\u{1F954}", "\u{1F360}", "\u{1F950}", "\u{1F35E}", "\u{1F96F}", "\u{1F9C7}", "\u{1F95E}", "\u{1F9C0}",
  "\u{1F356}", "\u{1F357}", "\u{1F969}", "\u{1F953}", "\u{1F354}", "\u{1F32D}", "\u{1F32E}", "\u{1F32F}",
  "\u{1FAD4}", "\u{1F957}", "\u{1F35D}", "\u{1F35C}", "\u{1F372}", "\u{1F35B}", "\u{1F363}", "\u{1F364}",
  "\u{1F99E}", "\u{1F980}", "\u{1F95B}", "\u{1FAD8}", "\u{1F95A}", "\u{1F36F}", "\u{1F370}", "\u{1F36A}",
  "\u{1F968}", "\u{1F96A}", "\u{1FAD3}", "\u{1F37D}\u{FE0F}",
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-11 h-[38px] flex items-center justify-center border border-warm-200 rounded-lg bg-white text-xl hover:bg-warm-50 transition-colors focus:outline-none focus:ring-2 focus:ring-warm-300"
      >
        {value || "\u{1F37D}\u{FE0F}"}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-warm-200 rounded-xl shadow-lg p-2 w-64 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {FOOD_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onChange(e); setOpen(false); }}
                className={`w-7 h-7 flex items-center justify-center rounded hover:bg-warm-100 text-base transition-colors ${value === e ? "bg-warm-200" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const selectClass = "appearance-none bg-no-repeat";
const selectStyle = {
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2378716c'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
  backgroundSize: "1.25rem",
  backgroundPosition: "right 0.5rem center",
};
const selectStyleSm = {
  ...selectStyle,
  backgroundSize: "1rem",
  backgroundPosition: "right 0.35rem center",
};

function SectionCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="text-left">
          <h2 className="text-sm font-semibold text-stone-700">{title}</h2>
          {subtitle && (
            <p className="text-[10px] text-stone-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

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

// --- Section: Custom Foods ---

function CustomFoodsSection() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editCategory, setEditCategory] = useState<FoodCategory>("other");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCustomFoods(getCustomFoods());
    sync();
    window.addEventListener("custom-foods-updated", sync);
    return () => window.removeEventListener("custom-foods-updated", sync);
  }, []);

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addCustomFood({
      id: `custom-${generateId()}`,
      name: trimmedName,
      emoji: emoji.trim() || "\u{1F37D}\u{FE0F}",
      category,
      createdAt: Date.now(),
    });
    setName("");
    setEmoji("");
    setCategory("other");
  };

  const handleStartEdit = (food: CustomFood) => {
    setEditingId(food.id);
    setEditName(food.name);
    setEditEmoji(food.emoji);
    setEditCategory(food.category);
  };

  const handleSaveEdit = (food: CustomFood) => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;
    updateCustomFood({
      ...food,
      name: trimmedName,
      emoji: editEmoji.trim() || "\u{1F37D}\u{FE0F}",
      category: editCategory,
    });
    setEditingId(null);
  };

  const handleDelete = (foodId: string) => {
    deleteCustomFood(foodId);
    setDeleteConfirmId(null);
  };

  const subtitle = customFoods.length > 0 ? `${customFoods.length} food${customFoods.length === 1 ? "" : "s"}` : undefined;

  return (
    <SectionCard title="Custom foods" subtitle={subtitle}>
      <p className="text-xs text-stone-400 mb-3">
        Add your own foods to track alongside the built-in list.
      </p>

      {/* Add food form */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food name"
            className="flex-1 px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300"
          />
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            className={`flex-1 px-3 py-2 pr-8 border border-warm-200 rounded-lg text-sm bg-white ${selectClass} focus:outline-none focus:ring-2 focus:ring-warm-300`}
            style={selectStyle}
          >
            {categoryOrder.map((cat) => (
              <option key={cat} value={cat}>{categoryLabels[cat]}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="px-4 py-2 bg-warm-500 text-white text-sm font-medium rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Custom foods list */}
      {customFoods.length > 0 && (
        <div className="space-y-2">
          {customFoods.map((food) => (
            <div
              key={food.id}
              className="bg-warm-50 border border-warm-100 rounded-lg px-3 py-2"
            >
              {editingId === food.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <EmojiPicker value={editEmoji} onChange={setEditEmoji} />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-1.5 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as FoodCategory)}
                      className={`flex-1 px-2 py-1.5 pr-7 border border-warm-200 rounded-lg text-xs bg-white ${selectClass} focus:outline-none focus:ring-2 focus:ring-warm-300`}
                      style={selectStyleSm}
                    >
                      {categoryOrder.map((cat) => (
                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSaveEdit(food)}
                      disabled={!editName.trim()}
                      className="text-xs px-3 py-1.5 bg-sage-500 text-white rounded-lg disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{food.emoji}</span>
                  <span className="flex-1 text-sm text-stone-700 min-w-0 truncate">{food.name}</span>
                  <span className="text-[10px] text-stone-400 shrink-0">{categoryLabels[food.category]}</span>
                  <button
                    onClick={() => handleStartEdit(food)}
                    className="text-stone-400 hover:text-warm-600 transition-colors p-1 shrink-0"
                    aria-label="Edit food"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  {deleteConfirmId === food.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(food.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors p-1 shrink-0"
                      aria-label="Delete food"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// --- Section: System Foods ---

function SystemFoodsSection() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sync = () => setHiddenIds(getHiddenFoodIds());
    sync();
    window.addEventListener("custom-foods-updated", sync);
    return () => window.removeEventListener("custom-foods-updated", sync);
  }, []);

  const toggleFood = (id: string) => {
    const next = new Set(hiddenIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHiddenIds(next);
    saveHiddenFoodIds(next);
  };

  const hideAll = () => {
    const all = new Set(foods.map((f) => f.id));
    setHiddenIds(all);
    saveHiddenFoodIds(all);
  };

  const showAll = () => {
    setHiddenIds(new Set());
    saveHiddenFoodIds(new Set());
  };

  const filtered = search.trim()
    ? foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  const hiddenCount = hiddenIds.size;
  const subtitle = hiddenCount > 0 ? `${hiddenCount} hidden` : undefined;

  return (
    <SectionCard title="System foods" subtitle={subtitle}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search foods..."
        className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 mb-3"
      />
      <div className="flex gap-2 mb-3">
        <button
          onClick={hideAll}
          className="text-xs px-3 py-1 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-colors"
        >
          Hide all
        </button>
        <button
          onClick={showAll}
          className="text-xs px-3 py-1 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-colors"
        >
          Show all
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
        {filtered.map((food) => {
          const hidden = hiddenIds.has(food.id);
          return (
            <button
              key={food.id}
              onClick={() => toggleFood(food.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                hidden
                  ? "bg-stone-50 border-stone-200 opacity-40"
                  : "bg-white border-warm-100 hover:border-warm-200"
              }`}
            >
              <span className="text-lg leading-none">{food.emoji}</span>
              <span className="text-[9px] mt-0.5 text-stone-500 text-center leading-tight">
                {food.name}
              </span>
              {hidden && (
                <span className="text-[8px] text-red-400 font-medium">hidden</span>
              )}
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

// --- Main Settings Page ---

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

        {/* Baby's Name */}
        <SectionCard title="Baby&rsquo;s name" subtitle={familyInfo.babyName || "Not set"} defaultOpen>
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
        </SectionCard>

        {/* Family Sharing */}
        <SectionCard title="Family sharing" subtitle={`${familyInfo.memberCount} member${familyInfo.memberCount === 1 ? "" : "s"}`}>
          {/* Family Code */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Family code
            </label>
            <p className="text-xs text-stone-400 mb-2">
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

          {/* Members */}
          <div className="flex items-center justify-between py-2 mb-4 border-t border-warm-100">
            <span className="text-sm text-stone-600">Family members</span>
            <span className="text-sm font-semibold text-warm-700">
              {familyInfo.memberCount}
            </span>
          </div>

          {/* Leave Family */}
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
        </SectionCard>

        <CustomFoodsSection />
        <SystemFoodsSection />

        {/* Sign out */}
        <button
          onClick={async () => {
            setBusy(true);
            try { await signOut(); } catch {} finally { setBusy(false); }
          }}
          disabled={busy}
          className="w-full py-2.5 text-sm text-red-500 hover:text-red-700 bg-white rounded-xl border border-warm-100 shadow-sm transition-colors disabled:opacity-50"
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

      {/* Family Sharing */}
      <SectionCard title="Family sharing" subtitle="Not in a family">
        {/* Create a Family */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-stone-500 mb-2">Create a family</h3>
          <p className="text-xs text-stone-400 mb-2">
            Start a shared food log. You&apos;ll get a code to invite family members.
          </p>
          <input
            type="text"
            value={newBabyName}
            onChange={(e) => setNewBabyName(e.target.value)}
            placeholder="Baby's name (optional)"
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 mb-2"
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
        <div className="pt-3 border-t border-warm-100">
          <h3 className="text-xs font-semibold text-stone-500 mb-2">Join a family</h3>
          <p className="text-xs text-stone-400 mb-2">
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
      </SectionCard>

      <CustomFoodsSection />
      <SystemFoodsSection />

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
