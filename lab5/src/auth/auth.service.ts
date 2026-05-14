import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_OPTIONS, type AuthModuleOptions } from './auth.options';
import type { RequestUser } from './auth.types';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
  ) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: options.firebaseProjectId,
          clientEmail: options.firebaseClientEmail,
          privateKey: options.firebasePrivateKey,
        }),
      });
    }
  }

  async verifyBearerToken(authorizationHeader?: string): Promise<RequestUser> {
    const token = this.extractBearerToken(authorizationHeader);
    if (!token)
      throw new UnauthorizedException('Missing Authorization: Bearer <token>');

    const decoded: DecodedIdToken | null = await getAuth()
      .verifyIdToken(token)
      .catch(() => null);
    if (!decoded?.uid) throw new UnauthorizedException('Invalid token');

    const firebaseUid = decoded.uid;
    const email = decoded.email ?? undefined;

    const existingByUid = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true, firebaseUid: true, role: true, email: true },
    });
    if (existingByUid) {
      return {
        userId: existingByUid.id,
        firebaseUid,
        role: existingByUid.role,
        email: existingByUid.email,
      };
    }

    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, firebaseUid: true, email: true },
      });
      if (existingByEmail) {
        const updated = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { firebaseUid },
          select: { id: true, role: true, email: true },
        });
        return {
          userId: updated.id,
          firebaseUid,
          role: updated.role,
          email: updated.email,
        };
      }
    }

    return { firebaseUid, role: 'USER', email };
  }

  private extractBearerToken(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) return null;
    return token;
  }
}
