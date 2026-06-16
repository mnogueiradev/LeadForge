import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
    private redisService: RedisService,
  ) {}

  async execute(tenantId: string, id: string, data: { name: string }) {
    const role = await this.roleRepository.update(tenantId, id, data);
    return role;
  }
}
