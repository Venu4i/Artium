import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { setCredentials, logout, setCheckingAuth } from "./store/authSlice";
import api from "./api/axios";

// Providers
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";

// Components
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layout/MainLayout";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage"; // 👈 Added ChatPage
import ExploreCommunities from "./pages/ExploreCommunities";
import MyCommunities from "./pages/MyCommunities";
import CommunityPage from "./pages/CommunityPage"; // Legacy, can remove later
import CommunityLayout from "./layout/CommunityLayout";
import CommunityWorkspace from "./pages/CommunityWorkspace";
import AcceptInvite from "./pages/AcceptInvite";

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrap the MainLayout in SocketProvider so chat works everywhere 
  // while the user is logged in
  return (
    <ThemeProvider>
      <SocketProvider>
        <MainLayout />
      </SocketProvider>
    </ThemeProvider>
  );
};

// Community Route Wrapper (Isolated from MainLayout)
const CommunityRouteWrapper = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider>
      <SocketProvider>
        <CommunityLayout />
      </SocketProvider>
    </ThemeProvider>
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
          <Route path="/settings" element={<SettingsPage />} />
          
          <Route path="/upload" element={<UploadPage />} />

          {/* --- Chroma Canvas Chat Route --- */}
          <Route path="/chat" element={<ChatPage />} /> 

          {/* --- Community System Routes (Inside MainLayout) --- */}
          <Route path="/communities" element={<ExploreCommunities />} />
          <Route path="/my-communities" element={<MyCommunities />} />
          <Route path="/community/invite/:token" element={<AcceptInvite />} />
        </Route>

        {/* --- Isolated Community Routes (No MainLayout Sidebar/Topbar) --- */}
        <Route path="/community/:id" element={<CommunityRouteWrapper />}>
          <Route index element={<Navigate to="workspace" replace />} />
          <Route path="workspace" element={<CommunityWorkspace />} />
          <Route path="arena" element={<div className="flex-1 flex items-center justify-center text-community-on-surface text-xl">Arena (Pending UI)</div>} />
          <Route path="pantheon" element={<div className="flex-1 flex items-center justify-center text-community-on-surface text-xl">Pantheon (Pending UI)</div>} />
        </Route>

        {/* --- 404 Catch-all --- */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;