import axios from "axios";
import { logout, setCredentials } from "../store/authSlice";

let store;

export const injectStore = (_store) => {
  store = _store;
};

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // Ensure cookies are sent with every request
});

// No request interceptor: auth uses cookies only (sent automatically with withCredentials: true).
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/user/login") &&
      !originalRequest.url.includes("/user/register") &&
      !originalRequest.url.includes("/user/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Correctly send the refresh token using cookies
        const response = await axios.post(
          "http://localhost:5000/api/v1/user/refresh",
          {}, // No body needed
          { withCredentials: true } // Ensure cookies are sent
        );

        const { user } = response.data?.data ?? {};
        const currentUser = store?.getState()?.auth?.user;

        // Update Redux store with the refreshed user data
        store.dispatch(
          setCredentials({ user: user ?? currentUser })
        );

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Logout the user if the refresh token fails
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;