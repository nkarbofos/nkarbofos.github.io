import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  /**
   * Do not call $connect() at bootstrap: Prisma connects lazily on the first query.
   * That way `nest start` / `start:dev` can listen even when DATABASE_URL is temporarily unreachable;
   * DB errors surface on first request instead of crashing the process at startup.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
