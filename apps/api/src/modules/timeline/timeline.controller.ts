import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth-payload.interface';
import { ListTimelineUseCase } from './use-cases/list-timeline.use-case';
import { ListTimelineDto } from './dtos/list-timeline.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly listTimelineUseCase: ListTimelineUseCase) {}

  @Get()
  @RequirePermissions('timeline:read_all')
  async getGlobalTimeline(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListTimelineDto,
  ) {
    return this.listTimelineUseCase.execute(user.tenantId, query);
  }

  @Get('entity')
  @RequirePermissions('timeline:read_entity') // Or similar specific permission
  async getEntityTimeline(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListTimelineDto,
  ) {
    return this.listTimelineUseCase.execute(user.tenantId, query);
  }

  @Get('user')
  @RequirePermissions('timeline:read_user')
  async getUserTimeline(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListTimelineDto,
  ) {
    return this.listTimelineUseCase.execute(user.tenantId, query);
  }
}
