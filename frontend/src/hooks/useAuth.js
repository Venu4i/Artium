import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout as logoutAction } from "../store/authSlice";
import api from "../api/axios";

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Pulling state from your Redux authSlice
  const { user, token, isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth
  );

  /**
   * Manual Login 
   * Used in your AuthPage/Login component
   */
  const login = async (credentials) => {
    try {
      const response = await api.post("/user/login", credentials);
      const { user, accessToken } = response.data.data;
      
      // Store in Redux
      dispatch(setCredentials({ user, token: accessToken }));
      
      console.log("🔐 Chroma Canvas Session Started for:", user.username);
      return { success: true };
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data?.message || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  /**
   * Logout
   * Clears Redux and notifies the backend to clear cookies
   */
  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (error) {
      console.error("Logout error on server, clearing local state anyway.");
    } finally {
      dispatch(logoutAction());
      console.log("🔌 Artist Session Ended");
    }
  };

  /**
   * Refresh Logic (Silent Auth)
   * This helps fix the "Error generating tokens" by ensuring 
   * the frontend stays synced with the backend's refresh cookie.
   */
  const refreshSession = async () => {
    try {
      const response = await api.get("/user/refresh");
      const { user, accessToken } = response.data.data;
      dispatch(setCredentials({ user, token: accessToken }));
    } catch (error) {
      dispatch(logoutAction());
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isCheckingAuth,
    login,
    logout,
    refreshSession
  };
};