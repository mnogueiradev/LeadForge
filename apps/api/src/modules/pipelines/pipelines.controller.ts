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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import {
  CreatePipelineUseCase,
  UpdatePipelineUseCase,
  DeletePipelineUseCase,
  ArchivePipelineUseCase,
  ActivatePipelineUseCase,
  DeactivatePipelineUseCase,
  SetDefaultPipelineUseCase,
  ReorderPipelinesUseCase,
  GetPipelineUseCase,
  ListPipelinesUseCase,
} from './use-cases';
import { CreatePipelineDto } from './dtos/create-pipeline.dto';
import { UpdatePipelineDto } from './dtos/update-pipeline.dto';
import { ListPipelinesDto } from './dtos/list-pipelines.dto';
import { ReorderPipelinesDto } from './dtos/reorder-pipelines.dto';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(
    private readonly createPipelineUseCase: CreatePipelineUseCase,
    private readonly updatePipelineUseCase: UpdatePipelineUseCase,
    private readonly deletePipelineUseCase: DeletePipelineUseCase,
    private readonly archivePipelineUseCase: ArchivePipelineUseCase,
    private readonly activatePipelineUseCase: ActivatePipelineUseCase,
    private readonly deactivatePipelineUseCase: DeactivatePipelineUseCase,
    private readonly setDefaultPipelineUseCase: SetDefaultPipelineUseCase,
    private readonly reorderPipelinesUseCase: ReorderPipelinesUseCase,
    private readonly getPipelineUseCase: GetPipelineUseCase,
    private readonly listPipelinesUseCase: ListPipelinesUseCase,
  ) {}

  @Post()
  @RequirePermissions('pipelines:create')
  async create(@Req() req: any, @Body() dto: CreatePipelineDto) {
    return this.createPipelineUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      dto,
    );
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('pipelines:update')
  async reorder(@Req() req: any, @Body() dto: ReorderPipelinesDto) {
    await this.reorderPipelinesUseCase.execute(req.user.tenantId, dto);
  }

  @Get()
  @RequirePermissions('pipelines:read')
  async list(@Req() req: any, @Query() query: ListPipelinesDto) {
    return this.listPipelinesUseCase.execute(req.user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('pipelines:read')
  async get(@Req() req: any, @Param('id') id: string) {
    return this.getPipelineUseCase.execute(req.user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('pipelines:update')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.updatePipelineUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Post(':id/activate')
  @RequirePermissions('pipelines:activate')
  async activate(@Req() req: any, @Param('id') id: string) {
    return this.activatePipelineUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
    );
  }

  @Post(':id/deactivate')
  @RequirePermissions('pipelines:activate')
  async deactivate(@Req() req: any, @Param('id') id: string) {
    return this.deactivatePipelineUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
    );
  }

  @Post(':id/set-default')
  @RequirePermissions('pipelines:set_default')
  async setDefault(@Req() req: any, @Param('id') id: string) {
    return this.setDefaultPipelineUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
    );
  }

  @Delete(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('pipelines:delete')
  async archive(@Req() req: any, @Param('id') id: string) {
    await this.archivePipelineUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('pipelines:delete')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.deletePipelineUseCase.execute(req.user.tenantId, id);
  }
}
