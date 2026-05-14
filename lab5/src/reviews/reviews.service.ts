import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        userId: dto.userId,
        score: dto.score,
        comment: dto.comment,
      },
    });
  }

  async findAll(args: { page: number; pageSize: number }) {
    const skip = (args.page - 1) * args.pageSize;
    const take = args.pageSize + 1;

    const items = await this.prisma.review.findMany({
      orderBy: { id: 'desc' },
      skip,
      take,
      include: { user: true },
    });

    const hasNext = items.length > args.pageSize;
    return { items: items.slice(0, args.pageSize), hasNext };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, links: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findOneShallow(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        score: true,
        comment: true,
      },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  update(id: string, dto: UpdateReviewDto) {
    return this.prisma.review.update({
      where: { id },
      data: {
        userId: dto.userId,
        score: dto.score,
        comment: dto.comment,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.review.delete({ where: { id } });
    return { ok: true };
  }
}
