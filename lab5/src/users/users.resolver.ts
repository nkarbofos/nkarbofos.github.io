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
import { UsersService } from './users.service';
import { LinksService } from '../links/links.service';
import { UserConnection } from '../graphql/types/pagination.object';
import {
  CreateUserInput,
  UpdateUserInput,
  UserGql,
  UsersQueryArgs,
} from '../graphql/types/user.model';
import { LinkGql } from '../graphql/types/link.model';
import { MutationOkGql } from '../graphql/types/mutation-result.object';

@Resolver(() => UserGql)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LinksService))
    private readonly linksService: LinksService,
  ) {}

  @Query(() => UserConnection, {
    description: 'List users with cursor-style pagination metadata',
  })
  async users(@Args() args: UsersQueryArgs): Promise<UserConnection> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const { items, hasNext } = await this.usersService.findAll({
      page,
      pageSize,
    });
    return { items, page, pageSize, hasNext };
  }

  @Query(() => UserGql, {
    description: 'Get a single user by id (nested fields load on demand)',
  })
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserGql> {
    return this.usersService.findOneShallow(id);
  }

  @ResolveField(() => [LinkGql], {
    description: 'Project links owned by this user',
    complexity: 5,
  })
  async links(@Parent() user: UserGql): Promise<LinkGql[]> {
    return this.linksService.findManyForUser(user.id);
  }

  @Mutation(() => UserGql, { description: 'Register a new user' })
  async createUser(@Args('input') input: CreateUserInput): Promise<UserGql> {
    return this.usersService.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      telegramUrl: input.telegramUrl,
    });
  }

  @Mutation(() => UserGql, { description: 'Update profile fields' })
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserGql> {
    return this.usersService.update(id, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      telegramUrl: input.telegramUrl,
    });
  }

  @Mutation(() => MutationOkGql, { description: 'Remove a user permanently' })
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationOkGql> {
    await this.usersService.remove(id);
    return { ok: true };
  }
}
