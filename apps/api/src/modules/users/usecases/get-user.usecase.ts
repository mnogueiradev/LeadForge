import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
  ) {}

  async execute(tenantId: string, id: string) {
    const existingUser = await this.userRepository.findById(tenantId, id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = existingUser;
    return result;
  }
}
