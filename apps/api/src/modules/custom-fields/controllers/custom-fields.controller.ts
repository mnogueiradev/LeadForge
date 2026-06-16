import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  CreateCustomFieldUseCase,
  UpdateCustomFieldUseCase,
  DeleteCustomFieldUseCase,
  ListCustomFieldsUseCase,
} from '../usecases';
import {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
} from '../dtos/custom-fields.dto';
import { EntityType } from '@prisma/client';

@Controller('custom-fields')
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(
    private readonly createUseCase: CreateCustomFieldUseCase,
    private readonly updateUseCase: UpdateCustomFieldUseCase,
    private readonly deleteUseCase: DeleteCustomFieldUseCase,
    private readonly listUseCase: ListCustomFieldsUseCase,
  ) {}

  @Post()
  @RequirePermissions('custom_fields.manage')
  async create(@Req() req: any, @Body() data: CreateCustomFieldDto) {
    return this.createUseCase.execute(req.user.tenantId, req.user.sub, data);
  }

  @Get()
  @RequirePermissions('custom_fields.read')
  async list(@Req() req: any, @Query('entityType') entityType?: EntityType) {
    return this.listUseCase.execute(req.user.tenantId, entityType);
  }

  @Patch(':id')
  @RequirePermissions('custom_fields.manage')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateCustomFieldDto,
  ) {
    return this.updateUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data,
    );
  }

  @Delete(':id')
  @RequirePermissions('custom_fields.manage')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.deleteUseCase.execute(req.user.tenantId, req.user.sub, id);
    return { success: true };
  }
}
