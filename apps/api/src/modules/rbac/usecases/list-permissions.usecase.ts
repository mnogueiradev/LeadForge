import { Injectable, Inject } from '@nestjs/common';
import { IPermissionRepository } from '../repositories/permissions.repository.interface';

@Injectable()
export class ListPermissionsUseCase {
  constructor(
    @Inject(IPermissionRepository)
    private permissionRepository: IPermissionRepository,
  ) {}

  async execute() {
    return this.permissionRepository.findAll();
  }
}
