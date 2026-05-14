import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Result of a delete or detach mutation' })
export class MutationOkGql {
  @Field(() => Boolean, {
    description: 'True when the operation completed successfully',
  })
  ok!: boolean;
}
