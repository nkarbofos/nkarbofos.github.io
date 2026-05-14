import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: { name: dto.name } });
  }

  async findAll(args: { page: number; pageSize: number }) {
    const skip = (args.page - 1) * args.pageSize;
    const take = args.pageSize + 1;

    const items = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      skip,
      take,
    });

    const hasNext = items.length > args.pageSize;
    return { items: items.slice(0, args.pageSize), hasNext };
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async findOneShallow(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async findLinksForTag(tagId: string) {
    const rows = await this.prisma.linkTag.findMany({
      where: { tagId },
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

  update(id: string, dto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }
}
