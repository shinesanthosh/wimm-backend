// Simple in-memory token blacklist
// In production, you'd want to use Redis or a database
const blacklistedTokens = new Set<string>()

export const addToBlacklist = (token: string): void => {
  blacklistedTokens.add(token)
}

export const isBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token)
}

export const removeFromBlacklist = (token: string): void => {
  blacklistedTokens.delete(token)
}

// Clean up expired tokens periodically (optional optimization)
export const cleanupExpiredTokens = (): void => {
  // This would require parsing JWT tokens to check expiration
  // For now, we'll rely on the Set growing until server restart
  // In production, use Redis with TTL or database cleanup job
}
