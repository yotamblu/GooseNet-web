/**
 * Crypto Utilities
 * Password hashing with fallback for mobile/non-HTTPS contexts
 */

"use client";

/**
 * Hash string using SHA-256 with crypto.subtle
 */
async function sha256String(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Hash password using SHA-256
 * Uses crypto.subtle - must be available in browser context
 */
export async function hashPassword(password: string): Promise<string> {
  // Ensure we're in browser context
  if (typeof window === "undefined") {
    throw new Error("Password hashing must be done in the browser");
  }

  // crypto.subtle must be available (works in HTTPS and localhost)
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("crypto.subtle is not available. Please use HTTPS or localhost.");
  }

  try {
    const hash = await sha256String(password);
    // Debug: Verify hash for "test" matches expected value
    if (password === "test") {
      const expectedHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      if (hash !== expectedHash) {
        console.error("❌ Hash mismatch for 'test':", hash, "expected:", expectedHash);
      } else {
        console.log("✅ Hash verified for 'test'");
      }
    }
    return hash;
  } catch (error) {
    console.error("Failed to hash password with crypto.subtle:", error);
    throw new Error(
      "Password hashing failed. crypto.subtle is required. Please use HTTPS or localhost."
    );
  }
}

