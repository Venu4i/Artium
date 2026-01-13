import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { injectStore } from "../api/axios";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/* ===== INJECT STORE INTO AXIOS (ADDED) ===== */
injectStore(store);
/* ========================================== */
