import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { buildPaginationLinks } from '../common/pagination/pagination';
import { StorageService } from '../storage/storage.service';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';

class UsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storage: StorageService,
  ) {}

  @ApiOperation({ summary: 'List users (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiResponse({ status: 200 })
  @Header('Cache-Control', 'public, max-age=3600')
  @PublicAccess()
  @Get()
  async findAll(
    @Query() query: UsersQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const { items, hasNext } = await this.usersService.findAll({
      page,
      pageSize,
    });
    const link = buildPaginationLinks({
      baseUrl: '/api/users',
      page,
      pageSize,
      hasNext,
    });
    if (link) res.setHeader('Link', link);
    return items;
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201 })
  @PublicAccess()
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Header('Cache-Control', 'public, max-age=3600')
  @PublicAccess()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const caller = req.user;
    if (caller && caller.role !== 'ADMIN' && caller.userId !== id) {
      throw new BadRequestException('You can only update your own profile');
    }
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Upload user avatar to S3 (Yandex Object Storage)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 201 })
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: Request,
  ) {
    const caller = req?.user;
    if (caller && caller.role !== 'ADMIN' && caller.userId !== id) {
      throw new BadRequestException(
        'You can only upload avatar for your own profile',
      );
    }
    if (!file) throw new BadRequestException('File is required (field: file)');

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type (allowed: jpeg, png, webp)',
      );
    }
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException('File is too large (max 2MB)');
    }

    const ext =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : 'jpg';
    const key = `avatars/${id}/${Date.now()}.${ext}`;

    const { url } = await this.storage.putObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return this.usersService.setAvatarUrl(id, url);
  }
}
