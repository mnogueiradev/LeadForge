import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CalendarController } from './calendar.controller';

import { CreateCalendarEventUseCase } from './usecases/create-calendar-event.usecase';
import { UpdateCalendarEventUseCase } from './usecases/update-calendar-event.usecase';
import { DeleteCalendarEventUseCase } from './usecases/delete-calendar-event.usecase';
import { RescheduleCalendarEventUseCase } from './usecases/reschedule-calendar-event.usecase';
import { CompleteCalendarEventUseCase } from './usecases/complete-calendar-event.usecase';
import { CancelCalendarEventUseCase } from './usecases/cancel-calendar-event.usecase';
import { GetCalendarEventUseCase } from './usecases/get-calendar-event.usecase';
import { ListCalendarEventsUseCase } from './usecases/list-calendar-events.usecase';
import { GetCalendarAgendaUseCase } from './usecases/get-calendar-agenda.usecase';

@Module({
  controllers: [CalendarController],
  providers: [
    { provide: PrismaClient, useFactory: async () => { const { prisma } = await import('../../lib/prisma'); return prisma; } },
    CreateCalendarEventUseCase,
    UpdateCalendarEventUseCase,
    DeleteCalendarEventUseCase,
    RescheduleCalendarEventUseCase,
    CompleteCalendarEventUseCase,
    CancelCalendarEventUseCase,
    GetCalendarEventUseCase,
    ListCalendarEventsUseCase,
    GetCalendarAgendaUseCase
  ],
  exports: [
    CreateCalendarEventUseCase,
    UpdateCalendarEventUseCase,
    GetCalendarEventUseCase,
  ],
})
export class CalendarModule {}
