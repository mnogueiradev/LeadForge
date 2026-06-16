import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth-payload.interface';
import { SecurityLogsService } from './security-logs.service';

interface SecurityLogsQuery {
  [key: string]: unknown;
}

@Controller('security-logs')
export class SecurityLogsController {
  constructor(private readonly securityLogsService: SecurityLogsService) {}

  @Get()
  @RequirePermissions('security.read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: SecurityLogsQuery,
  ) {
    return this.securityLogsService.findAll(user.tenantId, query);
  }
}
