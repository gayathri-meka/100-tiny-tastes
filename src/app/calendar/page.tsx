"use client";

import { useState, useEffect, useMemo } from "react";
import { getLogs } from "@/lib/storage";
import { getFoodById } from "@/lib/foods";
import { FoodLog } from "@/lib/types";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const REACTION_EMOJI: Record<string, string> = {
  liked: "\u{1F60B}",
  neutral: "\u{1F610}",
  rejected: "\u{1F645}",
};

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount (SSR-safe: can't read during render)
    const syncFromStorage = () => setLogs(getLogs());
    syncFromStorage();
    setMounted(true);

    window.addEventListener("logs-updated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("logs-updated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const logsByDate = useMemo(() => {
    const map: Record<string, FoodLog[]> = {};
    for (const log of logs) {
      if (!map[log.date]) map[log.date] = [];
      map[log.date].push(log);
    }
    return map;
  }, [logs]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const selectedLogs = selectedDate ? (logsByDate[selectedDate] || []) : [];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-warm-100 text-stone-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-stone-800">
          {MONTH_NAMES[month]} {year}
        </h1>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-warm-100 text-stone-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-stone-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-warm-100 rounded-lg overflow-hidden border border-warm-100">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-warm-50 h-16" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(year, month, day);
          const dayLogs = mounted ? (logsByDate[dateKey] || []) : [];
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          // Deduplicate by foodId to get unique foods for that day
          const uniqueFoods: { id: string; emoji: string }[] = [];
          const seen = new Set<string>();
          for (const log of dayLogs) {
            if (!seen.has(log.foodId)) {
              seen.add(log.foodId);
              const f = getFoodById(log.foodId);
              if (f) uniqueFoods.push({ id: f.id, emoji: f.emoji });
            }
          }
          const overflow = uniqueFoods.length - 3;

          return (
            <button
              key={day}
              onClick={() =>
                setSelectedDate(isSelected ? null : dateKey)
              }
              className={`h-16 flex flex-col items-center justify-start pt-1.5 relative transition-colors ${
                isSelected
                  ? "bg-warm-200"
                  : isToday
                    ? "bg-warm-50 ring-1 ring-inset ring-warm-300"
                    : "bg-white hover:bg-warm-50"
              }`}
            >
              <span
                className={`text-xs font-medium leading-none ${
                  isToday
                    ? "font-bold text-warm-700"
                    : "text-stone-700"
                }`}
              >
                {day}
              </span>
              {uniqueFoods.length > 0 && (
                <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center">
                  {uniqueFoods.slice(0, 3).map((f) => (
                    <span key={f.id} className="text-xs leading-none">
                      {f.emoji}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[8px] text-stone-400 leading-none">
                      +{overflow}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Trailing empty cells */}
        {Array.from({
          length: (7 - ((firstDay + daysInMonth) % 7)) % 7,
        }).map((_, i) => (
          <div key={`trail-${i}`} className="bg-warm-50 h-16" />
        ))}
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedLogs.length === 0 ? (
            <p className="text-sm text-stone-400 py-3">
              No foods logged on this day.
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedLogs.map((log) => {
                const food = getFoodById(log.foodId);
                if (!food) return null;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 bg-white border border-warm-100 rounded-lg px-3 py-2"
                  >
                    <span className="text-xl">{food.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-stone-700">
                        {food.name}
                      </span>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="text-[10px] text-stone-400">
                          {log.form === "puree" ? "Purée" : log.form === "mashed" ? "Mashed" : "Finger food"}
                        </span>
                        <span className="text-[10px] text-stone-300">·</span>
                        <span className="text-[10px] text-stone-400">
                          {log.amount}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg">
                      {REACTION_EMOJI[log.reaction]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
