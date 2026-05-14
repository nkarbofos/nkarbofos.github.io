import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import type { RequestUser } from './auth.types';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const type = context.getType<string>();
    const user: RequestUser | undefined =
      type === 'graphql'
        ? GqlExecutionContext.create(context).getContext<{
            req?: Request & { user?: RequestUser };
          }>()?.req?.user
        : context.switchToHttp().getRequest<Request & { user?: RequestUser }>()
            .user;

    if (!user?.role) throw new ForbiddenException('Missing user role');
    if (!required.includes(user.role))
      throw new ForbiddenException('Forbidden');
    return true;
  }
}
