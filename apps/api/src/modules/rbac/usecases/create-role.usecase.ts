import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IRoleRepository } from '../repositories/roles.repository.interface';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
    private redisService: RedisService,
  ) {}

  async execute(
    tenantId: string,
    data: { name: string; permissionIds?: string[] },
  ) {
    const existing = await this.roleRepository.findByName(tenantId, data.name);
    if (existing) throw new BadRequestException('Role already exists');

    return this.roleRepository.create(tenantId, {
      name: data.name,
      isSystem: false,
      permissionIds: data.permissionIds,
    });
  }
}
