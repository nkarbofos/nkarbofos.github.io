import type { Request, Response } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsedMs = Date.now() - startedAt;
          const type = context.getType<string>();

          if (type === 'http') {
            const http = context.switchToHttp();
            const req = http.getRequest<Request>();
            const res = http.getResponse<Response>();
            res.setHeader('X-Elapsed-Time', `${elapsedMs}ms`);

            console.log(
              `[elapsed] ${req?.method ?? 'HTTP'} ${req?.url ?? ''} ${elapsedMs}ms`,
            );
            return;
          }

          if (type === 'graphql') {
            const gqlCtx = GqlExecutionContext.create(context).getContext<{
              res?: Response;
            }>();
            gqlCtx?.res?.setHeader('X-Elapsed-Time', `${elapsedMs}ms`);

            console.log(`[elapsed] graphql ${elapsedMs}ms`);
          }
        },
      }),
    );
  }
}
