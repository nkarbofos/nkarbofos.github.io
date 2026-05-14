import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type { Request, Response } from 'express';
import { buildPaginationLinks } from '../common/pagination/pagination';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

class LinksQueryDto {
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

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}

@ApiTags('links')
@Controller('api/links')
export class LinksApiController {
  constructor(private readonly linksService: LinksService) {}

  private async assertOwnerOrAdmin(req: Request, linkId: string) {
    const caller = req.user;
    if (!caller) throw new BadRequestException('Missing auth context');
    if (!caller.userId)
      throw new BadRequestException('User is not registered in DB yet');
    if (caller.role === 'ADMIN') return;

    const link = await this.linksService.findOneShallow(linkId);
    if (link.userId !== caller.userId) {
      throw new ForbiddenException('You can only modify your own links');
    }
  }

  @ApiOperation({ summary: 'List links (paginated, with optional filters)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiResponse({ status: 200 })
  @PublicAccess()
  @Get()
  async findAll(
    @Query() query: LinksQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const { items, hasNext } = await this.linksService.findAll({
      page,
      pageSize,
      userId: query.userId,
      tagId: query.tagId,
      courseId: query.courseId,
    });

    const link = buildPaginationLinks({
      baseUrl: '/api/links',
      page,
      pageSize,
      hasNext,
    });
    if (link) res.setHeader('Link', link);
    return items;
  }

  @ApiOperation({ summary: 'Create link' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: CreateLinkDto) {
    return this.linksService.create(dto);
  }

  @ApiOperation({ summary: 'Get link by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @PublicAccess()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.linksService.findOne(id);
  }

  @ApiOperation({ summary: 'Update link by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLinkDto,
    @Req() req: Request,
  ) {
    return (async () => {
      await this.assertOwnerOrAdmin(req, id);
      // Prevent changing ownership or relations via this endpoint.
      const { linkName, githubPagesUrl } = dto;
      return this.linksService.update(id, { linkName, githubPagesUrl });
    })();
  }

  @ApiOperation({ summary: 'Delete link by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.linksService.remove(id);
  }

  @ApiOperation({ summary: 'Attach tag to link' })
  @ApiParam({ name: 'id', description: 'Link id' })
  @ApiParam({ name: 'tagId', description: 'Tag id' })
  @ApiResponse({ status: 201 })
  @Post(':id/tags/:tagId')
  addTag(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('tagId', new ParseUUIDPipe()) tagId: string,
    @Req() req: Request,
  ) {
    return (async () => {
      await this.assertOwnerOrAdmin(req, id);
      return this.linksService.addTag(id, tagId);
    })();
  }

  @ApiOperation({ summary: 'Detach tag from link' })
  @ApiParam({ name: 'id', description: 'Link id' })
  @ApiParam({ name: 'tagId', description: 'Tag id' })
  @ApiResponse({ status: 200 })
  @Delete(':id/tags/:tagId')
  removeTag(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('tagId', new ParseUUIDPipe()) tagId: string,
    @Req() req: Request,
  ) {
    return (async () => {
      await this.assertOwnerOrAdmin(req, id);
      return this.linksService.removeTag(id, tagId);
    })();
  }

  @ApiOperation({ summary: 'Attach course to link' })
  @ApiParam({ name: 'id', description: 'Link id' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiResponse({ status: 201 })
  @Post(':id/courses/:courseId')
  addCourse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Req() req: Request,
  ) {
    return (async () => {
      await this.assertOwnerOrAdmin(req, id);
      return this.linksService.addCourse(id, courseId);
    })();
  }

  @ApiOperation({ summary: 'Detach course from link' })
  @ApiParam({ name: 'id', description: 'Link id' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiResponse({ status: 200 })
  @Delete(':id/courses/:courseId')
  removeCourse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Req() req: Request,
  ) {
    return (async () => {
      await this.assertOwnerOrAdmin(req, id);
      return this.linksService.removeCourse(id, courseId);
    })();
  }
}
