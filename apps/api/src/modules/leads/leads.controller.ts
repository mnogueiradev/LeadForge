import {
  Controller,
  Post,
  Get,
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
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { JwtPayload } from '../auth/interfaces/auth-payload.interface';
import {
  CreateLeadUseCase,
  UpdateLeadUseCase,
  ConvertLeadUseCase,
  LoseLeadUseCase,
  ListLeadsUseCase,
  ArchiveLeadUseCase,
  DeleteLeadUseCase,
  GetLeadUseCase,
} from './use-cases';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { ListLeadsDto } from './dtos/list-leads.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly updateLeadUseCase: UpdateLeadUseCase,
    private readonly convertLeadUseCase: ConvertLeadUseCase,
    private readonly loseLeadUseCase: LoseLeadUseCase,
    private readonly listLeadsUseCase: ListLeadsUseCase,
    private readonly archiveLeadUseCase: ArchiveLeadUseCase,
    private readonly deleteLeadUseCase: DeleteLeadUseCase,
    private readonly getLeadUseCase: GetLeadUseCase,
  ) {}

  @Post()
  @RequirePermissions('leads.create')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateLeadDto,
  ) {
    return this.createLeadUseCase.execute(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  @RequirePermissions('leads.read')
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: ListLeadsDto,
  ) {
    return this.listLeadsUseCase.execute(req.user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('leads.read')
  async get(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.getLeadUseCase.execute(req.user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('leads.update')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.updateLeadUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Post(':id/convert')
  @RequirePermissions('leads.update')
  async convert(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.convertLeadUseCase.execute(req.user.tenantId, id, req.user.sub);
  }

  @Post(':id/lose')
  @RequirePermissions('leads.update')
  async lose(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.loseLeadUseCase.execute(
      req.user.tenantId,
      id,
      req.user.sub,
      reason,
    );
  }

  @Delete(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('leads.delete')
  async archive(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.archiveLeadUseCase.execute(req.user.tenantId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('leads.delete')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.deleteLeadUseCase.execute(req.user.tenantId, id);
  }
}
