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
import { ReviewsService } from './reviews.service';
import { UsersService } from '../users/users.service';
import { LinksService } from '../links/links.service';
import { ReviewConnection } from '../graphql/types/pagination.object';
import {
  CreateReviewInput,
  ReviewGql,
  ReviewsQueryArgs,
  UpdateReviewInput,
} from '../graphql/types/review.model';
import { UserGql } from '../graphql/types/user.model';
import { LinkGql } from '../graphql/types/link.model';
import { MutationOkGql } from '../graphql/types/mutation-result.object';

@Resolver(() => ReviewGql)
export class ReviewsResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
  ) {}

  @Query(() => ReviewConnection, { description: 'Paginated list of reviews' })
  async reviews(@Args() args: ReviewsQueryArgs): Promise<ReviewConnection> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const { items, hasNext } = await this.reviewsService.findAll({
      page,
      pageSize,
    });
    const shallow = items.map((row) => ({
      id: row.id,
      userId: row.userId,
      score: row.score,
      comment: row.comment,
    }));
    return { items: shallow, page, pageSize, hasNext };
  }

  @Query(() => ReviewGql, { description: 'Get a review by id' })
  async review(@Args('id', { type: () => ID }) id: string): Promise<ReviewGql> {
    return this.reviewsService.findOneShallow(id);
  }

  @ResolveField(() => UserGql, {
    description: 'User who wrote the review',
    complexity: 2,
  })
  async user(@Parent() r: ReviewGql): Promise<UserGql> {
    return this.usersService.findOneShallow(r.userId);
  }

  @ResolveField(() => [LinkGql], {
    description: 'Links that reference this review',
    complexity: 5,
  })
  async links(@Parent() r: ReviewGql): Promise<LinkGql[]> {
    return this.linksService.findManyForReview(r.id);
  }

  @Mutation(() => ReviewGql, { description: 'Create a review' })
  async createReview(
    @Args('input') input: CreateReviewInput,
  ): Promise<ReviewGql> {
    return this.reviewsService.create({
      userId: input.userId,
      score: input.score,
      comment: input.comment,
    });
  }

  @Mutation(() => ReviewGql, { description: 'Update a review' })
  async updateReview(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateReviewInput,
  ): Promise<ReviewGql> {
    return this.reviewsService.update(id, {
      userId: input.userId,
      score: input.score,
      comment: input.comment,
    });
  }

  @Mutation(() => MutationOkGql, { description: 'Delete a review' })
  async deleteReview(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationOkGql> {
    await this.reviewsService.remove(id);
    return { ok: true };
  }
}
