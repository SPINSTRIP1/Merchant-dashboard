import type { PublicMenuItem } from "@/hooks/use-menu";

/** Sample public menu shown to visitors until the backend exposes a public menu endpoint. */
export const SAMPLE_PUBLIC_MENU: { business: string; items: PublicMenuItem[] } = {
  business: "Kitchen D4AD",
  items: [
    ["Jollof Rice & Chicken", "Smoky party jollof with grilled chicken and fried plantain.", 7000, "Lunch", "Best Seller"],
    ["Coconut Rice & Turkey", "Fragrant coconut rice served with peppered turkey.", 8500, "Lunch", "Chef's Pick"],
    ["Egusi & Pounded Yam", "Melon seed soup with assorted meat and smooth pounded yam.", 9000, "Dinner", "Chef's Pick"],
    ["Suya Platter", "Spicy grilled beef suya with onions, tomatoes and yaji.", 6500, "Dinner", "Best Seller"],
    ["Grilled Tilapia", "Whole tilapia grilled with pepper sauce and chips.", 14000, "Dinner", "Best Seller"],
    ["Akara & Pap", "Crispy bean cakes with warm, smooth pap.", 3500, "Breakfast", undefined],
    ["Yam Porridge", "Yam cooked in a rich palm-oil and pepper sauce.", 4500, "Breakfast", undefined],
    ["Pepper Soup", "Goat meat pepper soup with fresh scent leaves.", 5500, "Dinner", undefined],
    ["Fried Rice & Plantain", "Vegetable fried rice with dodo and coleslaw.", 6000, "Lunch", undefined],
    ["Chapman", "Classic Nigerian fruity cocktail, alcohol free.", 3000, "Drinks", "Best Seller"],
  ].map(([name, description, price, category, tag], i) => ({
    id: `sample_${i + 1}`,
    name: name as string,
    description: description as string,
    price: price as number,
    category: category as string,
    tag: tag as string | undefined,
    availability: "Always available",
    bestSeller: tag === "Best Seller",
  })),
};
