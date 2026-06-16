import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ClsService } from 'nestjs-cls';

interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly cls: ClsService) {}

  private safeGetString(key: string): string {
    const value = this.cls.get(key);
    return typeof value === 'string' ? value : 'unknown';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = this.safeGetString('requestId');

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'Erro interno no servidor.';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseBody = exception.getResponse() as HttpExceptionResponse;

      // NestJS ValidationPipe errors usually return an array of messages
      if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        message = responseBody.message ?? 'Unknown error';
        code = Array.isArray(message)
          ? 'VALIDATION_ERROR'
          : (typeof responseBody.error === 'string'
              ? responseBody.error
              : 'HTTP_EXCEPTION'
            )
              .toUpperCase()
              .replace(/\s+/g, '_');
      } else {
        message = exception.message;
        code = 'HTTP_EXCEPTION';
      }
    }

    // Log the error securely (without exposing to client if 500)
    const method = request.method ?? 'UNKNOWN';
    const url = request.url ?? '/unknown';

    if (statusCode >= 500) {
      this.logger.error(
        `[${requestId}] ${method} ${url} - ${String(exception)}`,
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${method} ${url} - ${statusCode} - ${JSON.stringify(message)}`,
      );
    }

    // Secure Response Payload
    response.status(statusCode).json({
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: url,
      requestId, // Helps support debug user issues without exposing server internals
    });
  }
}
