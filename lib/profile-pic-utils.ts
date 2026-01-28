/**
 * Profile Picture Utilities
 * Handles both URL and base64 profile picture formats
 */

/**
 * Normalize Google profile image URLs
 * Google profile images can have size parameters that need to be handled
 * URLs like: https://lh3.googleusercontent.com/a/...=s96-c or ...?sz=50
 * 
 * @param url - Google profile image URL
 * @returns Normalized URL without problematic size parameters
 */
function normalizeGoogleProfileUrl(url: string): string {
  // Check if it's a Google profile image URL
  if (url.includes('googleusercontent.com')) {
    try {
      const urlObj = new URL(url);
      
      // Remove size parameters that might cause issues
      // Google uses =s96-c, =s50, ?sz=50, etc.
      // We'll keep the base URL and let the browser handle sizing via CSS
      urlObj.search = ''; // Remove query parameters
      
      // Remove size parameters from pathname (e.g., =s96-c at the end)
      let pathname = urlObj.pathname;
      // Remove size patterns like =s96-c, =s50, etc. from the end
      pathname = pathname.replace(/=[sc]\d+(-[a-z])?$/i, '');
      urlObj.pathname = pathname;
      
      return urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return original
      return url;
    }
  }
  return url;
}

/**
 * Get the proper image source for a profile picture
 * Handles both URL strings and base64 encoded images
 * Normalizes Google profile image URLs to ensure they load properly
 * 
 * @param profilePicString - Either a URL (http/https) or base64 string
 * @returns Properly formatted image source string
 */
export function getProfilePicSrc(profilePicString: string | undefined | null): string | undefined {
  if (!profilePicString) {
    return undefined;
  }

  // Check if it's already a URL (http:// or https://)
  if (profilePicString.startsWith("http://") || profilePicString.startsWith("https://")) {
    // Normalize Google profile URLs
    return normalizeGoogleProfileUrl(profilePicString);
  }

  // Check if it's already a data URI
  if (profilePicString.startsWith("data:")) {
    return profilePicString;
  }

  // Assume it's base64 and add the data URI prefix
  // Try to detect image type from common base64 patterns
  // Default to jpeg if we can't determine
  let mimeType = "image/jpeg";
  
  // Check for common base64 image prefixes
  if (profilePicString.startsWith("/9j/") || profilePicString.startsWith("iVBORw0KGgo")) {
    // JPEG or PNG - try to detect
    if (profilePicString.startsWith("iVBORw0KGgo")) {
      mimeType = "image/png";
    } else {
      mimeType = "image/jpeg";
    }
  } else if (profilePicString.startsWith("UklGR")) {
    mimeType = "image/webp";
  } else if (profilePicString.startsWith("R0lGOD")) {
    mimeType = "image/gif";
  }

  return `data:${mimeType};base64,${profilePicString}`;
}




