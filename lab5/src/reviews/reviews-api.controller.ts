import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

class ReviewsQueryDto {
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

@ApiTags('reviews')
@Controller('api/reviews')
export class ReviewsApiController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'List reviews (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiResponse({ status: 200 })
  @PublicAccess()
  @Get()
  async findAll(
    @Query() query: ReviewsQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const { items, hasNext } = await this.reviewsService.findAll({
      page,
      pageSize,
    });
    const link = buildPaginationLinks({
      baseUrl: '/api/reviews',
      page,
      pageSize,
      hasNext,
    });
    if (link) res.setHeader('Link', link);
    return items;
  }

  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @ApiOperation({ summary: 'Get review by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @PublicAccess()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviewsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update review by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete review by id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviewsService.remove(id);
  }
}
