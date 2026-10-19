/**
 * Links to the public, customer-facing SpinStrip site (places.spinstrip.com), where customers view
 * published places, events and restaurant menus and book, buy tickets or order. The dashboard no
 * longer hosts its own copies of these pages; every "Public page" / "Preview" button and table QR
 * code points here so merchants see exactly what customers see.
 */
export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://places.spinstrip.com").replace(
  /\/+$/,
  ""
);

export const publicHomeUrl = () => `${PUBLIC_SITE_URL}/`;

export const publicPlaceUrl = (placeId?: string | null) =>
  placeId ? `${PUBLIC_SITE_URL}/preview/places?id=${encodeURIComponent(placeId)}` : publicHomeUrl();

export const publicEventUrl = (eventId?: string | null) =>
  eventId ? `${PUBLIC_SITE_URL}/preview/events?id=${encodeURIComponent(eventId)}` : publicHomeUrl();

/** One dish on the public site; `merchantUserId` lets it show the rest of that kitchen's menu. */
export const publicDishUrl = (itemId: string, merchantUserId: string) =>
  `${PUBLIC_SITE_URL}/preview/menu?id=${encodeURIComponent(itemId)}&merchant=${encodeURIComponent(merchantUserId)}`;

/**
 * A restaurant's full public menu (`/restaurants/{merchantUserId}`). With a table number the guest's
 * order is tagged to that table — this is what table QR codes encode (`?number=7`).
 */
export function publicRestaurantUrl(merchantUserId: string | null | undefined, tableNumber?: string) {
  if (!merchantUserId) return publicHomeUrl();
  const base = `${PUBLIC_SITE_URL}/restaurants/${encodeURIComponent(merchantUserId)}`;
  return tableNumber ? `${base}?number=${encodeURIComponent(tableNumber)}` : base;
}

