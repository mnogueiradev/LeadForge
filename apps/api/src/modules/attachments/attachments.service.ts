import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, EntityType, Attachment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    tenantId: string,
    userId: string,
    entityType: EntityType,
    entityId: string,
    file: Express.Multer.File,
  ) {
    const data: any = {
      tenantId,
      uploadedById: userId,
      entityType,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`, // Simplificação: a URL do arquivo servido
    };

    if (entityType === 'CONTACT') data.contactId = entityId;
    if (entityType === 'ORGANIZATION') data.organizationId = entityId;
    if (entityType === 'LEAD') data.leadId = entityId;
    if (entityType === 'DEAL') data.dealId = entityId;

    const attachment = await this.prisma.attachment.create({
      data,
    });

    // Criar timeline event
    await this.prisma.timelineEvent.create({
      data: {
        tenantId,
        entityType,
        entityId,
        eventType: 'ATTACHMENT_UPLOADED',
        title: 'Arquivo anexado',
        description: `O arquivo ${file.originalname} foi anexado.`,
        actorUserId: userId,
      },
    });

    return attachment;
  }

  async findAllByEntity(tenantId: string, entityType: EntityType, entityId: string) {
    const where: any = { tenantId, entityType };
    if (entityType === 'CONTACT') where.contactId = entityId;
    if (entityType === 'ORGANIZATION') where.organizationId = entityId;
    if (entityType === 'LEAD') where.leadId = entityId;
    if (entityType === 'DEAL') where.dealId = entityId;

    return this.prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, tenantId },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    await this.prisma.attachment.delete({
      where: { id },
    });

    // TODO: Remover arquivo do disco (fs.unlink)
  }
}
