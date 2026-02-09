"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFoodById } from "@/lib/foods";
import { getRecipe } from "@/lib/recipes";
import {
  addLog,
  generateId,
  getLogsForFood,
} from "@/lib/storage";
import {
  Food,
  FoodLog,
  FoodForm,
  FoodAmount,
  Reaction,
} from "@/lib/types";

type TabId = "log" | "recipe" | "history";

export default function FoodDetail({ id }: { id: string }) {
  const router = useRouter();
  const food = getFoodById(id);
  const [activeTab, setActiveTab] = useState<TabId>("log");
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (food) {
      setLogs(getLogsForFood(food.id));
    }
    setMounted(true);
  }, [food]);

  if (!food) {
    return (
      <div className="px-4 pt-6 text-center text-stone-500">
        Food not found.
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "log", label: "Log" },
    { id: "recipe", label: "Recipe" },
    { id: "history", label: "History" },
  ];

  const handleLogSaved = () => {
    setLogs(getLogsForFood(food.id));
    window.dispatchEvent(new Event("logs-updated"));
  };

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm text-stone-500 mb-3"
      >
        <svg
          className="w-4 h-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      {/* Food Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{food.emoji}</span>
        <div>
          <h1 className="text-xl font-bold text-stone-800">{food.name}</h1>
          {mounted && logs.length > 0 && (
            <span className="text-xs text-sage-600 font-medium">
              Tried {logs.length} {logs.length === 1 ? "time" : "times"}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-warm-500 text-warm-700"
                : "border-transparent text-stone-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "log" && (
        <LogTab food={food} onSaved={handleLogSaved} />
      )}
      {activeTab === "recipe" && <RecipeTab food={food} />}
      {activeTab === "history" && (
        <HistoryTab logs={logs} mounted={mounted} />
      )}
    </div>
  );
}

function LogTab({
  food,
  onSaved,
}: {
  food: Food;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [form, setForm] = useState<FoodForm>("puree");
  const [amount, setAmount] = useState<FoodAmount>("taste");
  const [reaction, setReaction] = useState<Reaction>("neutral");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const log: FoodLog = {
      id: generateId(),
      foodId: food.id,
      date,
      form,
      amount,
      reaction,
      notes: notes.trim(),
    };
    addLog(log);
    onSaved();
    setSaved(true);
    setNotes("");
    setTimeout(() => setSaved(false), 2000);
  };

  const formOptions: { value: FoodForm; label: string }[] = [
    { value: "puree", label: "Purée" },
    { value: "mashed", label: "Mashed" },
    { value: "finger food", label: "Finger food" },
  ];

  const amountOptions: { value: FoodAmount; label: string }[] = [
    { value: "taste", label: "Taste" },
    { value: "few spoons", label: "Few spoons" },
    { value: "serving", label: "Serving" },
  ];

  const reactionOptions: {
    value: Reaction;
    label: string;
    emoji: string;
  }[] = [
    { value: "liked", label: "Liked", emoji: "😋" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "rejected", label: "Rejected", emoji: "🙅" },
  ];

  return (
    <div className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300"
        />
      </div>

      {/* Form */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Form
        </label>
        <div className="grid grid-cols-3 gap-2">
          {formOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm(opt.value)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                form === opt.value
                  ? "bg-warm-100 border-warm-400 text-warm-800"
                  : "bg-white border-warm-200 text-stone-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Amount
        </label>
        <div className="grid grid-cols-3 gap-2">
          {amountOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAmount(opt.value)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                amount === opt.value
                  ? "bg-warm-100 border-warm-400 text-warm-800"
                  : "bg-white border-warm-200 text-stone-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reaction */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Reaction
        </label>
        <div className="grid grid-cols-3 gap-2">
          {reactionOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setReaction(opt.value)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex flex-col items-center gap-1 ${
                reaction === opt.value
                  ? "bg-warm-100 border-warm-400 text-warm-800"
                  : "bg-white border-warm-200 text-stone-500"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any observations..."
          rows={2}
          className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? "bg-sage-500 text-white"
            : "bg-warm-500 text-white active:bg-warm-600"
        }`}
      >
        {saved ? "Saved!" : "Save taste"}
      </button>
    </div>
  );
}

function RecipeTab({ food }: { food: Food }) {
  const recipe = getRecipe(food.id);

  if (!recipe) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        No recipe available yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">{recipe.prep}</p>
      <ol className="space-y-2">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warm-100 text-warm-700 text-xs font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-stone-700">{step.text}</span>
          </li>
        ))}
      </ol>
      {recipe.note && (
        <div className="bg-warm-50 border border-warm-100 rounded-lg p-3">
          <p className="text-xs text-stone-500">{recipe.note}</p>
        </div>
      )}
    </div>
  );
}

function HistoryTab({
  logs,
  mounted,
}: {
  logs: FoodLog[];
  mounted: boolean;
}) {
  if (!mounted) {
    return null;
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        No logs yet. Try this food and log it!
      </p>
    );
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const reactionEmoji: Record<Reaction, string> = {
    liked: "😋",
    neutral: "😐",
    rejected: "🙅",
  };

  const formLabels: Record<FoodForm, string> = {
    puree: "Purée",
    mashed: "Mashed",
    "finger food": "Finger food",
  };

  return (
    <div className="space-y-2">
      {sorted.map((log) => (
        <div
          key={log.id}
          className="bg-white border border-warm-100 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-400">
              {new Date(log.date + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-lg">{reactionEmoji[log.reaction]}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 bg-warm-50 text-stone-600 rounded-full">
              {formLabels[log.form]}
            </span>
            <span className="text-xs px-2 py-0.5 bg-warm-50 text-stone-600 rounded-full">
              {log.amount}
            </span>
          </div>
          {log.notes && (
            <p className="text-xs text-stone-500 mt-1.5">{log.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
