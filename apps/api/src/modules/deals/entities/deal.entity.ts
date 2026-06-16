export class DealEntity {
  id: string;
  tenantId: string;
  pipelineId: string;
  stageId: string;
  leadId: string | null;
  contactId: string | null;
  organizationId: string | null;
  ownerUserId: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'WON' | 'LOST' | 'ARCHIVED';
  value: number | null;
  currency: string;
  probability: number;
  expectedCloseDate: Date | null;
  closedAt: Date | null;
  wonAt: Date | null;
  lostAt: Date | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
