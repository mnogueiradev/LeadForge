import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { DataMasker } from './utils/data-masker.util';

export class AuditEventPayload {
  tenantId: string;
  userId?: string;
  entityName: string;
  entityId: string;
  action: string;
  oldValues?: unknown;
  newValues?: unknown;
}

export interface AuditQueryParams {
  entityName?: string;
  action?: string;
  skip?: number | string;
  take?: number | string;
  [key: string]: unknown;
}

interface AuditWhereClause {
  tenantId: string;
  entityName?: string;
  action?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private prisma: PrismaClient,
    private cls: ClsService,
  ) {}

  private safeGetString(key: string): string | undefined {
    const value = this.cls.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  @OnEvent('audit.*', { async: true })
  async handleAuditEvents(payload: AuditEventPayload) {
    try {
      const ipAddress = this.safeGetString('ipAddress');
      const userAgent = this.safeGetString('userAgent');
      const requestId = this.safeGetString('requestId');
      const userId = payload.userId || this.safeGetString('userId');

      await this.prisma.auditLog.create({
        data: {
          tenantId: payload.tenantId,
          userId: userId ?? null,
          action: payload.action,
          entityName: payload.entityName,
          entityId: payload.entityId,
          oldValues: payload.oldValues
            ? (DataMasker.mask(payload.oldValues) as any)
            : null,
          newValues: payload.newValues
            ? (DataMasker.mask(payload.newValues) as any)
            : null,
          ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
          userAgent: userAgent ? userAgent.substring(0, 255) : null,
          requestId: requestId ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create audit log for ${payload.entityName}:${payload.entityId}`,
        error,
      );
    }
  }

  async findAll(tenantId: string, query: AuditQueryParams) {
    const { entityName, action, skip = 0, take = 50 } = query;

    const where: AuditWhereClause = { tenantId };
    if (typeof entityName === 'string') {
      where.entityName = entityName;
    }
    if (typeof action === 'string') {
      where.action = action;
    }

    const skipNum =
      typeof skip === 'string' ? parseInt(skip, 10) : Number(skip);
    const takeNum =
      typeof take === 'string' ? parseInt(take, 10) : Number(take);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: skipNum,
        take: takeNum,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.auditLog.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
