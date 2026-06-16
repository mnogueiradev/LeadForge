import { Injectable, Inject } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RemoveRoleUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
    private redisService: RedisService,
  ) {}

  async execute(tenantId: string, userId: string, roleId: string) {
    await this.roleRepository.removeRoleFromUser(tenantId, userId, roleId);
    await this.redisService.invalidateUserPermissions(tenantId, userId);
    return { success: true };
  }
}
