const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Insert Activity Enums and Model at the end
const activityModel = `
enum ActivityType {
  CALL
  MEETING
  EMAIL
  FOLLOW_UP
  TASK
  DEMO
  PROPOSAL
  CONTRACT
  MESSAGE
}

enum ActivityStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELED
  OVERDUE
}

enum ActivityPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Activity {
  id               String           @id @default(uuid()) @db.Char(36)
  tenantId         String           @map("tenant_id") @db.Char(36)
  
  ownerUserId      String           @map("owner_user_id") @db.Char(36)
  createdByUserId  String           @map("created_by_user_id") @db.Char(36)
  
  contactId        String?          @map("contact_id") @db.Char(36)
  organizationId   String?          @map("organization_id") @db.Char(36)
  leadId           String?          @map("lead_id") @db.Char(36)
  dealId           String?          @map("deal_id") @db.Char(36)
  
  title            String           @db.VarChar(255)
  description      String?          @db.Text
  
  type             ActivityType
  status           ActivityStatus   @default(PENDING)
  priority         ActivityPriority @default(MEDIUM)
  
  dueDate          DateTime?        @map("due_date")
  startedAt        DateTime?        @map("started_at")
  completedAt      DateTime?        @map("completed_at")
  canceledAt       DateTime?        @map("canceled_at")
  
  durationMinutes  Int?             @map("duration_minutes")
  location         String?          @db.VarChar(255)
  
  metadata         Json?
  
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")
  deletedAt        DateTime?        @map("deleted_at")

  tenant           Tenant           @relation("TenantActivities", fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade, map: "activity_tenant_id_fk")
  ownerUser        User             @relation("ActivityOwner", fields: [ownerUserId], references: [id], onDelete: Restrict, onUpdate: Cascade, map: "activity_owner_user_id_fk")
  createdByUser    User             @relation("ActivityCreator", fields: [createdByUserId], references: [id], onDelete: Restrict, onUpdate: Cascade, map: "activity_created_by_user_id_fk")
  
  contact          Contact?         @relation("ContactActivities", fields: [contactId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "activity_contact_id_fk")
  organization     Organization?    @relation("OrganizationActivities", fields: [organizationId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "activity_organization_id_fk")
  lead             Lead?            @relation("LeadActivities", fields: [leadId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "activity_lead_id_fk")
  deal             Deal?            @relation("DealActivities", fields: [dealId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "activity_deal_id_fk")

  @@index([tenantId, ownerUserId, status, dueDate])
  @@index([tenantId, dealId])
  @@index([tenantId, leadId])
  @@index([tenantId, contactId])
  @@index([tenantId, organizationId])
  
  @@map("activities")
}
`;

if (!schema.includes('model Activity {')) {
  schema += '\n' + activityModel;
}

// Add to Tenant
if (!schema.includes('activities      Activity[]         @relation("TenantActivities")')) {
  schema = schema.replace(/model Tenant \{[\s\S]*?(?=\n\})/g, match => match + '\n  activities      Activity[]         @relation("TenantActivities")');
}

// Add to User
if (!schema.includes('ownedActivities    Activity[]         @relation("ActivityOwner")')) {
  schema = schema.replace(/model User \{[\s\S]*?(?=\n\})/g, match => match + '\n  ownedActivities    Activity[]         @relation("ActivityOwner")\n  createdActivities  Activity[]         @relation("ActivityCreator")');
}

// Add to Organization
if (!schema.includes('activities           Activity[]         @relation("OrganizationActivities")')) {
  schema = schema.replace(/model Organization \{[\s\S]*?(?=\n\})/g, match => match + '\n  activities           Activity[]         @relation("OrganizationActivities")');
}

// Add to Contact
if (!schema.includes('activities         Activity[]         @relation("ContactActivities")')) {
  schema = schema.replace(/model Contact \{[\s\S]*?(?=\n\})/g, match => match + '\n  activities         Activity[]         @relation("ContactActivities")');
}

// Add to Lead
if (!schema.includes('activities         Activity[]         @relation("LeadActivities")')) {
  schema = schema.replace(/model Lead \{[\s\S]*?(?=\n\})/g, match => match + '\n  activities         Activity[]         @relation("LeadActivities")');
}

// Add to Deal
if (!schema.includes('activities         Activity[]         @relation("DealActivities")')) {
  schema = schema.replace(/model Deal \{[\s\S]*?(?=\n\})/g, match => match + '\n  activities         Activity[]         @relation("DealActivities")');
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
