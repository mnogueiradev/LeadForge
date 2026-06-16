import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { SecurityPolicyService } from '../services/security-policy.service';
import { UpdateSecurityPolicyDto } from '../dto/update-security-policy.dto';

@Controller('security-settings')
@UseGuards(JwtAuthGuard)
export class SecurityPoliciesController {
  constructor(private readonly securityPolicyService: SecurityPolicyService) {}

  @Get()
  @RequirePermissions('security_settings.read')
  async getSettings(@Request() req: any) {
    const tenantId = req.user.tenantId;
    const policy = await this.securityPolicyService.getPolicy(tenantId);
    return { data: policy };
  }

  @Patch()
  @RequirePermissions('security_settings.update')
  async updateSettings(
    @Request() req: any,
    @Body() dto: UpdateSecurityPolicyDto,
  ) {
    const tenantId = req.user.tenantId;
    const updatedPolicy = await this.securityPolicyService.updatePolicy(
      tenantId,
      dto,
    );

    // Future: Emit Audit event here via AuditService

    return {
      data: updatedPolicy,
      message: 'Políticas de segurança atualizadas com sucesso.',
    };
  }
}
