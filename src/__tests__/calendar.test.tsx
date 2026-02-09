import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "@/app/calendar/page";
import { saveLogs } from "@/lib/storage";
import { FoodLog } from "@/lib/types";

jest.mock("next/navigation");

function makeLog(foodId: string, date: string): FoodLog {
  return {
    id: Math.random().toString(36),
    foodId,
    date,
    form: "puree",
    amount: "taste",
    reaction: "liked",
    notes: "",
  };
}

beforeEach(() => {
  localStorage.clear();
  // Fix the date to Feb 8, 2026 for deterministic calendar rendering
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 1, 8)); // Feb 8, 2026
});

afterEach(() => {
  jest.useRealTimers();
});

describe("calendar", () => {
  test("days with logs show food emoji indicators", async () => {
    saveLogs([makeLog("banana", "2026-02-05")]);

    await act(async () => {
      render(<CalendarPage />);
    });

    // The banana emoji should appear in the calendar grid
    const emojis = screen.getAllByText("🍌");
    expect(emojis.length).toBeGreaterThanOrEqual(1);
  });

  test("days with more than 3 foods show +N indicator", async () => {
    saveLogs([
      makeLog("banana", "2026-02-10"),
      makeLog("avocado", "2026-02-10"),
      makeLog("apple", "2026-02-10"),
      makeLog("pear", "2026-02-10"),
      makeLog("mango", "2026-02-10"),
    ]);

    await act(async () => {
      render(<CalendarPage />);
    });

    // Should show +2 (5 unique foods - 3 shown = 2 overflow)
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  test("days with exactly 3 foods show all emojis and no +N", async () => {
    saveLogs([
      makeLog("banana", "2026-02-10"),
      makeLog("avocado", "2026-02-10"),
      makeLog("apple", "2026-02-10"),
    ]);

    await act(async () => {
      render(<CalendarPage />);
    });

    // All 3 emojis should be present
    expect(screen.getAllByText("🍌").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("🥑").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("🍎").length).toBeGreaterThanOrEqual(1);

    // No +N indicator
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  test("selecting a day shows the foods logged on that date", async () => {
    saveLogs([
      makeLog("banana", "2026-02-15"),
      makeLog("avocado", "2026-02-15"),
    ]);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<CalendarPage />);
    });

    // Click on day 15
    const day15Buttons = screen.getAllByText("15");
    // Find the day button (not the date display)
    const day15 = day15Buttons[0];
    await user.click(day15);

    // Should show food names in the detail section
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Avocado")).toBeInTheDocument();
  });

  test("selecting a day with no logs shows empty message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<CalendarPage />);
    });

    // Click on day 20 (no logs)
    await user.click(screen.getByText("20"));

    expect(screen.getByText("No foods logged on this day.")).toBeInTheDocument();
  });

  test("duplicate logs for same food on same day show only one emoji", async () => {
    saveLogs([
      makeLog("banana", "2026-02-10"),
      makeLog("banana", "2026-02-10"),
      makeLog("banana", "2026-02-10"),
    ]);

    await act(async () => {
      render(<CalendarPage />);
    });

    // Should NOT show +N since it's the same food 3 times (1 unique)
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
