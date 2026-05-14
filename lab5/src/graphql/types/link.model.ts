import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({ description: 'GitHub Pages project link submitted by a user' })
export class LinkGql {
  @Field(() => ID, { description: 'Unique link identifier (UUID)' })
  id!: string;

  @Field(() => ID, { description: 'Author user id' })
  userId!: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Optional linked review id',
  })
  reviewId?: string | null;

  @Field(() => String, { description: 'Display name for the link' })
  linkName!: string;

  @Field(() => String, { description: 'GitHub Pages URL' })
  githubPagesUrl!: string;

  @Field(() => GraphQLISODateTime, { description: 'When the link was created' })
  createdAt!: Date;
}

@InputType({ description: 'Payload to create a link' })
export class CreateLinkInput {
  @Field(() => ID, { description: 'Author user id' })
  userId!: string;

  @Field(() => ID, { nullable: true, description: 'Optional review id' })
  reviewId?: string;

  @Field(() => String, { description: 'Display name for the link' })
  linkName!: string;

  @Field(() => String, { description: 'GitHub Pages URL' })
  githubPagesUrl!: string;
}

@InputType({ description: 'Payload to update a link' })
export class UpdateLinkInput {
  @Field(() => ID, { nullable: true, description: 'Author user id' })
  userId?: string;

  @Field(() => ID, { nullable: true, description: 'Optional review id' })
  reviewId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name for the link',
  })
  linkName?: string;

  @Field(() => String, { nullable: true, description: 'GitHub Pages URL' })
  githubPagesUrl?: string;
}

@ArgsType()
export class LinksQueryArgs {
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

  @Field(() => ID, { nullable: true, description: 'Filter by author user id' })
  userId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by tag id' })
  tagId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by course id' })
  courseId?: string;
}
