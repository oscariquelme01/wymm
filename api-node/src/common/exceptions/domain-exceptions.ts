import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'

/**
 * Thrown when a domain entity is not found.
 * Results in a 404 response.
 */
export class EntityNotFoundException extends NotFoundException {
  constructor(entityName: string, id?: string | number) {
    const message = id
      ? `${entityName} with id '${id}' not found`
      : `${entityName} not found`
    super(message)
  }
}

/**
 * Thrown when an external service (e.g. Enable Banking API) returns an error.
 * Results in a 502 Bad Gateway response, since the upstream service failed.
 */
export class ExternalServiceException extends HttpException {
  constructor(
    service: string,
    detail: string,
    public readonly originalError?: unknown
  ) {
    super(
      {
        statusCode: 502,
        error: 'Bad Gateway',
        message: `${service}: ${detail}`,
      },
      502
    )
  }
}

/**
 * Thrown when the server encounters an unexpected internal state.
 * Results in a 500 response.
 */
export class InternalStateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message)
  }
}
