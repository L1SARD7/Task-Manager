import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, details } = this.parseException(exception);

    response.status(statusCode).json({
      success: false,
      statusCode,
      errorCode: this.getErrorCode(statusCode),
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private parseException(exception: unknown): {
    statusCode: number;
    message: string;
    details: string[] | null;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        exception instanceof BadRequestException &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseData = exceptionResponse as {
          message?: string | string[];
        };

        if (Array.isArray(responseData.message)) {
          return {
            statusCode,
            message: 'Validation failed',
            details: responseData.message,
          };
        }
      }

      if (typeof exceptionResponse === 'string') {
        return {
          statusCode,
          message: exceptionResponse,
          details: null,
        };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseData = exceptionResponse as {
          message?: string | string[];
        };

        if (Array.isArray(responseData.message)) {
          return {
            statusCode,
            message: responseData.message.join(', '),
            details: responseData.message,
          };
        }

        if (typeof responseData.message === 'string') {
          return {
            statusCode,
            message: responseData.message,
            details: null,
          };
        }
      }

      return {
        statusCode,
        message: exception.message,
        details: null,
      };
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      exception.name === 'MongoServerError' &&
      'code' in exception &&
      exception.code === 11000
    ) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate key error',
        details: null,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: null,
    };
  }

  private getErrorCode(statusCode: number): string {
    switch (statusCode as HttpStatus) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
