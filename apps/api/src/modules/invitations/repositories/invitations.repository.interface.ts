import { InvitationStatus } from '@prisma/client';

export interface IInvitationRepository {
  create(data: any): Promise<any>;
  findById(tenantId: string, id: string): Promise<any | null>;
  findByToken(token: string): Promise<any | null>;
  findByEmail(tenantId: string, email: string): Promise<any | null>;
  findAll(tenantId: string): Promise<any[]>;
  updateStatus(id: string, status: InvitationStatus): Promise<void>;
  updateTokenAndExpiry(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  markAsAccepted(id: string): Promise<void>;
}

export const IInvitationRepository = Symbol('IInvitationRepository');
