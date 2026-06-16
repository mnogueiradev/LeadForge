import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MoveDealStageUseCase } from './usecases/move-deal-stage.usecase';
import { GetMovementHistoryUseCase } from './usecases/get-movement-history.usecase';
import { ListStageMovementsUseCase } from './usecases/list-stage-movements.usecase';
import { MoveDealDto } from './dto/move-deal.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class PipelineMovementsController {
  constructor(
    private readonly moveDealStageUseCase: MoveDealStageUseCase,
    private readonly getMovementHistoryUseCase: GetMovementHistoryUseCase,
    private readonly listStageMovementsUseCase: ListStageMovementsUseCase,
  ) {}

  @Post('deals/:id/movements')
  async moveDeal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: MoveDealDto,
  ) {
    return this.moveDealStageUseCase.execute({
      tenantId: user.tenantId,
      dealId: id,
      toStageId: dto.toStageId,
      userId: user.id,
      source: dto.source,
      reason: dto.reason,
      metadata: dto.metadata,
    });
  }

  @Get('deals/:id/movements')
  async getDealMovements(@CurrentUser() user: any, @Param('id') id: string) {
    return this.getMovementHistoryUseCase.execute(user.tenantId, id);
  }

  @Get('pipeline-stages/:id/movements')
  async getStageMovements(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.listStageMovementsUseCase.execute(
      user.tenantId,
      id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
