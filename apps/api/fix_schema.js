const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace('  movementsFrom   DealMovement[] @relation("DealMovementFromStage")\n', '');
schema = schema.replace('  movementsTo     DealMovement[] @relation("DealMovementToStage")\n', '');
schema = schema.replace('  dealMovements   DealMovement[]\n', '');

// Add missing fields directly to their respective models using precise replacements
schema = schema.replace('  deals           Deal[]\n\n  @@index([tenantId])\n  @@map("pipelines")', '  deals           Deal[]\n  dealMovements   DealMovement[]\n\n  @@index([tenantId])\n  @@map("pipelines")');

schema = schema.replace('  deals           Deal[]\n\n  @@index([tenantId, pipelineId])\n  @@map("pipeline_stages")', '  deals           Deal[]\n  movementsFrom   DealMovement[] @relation("DealMovementFromStage")\n  movementsTo     DealMovement[] @relation("DealMovementToStage")\n\n  @@index([tenantId, pipelineId])\n  @@map("pipeline_stages")');

fs.writeFileSync('prisma/schema.prisma', schema);
