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

  const toggleAppState = (appName: string) => {
    dispatch(toggleApp(appName));
  };

  const setAppActiveState = (appName: string, isActive: boolean) => {
    dispatch(setAppState({ appName, isActive }));
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
