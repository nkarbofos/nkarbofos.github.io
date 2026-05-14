import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function toWeakEtag(payload: unknown): string {
  const json = JSON.stringify(payload);
  const hash = createHash('sha1').update(json).digest('hex');
  return `W/"${hash}"`;
}

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (req.method !== 'GET') return next.handle();

    return next.handle().pipe(
      map((body: unknown) => {
        // Empty body - nothing to tag
        if (body === undefined) return body;

        const etag = toWeakEtag(body);
        res.setHeader('ETag', etag);

        const ifNoneMatch = req.headers['if-none-match'];
        if (typeof ifNoneMatch === 'string' && ifNoneMatch === etag) {
          res.status(304);
          return undefined;
        }

        return body;
      }),
    );
  }
}
