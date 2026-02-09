import { foods } from "@/lib/foods";
import FoodDetail from "./FoodDetail";

export function generateStaticParams() {
  return foods.map((f) => ({ id: f.id }));
}

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FoodDetail id={id} />;
}
