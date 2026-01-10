/**
 * Require Authentication Hook
 * Redirects to login if user is not authenticated
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/**
 * Hook that requires authentication
 * Redirects to /login if user is not authenticated
 */
export function useRequireAuth(): void {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;

    // If no user, redirect to login
    if (!user) {
      router.push("/login");
    }
  }, [user, loading, router]);
}

