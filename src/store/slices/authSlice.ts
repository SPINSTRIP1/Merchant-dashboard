import { loginApi } from "@/app/(auth)/_api";
import { decrypt, encrypt } from "@/utils";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define interfaces matching your auth manager
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface UserData {
  email: string;
  fullName: string;
  userName: string;
  role: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  complianceStatus?: "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize from storage (same pattern as your auth manager)
const initializeFromStorage = () => {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiryTime: null,
      isAuthenticated: false,
    };
  }

  try {
    // Restore access token from localStorage (encrypted)
    const encryptedAccessToken = localStorage.getItem("spinstrip_at");
    const accessToken = encryptedAccessToken
      ? decrypt(encryptedAccessToken)
      : null;

    // Restore refresh token from localStorage (encrypted)
    const encryptedRefreshToken = localStorage.getItem("spinstrip_rt");
    const refreshToken = encryptedRefreshToken
      ? decrypt(encryptedRefreshToken)
      : null;

    // Restore user data from localStorage
    const userData = localStorage.getItem("spinstrip_user");
    const user = userData ? JSON.parse(userData) : null;

    const isAuthenticated = !!accessToken;

    return {
      user: isAuthenticated ? user : null,
      accessToken: isAuthenticated ? accessToken : null,
      refreshToken: isAuthenticated ? refreshToken : null,
      isAuthenticated,
    };
  } catch (error) {
    console.error("Error initializing auth from storage:", error);
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiryTime: null,
      isAuthenticated: false,
    };
  }
};

const initialState: AuthState = {
  ...initializeFromStorage(),
  isLoading: false,
  error: null,
};

// Store tokens securely (same as your auth manager)
const storeTokensSecurely = (tokens: AuthTokens, userData?: UserData) => {
  if (typeof window === "undefined") return;

  try {
    // Store access token encrypted
    const encryptedAccessToken = encrypt(tokens.accessToken);
    localStorage.setItem("spinstrip_at", encryptedAccessToken);

    // Store refresh token encrypted
    if (tokens.refreshToken) {
      const encryptedRefreshToken = encrypt(tokens.refreshToken);
      localStorage.setItem("spinstrip_rt", encryptedRefreshToken);
    }

    // Store user data
    if (userData) {
      localStorage.setItem("spinstrip_user", JSON.stringify(userData));
    }
  } catch (error) {
    console.error("Error storing tokens:", error);
  }
};

// Clear tokens (same as your auth manager)
const clearTokensFromStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("spinstrip_at");
  localStorage.removeItem("spinstrip_rt");
  localStorage.removeItem("spinstrip_user");
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { emailOrUsername: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginApi(
        credentials.emailOrUsername,
        credentials.password
      );
      const { accessToken, refreshToken, user } = response.data;

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
      };

      storeTokensSecurely(tokens, user);

      return {
        user,
        tokens,
      };
    } catch (error) {
      console.log(error);
      return rejectWithValue((error as Error).message);
    }
  }
);

// export const loadUser = createAsyncThunk(
//   "auth/loadUser",
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const state = getState() as { auth: AuthState };
//       const { accessToken, tokenExpiryTime } = state.auth;

//       // Check if token exists and is not expired
//       if (!accessToken || (tokenExpiryTime && Date.now() >= tokenExpiryTime)) {
//         clearTokensFromStorage();
//         return rejectWithValue("No valid token found");
//       }

//       const user = await authAPI.me();
//       return { user, accessToken, tokenExpiryTime };
//     } catch (error) {
//       clearTokensFromStorage();
//       const axiosError = error as AxiosError;
//       const errorMessage =
//         (axiosError.response?.data as { message?: string })?.message ||
//         axiosError.message ||
//         "Failed to load user";
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearTokensFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("spinstrip_user", JSON.stringify(state.user));
        }
      }
    },
    setTokens: (
      state,
      action: PayloadAction<{ tokens: AuthTokens; user: UserData }>
    ) => {
      const { tokens, user } = action.payload;
      state.user = user;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken || null;
      state.isAuthenticated = true;
      state.error = null;

      storeTokensSecurely(tokens, user);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Load User
    // builder
    //   .addCase(loadUser.pending, (state) => {
    //     state.isLoading = true;
    //   })
    //   .addCase(loadUser.fulfilled, (state, action) => {
    //     state.isLoading = false;
    //     state.user = action.payload.user;
    //     state.error = null;
    //   })
    //   .addCase(loadUser.rejected, (state, action) => {
    //     state.isLoading = false;
    //     state.error = action.payload as string;
    //     state.isAuthenticated = false;
    //     state.user = null;
    //     state.accessToken = null;
    //     state.refreshToken = null;
    //     state.tokenExpiryTime = null;
    //   });

    // Refresh Token
    // builder
    //   .addCase(refreshTokenAsync.pending, (state) => {
    //     state.isLoading = true;
    //   })
    //   .addCase(refreshTokenAsync.fulfilled, (state, action) => {
    //     state.isLoading = false;
    //     state.user = action.payload.user;
    //     state.accessToken = action.payload.tokens.accessToken;
    //     state.refreshToken = action.payload.tokens.refreshToken || null;
    //     state.tokenExpiryTime = action.payload.tokenExpiryTime;
    //     state.isAuthenticated = true;
    //     state.error = null;
    //   })
    //   .addCase(refreshTokenAsync.rejected, (state, action) => {
    //     state.isLoading = false;
    //     state.error = action.payload as string;
    //     state.isAuthenticated = false;
    //     state.user = null;
    //     state.accessToken = null;
    //     state.refreshToken = null;
    //     state.tokenExpiryTime = null;
    //   });
  },
});

export const { logout, clearError, updateUser, setTokens } = authSlice.actions;
export default authSlice.reducer;
