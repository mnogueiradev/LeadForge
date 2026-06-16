import { Injectable } from '@nestjs/common';
import { PrismaClient, Invitation, InvitationStatus } from '@prisma/client';
import { IInvitationRepository } from './invitations.repository.interface';

@Injectable()
export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<Invitation> {
    return this.prisma.invitation.create({
      data,
      include: { role: true },
    });
  }

  async findById(tenantId: string, id: string): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: { id, tenantId },
      include: { role: true, invitedBy: true },
    });
  }

  async findByToken(token: string): Promise<any | null> {
    return this.prisma.invitation.findUnique({
      where: { token },
      include: { tenant: true, role: true },
    });
  }

  async findByEmail(
    tenantId: string,
    email: string,
  ): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: { tenantId, email },
    });
  }

  async findAll(tenantId: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: { tenantId },
      include: { role: true, invitedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { status },
    });
  }

  async updateTokenAndExpiry(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { token, expiresAt, status: InvitationStatus.PENDING },
    });
  }

  async markAsAccepted(id: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }
}
