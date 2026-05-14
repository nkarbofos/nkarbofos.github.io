import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ElapsedTimeInterceptor } from './common/interceptors/elapsed-time.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:5173',
    ...(process.env.FRONTEND_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Authorization', 'Content-Type', 'If-None-Match'],
    exposedHeaders: ['ETag', 'X-Elapsed-Time', 'Link'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(
    new ElapsedTimeInterceptor(),
    new ETagInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GitHub projects links')
    .setDescription('API for sharing GitHub project links and reviews')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3010);
}
void bootstrap();
