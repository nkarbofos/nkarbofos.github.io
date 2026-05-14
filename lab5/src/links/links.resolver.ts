import { Inject, forwardRef } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { LinksService } from './links.service';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
import { LinkConnection } from '../graphql/types/pagination.object';
import {
  CreateLinkInput,
  LinkGql,
  LinksQueryArgs,
  UpdateLinkInput,
} from '../graphql/types/link.model';
import { UserGql } from '../graphql/types/user.model';
import { ReviewGql } from '../graphql/types/review.model';
import { TagGql } from '../graphql/types/tag.model';
import { CourseGql } from '../graphql/types/course.model';
import { MutationOkGql } from '../graphql/types/mutation-result.object';

@Resolver(() => LinkGql)
export class LinksResolver {
  constructor(
    private readonly linksService: LinksService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService,
  ) {}

  @Query(() => LinkConnection, {
    description: 'List links with filters and pagination',
  })
  async links(@Args() args: LinksQueryArgs): Promise<LinkConnection> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const { items, hasNext } = await this.linksService.findAll({
      page,
      pageSize,
      userId: args.userId,
      tagId: args.tagId,
      courseId: args.courseId,
    });
    const shallow = items.map((row) => ({
      id: row.id,
      userId: row.userId,
      reviewId: row.reviewId,
      linkName: row.linkName,
      githubPagesUrl: row.githubPagesUrl,
      createdAt: row.createdAt,
    }));
    return { items: shallow, page, pageSize, hasNext };
  }

  @Query(() => LinkGql, {
    description: 'Get one link by id; relations are field-resolved',
  })
  async link(@Args('id', { type: () => ID }) id: string): Promise<LinkGql> {
    return this.linksService.findOneShallow(id);
  }

  @ResolveField(() => UserGql, {
    description: 'Author of the link',
    complexity: 2,
  })
  async user(@Parent() link: LinkGql): Promise<UserGql> {
    return this.usersService.findOneShallow(link.userId);
  }

  @ResolveField(() => ReviewGql, {
    nullable: true,
    description: 'Linked review, if any',
    complexity: 2,
  })
  async review(@Parent() link: LinkGql): Promise<ReviewGql | null> {
    if (!link.reviewId) return null;
    return this.reviewsService.findOneShallow(link.reviewId);
  }

  @ResolveField(() => [TagGql], {
    description: 'Tags attached to this link',
    complexity: 5,
  })
  async tags(@Parent() link: LinkGql): Promise<TagGql[]> {
    return this.linksService.findTagsForLink(link.id);
  }

  @ResolveField(() => [CourseGql], {
    description: 'Courses associated with this link',
    complexity: 5,
  })
  async courses(@Parent() link: LinkGql): Promise<CourseGql[]> {
    return this.linksService.findCoursesForLink(link.id);
  }

  @Mutation(() => LinkGql, { description: 'Create a new link' })
  async createLink(@Args('input') input: CreateLinkInput): Promise<LinkGql> {
    return this.linksService.create({
      userId: input.userId,
      reviewId: input.reviewId,
      linkName: input.linkName,
      githubPagesUrl: input.githubPagesUrl,
    });
  }

  @Mutation(() => LinkGql, { description: 'Update link fields' })
  async updateLink(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLinkInput,
  ): Promise<LinkGql> {
    return this.linksService.update(id, {
      linkName: input.linkName,
      githubPagesUrl: input.githubPagesUrl,
    });
  }

  @Mutation(() => MutationOkGql, { description: 'Delete a link' })
  async deleteLink(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationOkGql> {
    await this.linksService.remove(id);
    return { ok: true };
  }

  @Mutation(() => MutationOkGql, {
    description: 'Attach an existing tag to a link',
  })
  async attachTagToLink(
    @Args('linkId', { type: () => ID }) linkId: string,
    @Args('tagId', { type: () => ID }) tagId: string,
  ): Promise<MutationOkGql> {
    await this.linksService.addTag(linkId, tagId);
    return { ok: true };
  }

  @Mutation(() => MutationOkGql, { description: 'Remove a tag from a link' })
  async detachTagFromLink(
    @Args('linkId', { type: () => ID }) linkId: string,
    @Args('tagId', { type: () => ID }) tagId: string,
  ): Promise<MutationOkGql> {
    await this.linksService.removeTag(linkId, tagId);
    return { ok: true };
  }

  @Mutation(() => MutationOkGql, {
    description: 'Associate a course with a link',
  })
  async attachCourseToLink(
    @Args('linkId', { type: () => ID }) linkId: string,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<MutationOkGql> {
    await this.linksService.addCourse(linkId, courseId);
    return { ok: true };
  }

  @Mutation(() => MutationOkGql, {
    description: 'Remove a course association from a link',
  })
  async detachCourseFromLink(
    @Args('linkId', { type: () => ID }) linkId: string,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<MutationOkGql> {
    await this.linksService.removeCourse(linkId, courseId);
    return { ok: true };
  }
}
