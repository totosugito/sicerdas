// 6 hours in milliseconds
export const GUEST_EVENT_WINDOW_MS = 6 * 60 * 60 * 1000;

// Password reset rate limiting
export const PASSWORD_RESET_RATE_LIMIT = 3; // Maximum requests allowed per hour
export const PASSWORD_RESET_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds