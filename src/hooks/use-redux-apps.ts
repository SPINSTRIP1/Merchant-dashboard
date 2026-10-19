import { useAppSelector, useAppDispatch } from "./redux";
import {
  selectActiveApps,
  selectAppsState,
  selectAppsWithStatus,
  selectSearchQuery,
  selectCategoryFilter,
} from "@/store/selectors";
import {
  toggleApp,
  setAppState,
  resetAppsState,
  setSearchQuery,
  setCategoryFilter,
} from "@/store/slices/appsSlice";

export const useReduxApps = () => {
  const dispatch = useAppDispatch();

  const activeApps = useAppSelector(selectActiveApps);
  const appsState = useAppSelector(selectAppsState);
  const appsWithStatus = useAppSelector(selectAppsWithStatus);
  const searchQuery = useAppSelector(selectSearchQuery);
  const categoryFilter = useAppSelector(selectCategoryFilter);

  /** Switches an app on/off by its stable `key` (e.g. "menu"), not its display name. */
  const toggleAppState = (appKey: string) => {
    dispatch(toggleApp(appKey));
  };

  const setAppActiveState = (appKey: string, isActive: boolean) => {
    dispatch(setAppState({ appKey, isActive }));
  };

  const resetApps = () => {
    dispatch(resetAppsState());
  };

  const updateSearchQuery = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const updateCategoryFilter = (category: string) => {
    dispatch(setCategoryFilter(category));
  };

  return {
    activeApps,
    appsState,
    appsWithStatus,
    searchQuery,
    categoryFilter,
    toggleAppState,
    setAppActiveState,
    resetApps,
    updateSearchQuery,
    updateCategoryFilter,
  };
};
