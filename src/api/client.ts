import axios, { type InternalAxiosRequestConfig } from "axios";

// Set VITE_API_BASE_URL at build time (Vercel / Netlify / Cloudflare Pages env settings).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// A 401 on a request that carried a token means the session was revoked or expired.
// A 401 without one (e.g. wrong password on the login form) is left to the caller.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export const MAX_PAGE_SIZE = 100;

export interface PageResult<T> {
  items: T[];
  total: number;
}

/** Fetch one page of a paginated list endpoint; the total comes from X-Total-Count. */
export async function getPage<T>(
  url: string,
  limit: number,
  offset: number,
  params?: Record<string, unknown>,
): Promise<PageResult<T>> {
  const res = await client.get<T[]>(url, { params: { ...params, limit, offset } });
  const total = Number(res.headers["x-total-count"] ?? res.data.length);
  return { items: res.data, total };
}

/** Fetch every page of a paginated list endpoint (for views that need the full list). */
export async function getAllPages<T>(url: string, params?: Record<string, unknown>): Promise<T[]> {
  const all: T[] = [];
  for (;;) {
    const { items, total } = await getPage<T>(url, MAX_PAGE_SIZE, all.length, params);
    all.push(...items);
    if (items.length === 0 || all.length >= total) return all;
  }
}

export default client;
