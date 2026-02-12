import { getFamilyId, setFamilyId, getBabyName, setBabyName } from "@/lib/family";

beforeEach(() => {
  localStorage.clear();
});

describe("familyId localStorage", () => {
  test("getFamilyId returns null when empty", () => {
    expect(getFamilyId()).toBeNull();
  });

  test("setFamilyId stores and retrieves value", () => {
    setFamilyId("family-123");
    expect(getFamilyId()).toBe("family-123");
  });

  test("setFamilyId(null) clears the value", () => {
    setFamilyId("family-123");
    expect(getFamilyId()).toBe("family-123");

    setFamilyId(null);
    expect(getFamilyId()).toBeNull();
  });

  test("setFamilyId overwrites previous value", () => {
    setFamilyId("family-1");
    setFamilyId("family-2");
    expect(getFamilyId()).toBe("family-2");
  });
});

describe("babyName localStorage", () => {
  test("getBabyName returns null when empty", () => {
    expect(getBabyName()).toBeNull();
  });

  test("setBabyName stores and retrieves value", () => {
    setBabyName("Luna");
    expect(getBabyName()).toBe("Luna");
  });

  test("setBabyName(null) clears the value", () => {
    setBabyName("Luna");
    expect(getBabyName()).toBe("Luna");

    setBabyName(null);
    expect(getBabyName()).toBeNull();
  });

  test("setBabyName overwrites previous value", () => {
    setBabyName("Luna");
    setBabyName("Mia");
    expect(getBabyName()).toBe("Mia");
  });
});
