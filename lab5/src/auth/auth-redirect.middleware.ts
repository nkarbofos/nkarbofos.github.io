import type { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { RequestUser } from './auth.types';

@Injectable()
export class AuthRedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const accept = req.headers.accept ?? '';
    const wantsHtml =
      typeof accept === 'string' && accept.includes('text/html');
    const user = (req as Request & { user?: RequestUser }).user;
    const isAuthed = Boolean(user);

    if (wantsHtml && !isAuthed) {
      return res.redirect('/login');
    }
    return next();
  }
}
