import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaClient } from '@prisma/client';
import { SecurityPoliciesController } from './controllers/security-policies.controller';
import { SecurityPolicyService } from './services/security-policy.service';

@Global()
@Module({
  imports: [CacheModule.register()],
  controllers: [SecurityPoliciesController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    SecurityPolicyService
  ],
  exports: [SecurityPolicyService],
})
export class SecurityPoliciesModule {}
