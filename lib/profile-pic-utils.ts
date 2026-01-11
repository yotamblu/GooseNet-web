/**
 * Profile Picture Utilities
 * Handles both URL and base64 profile picture formats
 */

/**
 * Get the proper image source for a profile picture
 * Handles both URL strings and base64 encoded images
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
    return profilePicString;
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

