/**
 * API Helper Functions
 * Convenience functions for making authenticated API calls
 */

import { apiFetch } from "./api";

/**
 * Example: Get user data
 * The token is automatically included in the request
 */
export async function getUserData() {
  return apiFetch<{
    userName: string;
    email: string;
    role: string;
    apiKey: string;
  }>("/api/userAuth/me");
}

/**
 * Get current user data
 * Uses the /api/userAuth/me endpoint with JWT token
 */
export async function getCurrentUser() {
  return apiFetch<{
    userName: string;
    email: string;
    role: string;
    apiKey: string;
  }>("/api/userAuth/me");
}

/**
 * Example: Make any authenticated API call
 * Replace with your actual API endpoints
 */
export async function getWorkouts() {
  return apiFetch("/api/workouts");
}

export async function getWorkout(id: string) {
  return apiFetch(`/api/workouts/${id}`);
}

export async function createWorkout(workout: unknown) {
  return apiFetch("/api/workouts", {
    method: "POST",
    body: JSON.stringify(workout),
  });
}

/**
 * How to use in any component:
 * 
 * import { apiFetch } from "@/lib/api";
 * 
 * // Get user data (token automatically included)
 * const userData = await apiFetch("/api/userAuth/me");
 * 
 * // Or use the helper function
 * import { getCurrentUser } from "@/lib/api-helpers";
 * const user = await getCurrentUser();
 */

