import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
  ) {}

  async execute(tenantId: string, id: string) {
    const existingUser = await this.userRepository.findById(tenantId, id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(tenantId, id, {
      isActive: false,
    });
    const { passwordHash, ...result } = updatedUser;

    // In a real application, we would also clear the active refresh tokens from Redis

    return result;
  }
}
