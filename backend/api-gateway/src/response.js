/**
 * Global Response Standardization Utility
 * All services use this format to ensure consistency
 * 
 * Response Schema:
 * {
 *   success: boolean,
 *   message: string,
 *   data: object | null,
 *   error: { code: string, details?: object } | null,
 *   requestId: string (optional, set by gateway/middleware)
 * }
 */

function successResponse(message, data = null, requestId = null) {
  return {
    success: true,
    message,
    data,
    error: null,
    ...(requestId && { requestId }),
  }
}

function errorResponse(message, code, details = null, requestId = null) {
  return {
    success: false,
    message,
    data: null,
    error: {
      code,
      ...(details && { details }),
    },
    ...(requestId && { requestId }),
  }
}

function validationErrorResponse(message, fieldErrors = {}, requestId = null) {
  return {
    success: false,
    message,
    data: null,
    error: {
      code: 'VALIDATION_ERROR',
      details: fieldErrors,
    },
    ...(requestId && { requestId }),
  }
}

// Status code helpers
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  HTTP_STATUS,
}
