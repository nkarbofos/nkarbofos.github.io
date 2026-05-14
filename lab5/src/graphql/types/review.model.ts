import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({ description: 'Peer review of a project' })
export class ReviewGql {
  @Field(() => ID, { description: 'Unique review identifier (UUID)' })
  id!: string;

  @Field(() => ID, { description: 'Reviewer user id' })
  userId!: string;

  @Field(() => Int, { nullable: true, description: 'Numeric score (0–100)' })
  score?: number | null;

  @Field(() => String, { nullable: true, description: 'Free-text comment' })
  comment?: string | null;
}

@InputType({ description: 'Payload to create a review' })
export class CreateReviewInput {
  @Field(() => ID, { description: 'Reviewer user id' })
  userId!: string;

  @Field(() => Int, { nullable: true, description: 'Numeric score (0–100)' })
  score?: number;

  @Field(() => String, { nullable: true, description: 'Free-text comment' })
  comment?: string;
}

@InputType({ description: 'Payload to update a review' })
export class UpdateReviewInput {
  @Field(() => ID, { nullable: true, description: 'Reviewer user id' })
  userId?: string;

  @Field(() => Int, { nullable: true, description: 'Numeric score (0–100)' })
  score?: number;

  @Field(() => String, { nullable: true, description: 'Free-text comment' })
  comment?: string;
}

@ArgsType()
export class ReviewsQueryArgs {
  @Field(() => Int, { defaultValue: 1, description: 'Page number (1-based)' })
  @Min(1)
  page = 1;

  @Field(() => Int, {
    defaultValue: 20,
    description: 'Items per page (max 100)',
  })
  @Min(1)
  @Max(100)
  pageSize = 20;
}
