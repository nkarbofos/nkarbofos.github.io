import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AUTH_OPTIONS, type AuthModuleOptions } from './auth.options';

@Global()
@Module({})
export class AuthModule {
  static register(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [{ provide: AUTH_OPTIONS, useValue: options }, AuthService],
      exports: [AuthService],
    };
  }
}
