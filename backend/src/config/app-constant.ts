export const CONFIG = {
    GUEST_EVENT_WINDOW_MS: 6 * 60 * 60 * 1000,  // 6 hours in milliseconds
    PASSWORD_RESET_RATE_LIMIT: 3,  // Maximum requests allowed per hour
    PASSWORD_RESET_RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000,  // 1 hour in milliseconds
    CLOUD_URL: 'https://s3.nevaobjects.id/si-cerdas'
}