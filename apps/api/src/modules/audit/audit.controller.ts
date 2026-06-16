import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth-payload.interface';
import { AuditService, AuditQueryParams } from './audit.service';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit.read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: AuditQueryParams,
  ) {
    return this.auditService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('audit.read')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const log = await this.auditService.findById(user.tenantId, id);
    if (!log) throw new NotFoundException('Log de auditoria não encontrado');
    return log;
  }
}
