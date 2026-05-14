import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({ description: 'Registered platform user' })
export class UserGql {
  @Field(() => ID, { description: 'Unique user identifier (UUID)' })
  id!: string;

  @Field(() => String, { description: 'Email address (unique)' })
  email!: string;

  @Field(() => String, { description: 'Given name' })
  firstName!: string;

  @Field(() => String, { description: 'Family name' })
  lastName!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Telegram profile URL (optional)',
  })
  telegramUrl?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Public URL of user avatar stored in object storage',
  })
  avatarUrl?: string | null;

  @Field(() => GraphQLISODateTime, { description: 'Record creation time' })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { description: 'Last update time' })
  updatedAt!: Date;
}

@InputType({ description: 'Payload to create a user' })
export class CreateUserInput {
  @Field(() => String, { description: 'Email address' })
  email!: string;

  @Field(() => String, { description: 'Given name' })
  firstName!: string;

  @Field(() => String, { description: 'Family name' })
  lastName!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Telegram profile URL (optional)',
  })
  telegramUrl?: string;
}

@InputType({ description: 'Payload to update a user (all fields optional)' })
export class UpdateUserInput {
  @Field(() => String, { nullable: true, description: 'Email address' })
  email?: string;

  @Field(() => String, { nullable: true, description: 'Given name' })
  firstName?: string;

  @Field(() => String, { nullable: true, description: 'Family name' })
  lastName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Telegram profile URL (optional)',
  })
  telegramUrl?: string;
}

@ArgsType()
export class UsersQueryArgs {
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
