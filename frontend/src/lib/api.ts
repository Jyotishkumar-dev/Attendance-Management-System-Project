import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${apiUrl}/api`,
});

let accessToken: string | null = localStorage.getItem("accessToken");
let refreshToken: string | null = localStorage.getItem("refreshToken");

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem("accessToken", access);
  else localStorage.removeItem("accessToken");
  if (refresh) localStorage.setItem("refreshToken", refresh);
  else localStorage.removeItem("refreshToken");
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${apiUrl}/api/auth/refresh`, { refreshToken })
            .then((r) => {
              setTokens(r.data.accessToken, refreshToken);
              return r.data.accessToken as string;
            })
            .catch(() => {
              setTokens(null, null);
              window.location.href = "/login";
              return null;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const newToken = await refreshing;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        // fall through to reject
      }
    }
    return Promise.reject(error);
  }
);
