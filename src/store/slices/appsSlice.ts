import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apps as initialApps } from "@/constants";

export type CatalogApp = (typeof initialApps)[number];
export type AppKey = CatalogApp["key"];

export interface AppState {
  /** Keyed by the app's stable `key`. Older saved state may still be keyed by display name. */
  [appKey: string]: {
    isActive: boolean;
    default?: boolean;
    amount?: number;
    description?: string;
    tagLine?: string;
  };
}

interface AppsState {
  appsState: AppState;
  searchQuery: string;
  categoryFilter: string;
}

const findApp = (key: string) => initialApps.find((app) => app.key === key);

/**
 * Whether an app is switched on. Reads the entry saved under the app's key, then under its current
 * or earlier display names (state saved before apps had keys), then falls back to the catalogue
 * default — so renaming an app, or adding a new one, never leaves it without a value.
 */
export function resolveAppActive(appsState: AppState | undefined, app: CatalogApp): boolean {
  if (app.default) return true;
  const legacy = "legacyNames" in app ? (app.legacyNames as readonly string[]) : [];
  for (const id of [app.key, app.name, ...legacy]) {
    const saved = appsState?.[id];
    if (saved && typeof saved.isActive === "boolean") return saved.isActive;
  }
  return app.isActive;
}

// Initialize apps state from constants
const initializeAppsState = (): AppState => {
  const state: AppState = {};
  initialApps.forEach((app) => {
    state[app.key] = { isActive: app.isActive, default: app.default };
  });
  return state;
};

const initialState: AppsState = {
  appsState: initializeAppsState(),
  searchQuery: "",
  categoryFilter: "",
};

const appsSlice = createSlice({
  name: "apps",
  initialState,
  reducers: {
    /** Payload: the app's `key`. */
    toggleApp: (state, action: PayloadAction<string>) => {
      const app = findApp(action.payload);
      if (!app) return;
      state.appsState[app.key] = {
        ...state.appsState[app.key],
        isActive: !resolveAppActive(state.appsState, app),
      };
    },
    /** Payload: the app's `key` and the new state. */
    setAppState: (state, action: PayloadAction<{ appKey: string; isActive: boolean }>) => {
      const { appKey, isActive } = action.payload;
      if (!findApp(appKey)) return;
      state.appsState[appKey] = { ...state.appsState[appKey], isActive };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    resetAppsState: (state) => {
      state.appsState = initializeAppsState();
      state.searchQuery = "";
      state.categoryFilter = "";
    },
    bulkUpdateApps: (state, action: PayloadAction<AppState>) => {
      state.appsState = { ...state.appsState, ...action.payload };
    },
  },
});

export const {
  toggleApp,
  setAppState,
  setSearchQuery,
  setCategoryFilter,
  resetAppsState,
  bulkUpdateApps,
} = appsSlice.actions;

export default appsSlice.reducer;
