import axios from "axios";
import { logout, setCredentials } from "../store/authSlice";

let store;

export const injectStore = (_store) => {
  store = _store;
};

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
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
        // Refresh using cookies only (no body, no Redux token).
        const response = await axios.get(
          "http://localhost:5000/api/v1/user/refresh",
          { withCredentials: true }
        );

        const { user } = response.data?.data ?? {};
        const currentUser = store?.getState()?.auth?.user;

        store.dispatch(
          setCredentials({ user: user ?? currentUser })
        );

        // Retry: cookies (including new accessToken) are sent automatically.
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;