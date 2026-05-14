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
      throw new BadRequestException('User is not registered in DB yet');
    }
    return this.usersService.findOne(req.user.userId);
  }

  @ApiResponse({ status: 201 })
  @Post('register')
  async register(@Req() req: Request, @Body() dto: RegisterProfileDto) {
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
    return user;
  }
}
