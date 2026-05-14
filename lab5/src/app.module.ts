import { join } from 'node:path';
import type { Request, Response } from 'express';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  createComplexityRule,
  simpleEstimator,
} from 'graphql-query-complexity';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { AuthApiController } from './auth/auth-api.controller';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { CoursesModule } from './courses/courses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LinksModule } from './links/links.module';
import { AuthRedirectMiddleware } from './auth/auth-redirect.middleware';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      validationRules: [
        createComplexityRule({
          maximumComplexity: 100,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        }),
      ],
    }),
    PrismaModule,
    StorageModule,
    AuthModule.register({
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
      firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
      firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(
        /\\n/g,
        '\n',
      ),
    }),
    UsersModule,
    TagsModule,
    CoursesModule,
    ReviewsModule,
    LinksModule,
  ],
  controllers: [AppController, AuthApiController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthRedirectMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.GET });
  }
}
