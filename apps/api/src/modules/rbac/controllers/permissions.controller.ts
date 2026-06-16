import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ListPermissionsUseCase } from '../usecases/list-permissions.usecase';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { Inject } from '@nestjs/common';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private listPermissionsUseCase: ListPermissionsUseCase,
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
  ) {}

  @Get()
  async findAll() {
    return this.listPermissionsUseCase.execute();
  }

  @Get('me')
  async getMyPermissions(@CurrentUser() user: any) {
    return this.roleRepository.getUserEffectivePermissions(
      user.tenantId,
      user.sub,
    );
  }
}
