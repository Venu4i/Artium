import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout, setCheckingAuth } from "./store/authSlice";
import api from "./api/axios";
import AuthPage from "./components/AuthPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const { isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // On refresh, we ask the server for a new token using the Refresh Cookie
        const response = await api.post("/user/refresh-token");
        const { user, accessToken } = response.data.data;
        
        dispatch(setCredentials({ user, token: accessToken }));
      } catch (error) {
        // If refresh fails (no cookie/invalid), we are officially logged out
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

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}

export default App;