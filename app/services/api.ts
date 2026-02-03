/**
 * API Service Class
 * Centralized service for making HTTP requests to the GooseNet API
 */

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Use environment variable or default to GooseAPI
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://gooseapi.ddns.net";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Hash password using SHA-256
   * Matches the exact implementation: encoder -> digest -> array -> hex string
   */
  private async hashPassword(password: string): Promise<string> {
    // Debug: Log password details to verify it's not modified
    console.log("🔐 API Service - Password to hash length:", password.length, "first char:", password.charCodeAt(0));
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    
    // Debug: Verify hash for "test"
    if (password === "test") {
      const expectedHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      if (hashHex !== expectedHash) {
        console.error("❌ API Service - Hash mismatch for 'test':", hashHex, "expected:", expectedHash);
      } else {
        console.log("✅ API Service - Hash verified for 'test'");
      }
    }
    console.log("🔐 API Service - Generated hash:", hashHex);
    return hashHex;
  }

  /**
   * Get authentication token from storage
   */
  getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  /**
   * Set authentication token in storage
   */
  setAuthToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("authToken", token);
  }

  /**
   * Remove authentication token from storage
   */
  clearAuthToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
  }

  /**
   * Build headers for request
   */
  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add authentication token if required
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: T;
    try {
      data = isJson ? await response.json() : ((await response.text()) as unknown as T);
    } catch (error) {
      throw new Error("Failed to parse response");
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "message" in data
          ? (data as { message: string }).message
          : `API Error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return {
      data,
      status: response.status,
      message: typeof data === "object" && data !== null && "message" in data ? (data as { message: string }).message : undefined,
    };
  }

  /**
   * Make HTTP request
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, requiresAuth = true } = options;

    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders({ ...options, requiresAuth });

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    // Log request
    console.log("🚀 API Request:", {
      method,
      url,
      headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, key === "Authorization" ? "Bearer ***" : value])),
      body: body ? JSON.stringify(body, null, 2) : undefined,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await fetch(url, config);
      
      // Log response status
      console.log("📥 API Response:", {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
      });

      const result = await this.handleResponse<T>(response);
      
      // Log response data
      console.log("✅ API Response Data:", {
        method,
        url,
        status: result.status,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      // Log error
      console.error("❌ API Error:", {
        method,
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // ==================== Authentication Methods ====================

  /**
   * Login user with username and password
   * Sends SHA-256 hashed password to match what backend expects for login
   * Throws specific error for 401 (invalid credentials)
   */
  async login(username: string, password: string): Promise<ApiResponse<unknown>> {
    const hashedPassword = await this.hashPassword(password);
    
    try {
      // Use full URL for GooseAPI login endpoint
      const response = await this.request<unknown>(
        "https://gooseapi.ddns.net/api/userAuth",
        {
          method: "POST",
          body: {
            userName: username,
            hashedPassword: hashedPassword, // Send SHA-256 hashed password
          },
          requiresAuth: false,
        }
      );

      // Store token from response - check multiple possible field names
      if (response.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        
        // Check for token in various possible fields
        const token = 
          (data.token as string) || 
          (data.accessToken as string) || 
          (data.access_token as string) ||
          (data.authToken as string) ||
          (data.auth_token as string) ||
          (data.jwt as string) ||
          (data.jwtToken as string);
        
        if (token && typeof token === "string") {
          console.log("✅ Token found and stored:", token.substring(0, 20) + "...");
          this.setAuthToken(token);
        } else {
          console.warn("⚠️ No token found in response. Full response:", JSON.stringify(response.data, null, 2));
          // Even if no token, consider login successful if we got a 200 response
          // Some APIs might use session cookies instead
          console.log("⚠️ Login successful but no token field found. API may use session-based auth.");
        }
      } else {
        console.warn("⚠️ Response data is not an object:", response.data);
      }

      return response;
    } catch (error) {
      // Re-throw with specific message for 401 errors
      if (error instanceof Error && (error as Error & { status?: number }).status === 401) {
        throw new Error("Invalid username or password. Please check your credentials and try again.");
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.post("/auth/logout", {}, { requiresAuth: true });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      this.clearAuthToken();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser<T = unknown>(): Promise<ApiResponse<T>> {
    return this.get<T>("/auth/me");
  }

  // ==================== Example API Methods (Legacy) ====================
  // Note: These are example methods. Use workoutSummary endpoints instead.

  // ==================== Coach Methods ====================

  /**
   * Get all athletes for a coach
   * @param apiKey - The coach's API key
   */
  async getAthletes<T = unknown>(apiKey: string): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/athletes?apiKey=${encodeURIComponent(apiKey)}`);
  }

  /**
   * Get all flocks for a coach
   * @param apiKey - The coach's API key
   */
  async getFlocks<T = unknown>(apiKey: string): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/flocks/getFlocks?apiKey=${encodeURIComponent(apiKey)}`);
  }

  /**
   * Create a new flock for a coach
   * @param apiKey - The coach's API key
   * @param flockName - The name of the flock to create
   */
  async createFlock<T = unknown>(apiKey: string, flockName: string): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
      flockName: flockName,
    });
    return this.post<T>(
      `/api/flocks/createFlock?${params.toString()}`,
      undefined
    );
  }

  /**
   * Get all athletes in a specific flock
   * @param apiKey - The coach's API key
   * @param flockName - The name of the flock
   */
  async getFlockAthletes<T = unknown>(apiKey: string, flockName: string): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/flocks/flockAthletes?apiKey=${encodeURIComponent(apiKey)}&flockName=${encodeURIComponent(flockName)}`);
  }

  /**
   * Add an athlete to a flock
   * @param apiKey - The coach's API key
   * @param athleteUserName - The username of the athlete to add
   * @param flockName - The name of the flock
   */
  async addToFlock<T = unknown>(apiKey: string, athleteUserName: string, flockName: string): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
    });
    return this.post<T>(
      `/api/flocks/addToFlock?${params.toString()}`,
      {
        athleteUserName: athleteUserName,
        flockName: flockName,
      }
    );
  }

  /**
   * Remove an athlete from a flock
   * @param apiKey - The coach's API key
   * @param flockName - The name of the flock
   * @param athleteName - The name of the athlete to remove
   */
  async removeAthleteFromFlock<T = unknown>(apiKey: string, flockName: string, athleteName: string): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
    });
    return this.post<T>(
      `/api/flocks/removeAthlete?${params.toString()}`,
      {
        FlockName: flockName,
        AthleteName: athleteName,
      }
    );
  }

  // ==================== Garmin OAuth Methods ====================

  /**
   * Validate if athlete is already connected to Garmin
   * @param apiKey - The user's API key
   * @returns Response with isConnected boolean
   */
  async validateGarminConnection<T = { isConnected: boolean }>(apiKey: string): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/ValidateGarminConnection?apiKey=${encodeURIComponent(apiKey)}`);
  }

  /**
   * Request OAuth token from Garmin
   * @param apiKey - API key (required) - always passed as query string
   * @returns Response with: { stateToken: string, oauth_token: string, oauth_token_secret: string }
   */
  async requestGarminToken<T = { stateToken: string; oauth_token: string; oauth_token_secret: string }>(
    apiKey: string
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/request-token?apiKey=${encodeURIComponent(apiKey)}`);
  }

  /**
   * Get JWT token from state token
   * @param stateToken - State token from OAuth flow
   * @returns Response with: { token: string } or { message: string } if expired
   */
  async getJwtFromStateToken<T = { token: string } | { message: string }>(
    stateToken: string
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/auth/stateToken?token=${encodeURIComponent(stateToken)}`, {
      requiresAuth: false,
    });
  }

  /**
   * Get OAuth token secret from state token
   * @param stateToken - State token from OAuth flow
   * @returns Response with: { token_secret: string, apiKey: string } or { message: string } if expired
   */
  async getOAuthDataFromStateToken<T = { token_secret: string; apiKey: string } | { message: string }>(
    stateToken: string
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/api/auth/stateToken/oauth?token=${encodeURIComponent(stateToken)}`, {
      requiresAuth: false,
    });
  }

  /**
   * Get Garmin access token after OAuth callback (Stateful flow)
   * @param oauth_token - OAuth token from callback
   * @param oauth_verifier - OAuth verifier from callback
   * @param state - State from initial request (stateful flow)
   * @param apiKey - User's API key
   */
  async getGarminAccessTokenStateful<T = unknown>(
    oauth_token: string,
    oauth_verifier: string,
    state: string,
    apiKey: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
      state: state,
      apiKey: apiKey,
    });
    return this.get<T>(`/api/access-token?${params.toString()}`);
  }

  /**
   * Get Garmin access token after OAuth callback (Stateless flow)
   * @param oauth_token - OAuth token from callback
   * @param oauth_verifier - OAuth verifier from callback
   * @param token_secret - Token secret from initial request
   * @param apiKey - Optional API key to include in request
   */
  async getGarminAccessTokenStateless<T = unknown>(
    oauth_token: string,
    oauth_verifier: string,
    token_secret: string,
    apiKey?: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
      token_secret: token_secret,
    });
    if (apiKey) {
      params.append("apiKey", apiKey);
    }
    return this.get<T>(`/api/access-token?${params.toString()}`);
  }

  /**
   * Get Garmin access token after OAuth callback (Legacy method for backward compatibility)
   * @deprecated Use getGarminAccessTokenStateful or getGarminAccessTokenStateless instead
   */
  async getGarminAccessToken<T = unknown>(
    oauth_token: string,
    oauth_verifier: string,
    token_secret: string,
    apiKey: string
  ): Promise<ApiResponse<T>> {
    // Default to stateless flow for backward compatibility
    return this.getGarminAccessTokenStateless<T>(oauth_token, oauth_verifier, token_secret);
  }

  // ==================== Workout Methods ====================

  /**
   * Get workout summary for a specific date
   * @param athleteName - Name of the athlete
   * @param apiKey - API key for authorization
   * @param date - Date in format "MM/dd/yyyy" or "M/d/yyyy"
   */
  async getWorkoutSummary<T = { runningWorkouts: unknown[]; strengthWorkouts: unknown[] }>(
    athleteName: string,
    apiKey: string,
    date: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      athleteName: athleteName,
      apiKey: apiKey,
      date: date,
    });
    return this.get<T>(`/api/workoutSummary?${params.toString()}`);
  }

  /**
   * Get workout feed with pagination
   * @param apiKey - API key for authorization
   * @param athleteName - Name of the athlete
   * @param runningCursor - Optional cursor for running workouts pagination (MM/dd/yyyy)
   * @param strengthCursor - Optional cursor for strength workouts pagination (MM/dd/yyyy)
   */
  async getWorkoutFeed<T = {
    runningWorkouts: unknown[];
    strengthWorkouts: unknown[];
    runningNextCursor: string | null;
    strengthNextCursor: string | null;
  }>(
    apiKey: string,
    athleteName: string,
    runningCursor?: string | null,
    strengthCursor?: string | null
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
      athleteName: athleteName,
    });
    if (runningCursor) {
      params.append("runningCursor", runningCursor);
    }
    if (strengthCursor) {
      params.append("strengthCursor", strengthCursor);
    }
    return this.get<T>(`/api/workoutSummary/feed?${params.toString()}`);
  }

  /**
   * Get detailed workout by ID
   * @param userName - Username of the athlete
   * @param id - Workout ID
   */
  async getWorkout<T = unknown>(userName: string, id: string): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      userName: userName,
      id: id,
    });
    return this.get<T>(`/api/workoutSummary/getWorkout?${params.toString()}`, {
      requiresAuth: false,
    });
  }

  /**
   * Get workout data (samples and laps)
   * @param workoutId - Workout ID
   * @param userName - Username of the athlete
   */
  async getWorkoutData<T = { dataSamples: unknown[]; workoutLaps: unknown[] }>(
    workoutId: string,
    userName: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      userName: userName,
      workoutId: workoutId,
    });
    return this.get<T>(`/api/workoutSummary/data?${params.toString()}`, {
      requiresAuth: false,
    });
  }

  /**
   * Get profile picture for a user
   * @param userName - Username of the user
   * @returns Response with profile picture data (text/string)
   */
  async getProfilePic(userName: string): Promise<ApiResponse<string>> {
    const params = new URLSearchParams({
      userName: userName,
    });
    return this.get<string>(`/api/profilePic?${params.toString()}`, {
      requiresAuth: false,
    });
  }

  /**
   * Get strength workout details by ID
   * @param workoutId - Strength workout ID
   */
  async getStrengthWorkout<T = unknown>(workoutId: string): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      id: workoutId,
    });
    return this.get<T>(`/api/strength/workout?${params.toString()}`, {
      requiresAuth: false,
    });
  }

  /**
   * Submit strength workout review
   * @param apiKey - API key for authorization
   * @param workoutId - Strength workout ID
   * @param review - Review data
   */
  async submitStrengthWorkoutReview<T = unknown>(
    apiKey: string,
    workoutId: string,
    review: { athleteName: string; reviewContent: string; difficultyLevel: number }
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
      workoutId: workoutId,
    });
    return this.post<T>(`/api/strength/reviews?${params.toString()}`, review);
  }

  // ==================== Planned Workout Methods ====================

  /**
   * Get planned workout feed with pagination
   * @param apiKey - API key for authorization
   * @param athleteName - Name of the athlete
   * @param runningCursor - Optional cursor for running workouts pagination
   * @param strengthCursor - Optional cursor for strength workouts pagination
   */
  async getPlannedWorkoutFeed<T = {
    runningWorkouts: unknown[];
    strengthWorkouts: unknown[];
    runningNextCursor: string | null;
    strengthNextCursor: string | null;
  }>(
    apiKey: string,
    athleteName: string,
    runningCursor?: string | null,
    strengthCursor?: string | null
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
      athleteName: athleteName,
    });
    if (runningCursor) {
      params.append("runningCursor", runningCursor);
    }
    if (strengthCursor) {
      params.append("strengthCursor", strengthCursor);
    }
    return this.get<T>(`/api/planned/feed?${params.toString()}`);
  }

  /**
   * Get planned workouts by date
   * @param apiKey - API key for authorization
   * @param athleteName - Name of the athlete
   * @param date - Date in format "MM/dd/yyyy" or "M/d/yyyy"
   */
  async getPlannedWorkoutsByDate<T = {
    runningWorkouts: unknown[];
    strengthWorkouts: unknown[];
  }>(
    apiKey: string,
    athleteName: string,
    date: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      apiKey: apiKey,
      athleteName: athleteName,
      date: date,
    });
    return this.get<T>(`/api/plannedWorkout/byDate?${params.toString()}`);
  }

  /**
   * Get planned workout by ID
   * @param id - Planned workout ID
   */
  async getPlannedWorkoutById<T = unknown>(
    id: string
  ): Promise<ApiResponse<T>> {
    const params = new URLSearchParams({
      id: id,
    });
    return this.get<T>(`/api/plannedWorkout/byId?${params.toString()}`, {
      requiresAuth: false,
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for custom instances if needed
export default ApiService;

