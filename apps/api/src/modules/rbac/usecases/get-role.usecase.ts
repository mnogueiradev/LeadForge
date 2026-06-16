import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';

@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
  ) {}

  async execute(tenantId: string, id: string) {
    const role = await this.roleRepository.findById(tenantId, id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
}
