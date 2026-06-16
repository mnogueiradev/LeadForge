import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvConfig } from '../../config/env.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  // Blacklist: jti -> expiration timeframe
  async setBlacklistToken(
    jti: string,
    expirationSeconds: number,
  ): Promise<void> {
    await this.client.setex(
      `jwt_blacklist:${jti}`,
      expirationSeconds,
      'revoked',
    );
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const exists = await this.client.exists(`jwt_blacklist:${jti}`);
    return exists === 1;
  }

  // Active Sessions / Refresh tokens
  async setRefreshToken(
    userId: string,
    jti: string,
    expirationSeconds: number,
  ): Promise<void> {
    await this.client.setex(
      `refresh_token:${userId}:${jti}`,
      expirationSeconds,
      'active',
    );
  }

  async isRefreshTokenValid(userId: string, jti: string): Promise<boolean> {
    const exists = await this.client.exists(`refresh_token:${userId}:${jti}`);
    return exists === 1;
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const keys = await this.client.keys(`refresh_token:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async revokeRefreshToken(userId: string, jti: string): Promise<void> {
    await this.client.del(`refresh_token:${userId}:${jti}`);
  }

  // RBAC Permissions Cache
  async getUserPermissions(
    tenantId: string,
    userId: string,
  ): Promise<string[] | null> {
    const data = await this.client.get(`rbac:${tenantId}:user:${userId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async setUserPermissions(
    tenantId: string,
    userId: string,
    permissions: string[],
  ): Promise<void> {
    // Cache for 15 minutes
    await this.client.setex(
      `rbac:${tenantId}:user:${userId}`,
      900,
      JSON.stringify(permissions),
    );
  }

  async invalidateUserPermissions(
    tenantId: string,
    userId: string,
  ): Promise<void> {
    await this.client.del(`rbac:${tenantId}:user:${userId}`);
  }

  async invalidateRolePermissions(
    tenantId: string,
    roleId: string,
  ): Promise<void> {
    // A primitive approach: clear ALL cached permissions for this tenant
    // Since keeping track of which user has which role in Redis would be complex,
    // it's safer to just wipe the tenant's permissions cache when a role is updated.
    const keys = await this.client.keys(`rbac:${tenantId}:user:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Account Lockout (Brute Force Protection)
  async getLoginFailures(email: string): Promise<number> {
    const count = await this.client.get(`login_failures:${email}`);
    return count ? parseInt(count, 10) : 0;
  }

  async incrementLoginFailures(email: string): Promise<number> {
    const key = `login_failures:${email}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      // Set expiration to 15 minutes on first failure
      await this.client.expire(key, 900);
    }
    return count;
  }

  async resetLoginFailures(email: string): Promise<void> {
    await this.client.del(`login_failures:${email}`);
  }
}
