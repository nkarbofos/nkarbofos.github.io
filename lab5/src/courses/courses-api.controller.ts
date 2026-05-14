import {
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
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import type { Response } from 'express';
import { buildPaginationLinks } from '../common/pagination/pagination';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesService } from './courses.service';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

class CoursesQueryDto {
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
  pageSize?: number = 50;
}

@ApiTags('courses')
@Controller('api/courses')
export class CoursesApiController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'List courses (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiResponse({ status: 200 })
  @Header('Cache-Control', 'public, max-age=3600')
  @PublicAccess()
  @Get()
  async findAll(
    @Query() query: CoursesQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;

    const { items, hasNext } = await this.coursesService.findAll({
      page,
      pageSize,
    });
    const link = buildPaginationLinks({
      baseUrl: '/api/courses',
      page,
      pageSize,
      hasNext,
    });
    if (link) res.setHeader('Link', link);
    return items;
  }

  @ApiOperation({ summary: 'Create course' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @ApiOperation({ summary: 'Get course by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Header('Cache-Control', 'public, max-age=3600')
  @PublicAccess()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.coursesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update course by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete course by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.coursesService.remove(id);
  }
}
