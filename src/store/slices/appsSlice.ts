import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apps as initialApps } from "@/constants";

export interface AppState {
  [appName: string]: {
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

// Initialize apps state from constants
const initializeAppsState = (): AppState => {
  const state: AppState = {};
  initialApps.forEach((app) => {
    state[app.name] = { isActive: app.isActive, default: app.default };
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
    toggleApp: (state, action: PayloadAction<string>) => {
      const appName = action.payload;
      state.appsState[appName] = {
        ...state.appsState[appName],
        isActive: !state.appsState[appName].isActive,
      };
    },
    setAppState: (
      state,
      action: PayloadAction<{ appName: string; isActive: boolean }>
    ) => {
      const { appName, isActive } = action.payload;
      state.appsState[appName].isActive = isActive;
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
