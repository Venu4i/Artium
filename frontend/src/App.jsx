import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { setCredentials, logout, setCheckingAuth } from "./store/authSlice";
import api from "./api/axios";
import AuthPage from "./components/AuthPage"
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.get("/user/refresh");
        const { user, accessToken } = response.data.data;

        dispatch(setCredentials({ user, token: accessToken }));
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };

    initAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-[#1a1625] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
