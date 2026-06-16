import { Pipeline } from '@prisma/client';

export class PipelineCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}

export class PipelineUpdatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}

export class PipelineArchivedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}

export class PipelineActivatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}

export class PipelineDeactivatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}

export class PipelineDefaultChangedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly pipeline: Pipeline,
    public readonly actorId: string,
  ) {}
}
