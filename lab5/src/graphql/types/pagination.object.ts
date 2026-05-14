import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserGql } from './user.model';
import { LinkGql } from './link.model';
import { ReviewGql } from './review.model';
import { TagGql } from './tag.model';
import { CourseGql } from './course.model';

@ObjectType({ description: 'Paginated list of users with metadata' })
export class UserConnection {
  @Field(() => [UserGql], { description: 'Users on this page' })
  items!: UserGql[];

  @Field(() => Int, { description: 'Current page number (1-based)' })
  page!: number;

  @Field(() => Int, { description: 'Maximum items per page' })
  pageSize!: number;

  @Field(() => Boolean, {
    description: 'Whether another page exists after this one',
  })
  hasNext!: boolean;
}

@ObjectType({ description: 'Paginated list of links with metadata' })
export class LinkConnection {
  @Field(() => [LinkGql], { description: 'Links on this page' })
  items!: LinkGql[];

  @Field(() => Int, { description: 'Current page number (1-based)' })
  page!: number;

  @Field(() => Int, { description: 'Maximum items per page' })
  pageSize!: number;

  @Field(() => Boolean, {
    description: 'Whether another page exists after this one',
  })
  hasNext!: boolean;
}

@ObjectType({ description: 'Paginated list of reviews with metadata' })
export class ReviewConnection {
  @Field(() => [ReviewGql], { description: 'Reviews on this page' })
  items!: ReviewGql[];

  @Field(() => Int, { description: 'Current page number (1-based)' })
  page!: number;

  @Field(() => Int, { description: 'Maximum items per page' })
  pageSize!: number;

  @Field(() => Boolean, {
    description: 'Whether another page exists after this one',
  })
  hasNext!: boolean;
}

@ObjectType({ description: 'Paginated list of tags with metadata' })
export class TagConnection {
  @Field(() => [TagGql], { description: 'Tags on this page' })
  items!: TagGql[];

  @Field(() => Int, { description: 'Current page number (1-based)' })
  page!: number;

  @Field(() => Int, { description: 'Maximum items per page' })
  pageSize!: number;

  @Field(() => Boolean, {
    description: 'Whether another page exists after this one',
  })
  hasNext!: boolean;
}

@ObjectType({ description: 'Paginated list of courses with metadata' })
export class CourseConnection {
  @Field(() => [CourseGql], { description: 'Courses on this page' })
  items!: CourseGql[];

  @Field(() => Int, { description: 'Current page number (1-based)' })
  page!: number;

  @Field(() => Int, { description: 'Maximum items per page' })
  pageSize!: number;

  @Field(() => Boolean, {
    description: 'Whether another page exists after this one',
  })
  hasNext!: boolean;
}
