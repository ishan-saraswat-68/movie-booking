import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handle = (thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    };
    handle(registerUser);
    handle(loginUser);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
