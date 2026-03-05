import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { env } from 'src/config/env'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const { statusCode, body } = this.buildResponse(exception, request)

    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception)
      )
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} -> ${statusCode}: ${body.message}`
      )
    }

    response.status(statusCode).json(body)
  }

  private buildResponse(exception: unknown, request: Request) {
    const timestamp = new Date().toISOString()
    const path = request.url

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      // NestJS HttpException.getResponse() can return a string or an object
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message ||
            exception.message

      const error =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as Record<string, unknown>).error
          : undefined

      return {
        statusCode,
        body: {
          statusCode,
          ...(error ? { error } : {}),
          message,
          timestamp,
          path,
        },
      }
    }

    // Unhandled / unknown exceptions -> 500
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    const isProduction = env.nodeEnv === 'production'

    return {
      statusCode,
      body: {
        statusCode,
        error: 'Internal Server Error',
        message: isProduction
          ? 'Internal server error'
          : exception instanceof Error
            ? exception.message
            : String(exception),
        ...(isProduction
          ? {}
          : {
              stack:
                exception instanceof Error ? exception.stack : undefined,
            }),
        timestamp,
        path,
      },
    }
  }
}
