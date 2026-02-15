import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null,
  isLoading: false,
  error: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem("auth_token") : false,
};

// Register User - POST /api/auth/register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    credentials: {
      name: string;
      username: string;
      email: string;
      phone: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/register", credentials);
      
      // Simpan token jika ada (auto-login setelah register)
      if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Login User - POST /api/auth/login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      
      // Simpan token
      if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("auth_token");
  return null;
});

// Fetch Current User - GET /api/me
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout User
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("auth_token");
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;