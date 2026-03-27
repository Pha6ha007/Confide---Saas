// Confide — Safe error responses for production
// Never expose internal error details to clients

/**
 * Returns error details only in development, generic message in production.
 * Use in API catch blocks instead of raw error.message.
 */
export function safeErrorDetails(error: unknown): string | undefined {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error'
  }
  return undefined
}

/**
 * Build a safe error response body.
 * In production: { error: "Something went wrong" }
 * In development: { error: "Something went wrong", details: "actual error message" }
 */
export function safeErrorBody(
  publicMessage: string,
  error?: unknown
): { error: string; details?: string } {
  const details = error ? safeErrorDetails(error) : undefined
  return details
    ? { error: publicMessage, details }
    : { error: publicMessage }
}
