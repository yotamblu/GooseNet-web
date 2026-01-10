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
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
   * Sends to GooseAPI with SHA-256 hashed password
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
            hashedPassword: hashedPassword,
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

  // ==================== Example API Methods ====================

  /**
   * Get workouts
   */
  async getWorkouts<T = unknown>(): Promise<ApiResponse<T>> {
    return this.get<T>("/workouts");
  }

  /**
   * Get workout by ID
   */
  async getWorkout<T = unknown>(id: string): Promise<ApiResponse<T>> {
    return this.get<T>(`/workouts/${id}`);
  }

  /**
   * Create workout
   */
  async createWorkout<T = unknown>(workout: unknown): Promise<ApiResponse<T>> {
    return this.post<T>("/workouts", workout);
  }

  /**
   * Update workout
   */
  async updateWorkout<T = unknown>(id: string, workout: unknown): Promise<ApiResponse<T>> {
    return this.put<T>(`/workouts/${id}`, workout);
  }

  /**
   * Delete workout
   */
  async deleteWorkout<T = unknown>(id: string): Promise<ApiResponse<T>> {
    return this.delete<T>(`/workouts/${id}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for custom instances if needed
export default ApiService;

