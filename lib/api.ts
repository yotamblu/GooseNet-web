/**
 * API Fetch Wrapper
 * Automatically handles authentication and 401 responses
 */

import { getToken, clearToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gooseapi.ddns.net";

/**
 * Fetch wrapper with automatic authentication
 * - Automatically attaches Authorization header if token exists
 * - Handles 401 by clearing token and redirecting to login
 * - Throws errors for non-OK responses
 * - Returns parsed JSON
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Using JWT token for API request to:", path);
  } else {
    console.log("⚠️ No token found for API request to:", path);
  }

  // Build URL
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    clearToken();
    // Redirect to login (only in browser)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized. Please log in again.");
  }

  // Parse response
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  let data: T;
  try {
    data = isJson ? await response.json() : ((await response.text()) as unknown as T);
  } catch (error) {
    throw new Error("Failed to parse response");
  }

  // Throw error for non-OK responses
  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message: string }).message
        : `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
}

