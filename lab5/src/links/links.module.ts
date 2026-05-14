import { Module, forwardRef } from '@nestjs/common';
import { LinksApiController } from './links-api.controller';
import { LinksService } from './links.service';
import { LinksResolver } from './links.resolver';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { TagsModule } from '../tags/tags.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => ReviewsModule),
    TagsModule,
    CoursesModule,
  ],
  controllers: [LinksApiController],
  providers: [LinksService, LinksResolver],
  exports: [LinksService],
})
export class LinksModule {}
