import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { setCredentials, logout, setCheckingAuth } from "./store/authSlice";
import api from "./api/axios"; // Ensure this matches your actual file path (e.g., ./utils/api)

// Components
import AuthPage from "./components/AuthPage";
import MainLayout from "./layout/MainLayout";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the MainLayout which contains the Sidebar/Topbar
  // and the <Outlet /> for child routes (Feed, Profile, etc.)
  return <MainLayout />;
};

function App() {
  const { isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  // 1. Check Auth on Load (RefreshToken)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.get("/user/refresh");
        const { user, accessToken } = response.data.data;
        dispatch(setCredentials({ user, token: accessToken }));
      } catch (error) {
        // Only logout if it's a genuine auth error, not just network
        dispatch(logout());
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };

    initAuth();
  }, [dispatch]);

  // 2. Loading Spinner
  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <AuthPage /> : <Navigate to="/feed" replace />
          }
        />

        {/* --- Protected Routes (Wrapped in MainLayout) --- */}
        <Route element={<ProtectedLayout />}>
          {/* Redirect root "/" to "/feed" */}
          <Route path="/" element={<Navigate to="/feed" replace />} />
          
          {/* Main Dashboard View */}
          <Route path="/feed" element={<FeedPage />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/upload" element={<UploadPage />} />
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Route>

        {/* --- 404 Catch-all --- */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;