import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "./redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAccessToken,
  selectRefreshToken,
} from "@/store/selectors";
import {
  loginUser,
  logout,
  clearError,
  updateUser,
  setTokens,
  type AuthTokens,
  type UserData,
} from "@/store/slices/authSlice";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export const useReduxAuth = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Authentication methods
  const login = useCallback(
    async (credentials: { emailOrUsername: string; password: string }) => {
      try {
        const result = await dispatch(loginUser(credentials));
        if (loginUser.fulfilled.match(result)) {
          return { success: true, user: result.payload.user };
        } else {
          return { success: false, error: result.payload as string };
        }
      } catch {
        return { success: false, error: "Login failed" };
      }
    },
    [dispatch]
  );

  //   const loadUserProfile = useCallback(async () => {
  //     try {
  //       const result = await dispatch(loadUser());
  //       if (loadUser.fulfilled.match(result)) {
  //         return { success: true, user: result.payload.user };
  //       } else {
  //         return { success: false, error: result.payload as string };
  //       }
  //     } catch {
  //       return { success: false, error: "Failed to load user" };
  //     }
  //   }, [dispatch]);

  //   const refreshAuthToken = useCallback(async () => {
  //     try {
  //       const result = await dispatch(refreshTokenAsync());
  //       if (refreshTokenAsync.fulfilled.match(result)) {
  //         return { success: true, tokens: result.payload.tokens };
  //       } else {
  //         return { success: false, error: result.payload as string };
  //       }
  //     } catch {
  //       return { success: false, error: "Token refresh failed" };
  //     }
  //   }, [dispatch]);

  // Utility methods
  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const updateUserProfile = useCallback(
    (userData: Partial<UserData>) => {
      dispatch(updateUser(userData));
    },
    [dispatch]
  );

  const setAuthTokens = useCallback(
    (tokens: AuthTokens, userData: UserData) => {
      dispatch(setTokens({ tokens, user: userData }));
    },
    [dispatch]
  );

  // Auth status checks (same pattern as your auth manager)
  const hasValidToken = useCallback(() => {
    return !!accessToken;
  }, [accessToken]);

  return {
    // State (matching your auth manager interface)
    user,
    accessToken,
    refreshToken,
    isAuthenticated: isAuthenticated && hasValidToken(),
    isLoading,
    error,

    // Authentication methods
    login,
    // register,
    // loadUser: loadUserProfile,
    // refreshAuthToken,
    logout: logoutUser,

    // Utility methods
    clearError: clearAuthError,
    updateUser: updateUserProfile,
    setTokens: setAuthTokens,
    // Legacy support (for backward compatibility)
    token: accessToken,
    isLoggedIn: isAuthenticated && hasValidToken(),
    setUserData: setAuthTokens, // Keep for compatibility
  };
};
