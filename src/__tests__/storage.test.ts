import { getLogs, addLog, getLogsForFood, getTriedFoodIds, saveLogs, generateId } from "@/lib/storage";
import { FoodLog } from "@/lib/types";

function makeLog(overrides: Partial<FoodLog> = {}): FoodLog {
  return {
    id: generateId(),
    foodId: "banana",
    date: "2026-01-15",
    form: "puree",
    amount: "taste",
    reaction: "liked",
    notes: "",
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("logging a taste", () => {
  test("saves an entry to localStorage", () => {
    const log = makeLog();
    addLog(log);

    const stored = getLogs();
    expect(stored).toHaveLength(1);
    expect(stored[0].foodId).toBe("banana");
    expect(stored[0].date).toBe("2026-01-15");
    expect(stored[0].form).toBe("puree");
    expect(stored[0].amount).toBe("taste");
    expect(stored[0].reaction).toBe("liked");
  });

  test("marks the food as tried", () => {
    addLog(makeLog({ foodId: "avocado" }));

    const tried = getTriedFoodIds();
    expect(tried.has("avocado")).toBe(true);
    expect(tried.has("banana")).toBe(false);
  });

  test("updates overall progress count", () => {
    expect(getTriedFoodIds().size).toBe(0);

    addLog(makeLog({ foodId: "banana" }));
    expect(getTriedFoodIds().size).toBe(1);

    addLog(makeLog({ foodId: "avocado" }));
    expect(getTriedFoodIds().size).toBe(2);
  });

  test("multiple logs for the same food are stored correctly", () => {
    addLog(makeLog({ foodId: "banana", date: "2026-01-15", reaction: "liked" }));
    addLog(makeLog({ foodId: "banana", date: "2026-01-16", reaction: "neutral" }));
    addLog(makeLog({ foodId: "banana", date: "2026-01-17", reaction: "rejected" }));

    const bananaLogs = getLogsForFood("banana");
    expect(bananaLogs).toHaveLength(3);
    expect(bananaLogs.map((l) => l.reaction)).toEqual(["liked", "neutral", "rejected"]);

    // Same food logged multiple times still counts as 1 tried food
    expect(getTriedFoodIds().size).toBe(1);
  });

  test("getLogs returns empty array for corrupted localStorage", () => {
    localStorage.setItem("tiny-tastes-logs", "not-json");
    expect(getLogs()).toEqual([]);
  });

  test("getLogs returns empty array for non-array JSON", () => {
    localStorage.setItem("tiny-tastes-logs", '{"foo":"bar"}');
    expect(getLogs()).toEqual([]);
  });
});
