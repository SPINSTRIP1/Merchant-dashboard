/**
 * Mock-data toolkit for features whose backend endpoints don't exist yet.
 *
 * Hooks in src/hooks call these from their `queryFn` / `mutationFn`, so replacing a mock with the
 * real endpoint later only touches the hook. Fixtures are generated from a seeded RNG so values are
 * stable across reloads; mutations live in memory and reset on a full page reload.
 */

/** Deterministic pseudo-random generator (mulberry32). */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof seededRandom>;

export const between = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

/** Round to the nearest `step` (amounts in the seed data are multiples of ₦100). */
export const roundTo = (value: number, step = 100) => Math.round(value / step) * step;

export const daysAgo = (days: number, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
};

export const FIRST_NAMES = [
  "Adaeze", "Chinedu", "Tunde", "Kemi", "Ngozi", "Emeka", "Bisi", "Ifeanyi", "Funmi", "Segun",
  "Amaka", "Yusuf", "Halima", "Obinna", "Zainab", "Chiamaka", "Tobi", "Uche", "Fatima", "Kunle",
] as const;

export const LAST_NAMES = [
  "Okafor", "Adeyemi", "Balogun", "Afolabi", "Nwosu", "Okonkwo", "Bello", "Eze", "Ogunleye",
  "Ibrahim", "Obi", "Adebayo", "Musa", "Chukwu", "Lawal", "Okeke", "Danjuma", "Ajayi",
] as const;

export const fullName = (rng: Rng) => `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;

export const emailFor = (name: string, rng: Rng) =>
  `${name.toLowerCase().replace(/\s+/g, ".")}${between(rng, 1, 99)}@${pick(rng, [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
  ])}`;

export const phoneNumber = (rng: Rng) =>
  `0${between(rng, 700, 909)}${between(rng, 100, 999)}${between(rng, 1000, 9999)}`;

/** Transaction reference in the backend's style: `SPN-YYYYMM-XXXXXX`. */
export const txRef = (date: Date, rng: Rng) => {
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const suffix = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[between(rng, 0, 31)]).join("");
  return `SPN-${ym}-${suffix}`;
};

export const mockId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Resolve with a copy of `data` after a short delay, like a network call. */
export function mockResponse<T>(data: T, delayMs = 350): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), delayMs)
  );
}

/** In-memory collection with list/get/create/update/remove, for mocked CRUD features. */
export function createMockCollection<T extends { id: string }>(seed: () => T[]) {
  let items: T[] | null = null;
  const all = () => (items ??= seed());

  return {
    list: (delayMs?: number) => mockResponse(all(), delayMs),
    get: (id: string, delayMs?: number) => mockResponse(all().find((i) => i.id === id) ?? null, delayMs),
    create: (item: T, delayMs?: number) => {
      items = [item, ...all()];
      return mockResponse(item, delayMs);
    },
    update: (id: string, patch: Partial<T>, delayMs?: number) => {
      let updated: T | null = null;
      items = all().map((i) => (i.id === id ? (updated = { ...i, ...patch }) : i));
      return mockResponse(updated, delayMs);
    },
    remove: (id: string, delayMs?: number) => {
      items = all().filter((i) => i.id !== id);
      return mockResponse(true, delayMs);
    },
    /** Synchronous snapshot, for derived mocks that aggregate several collections. */
    snapshot: () => all(),
  };
}

/**
 * A small key → value store kept in localStorage, for mocked additions layered on top of real
 * backend records (e.g. a place's tagline) so they survive a reload. Reads fall back to an empty
 * store when storage is unavailable.
 */
export function createPersistentMap<T>(storageKey: string) {
  const read = (): Record<string, T> => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Record<string, T>;
    } catch {
      return {};
    }
  };
  const write = (value: Record<string, T>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage full or blocked: keep working for this session only.
    }
  };

  return {
    get: (key: string): T | undefined => read()[key],
    all: read,
    set: (key: string, value: T) => write({ ...read(), [key]: value }),
    update: (key: string, fn: (current: T | undefined) => T) => {
      const store = read();
      write({ ...store, [key]: fn(store[key]) });
    },
  };
}
