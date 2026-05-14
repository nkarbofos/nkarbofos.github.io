import { Module, forwardRef } from '@nestjs/common';
import { ReviewsApiController } from './reviews-api.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { UsersModule } from '../users/users.module';
import { LinksModule } from '../links/links.module';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => LinksModule)],
  controllers: [ReviewsApiController],
  providers: [ReviewsService, ReviewsResolver],
  exports: [ReviewsService],
})
export class ReviewsModule {}
