import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apps as initialApps } from "@/constants";

interface AppState {
  [appName: string]: boolean;
}

interface AppsState {
  appsState: AppState;
  searchQuery: string;
}

// Initialize apps state from constants
const initializeAppsState = (): AppState => {
  const state: AppState = {};
  initialApps.forEach((app) => {
    state[app.name] = app.isActive;
  });
  return state;
};

const initialState: AppsState = {
  appsState: initializeAppsState(),
  searchQuery: "",
};

const appsSlice = createSlice({
  name: "apps",
  initialState,
  reducers: {
    toggleApp: (state, action: PayloadAction<string>) => {
      const appName = action.payload;
      state.appsState[appName] = !state.appsState[appName];
    },
    setAppState: (
      state,
      action: PayloadAction<{ appName: string; isActive: boolean }>
    ) => {
      const { appName, isActive } = action.payload;
      state.appsState[appName] = isActive;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetAppsState: (state) => {
      state.appsState = initializeAppsState();
      state.searchQuery = "";
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
  resetAppsState,
  bulkUpdateApps,
} = appsSlice.actions;

export default appsSlice.reducer;
