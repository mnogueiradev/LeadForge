export class CalendarEventResponseDto {
  id: string;
  tenantId: string;
  ownerUserId: string;
  activityId?: string | null;
  title: string;
  description?: string | null;
  eventType: string;
  status: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  location?: string | null;
  meetingUrl?: string | null;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  leadId?: string | null;
  dealId?: string | null;
  metadata?: any | null;
  createdAt: Date;
  updatedAt: Date;

  ownerUser?: { id: string; firstName: string; lastName: string };
  contact?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    primaryEmail?: string | null;
  } | null;
  organization?: { id: string; name: string } | null;
  lead?: { id: string; title: string } | null;
  deal?: { id: string; title: string; value?: number | any | null } | null;
  activity?: { id: string; title: string; status: string } | null;
}
