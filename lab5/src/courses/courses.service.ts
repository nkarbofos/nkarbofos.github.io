import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { name: dto.name, code: dto.code },
    });
  }

  async findAll(args: { page: number; pageSize: number }) {
    const skip = (args.page - 1) * args.pageSize;
    const take = args.pageSize + 1;

    const items = await this.prisma.course.findMany({
      orderBy: { name: 'asc' },
      skip,
      take,
    });

    const hasNext = items.length > args.pageSize;
    return { items: items.slice(0, args.pageSize), hasNext };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findOneShallow(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, name: true, code: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findLinksForCourse(courseId: string) {
    const rows = await this.prisma.linkCourse.findMany({
      where: { courseId },
      select: {
        link: {
          select: {
            id: true,
            userId: true,
            reviewId: true,
            linkName: true,
            githubPagesUrl: true,
            createdAt: true,
          },
        },
      },
    });
    return rows.map((r) => r.link);
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data: { name: dto.name, code: dto.code },
    });
  }

  async remove(id: string) {
    await this.prisma.course.delete({ where: { id } });
    return { ok: true };
  }
}
