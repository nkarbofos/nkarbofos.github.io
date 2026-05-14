import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthService } from './auth.service';
import type { RequestUser } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const type = context.getType<string>();
    if (type === 'http') {
      const req = context.switchToHttp().getRequest<Request>();
      const authHeader = req.headers.authorization;
      const user = await this.auth.verifyBearerToken(authHeader);
      (req as Request & { user?: RequestUser }).user = user;
      return true;
    }

    if (type === 'graphql') {
      // GraphQL context is configured in AppModule as { req, res }
      const gqlCtx = GqlExecutionContext.create(context).getContext<{
        req?: Request & { user?: RequestUser };
      }>();
      const req = gqlCtx.req;
      const authHeader = req?.headers.authorization;
      const user = await this.auth.verifyBearerToken(authHeader);
      if (req) req.user = user;
      return true;
    }

    return true;
  }
}
