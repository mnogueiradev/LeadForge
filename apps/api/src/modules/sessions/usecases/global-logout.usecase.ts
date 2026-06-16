import { Injectable } from '@nestjs/common';
import { PrismaClient, SecurityLogSeverity } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class GlobalLogoutUseCase {
  constructor(
    private prisma: PrismaClient,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, userId: string, currentFamilyId: string) {
    // Buscar todas as sessões ativas do usuário exceto a atual
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        familyId: { not: currentFamilyId },
      },
    });

    if (sessions.length === 0) return { success: true };

    const familyIds = sessions.map((s) => s.familyId);

    // Revogar no banco
    await this.prisma.session.updateMany({
      where: {
        id: { in: sessions.map((s) => s.id) },
      },
      data: { status: 'REVOKED' },
    });

    // Blacklist das famílias no Redis (para acesso imediato ser negado nos access tokens)
    // Supondo TTL de 15 minutos para access tokens (900s)
    for (const familyId of familyIds) {
      await this.redisService.setBlacklistToken(`family:${familyId}`, 900);
    }

    // Auditoria
    this.eventEmitter.emit('security.session.revoked_all', {
      tenantId,
      userId,
      eventType: 'SESSION',
      action: 'GLOBAL_LOGOUT',
      severity: SecurityLogSeverity.WARNING,
      details: {
        revokedFamiliesCount: familyIds.length,
        keptFamilyId: currentFamilyId,
      },
    });

    return { success: true, count: familyIds.length };
  }
}
