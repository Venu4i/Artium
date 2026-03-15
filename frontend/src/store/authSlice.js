import { createSlice } from "@reduxjs/toolkit";

// Auth state: cookies hold tokens (httpOnly); Redux only holds user for UI.
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user ?? state.user;
      state.isAuthenticated = true;
      state.isCheckingAuth = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isCheckingAuth = false;
    },
    setCheckingAuth: (state, action) => {
      state.isCheckingAuth = action.payload;
    },
  },
});

export const { setCredentials, logout, setCheckingAuth } =
  authSlice.actions;
export default authSlice.reducer;
