export type FoodCategory =
  | "fruits"
  | "vegetables"
  | "grains"
  | "proteins"
  | "dairy"
  | "other";

export type FoodForm = "puree" | "mashed" | "finger food";
export type FoodAmount = "taste" | "few spoons" | "serving";
export type Reaction = "liked" | "neutral" | "rejected";

export interface Food {
  id: string;
  name: string;
  emoji: string;
  category: FoodCategory;
}

export interface FoodLog {
  id: string;
  foodId: string;
  date: string; // YYYY-MM-DD
  form: FoodForm;
  amount: FoodAmount;
  reaction: Reaction;
  notes: string;
}

export interface RecipeStep {
  text: string;
}

export interface Recipe {
  foodId: string;
  prep: string;
  steps: RecipeStep[];
  note?: string;
}
