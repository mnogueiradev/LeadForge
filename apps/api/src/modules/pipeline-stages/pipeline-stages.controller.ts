import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PipelineStagesService } from './pipeline-stages.service';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
import { ReorderPipelineStagesDto } from './dto/reorder-pipeline-stages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pipelines/:pipelineId/stages')
export class PipelineStagesController {
  constructor(private readonly pipelineStagesService: PipelineStagesService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Param('pipelineId') pipelineId: string,
    @Body() createPipelineStageDto: CreatePipelineStageDto,
  ) {
    return this.pipelineStagesService.create(
      user.tenantId,
      pipelineId,
      user.id,
      createPipelineStageDto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: any, @Param('pipelineId') pipelineId: string) {
    return this.pipelineStagesService.findAll(user.tenantId, pipelineId);
  }

  @Put('reorder')
  reorder(
    @CurrentUser() user: any,
    @Param('pipelineId') pipelineId: string,
    @Body() reorderDto: ReorderPipelineStagesDto,
  ) {
    return this.pipelineStagesService.reorder(
      user.tenantId,
      pipelineId,
      reorderDto,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: any,
    @Param('pipelineId') pipelineId: string,
    @Param('id') id: string,
  ) {
    return this.pipelineStagesService.findOne(user.tenantId, pipelineId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('pipelineId') pipelineId: string,
    @Param('id') id: string,
    @Body() updatePipelineStageDto: UpdatePipelineStageDto,
  ) {
    return this.pipelineStagesService.update(
      user.tenantId,
      pipelineId,
      id,
      updatePipelineStageDto,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: any,
    @Param('pipelineId') pipelineId: string,
    @Param('id') id: string,
  ) {
    return this.pipelineStagesService.remove(user.tenantId, pipelineId, id);
  }
}
