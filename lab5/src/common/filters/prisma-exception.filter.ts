import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const map = this.mapError(exception);

    if (host.getType<string>() === 'graphql') {
      throw new HttpException(
        map.body as Record<string, unknown>,
        map.statusCode,
      );
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(map.statusCode).json(map.body);
  }

  private mapError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    body: unknown;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          body: {
            statusCode: HttpStatus.CONFLICT,
            message: 'Unique constraint failed',
            meta: exception.meta,
          },
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          body: {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Record not found',
            meta: exception.meta,
          },
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          body: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Database error',
            code: exception.code,
          },
        };
    }
  }
}
