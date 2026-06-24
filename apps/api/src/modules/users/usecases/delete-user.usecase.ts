import { Injectable, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';
import { DeleteUserDto } from '../dtos/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(tenantId: string, adminId: string, targetUserId: string, dto: DeleteUserDto) {
    // 1. Check if admin exists
    const admin = await this.userRepository.findById(tenantId, adminId);
    if (!admin) {
      throw new UnauthorizedException('Administrador não encontrado.');
    }

    // 2. Validate admin password
    const isPasswordValid = await bcrypt.compare(dto.adminPassword, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha de administrador incorreta.');
    }

    // 3. Check if target user exists
    const targetUser = await this.userRepository.findById(tenantId, targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // 4. Prevent self-deletion if applicable, though maybe the owner wants to? 
    // Wait, the prompt says "excluir eles do sistema". Better to prevent self deletion to avoid locking out.
    if (adminId === targetUserId) {
      throw new UnauthorizedException('Você não pode excluir sua própria conta por aqui.');
    }

    // 5. Soft delete the target user
    await this.userRepository.update(tenantId, targetUserId, { deletedAt: new Date() });

    // 6. Audit Logging
    this.eventEmitter.emit('audit.log', {
      tenantId,
      userId: adminId,
      action: 'DELETE',
      resource: 'USER',
      resourceId: targetUserId,
      details: { message: `Administrador excluiu o usuário ${targetUser.email}` },
    });

    return { success: true };
  }
}
