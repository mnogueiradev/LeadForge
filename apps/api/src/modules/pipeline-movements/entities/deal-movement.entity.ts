import { MovementSource } from '@prisma/client';

export class DealMovement {
  id: string;
  tenantId: string;
  dealId: string;
  pipelineId: string;
  fromStageId: string | null;
  toStageId: string;
  movedByUserId: string | null;
  source: MovementSource;
  reason: string | null;
  metadata: any | null;
  executedAt: Date;
  createdAt: Date;
}
