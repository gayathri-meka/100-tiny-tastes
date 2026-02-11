import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { FoodLog } from "./types";

function logsCollection(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "logs");
}

export async function fetchCloudLogs(uid: string): Promise<FoodLog[]> {
  const snapshot = await getDocs(logsCollection(uid));
  return snapshot.docs.map((d) => d.data() as FoodLog);
}

export async function pushLogToCloud(uid: string, log: FoodLog): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", uid, "logs", log.id);
  await setDoc(ref, log);
}

export async function migrateLogsToCloud(
  uid: string,
  localLogs: FoodLog[]
): Promise<FoodLog[]> {
  const cloudLogs = await fetchCloudLogs(uid);
  const existingIds = new Set(cloudLogs.map((l) => l.id));
  const newLogs = localLogs.filter((l) => !existingIds.has(l.id));

  if (newLogs.length > 0) {
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    for (const log of newLogs) {
      batch.set(doc(db, "users", uid, "logs", log.id), log);
    }
    await batch.commit();
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

export function subscribeToCloudLogs(
  uid: string,
  callback: (logs: FoodLog[]) => void
): () => void {
  return onSnapshot(logsCollection(uid), (snapshot) => {
    const logs = snapshot.docs.map((d) => d.data() as FoodLog);
    callback(logs);
  });
}
