"use client";

import { CustomFood } from "./types";
import { getCloudUid } from "./storage";
import { getFamilyId } from "./family";

const CUSTOM_FOODS_KEY = "tiny-tastes-custom-foods";

/** Read all custom foods from localStorage (includes deleted) */
export function getAllCustomFoods(): CustomFood[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CustomFood[];
  } catch {
    return [];
  }
}

/** Read non-deleted custom foods from localStorage */
export function getCustomFoods(): CustomFood[] {
  return getAllCustomFoods().filter((f) => !f.deleted);
}

/** Save custom foods array to localStorage */
export function saveCustomFoods(foods: CustomFood[]): void {
  localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
}

/** Clear custom foods from localStorage */
export function clearCustomFoods(): void {
  localStorage.removeItem(CUSTOM_FOODS_KEY);
}

/** Get a custom food by ID (includes deleted, for log rendering) */
export function getCustomFoodById(id: string): CustomFood | undefined {
  return getAllCustomFoods().find((f) => f.id === id);
}

function dispatchUpdate() {
  window.dispatchEvent(new Event("custom-foods-updated"));
}

function pushToCloud(food: CustomFood) {
  const uid = getCloudUid();
  if (uid) {
    const familyId = getFamilyId();
    import("./firestore").then(({ pushCustomFoodToCloud }) => {
      pushCustomFoodToCloud(uid, food, familyId).catch((err) => {
        console.warn("Cloud sync failed for custom food:", food.id, err);
      });
    });
  }
}

/** Add a new custom food */
export function addCustomFood(food: CustomFood): void {
  const foods = getAllCustomFoods();
  foods.push(food);
  saveCustomFoods(foods);
  dispatchUpdate();
  pushToCloud(food);
}

/** Update an existing custom food */
export function updateCustomFood(food: CustomFood): void {
  const foods = getAllCustomFoods().map((f) => (f.id === food.id ? food : f));
  saveCustomFoods(foods);
  dispatchUpdate();
  pushToCloud(food);
}

/** Soft-delete a custom food */
export function deleteCustomFood(foodId: string): void {
  const foods = getAllCustomFoods();
  const food = foods.find((f) => f.id === foodId);
  if (!food) return;
  const updated = { ...food, deleted: true };
  const newFoods = foods.map((f) => (f.id === foodId ? updated : f));
  saveCustomFoods(newFoods);
  dispatchUpdate();
  pushToCloud(updated);
}
