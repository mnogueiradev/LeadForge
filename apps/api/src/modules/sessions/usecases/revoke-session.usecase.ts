import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, SecurityLogSeverity } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    private prisma: PrismaClient,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    tenantId: string,
    userId: string,
    sessionId: string,
    forceCrossUser: boolean = false,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    // Apenas pode revogar se for a própria sessão ou se o usuário tiver força bruta (Admin com sessions.terminate)
    if (!forceCrossUser && session.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada'); // Segurança: não revelar que existe
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'REVOKED' },
    });

    // Blacklist do familyId (Duração max do access token - 15min)
    await this.redisService.setBlacklistToken(
      `family:${session.familyId}`,
      900,
    );

    // Auditoria
    this.eventEmitter.emit('security.session.revoked', {
      tenantId: session.tenantId,
      userId: session.userId,
      eventType: 'SESSION',
      action: 'REVOKED',
      severity: SecurityLogSeverity.WARNING,
      details: {
        familyId: session.familyId,
        deviceName: session.deviceName,
        revokedByUserId: userId,
      },
    });

    return { success: true };
  }
}
