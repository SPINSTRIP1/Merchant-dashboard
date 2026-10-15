export const FALLBACK_BUSINESS_CATEGORIES = [
  { id: 1, name: "Restaurants" },
  { id: 2, name: "Nightlife & Clubs" },
  { id: 3, name: "Fashion & Apparel store" },
  { id: 4, name: "Beauty & Wellness" },
  { id: 5, name: "Home & Lifestyle" },
  { id: 6, name: "Events & Entertainment" },
  { id: 7, name: "Groceries & Supermarkets" },
];

/**
 * Sub-categories offered under each business category. The API has no sub-category endpoint yet,
 * so these are keyed by category name; unknown categories fall back to the general list.
 */
export const BUSINESS_SUB_CATEGORIES: Record<string, string[]> = {
  Restaurants: ["Fine Dining", "Casual Dining", "Quick Service", "Cafe & Bakery", "Buka / Local Kitchen", "Bar & Grill"],
  "Nightlife & Clubs": ["Nightclub", "Lounge", "Bar", "Rooftop", "Karaoke", "Live Music Venue"],
  "Fashion & Apparel store": ["Clothing", "Footwear", "Accessories", "Jewellery", "Tailoring", "Thrift"],
  "Beauty & Wellness": ["Salon", "Barbershop", "Spa", "Gym & Fitness", "Nail Studio", "Skincare Clinic"],
  "Home & Lifestyle": ["Furniture", "Home Decor", "Kitchenware", "Gifts", "Electronics", "Bookstore"],
  "Events & Entertainment": ["Event Centre", "Cinema", "Gaming Arcade", "Concerts", "Event Planning", "Recreation Park"],
  "Groceries & Supermarkets": ["Supermarket", "Mini Mart", "Fresh Produce", "Wholesale", "Pharmacy", "Liquor Store"],
};

export const GENERAL_SUB_CATEGORIES = ["Retail", "Food & Beverage", "Hospitality", "Healthcare", "Technology", "Services", "Other"];

export const subCategoriesFor = (category: string | undefined) =>
  (category && BUSINESS_SUB_CATEGORIES[category]) || GENERAL_SUB_CATEGORIES;
