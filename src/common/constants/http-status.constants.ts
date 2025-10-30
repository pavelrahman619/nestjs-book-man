/**
 * HTTP Status Codes Constants
 * Centralized constants for consistent HTTP status code usage across the application
 */
export const HTTP_STATUS_CODES = {
  // Success responses
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client error responses
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode =
  (typeof HTTP_STATUS_CODES)[keyof typeof HTTP_STATUS_CODES];
