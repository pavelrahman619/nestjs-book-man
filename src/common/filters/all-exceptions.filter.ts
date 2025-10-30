import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { HTTP_STATUS_CODES } from '../constants/http-status.constants';

/**
 * Global exception filter for standardized error handling
 * Catches all exceptions and formats them consistently
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HTTP exceptions (validation errors, not found, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || HttpStatus[status] || 'Unknown Error';
      } else {
        message = exception.message;
        error = HttpStatus[status] || 'Unknown Error';
      }
    }
    // Handle TypeORM database errors
    else if (exception instanceof QueryFailedError) {
      if (exception.message.includes('UNIQUE constraint')) {
        status = HTTP_STATUS_CODES.CONFLICT;
        message = 'Resource already exists';
        error = 'Conflict';
      } else {
        status = HTTP_STATUS_CODES.BAD_REQUEST;
        message = 'Database operation failed';
        error = 'Bad Request';
      }
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Send standardized error response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
