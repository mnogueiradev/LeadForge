import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface IdentityRiskContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  country?: string;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Injectable()
export class IdentityRiskService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Avalia o risco de um login/sessão baseado no histórico do usuário.
   */
  async evaluateRisk(
    context: IdentityRiskContext,
  ): Promise<{ score: number; level: RiskLevel; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];

    // Busca o histórico recente de sessões ativas ou expiradas desse usuário
    const pastSessions = await this.prisma.session.findMany({
      where: { userId: context.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (pastSessions.length === 0) {
      // Primeiro login
      reasons.push('Primeiro login registrado (New Account).');
      score += 10;
    } else {
      // Verifica IP
      const knownIps = new Set(pastSessions.map((s) => s.ipAddress));
      if (!knownIps.has(context.ipAddress)) {
        reasons.push('Novo endereço IP não reconhecido.');
        score += 30;
      }

      // Verifica User-Agent / Device
      const knownUserAgents = new Set(pastSessions.map((s) => s.userAgent));
      if (!knownUserAgents.has(context.userAgent)) {
        reasons.push('Novo dispositivo ou navegador não reconhecido.');
        score += 20;
      }

      // Verifica país (se houver geoip tracking configurado no futuro)
      if (context.country) {
        const knownCountries = new Set(
          pastSessions.map((s) => s.country).filter(Boolean),
        );
        if (knownCountries.size > 0 && !knownCountries.has(context.country)) {
          reasons.push('Login de um novo país.');
          score += 40;
        }
      }
    }

    // Teto de 100
    score = Math.min(score, 100);

    let level = RiskLevel.LOW;
    if (score >= 80) level = RiskLevel.CRITICAL;
    else if (score >= 50) level = RiskLevel.HIGH;
    else if (score >= 20) level = RiskLevel.MEDIUM;

    return { score, level, reasons };
  }
}
