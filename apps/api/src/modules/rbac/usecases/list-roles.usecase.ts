import { Injectable, Inject } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
  ) {}

  async execute(tenantId: string) {
    return this.roleRepository.findAll(tenantId);
  }
}
