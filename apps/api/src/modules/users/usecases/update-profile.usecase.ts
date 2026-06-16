import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
  ) {}

  async execute(tenantId: string, userId: string, data: UpdateProfileDto) {
    const existingUser = await this.userRepository.findById(tenantId, userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(tenantId, userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}
