import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TagsApiController } from './tags-api.controller';
import { TagsService } from './tags.service';
import { TagsResolver } from './tags.resolver';

@Module({
  imports: [CacheModule.register({ ttl: 5 })],
  controllers: [TagsApiController],
  providers: [TagsService, TagsResolver],
  exports: [TagsService],
})
export class TagsModule {}
