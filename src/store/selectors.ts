import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { apps as constantsApps } from "@/constants";

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Apps selectors
export const selectAppsState = (state: RootState) => state.apps.appsState;
export const selectSearchQuery = (state: RootState) => state.apps.searchQuery;

// Memoized selector for active apps
export const selectActiveApps = createSelector(
  [selectAppsState],
  (appsState) => {
    return constantsApps.filter((app) => appsState[app.name] === true);
  }
);

// Memoized selector for apps with status
export const selectAppsWithStatus = createSelector(
  [selectAppsState],
  (appsState) => {
    return constantsApps.map((app) => ({
      ...app,
      isActive: appsState[app.name] || false,
    }));
  }
);

// Memoized selector for filtered apps (with search)
export const selectFilteredApps = createSelector(
  [selectAppsWithStatus, selectSearchQuery],
  (apps, searchQuery) => {
    if (!searchQuery.trim()) return apps;

    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
    );
  }
);
