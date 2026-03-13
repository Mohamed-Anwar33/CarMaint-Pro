// Database module — types and schema exports only
// Data operations now use Supabase JS client directly in API routes
export * from "./schema";

// Legacy exports (no-op) kept for backwards compatibility
export const pool = null;
export const db = null;
