import { Pipeline } from '@prisma/client';

export const PIPELINE_REPOSITORY = 'PIPELINE_REPOSITORY';

export interface IPipelineRepository {
  create(
    tenantId: string,
    data: Omit<
      Pipeline,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tenantId'
    >,
  ): Promise<Pipeline>;
  findById(tenantId: string, id: string): Promise<Pipeline | null>;
  update(
    tenantId: string,
    id: string,
    data: Partial<Pipeline>,
  ): Promise<Pipeline>;
  delete(tenantId: string, id: string): Promise<void>;
  archive(tenantId: string, id: string): Promise<Pipeline>;

  findAll(
    tenantId: string,
    params: {
      skip?: number;
      take?: number;
      includeArchived?: boolean;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<[Pipeline[], number]>;

  findDefault(tenantId: string): Promise<Pipeline | null>;
  unsetDefaultForTenant(tenantId: string): Promise<void>;
  updateDisplayOrder(
    tenantId: string,
    id: string,
    order: number,
  ): Promise<void>;
}
