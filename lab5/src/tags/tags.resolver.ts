import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TagsService } from './tags.service';
import { TagConnection } from '../graphql/types/pagination.object';
import {
  CreateTagInput,
  TagGql,
  TagsQueryArgs,
  UpdateTagInput,
} from '../graphql/types/tag.model';
import { LinkGql } from '../graphql/types/link.model';
import { MutationOkGql } from '../graphql/types/mutation-result.object';

@Resolver(() => TagGql)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  @Query(() => TagConnection, { description: 'Paginated list of tags' })
  async tags(@Args() args: TagsQueryArgs): Promise<TagConnection> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const { items, hasNext } = await this.tagsService.findAll({
      page,
      pageSize,
    });
    return { items, page, pageSize, hasNext };
  }

  @Query(() => TagGql, { description: 'Get a tag by id' })
  async tag(@Args('id', { type: () => ID }) id: string): Promise<TagGql> {
    return this.tagsService.findOneShallow(id);
  }

  @ResolveField(() => [LinkGql], {
    description: 'Links that use this tag',
    complexity: 5,
  })
  async links(@Parent() tag: TagGql): Promise<LinkGql[]> {
    return this.tagsService.findLinksForTag(tag.id);
  }

  @Mutation(() => TagGql, { description: 'Create a tag' })
  async createTag(@Args('input') input: CreateTagInput): Promise<TagGql> {
    return this.tagsService.create({ name: input.name });
  }

  @Mutation(() => TagGql, { description: 'Rename a tag' })
  async updateTag(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTagInput,
  ): Promise<TagGql> {
    return this.tagsService.update(id, { name: input.name });
  }

  @Mutation(() => MutationOkGql, { description: 'Delete a tag' })
  async deleteTag(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationOkGql> {
    await this.tagsService.remove(id);
    return { ok: true };
  }
}
