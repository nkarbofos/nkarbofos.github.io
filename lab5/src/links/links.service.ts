import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLinkDto) {
    return this.prisma.link.create({
      data: {
        userId: dto.userId,
        reviewId: dto.reviewId,
        linkName: dto.linkName,
        githubPagesUrl: dto.githubPagesUrl,
      },
    });
  }

  async findAll(args: {
    page: number;
    pageSize: number;
    userId?: string;
    tagId?: string;
    courseId?: string;
  }) {
    const skip = (args.page - 1) * args.pageSize;
    const take = args.pageSize + 1;

    const where: Prisma.LinkWhereInput = {
      ...(args.userId ? { userId: args.userId } : {}),
      ...(args.tagId
        ? {
            tags: {
              some: {
                tagId: args.tagId,
              },
            },
          }
        : {}),
      ...(args.courseId
        ? {
            courses: {
              some: {
                courseId: args.courseId,
              },
            },
          }
        : {}),
    };

    const items = await this.prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      where,
      include: {
        user: true,
        review: true,
        tags: { include: { tag: true } },
        courses: { include: { course: true } },
      },
    });

    const hasNext = items.length > args.pageSize;
    return { items: items.slice(0, args.pageSize), hasNext };
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: {
        user: true,
        review: { include: { user: true } },
        tags: { include: { tag: true } },
        courses: { include: { course: true } },
      },
    });
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async findOneShallow(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        reviewId: true,
        linkName: true,
        githubPagesUrl: true,
        createdAt: true,
      },
    });
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async findManyForUser(userId: string) {
    return this.prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        reviewId: true,
        linkName: true,
        githubPagesUrl: true,
        createdAt: true,
      },
    });
  }

  async findManyForReview(reviewId: string) {
    return this.prisma.link.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        reviewId: true,
        linkName: true,
        githubPagesUrl: true,
        createdAt: true,
      },
    });
  }

  async findTagsForLink(linkId: string) {
    const rows = await this.prisma.linkTag.findMany({
      where: { linkId },
      include: { tag: true },
    });
    return rows.map((r) => r.tag);
  }

  async findCoursesForLink(linkId: string) {
    const rows = await this.prisma.linkCourse.findMany({
      where: { linkId },
      include: { course: true },
    });
    return rows.map((r) => r.course);
  }

  update(id: string, dto: Pick<UpdateLinkDto, 'linkName' | 'githubPagesUrl'>) {
    return this.prisma.link.update({
      where: { id },
      data: {
        linkName: dto.linkName,
        githubPagesUrl: dto.githubPagesUrl,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.link.delete({ where: { id } });
    return { ok: true };
  }

  async addTag(linkId: string, tagId: string) {
    await this.ensureLinkExists(linkId);
    await this.ensureTagExists(tagId);
    return this.prisma.linkTag.create({ data: { linkId, tagId } });
  }

  async removeTag(linkId: string, tagId: string) {
    await this.ensureLinkExists(linkId);
    await this.ensureTagExists(tagId);
    await this.prisma.linkTag.deleteMany({ where: { linkId, tagId } });
    return { ok: true };
  }

  async addCourse(linkId: string, courseId: string) {
    await this.ensureLinkExists(linkId);
    await this.ensureCourseExists(courseId);
    return this.prisma.linkCourse.create({ data: { linkId, courseId } });
  }

  async removeCourse(linkId: string, courseId: string) {
    await this.ensureLinkExists(linkId);
    await this.ensureCourseExists(courseId);
    await this.prisma.linkCourse.deleteMany({ where: { linkId, courseId } });
    return { ok: true };
  }

  private async ensureLinkExists(id: string) {
    const exists = await this.prisma.link.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Link not found');
  }

  private async ensureTagExists(id: string) {
    const exists = await this.prisma.tag.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Tag not found');
  }

  private async ensureCourseExists(id: string) {
    const exists = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Course not found');
  }
}
