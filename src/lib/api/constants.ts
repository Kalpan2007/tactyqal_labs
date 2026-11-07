/**
 * Values shared by the Edge middleware and the Node request handlers.
 * Kept free of Node built-ins: anything imported here is bundled for the Edge
 * runtime, which has no `node:crypto`.
 */
export const ADMIN_COOKIE = "tactyqal_admin";
