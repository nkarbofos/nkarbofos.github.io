import { Module } from '@nestjs/common';
import { CoursesApiController } from './courses-api.controller';
import { CoursesService } from './courses.service';
import { CoursesResolver } from './courses.resolver';

@Module({
  controllers: [CoursesApiController],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}
