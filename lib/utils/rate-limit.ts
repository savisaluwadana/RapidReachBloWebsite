// Rate limiting utility for server actions
// Simple in-memory rate limiter (for production, use Redis or similar)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  // Increment count
  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count }
}

/**
 * Rate limit configurations for different actions
 */
export const RATE_LIMITS = {
  // Authentication
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  
  // Content creation
  CREATE_POST: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 posts per hour
  CREATE_COMMENT: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 comments per hour
  UPDATE_POST: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 updates per hour
  
  // Search and queries
  SEARCH: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 searches per minute
  
  // Admin actions
  APPROVE_POST: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 approvals per hour
  UPDATE_USER: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 user updates per hour
} as const

/**
 * Reset rate limit for a specific key
 * Useful for testing or manual overrides
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
