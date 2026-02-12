import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { FoodLog, CustomFood } from "./types";

function logsCollection(uid: string, familyId?: string | null) {
  const db = getFirebaseDb();
  if (familyId) {
    return collection(db, "families", familyId, "logs");
  }
  return collection(db, "users", uid, "logs");
}

function logDocPath(uid: string, logId: string, familyId?: string | null): string {
  if (familyId) {
    return `families/${familyId}/logs/${logId}`;
  }
  return `users/${uid}/logs/${logId}`;
}

export async function fetchCloudLogs(uid: string, familyId?: string | null): Promise<FoodLog[]> {
  const snapshot = await getDocs(logsCollection(uid, familyId));
  return snapshot.docs.map((d) => d.data() as FoodLog);
}

export async function pushLogToCloud(uid: string, log: FoodLog, familyId?: string | null): Promise<void> {
  const ref = doc(getFirebaseDb(), logDocPath(uid, log.id, familyId));
  await setDoc(ref, log);
}

export async function migrateLogsToCloud(
  uid: string,
  localLogs: FoodLog[],
  familyId?: string | null
): Promise<FoodLog[]> {
  const cloudLogs = await fetchCloudLogs(uid, familyId);
  const existingIds = new Set(cloudLogs.map((l) => l.id));
  const newLogs = localLogs.filter((l) => !existingIds.has(l.id));

  if (newLogs.length > 0) {
    const db = getFirebaseDb();
    // Firestore limits batches to 500 operations
    for (let i = 0; i < newLogs.length; i += 500) {
      const chunk = newLogs.slice(i, i + 500);
      const batch = writeBatch(db);
      for (const log of chunk) {
        batch.set(doc(db, logDocPath(uid, log.id, familyId)), log);
      }
      await batch.commit();
    }
  }

  // Return merged set (cloud + newly uploaded local)
  const allIds = new Set<string>();
  const merged: FoodLog[] = [];
  for (const log of [...cloudLogs, ...newLogs]) {
    if (!allIds.has(log.id)) {
      allIds.add(log.id);
      merged.push(log);
    }
  }
  return merged;
}

export async function deleteLogFromCloud(uid: string, logId: string, familyId?: string | null): Promise<void> {
  const ref = doc(getFirebaseDb(), logDocPath(uid, logId, familyId));
  await deleteDoc(ref);
}

export function subscribeToCloudLogs(
  uid: string,
  callback: (logs: FoodLog[]) => void,
  familyId?: string | null
): () => void {
  return onSnapshot(
    logsCollection(uid, familyId),
    (snapshot) => {
      const logs = snapshot.docs.map((d) => d.data() as FoodLog);
      callback(logs);
    },
    (err) => {
      console.warn("Cloud listener failed:", err);
    }
  );
}

// --- Custom Foods ---

function customFoodsCollection(uid: string, familyId?: string | null) {
  const db = getFirebaseDb();
  if (familyId) {
    return collection(db, "families", familyId, "customFoods");
  }
  return collection(db, "users", uid, "customFoods");
}

function customFoodDocPath(uid: string, foodId: string, familyId?: string | null): string {
  if (familyId) {
    return `families/${familyId}/customFoods/${foodId}`;
  }
  return `users/${uid}/customFoods/${foodId}`;
}

export async function pushCustomFoodToCloud(
  uid: string,
  food: CustomFood,
  familyId?: string | null
): Promise<void> {
  const ref = doc(getFirebaseDb(), customFoodDocPath(uid, food.id, familyId));
  await setDoc(ref, food);
}

export async function fetchCustomFoods(
  uid: string,
  familyId?: string | null
): Promise<CustomFood[]> {
  const snapshot = await getDocs(customFoodsCollection(uid, familyId));
  return snapshot.docs.map((d) => d.data() as CustomFood);
}

export function subscribeToCustomFoods(
  uid: string,
  callback: (foods: CustomFood[]) => void,
  familyId?: string | null
): () => void {
  return onSnapshot(
    customFoodsCollection(uid, familyId),
    (snapshot) => {
      const foods = snapshot.docs.map((d) => d.data() as CustomFood);
      callback(foods);
    },
    (err) => {
      console.warn("Custom foods listener failed:", err);
    }
  );
}
