import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private prisma: PrismaClient,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, data: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(
      tenantId,
      data.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists in this tenant');
    }

    // In a real flow, this could generate a random password and send an invitation email.
    // For now, let's just generate a mock password hash.
    const mockPassword = 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(mockPassword, 10);

    const user = await this.userRepository.create({
      tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      jobTitle: data.jobTitle || null,
      passwordHash,
      isActive: true,
      lastLoginAt: null,
    });

    if (data.roleIds && data.roleIds.length > 0) {
      await Promise.all(
        data.roleIds.map((roleId) =>
          this.prisma.userRole
            .create({
              data: { userId: user.id, roleId },
            })
            .catch(() => {}),
        ),
      );
    }

    const { passwordHash: _, ...result } = user;

    this.eventEmitter.emit('audit.user.created', {
      tenantId,
      entityName: 'User',
      entityId: user.id,
      action: 'CREATED',
      newValues: result,
    });

    return result;
  }
}
