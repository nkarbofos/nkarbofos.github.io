import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersApiController } from './users-api.controller';
import { UsersResolver } from './users.resolver';
import { LinksModule } from '../links/links.module';

@Module({
  imports: [forwardRef(() => LinksModule)],
  controllers: [UsersApiController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
