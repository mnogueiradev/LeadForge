import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EnvConfig } from '../../config/env.config';
// We will need a UsersModule soon to get user data from DB, for now we will just use Prisma directly
import { PrismaClient } from '@prisma/client';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { SecurityPoliciesModule } from '../security-policies/security-policies.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    SessionsModule,
    UsersModule,
    SecurityPoliciesModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    AuthService,
    JwtStrategy
  ], // Temporary PrismaClient here until UsersModule is made
})
export class AuthModule {}
