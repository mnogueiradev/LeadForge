import { Injectable } from '@nestjs/common';
import { SecurityPolicyService } from '../../security-policies/services/security-policy.service';

@Injectable()
export class SecurityScoreService {
  constructor(private securityPolicyService: SecurityPolicyService) {}

  /**
   * Avalia a maturidade de segurança de um Tenant.
   * Retorna um score de 0 a 100.
   */
  async evaluateTenant(
    tenantId: string,
  ): Promise<{ score: number; recommendations: string[] }> {
    const policy = await this.securityPolicyService.getPolicy(tenantId);
    let score = 0;
    const recommendations: string[] = [];

    // Avaliação: Política de Senhas (Max 35)
    if (policy.passwordPolicy.minLength >= 12) score += 15;
    else if (policy.passwordPolicy.minLength >= 8) score += 10;
    else
      recommendations.push(
        'Aumente o comprimento mínimo da senha para pelo menos 12 caracteres.',
      );

    let complexityFlags = 0;
    if (policy.passwordPolicy.requireUppercase) complexityFlags++;
    if (policy.passwordPolicy.requireLowercase) complexityFlags++;
    if (policy.passwordPolicy.requireNumbers) complexityFlags++;
    if (policy.passwordPolicy.requireSpecialChars) complexityFlags++;

    if (complexityFlags === 4) score += 10;
    else if (complexityFlags >= 2) score += 5;
    else
      recommendations.push(
        'Exija senhas mais complexas (letras, números, símbolos).',
      );

    if (policy.passwordPolicy.preventCommonPasswords) score += 10;
    else
      recommendations.push('Ative a prevenção contra senhas comuns e vazadas.');

    // Avaliação: MFA & Autenticação (Max 35)
    if (policy.authenticationPolicy.mfaRequired) score += 35;
    else
      recommendations.push(
        'Habilite o MFA (Múltiplos Fatores de Autenticação) para todos os usuários.',
      );

    // Avaliação: Sessões (Max 15)
    if (
      policy.sessionPolicy.maxConcurrentSessions > 0 &&
      policy.sessionPolicy.maxConcurrentSessions <= 3
    )
      score += 10;
    else
      recommendations.push(
        'Limite o número de sessões simultâneas (idealmente <= 3).',
      );

    if (
      policy.sessionPolicy.idleTimeoutMinutes > 0 &&
      policy.sessionPolicy.idleTimeoutMinutes <= 60
    )
      score += 5;
    else
      recommendations.push(
        'Configure um timeout de inatividade para as sessões.',
      );

    // Avaliação: Controle de Acesso e Domínios (Max 15)
    if (policy.accessPolicy.allowedDomains.length > 0) score += 15;
    else
      recommendations.push(
        'Restrinja os domínios de e-mail permitidos para novos convites.',
      );

    return { score, recommendations };
  }
}
