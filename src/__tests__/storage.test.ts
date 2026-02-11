import { getLogs, addLog, deleteLog, getLogsForFood, getTriedFoodIds, saveLogs, generateId, isPendingPush, isPendingDelete, completePendingPush } from "@/lib/storage";
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

describe("deleting a log", () => {
  test("removes the correct log from localStorage", () => {
    const log1 = makeLog({ id: "log-1", foodId: "banana" });
    const log2 = makeLog({ id: "log-2", foodId: "avocado" });
    addLog(log1);
    addLog(log2);

    deleteLog("log-1");

    const stored = getLogs();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("log-2");
  });

  test("updates tried food IDs after deleting the only log for a food", () => {
    const log = makeLog({ id: "log-1", foodId: "banana" });
    addLog(log);
    expect(getTriedFoodIds().has("banana")).toBe(true);

    deleteLog("log-1");
    expect(getTriedFoodIds().has("banana")).toBe(false);
  });

  test("deleting non-existent ID leaves logs unchanged", () => {
    addLog(makeLog({ id: "log-1" }));
    addLog(makeLog({ id: "log-2" }));

    deleteLog("non-existent");

    expect(getLogs()).toHaveLength(2);
  });

  test("deleting all logs results in empty array", () => {
    addLog(makeLog({ id: "log-1" }));
    addLog(makeLog({ id: "log-2" }));

    deleteLog("log-1");
    deleteLog("log-2");

    expect(getLogs()).toEqual([]);
    expect(getTriedFoodIds().size).toBe(0);
  });
});

describe("pending operation tracking", () => {
  test("isPendingPush returns false for unknown IDs", () => {
    expect(isPendingPush("unknown-id")).toBe(false);
  });

  test("isPendingDelete returns false for unknown IDs", () => {
    expect(isPendingDelete("unknown-id")).toBe(false);
  });

  test("completePendingPush does not throw for unknown IDs", () => {
    expect(() => completePendingPush("unknown-id")).not.toThrow();
  });
});
