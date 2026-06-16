import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { MoveDealStageDto } from './dto/move-deal-stage.dto';
import { MarkDealWonDto } from './dto/mark-deal-won.dto';
import { MarkDealLostDto } from './dto/mark-deal-lost.dto';
import { AssignDealOwnerDto } from './dto/assign-deal-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createDealDto: CreateDealDto) {
    return this.dealsService.create(user.tenantId, user.id, createDealDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('pipelineId') pipelineId?: string,
    @Query('stageId') stageId?: string,
    @Query('status') status?: any,
  ) {
    return this.dealsService.findAll(
      user.tenantId,
      pipelineId,
      stageId,
      status,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dealsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(user.tenantId, id, updateDealDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dealsService.remove(user.tenantId, id);
  }

  @Post(':id/move-stage')
  moveStage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() moveDealStageDto: MoveDealStageDto,
  ) {
    return this.dealsService.moveStage(
      user.tenantId,
      id,
      user.id,
      moveDealStageDto,
    );
  }

  @Post(':id/won')
  markWon(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() markDealWonDto: MarkDealWonDto,
  ) {
    return this.dealsService.markWon(
      user.tenantId,
      id,
      user.id,
      markDealWonDto,
    );
  }

  @Post(':id/lost')
  markLost(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() markDealLostDto: MarkDealLostDto,
  ) {
    return this.dealsService.markLost(
      user.tenantId,
      id,
      user.id,
      markDealLostDto,
    );
  }

  @Patch(':id/owner')
  assignOwner(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() assignDealOwnerDto: AssignDealOwnerDto,
  ) {
    return this.dealsService.assignOwner(
      user.tenantId,
      id,
      user.id,
      assignDealOwnerDto,
    );
  }
}
