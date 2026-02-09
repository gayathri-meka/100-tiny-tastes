import { render, screen, act } from "@testing-library/react";
import HomePage from "@/app/page";
import { saveLogs } from "@/lib/storage";
import { foods } from "@/lib/foods";
import { FoodLog } from "@/lib/types";

jest.mock("next/navigation");
jest.mock("next/link");

function makeLog(foodId: string): FoodLog {
  return {
    id: Math.random().toString(36),
    foodId,
    date: "2026-01-15",
    form: "puree",
    amount: "taste",
    reaction: "liked",
    notes: "",
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("home screen", () => {
  test("shows 0 / 100 progress when no foods are logged", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    const progressText = screen.getByText(/tastes tried/);
    expect(progressText.textContent).toContain("0");
    expect(progressText.textContent).toContain("100");
  });

  test("progress text updates when foods are logged", async () => {
    saveLogs([makeLog("banana"), makeLog("avocado"), makeLog("apple")]);

    await act(async () => {
      render(<HomePage />);
    });

    const progressText = screen.getByText(/tastes tried/);
    expect(progressText.textContent).toContain("3");
  });

  test("tried food tile links to the correct food detail page", async () => {
    saveLogs([makeLog("banana")]);

    await act(async () => {
      render(<HomePage />);
    });

    const bananaLink = screen.getByRole("link", { name: /Banana/i });
    expect(bananaLink).toHaveAttribute("href", "/food/banana");
  });

  test("all 100 foods are displayed in the grid", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    for (const food of foods.slice(0, 5)) {
      expect(screen.getByText(food.name)).toBeInTheDocument();
    }

    const links = screen.getAllByRole("link");
    // Each food is a link
    expect(links.length).toBe(foods.length);
  });
});
