import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({ description: 'Academic course associated with links' })
export class CourseGql {
  @Field(() => ID, { description: 'Unique course identifier (UUID)' })
  id!: string;

  @Field(() => String, { description: 'Course title' })
  name!: string;

  @Field(() => String, { nullable: true, description: 'Optional course code' })
  code?: string | null;
}

@InputType({ description: 'Payload to create a course' })
export class CreateCourseInput {
  @Field(() => String, { description: 'Course title' })
  name!: string;

  @Field(() => String, { nullable: true, description: 'Optional course code' })
  code?: string;
}

@InputType({ description: 'Payload to update a course' })
export class UpdateCourseInput {
  @Field(() => String, { nullable: true, description: 'Course title' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Optional course code' })
  code?: string;
}

@ArgsType()
export class CoursesQueryArgs {
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
