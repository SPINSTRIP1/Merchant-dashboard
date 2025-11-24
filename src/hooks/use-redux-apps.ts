import { useAppSelector, useAppDispatch } from "./redux";
import {
  selectActiveApps,
  selectAppsState,
  selectAppsWithStatus,
  selectSearchQuery,
} from "@/store/selectors";
import {
  toggleApp,
  setAppState,
  resetAppsState,
  setSearchQuery,
} from "@/store/slices/appsSlice";

export const useReduxApps = () => {
  const dispatch = useAppDispatch();

  const activeApps = useAppSelector(selectActiveApps);
  const appsState = useAppSelector(selectAppsState);
  const appsWithStatus = useAppSelector(selectAppsWithStatus);
  const searchQuery = useAppSelector(selectSearchQuery);

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

  return {
    activeApps,
    appsState,
    appsWithStatus,
    searchQuery,
    toggleAppState,
    setAppActiveState,
    resetApps,
    updateSearchQuery,
  };
};
