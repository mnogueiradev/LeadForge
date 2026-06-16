import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AssignActivityDto } from './dto/assign-activity.dto';

import { CreateActivityUseCase } from './usecases/create-activity.usecase';
import { UpdateActivityUseCase } from './usecases/update-activity.usecase';
import { DeleteActivityUseCase } from './usecases/delete-activity.usecase';
import { AssignActivityUseCase } from './usecases/assign-activity.usecase';
import { StartActivityUseCase } from './usecases/start-activity.usecase';
import { CompleteActivityUseCase } from './usecases/complete-activity.usecase';
import { CancelActivityUseCase } from './usecases/cancel-activity.usecase';
import { GetActivityUseCase } from './usecases/get-activity.usecase';
import {
  ListActivitiesUseCase,
  ListActivitiesFilters,
} from './usecases/list-activities.usecase';

interface AuthenticatedUser {
  tenantId: string;
  id: string;
  [key: string]: unknown;
}

interface ActivityFilters extends ListActivitiesFilters {
  [key: string]: unknown;
}

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly createActivityUseCase: CreateActivityUseCase,
    private readonly updateActivityUseCase: UpdateActivityUseCase,
    private readonly deleteActivityUseCase: DeleteActivityUseCase,
    private readonly assignActivityUseCase: AssignActivityUseCase,
    private readonly startActivityUseCase: StartActivityUseCase,
    private readonly completeActivityUseCase: CompleteActivityUseCase,
    private readonly cancelActivityUseCase: CancelActivityUseCase,
    private readonly getActivityUseCase: GetActivityUseCase,
    private readonly listActivitiesUseCase: ListActivitiesUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActivityDto,
  ) {
    return this.createActivityUseCase.execute(user.tenantId, user.id, dto);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: ActivityFilters,
  ) {
    const parsedFilters: ListActivitiesFilters = {
      ...filters,
      limit: filters.limit ? parseInt(String(filters.limit), 10) : 50,
      offset: filters.offset ? parseInt(String(filters.offset), 10) : 0,
    };
    return this.listActivitiesUseCase.execute(user.tenantId, parsedFilters);
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.getActivityUseCase.execute(user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.updateActivityUseCase.execute(user.tenantId, id, user.id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.deleteActivityUseCase.execute(user.tenantId, id, user.id);
  }

  @Patch(':id/assign')
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignActivityDto,
  ) {
    return this.assignActivityUseCase.execute(user.tenantId, id, user.id, dto);
  }

  @Post(':id/start')
  async start(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.startActivityUseCase.execute(user.tenantId, id, user.id);
  }

  @Post(':id/complete')
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.completeActivityUseCase.execute(user.tenantId, id, user.id);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.cancelActivityUseCase.execute(user.tenantId, id, user.id);
  }
}
