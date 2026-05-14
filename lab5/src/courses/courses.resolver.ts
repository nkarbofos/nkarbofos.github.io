import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CoursesService } from './courses.service';
import { CourseConnection } from '../graphql/types/pagination.object';
import {
  CourseGql,
  CoursesQueryArgs,
  CreateCourseInput,
  UpdateCourseInput,
} from '../graphql/types/course.model';
import { LinkGql } from '../graphql/types/link.model';
import { MutationOkGql } from '../graphql/types/mutation-result.object';

@Resolver(() => CourseGql)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Query(() => CourseConnection, { description: 'Paginated list of courses' })
  async courses(@Args() args: CoursesQueryArgs): Promise<CourseConnection> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const { items, hasNext } = await this.coursesService.findAll({
      page,
      pageSize,
    });
    return { items, page, pageSize, hasNext };
  }

  @Query(() => CourseGql, { description: 'Get a course by id' })
  async course(@Args('id', { type: () => ID }) id: string): Promise<CourseGql> {
    return this.coursesService.findOneShallow(id);
  }

  @ResolveField(() => [LinkGql], {
    description: 'Links associated with this course',
    complexity: 5,
  })
  async links(@Parent() course: CourseGql): Promise<LinkGql[]> {
    return this.coursesService.findLinksForCourse(course.id);
  }

  @Mutation(() => CourseGql, { description: 'Create a course' })
  async createCourse(
    @Args('input') input: CreateCourseInput,
  ): Promise<CourseGql> {
    return this.coursesService.create({ name: input.name, code: input.code });
  }

  @Mutation(() => CourseGql, { description: 'Update a course' })
  async updateCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCourseInput,
  ): Promise<CourseGql> {
    return this.coursesService.update(id, {
      name: input.name,
      code: input.code,
    });
  }

  @Mutation(() => MutationOkGql, { description: 'Delete a course' })
  async deleteCourse(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationOkGql> {
    await this.coursesService.remove(id);
    return { ok: true };
  }
}
