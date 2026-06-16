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
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    PasswordStrengthService,
    IdentityRiskService,
    SecurityScoreService
  ],
  exports: [PasswordStrengthService, IdentityRiskService, SecurityScoreService],
})
export class IdentityHardeningModule {}
