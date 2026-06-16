import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_SECURITY_POLICY,
  TenantSecurityPolicyData,
} from '../types/security-policy.types';
import { UpdateSecurityPolicyDto } from '../dto/update-security-policy.dto';

@Injectable()
export class SecurityPolicyService {
  constructor(
    private prisma: PrismaClient,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(tenantId: string): string {
    return `tenant:${tenantId}:security-policy`;
  }

  async getPolicy(tenantId: string): Promise<TenantSecurityPolicyData> {
    const cacheKey = this.getCacheKey(tenantId);

    // 1. Try to get from Cache
    const cachedPolicy =
      await this.cacheManager.get<TenantSecurityPolicyData>(cacheKey);
    if (cachedPolicy) {
      return cachedPolicy;
    }

    // 2. Fallback to DB
    const policyRecord = await this.prisma.tenantSecurityPolicy.findUnique({
      where: { tenantId },
    });

    if (policyRecord) {
      const policyData: TenantSecurityPolicyData = {
        passwordPolicy: this.safeParse(policyRecord.passwordPolicy) as any,
        sessionPolicy: this.safeParse(policyRecord.sessionPolicy) as any,
        authenticationPolicy: this.safeParse(policyRecord.authenticationPolicy) as any,
        accessPolicy: this.safeParse(policyRecord.accessPolicy) as any,
        invitationPolicy: this.safeParse(policyRecord.invitationPolicy) as any,
        auditPolicy: this.safeParse(policyRecord.auditPolicy) as any,
      };

      // 3. Set Cache (TTL 24 hours = 86400000 ms)
      await this.cacheManager.set(cacheKey, policyData, 86400000);
      return policyData;
    }

    // 4. Return default if not found
    return DEFAULT_SECURITY_POLICY;
  }

  async updatePolicy(
    tenantId: string,
    dto: UpdateSecurityPolicyDto,
  ): Promise<TenantSecurityPolicyData> {
    const currentPolicy = await this.getPolicy(tenantId);

    // Merge changes
    const mergedPolicy: TenantSecurityPolicyData = {
      passwordPolicy: {
        ...currentPolicy.passwordPolicy,
        ...dto.passwordPolicy,
      },
      sessionPolicy: { ...currentPolicy.sessionPolicy, ...dto.sessionPolicy },
      authenticationPolicy: {
        ...currentPolicy.authenticationPolicy,
        ...dto.authenticationPolicy,
      },
      accessPolicy: { ...currentPolicy.accessPolicy, ...dto.accessPolicy },
      invitationPolicy: {
        ...currentPolicy.invitationPolicy,
        ...dto.invitationPolicy,
      },
      auditPolicy: { ...currentPolicy.auditPolicy, ...dto.auditPolicy },
    };

    // Save to DB (upsert)
    await this.prisma.tenantSecurityPolicy.upsert({
      where: { tenantId },
      update: {
        passwordPolicy: JSON.stringify(mergedPolicy.passwordPolicy),
        sessionPolicy: JSON.stringify(mergedPolicy.sessionPolicy),
        authenticationPolicy: JSON.stringify(mergedPolicy.authenticationPolicy),
        accessPolicy: JSON.stringify(mergedPolicy.accessPolicy),
        invitationPolicy: JSON.stringify(mergedPolicy.invitationPolicy),
        auditPolicy: JSON.stringify(mergedPolicy.auditPolicy),
      },
      create: {
        tenantId,
        passwordPolicy: JSON.stringify(mergedPolicy.passwordPolicy),
        sessionPolicy: JSON.stringify(mergedPolicy.sessionPolicy),
        authenticationPolicy: JSON.stringify(mergedPolicy.authenticationPolicy),
        accessPolicy: JSON.stringify(mergedPolicy.accessPolicy),
        invitationPolicy: JSON.stringify(mergedPolicy.invitationPolicy),
        auditPolicy: JSON.stringify(mergedPolicy.auditPolicy),
      },
    });

    // Invalidate Cache
    await this.cacheManager.del(this.getCacheKey(tenantId));

    return mergedPolicy;
  }

  private safeParse(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return {};
  }

  // Enforcement Helpers

  async validatePasswordStrength(
    tenantId: string,
    password: string,
  ): Promise<string | null> {
    const policy = await this.getPolicy(tenantId);
    const rules = policy.passwordPolicy as any;

    const minLength = rules.minLength as number | undefined;
    if (minLength && password.length < minLength) {
      return `A senha deve ter no mínimo ${minLength} caracteres.`;
    }
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula.';
    }
    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula.';
    }
    if (rules.requireNumbers && !/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos um número.';
    }
    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'A senha deve conter pelo menos um caractere especial.';
    }
    if (rules.preventCommonPasswords) {
      const common = [
        '123456',
        '12345678',
        '123456789',
        'password',
        'senha123',
        'qwerty',
      ];
      if (common.includes(password.toLowerCase())) {
        return 'Esta senha é muito comum e foi bloqueada.';
      }
    }
    return null; // Valid
  }
}
