import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({ description: 'Tag label for categorizing links' })
export class TagGql {
  @Field(() => ID, { description: 'Unique tag identifier (UUID)' })
  id!: string;

  @Field(() => String, { description: 'Unique tag name' })
  name!: string;
}

@InputType({ description: 'Payload to create a tag' })
export class CreateTagInput {
  @Field(() => String, { description: 'Unique tag name' })
  name!: string;
}

@InputType({ description: 'Payload to update a tag' })
export class UpdateTagInput {
  @Field(() => String, { nullable: true, description: 'New tag name' })
  name?: string;
}

@ArgsType()
export class TagsQueryArgs {
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
