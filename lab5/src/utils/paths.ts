/**
 * Utility functions for handling paths with base path support
 */

// Base path from vite config - Vite automatically provides this
export const BASE_PATH = import.meta.env.BASE_URL;

/**
 * Creates a path with the base path prefix
 * @param path - Relative path (should start with /)
 * @returns Path with base path prefix
 */
export const createPath = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // BASE_URL already has trailing slash, so we don't add another one
  return `${BASE_PATH}${cleanPath}`;
};

/**
 * Gets the base path (with trailing slash)
 */
export const getBasePath = (): string => BASE_PATH;

