import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { setCredentials, logout, setCheckingAuth } from "./store/authSlice";
import api from "./api/axios";

// Providers
import { SocketProvider } from "./context/SocketContext"; // 👈 Added SocketProvider

// Components
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layout/MainLayout";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage"; // 👈 Added ChatPage

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrap the MainLayout in SocketProvider so chat works everywhere 
  // while the user is logged in
  return (
    <SocketProvider>
      <MainLayout />
    </SocketProvider>
  );
};

function App() {
  const { isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  // On load: verify session using refresh cookie only (no Redux/localStorage tokens).
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post("/user/refresh");
        const { user } = response.data?.data ?? {};
        if (user) dispatch(setCredentials({ user }));
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };
    initAuth();
  }, [dispatch]);

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

        {/* --- Protected Routes (Wrapped in MainLayout & SocketProvider) --- */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          
          <Route path="/feed" element={<FeedPage />} />
          
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/upload" element={<UploadPage />} />

          {/* --- Chroma Canvas Chat Route --- */}
          <Route path="/chat" element={<ChatPage />} /> 
        </Route>

        {/* --- 404 Catch-all --- */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;