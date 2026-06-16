import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaClient, SecurityLogSeverity } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

export class SecurityEventPayload {
  tenantId: string;
  userId?: string;
  eventType: string;
  action: string;
  severity: SecurityLogSeverity;
  details?: any;
}

@Injectable()
export class SecurityLogsService {
  private readonly logger = new Logger(SecurityLogsService.name);

  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  @OnEvent('security.*', { async: true })
  async handleSecurityEvents(payload: SecurityEventPayload) {
    try {
      const ipAddress = this.cls.get('ipAddress');
      const userAgent = this.cls.get('userAgent');
      const requestId = this.cls.get('requestId');

      // We might have userId in CLS if the payload doesn't explicitly provide it
      const userId = payload.userId || this.cls.get('userId');

      await this.prisma.securityLog.create({
        data: {
          tenantId: payload.tenantId,
          userId,
          eventType: payload.eventType,
          action: payload.action,
          severity: payload.severity,
          details: payload.details ? payload.details : null,
          ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
          userAgent: userAgent ? userAgent.substring(0, 255) : null,
          requestId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create security log for ${payload.eventType}:${payload.action}`,
        error,
      );
    }
  }

  async findAll(tenantId: string, query: any) {
    const { severity, action, skip = 0, take = 50 } = query;

    const where: any = { tenantId };
    if (severity) where.severity = severity;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      this.prisma.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.securityLog.count({ where }),
    ]);

    return { items, total };
  }
}
