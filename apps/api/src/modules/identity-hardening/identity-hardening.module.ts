import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PasswordStrengthService } from './services/password-strength.service';
import { IdentityRiskService } from './services/identity-risk.service';
import { SecurityScoreService } from './services/security-score.service';
import { SecurityPoliciesModule } from '../security-policies/security-policies.module';

@Global()
@Module({
  imports: [SecurityPoliciesModule],
  providers: [
    { provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } },
    PasswordStrengthService,
    IdentityRiskService,
    SecurityScoreService
  ],
  exports: [PasswordStrengthService, IdentityRiskService, SecurityScoreService],
})
export class IdentityHardeningModule {}
