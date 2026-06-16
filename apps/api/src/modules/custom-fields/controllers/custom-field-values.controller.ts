import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  GetEntityCustomFieldsUseCase,
  SetCustomFieldValuesUseCase,
} from '../usecases';
import { SetEntityCustomFieldsDto } from '../dtos/custom-fields.dto';
import { EntityType } from '@prisma/client';

@Controller('custom-field-values')
@UseGuards(JwtAuthGuard)
export class CustomFieldValuesController {
  constructor(
    private readonly getEntityFieldsUseCase: GetEntityCustomFieldsUseCase,
    private readonly setFieldValuesUseCase: SetCustomFieldValuesUseCase,
  ) {}

  @Get(':entityType/:entityId')
  @RequirePermissions('custom_fields.read')
  async getEntityFields(
    @Req() req: any,
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.getEntityFieldsUseCase.execute(
      req.user.tenantId,
      entityType,
      entityId,
    );
  }

  @Patch()
  @RequirePermissions('custom_fields.fill')
  async setEntityFields(
    @Req() req: any,
    @Body() data: SetEntityCustomFieldsDto,
  ) {
    await this.setFieldValuesUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      data,
    );
    return { success: true };
  }
}
