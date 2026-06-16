export class LeadCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly leadId: string,
    public readonly title: string,
    public readonly actorUserId: string,
    public readonly metadata?: any,
  ) {}
}

export class LeadConvertedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly leadId: string,
    public readonly title: string,
    public readonly actorUserId: string,
    public readonly metadata?: any,
  ) {}
}

export class LeadLostEvent {
  constructor(
    public readonly tenantId: string,
    public readonly leadId: string,
    public readonly title: string,
    public readonly actorUserId: string,
    public readonly metadata?: any,
  ) {}
}

export class LeadOwnerChangedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly leadId: string,
    public readonly title: string,
    public readonly actorUserId: string,
    public readonly metadata?: any,
  ) {}
}
