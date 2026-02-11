import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FoodDetail from "@/app/food/[id]/FoodDetail";
import { getLogs, saveLogs, getTriedFoodIds, getLogsForFood } from "@/lib/storage";
import { FoodLog } from "@/lib/types";

jest.mock("next/navigation");

beforeEach(() => {
  localStorage.clear();
});

describe("food detail tabs", () => {
  test("opens on the Log tab by default", async () => {
    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    // Log tab content should be visible (Save taste button)
    expect(screen.getByText("Save taste")).toBeInTheDocument();

    // The Log tab button should have active styling
    const logTab = screen.getByRole("button", { name: "Log" });
    expect(logTab.className).toContain("border-warm-500");
  });

  test("switching to Recipe tab shows recipe content", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "Recipe" }));

    // Banana recipe content should appear
    expect(screen.getByText(/ripe banana/i)).toBeInTheDocument();
    // Log tab content should be gone
    expect(screen.queryByText("Save taste")).not.toBeInTheDocument();
  });

  test("switching to History tab shows empty state when no logs", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));

    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
  });

  test("switching to History tab shows past logs", async () => {
    const log: FoodLog = {
      id: "test-log-1",
      foodId: "banana",
      date: "2026-01-15",
      form: "puree",
      amount: "taste",
      reaction: "liked",
      notes: "Really enjoyed it",
    };
    saveLogs([log]);

    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));

    expect(screen.getByText("Really enjoyed it")).toBeInTheDocument();
    expect(screen.getByText("Purée")).toBeInTheDocument();
    expect(screen.getByText("taste")).toBeInTheDocument();
  });
});

describe("logging a taste via the UI", () => {
  test("saving a log persists it to localStorage and marks food as tried", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    // Default form is purée, amount is taste, reaction is neutral
    // Click "Liked" reaction
    await user.click(screen.getByText("Liked"));

    // Click save
    await user.click(screen.getByText("Save taste"));

    // Verify saved to localStorage
    const logs = getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].foodId).toBe("banana");
    expect(logs[0].form).toBe("puree");
    expect(logs[0].amount).toBe("taste");
    expect(logs[0].reaction).toBe("liked");

    // Verify food is marked as tried
    expect(getTriedFoodIds().has("banana")).toBe(true);
  });

  test("saving multiple logs for the same food stores all of them", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="avocado" />);
    });

    // Save first log
    await user.click(screen.getByText("Save taste"));

    // Wait for "Saved!" to revert
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2100));
    });

    // Change reaction and save again
    await user.click(screen.getByText("Liked"));
    await user.click(screen.getByText("Save taste"));

    const logs = getLogs();
    expect(logs).toHaveLength(2);
    expect(logs.every((l) => l.foodId === "avocado")).toBe(true);
  });

  test("button shows 'Saved!' feedback after saving", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByText("Save taste"));

    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });
});

describe("deleting a log via the UI", () => {
  test("delete button appears on each log in History tab", async () => {
    saveLogs([
      { id: "log-1", foodId: "banana", date: "2026-01-15", form: "puree", amount: "taste", reaction: "liked", notes: "" },
    ]);
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));

    expect(screen.getByRole("button", { name: "Delete log" })).toBeInTheDocument();
  });

  test("clicking delete shows confirmation buttons", async () => {
    saveLogs([
      { id: "log-1", foodId: "banana", date: "2026-01-15", form: "puree", amount: "taste", reaction: "liked", notes: "" },
    ]);
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));
    await user.click(screen.getByRole("button", { name: "Delete log" }));

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("confirming delete removes the log", async () => {
    saveLogs([
      { id: "log-1", foodId: "banana", date: "2026-01-15", form: "puree", amount: "taste", reaction: "liked", notes: "" },
    ]);
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));
    await user.click(screen.getByRole("button", { name: "Delete log" }));
    await user.click(screen.getByText("Delete"));

    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
    expect(getLogs()).toHaveLength(0);
  });

  test("cancelling delete keeps the log", async () => {
    saveLogs([
      { id: "log-1", foodId: "banana", date: "2026-01-15", form: "puree", amount: "taste", reaction: "liked", notes: "Yummy" },
    ]);
    const user = userEvent.setup();

    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    await user.click(screen.getByRole("button", { name: "History" }));
    await user.click(screen.getByRole("button", { name: "Delete log" }));
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByText("Yummy")).toBeInTheDocument();
    expect(getLogs()).toHaveLength(1);
  });
});

describe("real-time sync updates", () => {
  test("logs-updated event refreshes the food detail page", async () => {
    await act(async () => {
      render(<FoodDetail id="banana" />);
    });

    // Simulate cloud sync adding a log (e.g., from another device)
    saveLogs([
      { id: "cloud-1", foodId: "banana", date: "2026-01-20", form: "mashed", amount: "serving", reaction: "liked", notes: "From other device" },
    ]);

    await act(async () => {
      window.dispatchEvent(new Event("logs-updated"));
    });

    // Header should update with "Tried 1 time"
    expect(screen.getByText(/Tried 1 time/)).toBeInTheDocument();
  });
});
