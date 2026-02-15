// src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar?: string | null;
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
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔐 Login attempt...');
      
      const response = await apiClient.post('/auth/login', credentials);
      
      console.log('📥 Login response:', response.data);
      
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const token = responseData.data.token;
        const user = responseData.data.user;
        
        if (token && user) {
          localStorage.setItem('token', token);
          return { user, token };
        }
      }
      
      throw new Error('Invalid response structure');
      
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data);
      
      if (error.response?.status === 404) {
        return rejectWithValue('API endpoint not found');
      } else if (error.response?.status === 400) {
        return rejectWithValue('Invalid email or password');
      } else if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue('Login failed. Please try again.');
      }
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔐 Register attempt:', { email: userData.email });
      
      const response = await apiClient.post('/auth/register', userData);
      console.log('📡 Register response:', response.data);
      
      const responseData = response.data;
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Registration failed');
      }
      
      const token = responseData.data?.token;
      const user = responseData.data?.user;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      
      return { user, token };
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Email already exists or invalid data';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Get current user - FIX THIS
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      console.log('🔍 Fetching current user...');
      const response = await apiClient.get('/me');
      
      console.log('📥 Current user raw response:', response.data);
      
      const responseData = response.data;
      
      // ← FIX: Handle nested structure
      let user;
      
      if (responseData.success && responseData.data) {
        // Structure: { success: true, data: { profile: {...}, stats: {...} } }
        user = responseData.data.profile || responseData.data;
      } else if (responseData.data) {
        // Structure: { data: {...} }
        user = responseData.data;
      } else {
        // Structure: {...} (direct user object)
        user = responseData;
      }
      
      console.log('✅ Parsed user:', user);
      
      if (!user || !user.id) {
        throw new Error('Invalid user data');
      }
      
      return { user, token };
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ User saved to Redux:', state.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
    
    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ User loaded from API:', state.user);
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;