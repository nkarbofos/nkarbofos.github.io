import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterProfileDto } from './dto/register-profile.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('api/auth')
export class AuthApiController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: 200 })
  @Get('me')
  async me(@Req() req: Request) {
    if (!req.user?.userId) {
      // #region agent log
      fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '191d33',
        },
        body: JSON.stringify({
          sessionId: '191d33',
          runId: 'pre-fix',
          hypothesisId: 'H3-H5',
          location: 'src/auth/auth-api.controller.ts:me-missing-db-user',
          message: 'GET /api/auth/me has token but no DB user id',
          data: {
            hasFirebaseUid: Boolean(req.user?.firebaseUid),
            hasEmailInToken: Boolean(req.user?.email),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      throw new BadRequestException('User is not registered in DB yet');
    }
    return this.usersService.findOne(req.user.userId);
  }

  @ApiResponse({ status: 201 })
  @Post('register')
  async register(@Req() req: Request, @Body() dto: RegisterProfileDto) {
    // #region agent log
    fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '191d33',
      },
      body: JSON.stringify({
        sessionId: '191d33',
        runId: 'pre-fix',
        hypothesisId: 'H2-H4',
        location: 'src/auth/auth-api.controller.ts:register-entry',
        message: 'POST /api/auth/register entered controller',
        data: {
          hasFirebaseUid: Boolean(req.user?.firebaseUid),
          hasExistingUserId: Boolean(req.user?.userId),
          hasEmailInToken: Boolean(req.user?.email),
          hasEmailInDto: Boolean(dto.email),
          emailMatchesToken: req.user?.email ? req.user.email === dto.email : null,
          firstNameLength: dto.firstName.length,
          lastNameLength: dto.lastName.length,
          hasTelegramUrl: Boolean(dto.telegramUrl),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!req.user?.firebaseUid)
      throw new BadRequestException('Missing firebase uid');

    if (req.user.email && req.user.email !== dto.email) {
      throw new BadRequestException(
        'Email in token does not match email in request body',
      );
    }

    const user = await this.usersService.upsertByFirebaseUid({
      firebaseUid: req.user.firebaseUid,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      telegramUrl: dto.telegramUrl,
    });
    // #region agent log
    fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '191d33',
      },
      body: JSON.stringify({
        sessionId: '191d33',
        runId: 'pre-fix',
        hypothesisId: 'H4-H5',
        location: 'src/auth/auth-api.controller.ts:register-upsert-result',
        message: 'POST /api/auth/register upsert completed',
        data: {
          hasDbProfileId: Boolean(user.id),
          hasFirebaseUid: Boolean(user.firebaseUid),
          role: user.role,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return user;
  }
}
