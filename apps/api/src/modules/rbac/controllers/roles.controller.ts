import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { AssignPermissionsDto } from '../dtos/assign-permissions.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CreateRoleUseCase } from '../usecases/create-role.usecase';
import { UpdateRoleUseCase } from '../usecases/update-role.usecase';
import { DeleteRoleUseCase } from '../usecases/delete-role.usecase';
import { ListRolesUseCase } from '../usecases/list-roles.usecase';
import { GetRoleUseCase } from '../usecases/get-role.usecase';
import { AssignPermissionUseCase } from '../usecases/assign-permission.usecase';
import { RemovePermissionUseCase } from '../usecases/remove-permission.usecase';

@Controller('roles')
export class RolesController {
  constructor(
    private createRoleUseCase: CreateRoleUseCase,
    private updateRoleUseCase: UpdateRoleUseCase,
    private deleteRoleUseCase: DeleteRoleUseCase,
    private listRolesUseCase: ListRolesUseCase,
    private getRoleUseCase: GetRoleUseCase,
    private assignPermissionUseCase: AssignPermissionUseCase,
    private removePermissionUseCase: RemovePermissionUseCase,
  ) {}

  @Get()
  @RequirePermissions('roles.read')
  async findAll(@CurrentUser() user: any) {
    return this.listRolesUseCase.execute(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.getRoleUseCase.execute(user.tenantId, id);
  }

  @Post()
  @RequirePermissions('roles.manage')
  async create(@CurrentUser() user: any, @Body() data: CreateRoleDto) {
    return this.createRoleUseCase.execute(user.tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('roles.manage')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: UpdateRoleDto,
  ) {
    return this.updateRoleUseCase.execute(user.tenantId, id, data);
  }

  @Delete(':id')
  @RequirePermissions('roles.manage')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.deleteRoleUseCase.execute(user.tenantId, id);
  }

  @Post(':id/permissions')
  @RequirePermissions('roles.manage')
  async assignPermissions(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: AssignPermissionsDto,
  ) {
    return this.assignPermissionUseCase.execute(
      user.tenantId,
      id,
      data.permissionIds,
    );
  }

  @Delete(':id/permissions')
  @RequirePermissions('roles.manage')
  async removePermissions(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: AssignPermissionsDto,
  ) {
    return this.removePermissionUseCase.execute(
      user.tenantId,
      id,
      data.permissionIds,
    );
  }
}
