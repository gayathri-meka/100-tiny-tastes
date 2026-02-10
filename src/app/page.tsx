"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { foods, categoryLabels, categoryOrder } from "@/lib/foods";
import { getTriedFoodIds } from "@/lib/storage";
import { Food } from "@/lib/types";
import Link from "next/link";
import { SaveProgress } from "@/components/SaveProgress";

export default function HomePage() {
  const router = useRouter();
  const [triedIds, setTriedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTriedIds(getTriedFoodIds());
    setMounted(true);

    const onStorage = () => setTriedIds(getTriedFoodIds());
    window.addEventListener("storage", onStorage);
    window.addEventListener("logs-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("logs-updated", onStorage);
    };
  }, []);

  useEffect(() => {
    if (pickerOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [pickerOpen]);

  const filteredFoods = pickerSearch.trim()
    ? foods.filter((f) =>
        f.name.toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : foods;

  const handlePickFood = (foodId: string) => {
    setPickerOpen(false);
    setPickerSearch("");
    router.push(`/food/${foodId}`);
  };

  const triedCount = triedIds.size;
  const totalCount = foods.length;
  const progress = totalCount > 0 ? (triedCount / totalCount) * 100 : 0;

  const grouped = categoryOrder.reduce<Record<string, Food[]>>((acc, cat) => {
    acc[cat] = foods.filter((f) => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-stone-800">
          100 Tiny Tastes
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          One little taste at a time
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700">
            Progress
          </span>
          <span className="text-sm font-semibold text-warm-700">
            {mounted ? triedCount : "–"} / {totalCount} tastes tried
          </span>
        </div>
        <div className="w-full h-3 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-warm-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: mounted ? `${progress}%` : "0%" }}
          />
        </div>
      </div>

      {/* Cloud save */}
      <SaveProgress />

      {/* Add today's taste shortcut */}
      <button
        onClick={() => setPickerOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-warm-700 bg-warm-100 hover:bg-warm-200 px-4 py-2.5 rounded-xl border border-warm-200 transition-colors mb-5"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add today&apos;s taste
      </button>

      {/* Food Picker Modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
          onClick={() => { setPickerOpen(false); setPickerSearch(""); }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl max-h-[70dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-2 border-b border-warm-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-stone-700">
                  Pick a food
                </span>
                <button
                  onClick={() => { setPickerOpen(false); setPickerSearch(""); }}
                  className="text-stone-400 p-1"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <input
                ref={searchRef}
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search foods..."
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-warm-300"
              />
            </div>
            <div className="overflow-y-auto px-2 py-2">
              {filteredFoods.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">
                  No foods found.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handlePickFood(food.id)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-warm-100 hover:border-warm-300 bg-white transition-colors"
                    >
                      <span className="text-xl leading-none">{food.emoji}</span>
                      <span className="text-[10px] mt-1 text-stone-500 text-center leading-tight">
                        {food.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Food Grid by Category */}
      {categoryOrder.map((cat) => (
        <div key={cat} className="mb-4">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            {categoryLabels[cat]}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {grouped[cat].map((food) => {
              const tried = triedIds.has(food.id);
              return (
                <Link
                  key={food.id}
                  href={`/food/${food.id}`}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    tried
                      ? "bg-sage-50 border-sage-200"
                      : "bg-white border-warm-100 hover:border-warm-200"
                  }`}
                >
                  {tried && (
                    <div className="absolute top-1 right-1">
                      <svg
                        className="w-3.5 h-3.5 text-sage-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="text-2xl leading-none">{food.emoji}</span>
                  <span
                    className={`text-[10px] mt-1 text-center leading-tight ${
                      tried ? "text-sage-600 font-medium" : "text-stone-500"
                    }`}
                  >
                    {food.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}
