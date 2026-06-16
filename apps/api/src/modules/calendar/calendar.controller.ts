import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/auth-payload.interface';

import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { RescheduleCalendarEventDto } from './dto/reschedule-calendar-event.dto';
import { ListCalendarEventsDto } from './dto/list-calendar-events.dto';
import { GetCalendarAgendaDto } from './dto/get-calendar-agenda.dto';

import { CreateCalendarEventUseCase } from './usecases/create-calendar-event.usecase';
import { UpdateCalendarEventUseCase } from './usecases/update-calendar-event.usecase';
import { DeleteCalendarEventUseCase } from './usecases/delete-calendar-event.usecase';
import { RescheduleCalendarEventUseCase } from './usecases/reschedule-calendar-event.usecase';
import { CompleteCalendarEventUseCase } from './usecases/complete-calendar-event.usecase';
import { CancelCalendarEventUseCase } from './usecases/cancel-calendar-event.usecase';
import { GetCalendarEventUseCase } from './usecases/get-calendar-event.usecase';
import { ListCalendarEventsUseCase } from './usecases/list-calendar-events.usecase';
import { GetCalendarAgendaUseCase } from './usecases/get-calendar-agenda.usecase';

@Controller('calendar/events')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly createUseCase: CreateCalendarEventUseCase,
    private readonly updateUseCase: UpdateCalendarEventUseCase,
    private readonly deleteUseCase: DeleteCalendarEventUseCase,
    private readonly rescheduleUseCase: RescheduleCalendarEventUseCase,
    private readonly completeUseCase: CompleteCalendarEventUseCase,
    private readonly cancelUseCase: CancelCalendarEventUseCase,
    private readonly getUseCase: GetCalendarEventUseCase,
    private readonly listUseCase: ListCalendarEventsUseCase,
    private readonly agendaUseCase: GetCalendarAgendaUseCase,
  ) {}

  @Post()
  create(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Body() dto: CreateCalendarEventDto,
  ) {
    return this.createUseCase.execute(req.user.tenantId, dto, req.user.sub);
  }

  @Get('agenda')
  getAgenda(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Query() dto: GetCalendarAgendaDto,
  ) {
    return this.agendaUseCase.execute(req.user.tenantId, dto);
  }

  @Get()
  list(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Query() dto: ListCalendarEventsDto,
  ) {
    return this.listUseCase.execute(req.user.tenantId, dto);
  }

  @Get(':id')
  findOne(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.getUseCase.execute(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.updateUseCase.execute(req.user.tenantId, id, dto, req.user.sub);
  }

  @Delete(':id')
  remove(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.deleteUseCase.execute(req.user.tenantId, id);
  }

  @Post(':id/reschedule')
  reschedule(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: RescheduleCalendarEventDto,
  ) {
    return this.rescheduleUseCase.execute(
      req.user.tenantId,
      id,
      dto,
      req.user.sub,
    );
  }

  @Post(':id/complete')
  complete(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.completeUseCase.execute(req.user.tenantId, id, req.user.sub);
  }

  @Post(':id/cancel')
  cancel(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.cancelUseCase.execute(req.user.tenantId, id, req.user.sub);
  }
}

