const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Replace DealStageHistory relation in Tenant
schema = schema.replace('  dealStageHistories DealStageHistory[]', '  dealMovements   DealMovement[]');

// Replace DealStageHistory relation in User
schema = schema.replace('  dealStageHistories DealStageHistory[]', '  dealMovements      DealMovement[]');

// Replace DealStageHistory relation in Deal
schema = schema.replace('  stageHistories      DealStageHistory[]', '  movements           DealMovement[]');

// Add MovementSource Enum and replace DealStageHistory model with DealMovement
const oldModel = `model DealStageHistory {
  id            String    @id @default(uuid()) @db.Char(36)
  tenantId      String    @map("tenant_id") @db.Char(36)
  dealId        String    @map("deal_id") @db.Char(36)
  
  fromStageId   String?   @map("from_stage_id") @db.Char(36)
  toStageId     String    @map("to_stage_id") @db.Char(36)
  
  userId        String    @map("user_id") @db.Char(36)
  
  createdAt     DateTime  @default(now()) @map("created_at")

  tenant        Tenant    @relation(fields: [tenantId], references: [id], map: "dsh_tenant_id_fk")
  deal          Deal      @relation(fields: [dealId], references: [id], onDelete: Cascade, map: "dsh_deal_id_fk")
  user          User      @relation(fields: [userId], references: [id], map: "dsh_user_id_fk")

  @@index([tenantId, dealId])
  @@index([tenantId, fromStageId])
  @@index([tenantId, toStageId])
  @@map("deal_stage_history")
}`;

const newModel = `enum MovementSource {
  USER
  AUTOMATION
  AI
  SYSTEM
  API
}

model DealMovement {
  id               String         @id @default(uuid()) @db.Char(36)
  tenantId         String         @map("tenant_id") @db.Char(36)
  
  dealId           String         @map("deal_id") @db.Char(36)
  pipelineId       String         @map("pipeline_id") @db.Char(36)
  
  fromStageId      String?        @map("from_stage_id") @db.Char(36)
  toStageId        String         @map("to_stage_id") @db.Char(36)
  
  movedByUserId    String?        @map("moved_by_user_id") @db.Char(36)
  source           MovementSource @default(USER)
  
  reason           String?        @db.Text
  metadata         Json?
  
  executedAt       DateTime       @default(now()) @map("executed_at")
  createdAt        DateTime       @default(now()) @map("created_at")

  tenant           Tenant         @relation(fields: [tenantId], references: [id], map: "dm_tenant_id_fk")
  deal             Deal           @relation(fields: [dealId], references: [id], onDelete: Cascade, map: "dm_deal_id_fk")
  pipeline         Pipeline       @relation(fields: [pipelineId], references: [id], map: "dm_pipeline_id_fk")
  fromStage        PipelineStage? @relation("DealMovementFromStage", fields: [fromStageId], references: [id], map: "dm_from_stage_id_fk")
  toStage          PipelineStage  @relation("DealMovementToStage", fields: [toStageId], references: [id], map: "dm_to_stage_id_fk")
  movedByUser      User?          @relation(fields: [movedByUserId], references: [id], map: "dm_moved_by_user_id_fk")

  @@index([tenantId, dealId])
  @@index([tenantId, pipelineId])
  @@index([tenantId, fromStageId])
  @@index([tenantId, toStageId])
  @@index([tenantId, movedByUserId])
  @@map("deal_movements")
}`;

schema = schema.replace(oldModel, newModel);

// We need to add inverse relations to PipelineStage for fromStage and toStage
// And to Pipeline for dealMovements
schema = schema.replace('  deals           Deal[]', '  deals           Deal[]\n  dealMovements   DealMovement[]'); // Pipeline
schema = schema.replace('  deals           Deal[]', '  deals           Deal[]\n  movementsFrom   DealMovement[] @relation("DealMovementFromStage")\n  movementsTo     DealMovement[] @relation("DealMovementToStage")'); // PipelineStage

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully for DealMovement!');
