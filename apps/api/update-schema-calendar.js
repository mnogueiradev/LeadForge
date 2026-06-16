const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

const calendarEventModel = `
enum CalendarEventType {
  CALL
  MEETING
  FOLLOW_UP
  TASK
  DEMO
  VISIT
  INTERNAL_EVENT
}

enum CalendarEventStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELED
  MISSED
}

model CalendarEvent {
  id               String              @id @default(uuid()) @db.Char(36)
  tenantId         String              @map("tenant_id") @db.Char(36)
  
  ownerUserId      String              @map("owner_user_id") @db.Char(36)
  activityId       String?             @map("activity_id") @db.Char(36)
  
  title            String              @db.VarChar(255)
  description      String?             @db.Text
  eventType        CalendarEventType   @map("event_type")
  status           CalendarEventStatus @default(SCHEDULED)
  
  startAt          DateTime            @map("start_at")
  endAt            DateTime            @map("end_at")
  timezone         String              @db.VarChar(50)
  
  location         String?             @db.VarChar(255)
  meetingUrl       String?             @map("meeting_url") @db.VarChar(1000)
  
  isAllDay         Boolean             @default(false) @map("is_all_day")
  isRecurring      Boolean             @default(false) @map("is_recurring")
  recurrenceRule   String?             @map("recurrence_rule") @db.VarChar(500)
  
  contactId        String?             @map("contact_id") @db.Char(36)
  organizationId   String?             @map("organization_id") @db.Char(36)
  leadId           String?             @map("lead_id") @db.Char(36)
  dealId           String?             @map("deal_id") @db.Char(36)
  
  metadata         Json?
  
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  deletedAt        DateTime?           @map("deleted_at")

  tenant           Tenant           @relation("TenantCalendarEvents", fields: [tenantId], references: [id], onDelete: Restrict, onUpdate: Cascade, map: "cal_event_tenant_id_fk")
  ownerUser        User             @relation("CalendarEventOwner", fields: [ownerUserId], references: [id], onDelete: Restrict, onUpdate: Cascade, map: "cal_event_owner_user_id_fk")
  activity         Activity?        @relation("ActivityCalendarEvents", fields: [activityId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "cal_event_activity_id_fk")
  
  contact          Contact?         @relation("ContactCalendarEvents", fields: [contactId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "cal_event_contact_id_fk")
  organization     Organization?    @relation("OrganizationCalendarEvents", fields: [organizationId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "cal_event_organization_id_fk")
  lead             Lead?            @relation("LeadCalendarEvents", fields: [leadId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "cal_event_lead_id_fk")
  deal             Deal?            @relation("DealCalendarEvents", fields: [dealId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "cal_event_deal_id_fk")

  @@index([tenantId, startAt, endAt])
  @@index([tenantId, ownerUserId, startAt, endAt])
  
  @@map("calendar_events")
}
`;

if (!schema.includes('model CalendarEvent {')) {
  schema += '\n' + calendarEventModel;
}

// Add to Tenant
if (!schema.includes('calendarEvents  CalendarEvent[]    @relation("TenantCalendarEvents")')) {
  schema = schema.replace(/model Tenant \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents  CalendarEvent[]    @relation("TenantCalendarEvents")');
}

// Add to User
if (!schema.includes('calendarEvents     CalendarEvent[]    @relation("CalendarEventOwner")')) {
  schema = schema.replace(/model User \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents     CalendarEvent[]    @relation("CalendarEventOwner")');
}

// Add to Organization
if (!schema.includes('calendarEvents       CalendarEvent[]    @relation("OrganizationCalendarEvents")')) {
  schema = schema.replace(/model Organization \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents       CalendarEvent[]    @relation("OrganizationCalendarEvents")');
}

// Add to Contact
if (!schema.includes('calendarEvents     CalendarEvent[]    @relation("ContactCalendarEvents")')) {
  schema = schema.replace(/model Contact \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents     CalendarEvent[]    @relation("ContactCalendarEvents")');
}

// Add to Lead
if (!schema.includes('calendarEvents     CalendarEvent[]    @relation("LeadCalendarEvents")')) {
  schema = schema.replace(/model Lead \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents     CalendarEvent[]    @relation("LeadCalendarEvents")');
}

// Add to Deal
if (!schema.includes('calendarEvents     CalendarEvent[]    @relation("DealCalendarEvents")')) {
  schema = schema.replace(/model Deal \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents     CalendarEvent[]    @relation("DealCalendarEvents")');
}

// Add to Activity
if (!schema.includes('calendarEvents   CalendarEvent[]  @relation("ActivityCalendarEvents")')) {
  schema = schema.replace(/model Activity \{[\s\S]*?(?=\n\})/g, match => match + '\n  calendarEvents   CalendarEvent[]  @relation("ActivityCalendarEvents")');
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
