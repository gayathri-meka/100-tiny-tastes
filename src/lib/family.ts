const FAMILY_ID_KEY = "tiny-tastes-family-id";
const BABY_NAME_KEY = "tiny-tastes-baby-name";

export function setFamilyId(id: string | null): void {
  if (id) {
    localStorage.setItem(FAMILY_ID_KEY, id);
  } else {
    localStorage.removeItem(FAMILY_ID_KEY);
  }
}

export function getFamilyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FAMILY_ID_KEY);
}

export function setBabyName(name: string | null): void {
  if (name) {
    localStorage.setItem(BABY_NAME_KEY, name);
  } else {
    localStorage.removeItem(BABY_NAME_KEY);
  }
}

export function getBabyName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BABY_NAME_KEY);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getDb() {
  const { getFirebaseDb } = await import("./firebase");
  return getFirebaseDb();
}

export async function createFamily(uid: string, babyName?: string): Promise<{ familyId: string; code: string }> {
  const { doc, setDoc, collection } = await import("firebase/firestore");
  const db = await getDb();
  const code = generateCode();
  const familyRef = doc(collection(db, "families"));
  const familyId = familyRef.id;

  const familyData: { code: string; members: string[]; babyName?: string } = {
    code,
    members: [uid],
  };
  if (babyName) {
    familyData.babyName = babyName;
  }

  await setDoc(familyRef, familyData);
  await setDoc(doc(db, "familyCodes", code), { familyId });
  await setDoc(doc(db, "users", uid), { familyId }, { merge: true });

  setFamilyId(familyId);
  if (babyName) setBabyName(babyName);

  return { familyId, code };
}

export async function lookupFamilyByCode(code: string): Promise<string | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const db = await getDb();
  const snap = await getDoc(doc(db, "familyCodes", code.toUpperCase()));
  if (!snap.exists()) return null;
  return (snap.data() as { familyId: string }).familyId;
}

export async function joinFamily(uid: string, familyId: string): Promise<void> {
  const { doc, updateDoc, arrayUnion, setDoc } = await import("firebase/firestore");
  const db = await getDb();
  await updateDoc(doc(db, "families", familyId), {
    members: arrayUnion(uid),
  });
  await setDoc(doc(db, "users", uid), { familyId }, { merge: true });
  setFamilyId(familyId);
}

export async function leaveFamily(uid: string, familyId: string): Promise<void> {
  const { doc, updateDoc, arrayRemove, getDoc, deleteDoc, deleteField } = await import("firebase/firestore");
  const db = await getDb();
  await updateDoc(doc(db, "families", familyId), {
    members: arrayRemove(uid),
  });
  await updateDoc(doc(db, "users", uid), { familyId: deleteField() });

  // Clean up if family is now empty
  const familySnap = await getDoc(doc(db, "families", familyId));
  if (familySnap.exists()) {
    const data = familySnap.data() as { members: string[]; code: string };
    if (data.members.length === 0) {
      await deleteDoc(doc(db, "familyCodes", data.code));
      await deleteDoc(doc(db, "families", familyId));
    }
  }

  setFamilyId(null);
  setBabyName(null);
}

export async function getFamilyInfo(familyId: string): Promise<{
  code: string;
  memberCount: number;
  babyName: string | null;
} | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const db = await getDb();
  const snap = await getDoc(doc(db, "families", familyId));
  if (!snap.exists()) return null;
  const data = snap.data() as { code: string; members: string[]; babyName?: string };
  return {
    code: data.code,
    memberCount: data.members.length,
    babyName: data.babyName || null,
  };
}

export async function updateBabyName(familyId: string, name: string): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getDb();
  await updateDoc(doc(db, "families", familyId), { babyName: name });
  setBabyName(name);
}

export async function fetchUserFamilyId(uid: string): Promise<string | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const db = await getDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { familyId?: string };
  return data.familyId || null;
}
