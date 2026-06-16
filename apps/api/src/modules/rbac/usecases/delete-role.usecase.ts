import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
    private redisService: RedisService,
  ) {}

  async execute(tenantId: string, id: string) {
    const deleted = await this.roleRepository.delete(tenantId, id);
    if (!deleted) throw new NotFoundException('Role not found');

    // Invalidate role cache
    await this.redisService.invalidateRolePermissions(tenantId, id);
    return { success: true };
  }
}
