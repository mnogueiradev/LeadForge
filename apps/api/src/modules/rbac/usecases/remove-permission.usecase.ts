import { Injectable, Inject } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RemovePermissionUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
    private redisService: RedisService,
  ) {}

  async execute(tenantId: string, roleId: string, permissionIds: string[]) {
    await this.roleRepository.removePermissions(
      tenantId,
      roleId,
      permissionIds,
    );
    await this.redisService.invalidateRolePermissions(tenantId, roleId);
    return { success: true };
  }
}
