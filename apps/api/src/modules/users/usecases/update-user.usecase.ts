import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PrismaClient } from '@prisma/client';
import { RedisService } from '../../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private prisma: PrismaClient,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, id: string, data: UpdateUserDto) {
    const existingUser = await this.userRepository.findById(tenantId, id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const { roleIds, ...updateData } = data;
    const updatedUser = await this.userRepository.update(
      tenantId,
      id,
      updateData,
    );

    if (roleIds) {
      // Very simple sync approach: delete all and recreate
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      if (roleIds.length > 0) {
        await this.prisma.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
      await this.redisService.invalidateUserPermissions(tenantId, id);
    }

    const { passwordHash, ...result } = updatedUser;

    this.eventEmitter.emit('audit.user.updated', {
      tenantId,
      entityName: 'User',
      entityId: id,
      action: 'UPDATED',
      oldValues: existingUser,
      newValues: updatedUser,
    });

    return result;
  }
}
