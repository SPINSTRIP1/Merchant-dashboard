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
export const selectCategoryFilter = (state: RootState) =>
  state.apps.categoryFilter;

// Memoized selector for active apps
export const selectActiveApps = createSelector(
  [selectAppsState],
  (appsState) => {
    return constantsApps.filter((app) => appsState[app.name].isActive);
  }
);

// Memoized selector for apps with status
export const selectAppsWithStatus = createSelector(
  [selectAppsState],
  (appsState) => {
    return constantsApps.map((app) => ({
      ...app,
      isActive: appsState[app.name].isActive || false,
    }));
  }
);

// Memoized selector for filtered apps (with search and category)
export const selectFilteredApps = createSelector(
  [selectAppsWithStatus, selectSearchQuery, selectCategoryFilter],
  (apps, searchQuery, categoryFilter) => {
    let filteredApps = apps;

    // Filter by category
    if (categoryFilter) {
      filteredApps = filteredApps.filter((app) => {
        switch (categoryFilter) {
          case "free":
            return !app.amount || app.amount === 0;
          case "paid":
            return app.amount && app.amount > 0;
          case "default":
            return app.default === true;
          case "community":
            return !app.default;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredApps = filteredApps.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query)
      );
    }

    return filteredApps;
  }
);
