"use client";

import { FoodLog } from "./types";

const LOGS_KEY = "tiny-tastes-logs";
const CLOUD_UID_KEY = "tiny-tastes-cloud-uid";

export function setCloudMode(uid: string | null): void {
  if (uid) {
    localStorage.setItem(CLOUD_UID_KEY, uid);
  } else {
    localStorage.removeItem(CLOUD_UID_KEY);
  }
}

export function getCloudUid(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLOUD_UID_KEY);
}

export function getLogs(): FoodLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FoodLog[];
  } catch {
    return [];
  }
}

export function saveLogs(logs: FoodLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function addLog(log: FoodLog): FoodLog[] {
  const logs = getLogs();
  logs.push(log);
  saveLogs(logs);

  // Fire-and-forget cloud sync
  const uid = getCloudUid();
  if (uid) {
    import("./firestore").then(({ pushLogToCloud }) => {
      pushLogToCloud(uid, log).catch(() => {});
    });
  }

  return logs;
}

export function getLogsForFood(foodId: string): FoodLog[] {
  return getLogs().filter((l) => l.foodId === foodId);
}

export function getLogsForDate(date: string): FoodLog[] {
  return getLogs().filter((l) => l.date === date);
}

export function getTriedFoodIds(): Set<string> {
  const logs = getLogs();
  return new Set(logs.map((l) => l.foodId));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
