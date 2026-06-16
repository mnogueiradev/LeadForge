export class PipelineStageEntity {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  color: string | null;
  probability: number;
  isInitialStage: boolean;
  isFinalStage: boolean;
  isWonStage: boolean;
  isLostStage: boolean;
  isActive: boolean;
  tenantId: string;
  pipelineId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
