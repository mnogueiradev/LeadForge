import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RedisService } from '../../redis/redis.service';
import { IRoleRepository } from '../../rbac/repositories/roles.repository.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
    @Inject(IRoleRepository) private roleRepository: IRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required, proceed
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    if (!user || !user.sub || !user.tenantId) {
      throw new ForbiddenException('Usuário não autenticado ou sem tenant');
    }

    // Attempt to get permissions from cache
    let userPermissions = await this.redisService.getUserPermissions(
      user.tenantId,
      user.sub,
    );

    if (!userPermissions) {
      // Cache miss, resolve from database
      userPermissions = await this.roleRepository.getUserEffectivePermissions(
        user.tenantId,
        user.sub,
      );
      await this.redisService.setUserPermissions(
        user.tenantId,
        user.sub,
        userPermissions,
      );
    }

    // Check if user has ALL required permissions
    // Alternatively, it could be ANY. We'll use ALL for stricter control.
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      // Temporariamente liberando os módulos novos até a migration de roles
      const isNewModule = requiredPermissions.some(p => p.startsWith('pipelines:') || p.startsWith('deals:'));
      if (isNewModule) {
        return true;
      }

      throw new ForbiddenException(
        'Você não tem permissão para realizar esta ação',
      );
    }

    return true;
  }
}
