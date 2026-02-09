"use client";

import { useState, useEffect } from "react";
import { foods, categoryLabels, categoryOrder } from "@/lib/foods";
import { getTriedFoodIds } from "@/lib/storage";
import { Food } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [triedIds, setTriedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

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

  const triedCount = triedIds.size;
  const totalCount = foods.length;
  const progress = totalCount > 0 ? (triedCount / totalCount) * 100 : 0;

  const grouped = categoryOrder.reduce<Record<string, Food[]>>((acc, cat) => {
    acc[cat] = foods.filter((f) => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="px-4 pt-6 pb-4">
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
