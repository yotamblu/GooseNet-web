/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setToken, getToken, clearToken } from "../lib/auth";
import { apiFetch } from "../lib/api";

interface User {
  userName: string;
  email: string;
  role: string;
  apiKey: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userName: string, hashedPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Hash password using SHA-256
   */
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  /**
   * Fetch current user from /me endpoint
   */
  const fetchUser = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      console.log("ℹ️ No token found, user not authenticated");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Fetching user data from /api/userAuth/me with JWT token");
      const userData = await apiFetch<User>("/api/userAuth/me");
      console.log("✅ User data fetched successfully:", userData);
      setUser(userData);
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      // If /me fails, clear token and user
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (userName: string, password: string): Promise<void> => {
    const hashedPassword = await hashPassword(password);

    // Call login endpoint (without auth header since we're logging in)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gooseapi.ddns.net";
    const response = await fetch(`${API_BASE_URL}/api/userAuth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        hashedPassword,
      }),
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new Error("Invalid username or password. Please check your credentials and try again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Store token
    if (data.token) {
      console.log("✅ JWT Token received and saved:", data.token.substring(0, 20) + "...");
      setToken(data.token);
      console.log("✅ Token stored in localStorage");
    } else {
      throw new Error("No token received from server");
    }

    // Fetch user data using the token
    await fetchUser();
  };

  /**
   * Logout user
   * Client-side only - clears token and user state
   */
  const logout = async (): Promise<void> => {
    // Clear token and user state
    clearToken();
    setUser(null);
    router.push("/login");
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  // On mount, fetch user if token exists
  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

