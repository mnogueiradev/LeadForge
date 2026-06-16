import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { EnvConfig } from '../../config/env.config';
import { ClsService } from 'nestjs-cls';
import { UAParser } from 'ua-parser-js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityLogSeverity } from '@prisma/client';
import { SecurityPolicyService } from '../security-policies/services/security-policy.service';
import {
  IdentityRiskService,
  RiskLevel,
} from '../identity-hardening/services/identity-risk.service';
import {
  AuthenticatedUser,
  TokensResponse,
  RefreshTokenPayload,
} from './interfaces/auth-payload.interface';
import { RegisterDto } from './dtos/register.dto';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService<EnvConfig, true>,
    private cls: ClsService,
    private eventEmitter: EventEmitter2,
    private securityPolicyService: SecurityPolicyService,
    private identityRiskService: IdentityRiskService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const failures = await this.redisService.getLoginFailures(email);
    if (failures >= 5) {
      throw new UnauthorizedException(
        'Muitas tentativas de login. Conta bloqueada temporariamente. Tente novamente em 15 minutos.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (
      user &&
      user.isActive &&
      (await bcrypt.compare(pass, user.passwordHash))
    ) {
      // Login successful, reset failures
      await this.redisService.resetLoginFailures(email);
      const { passwordHash: _, ...result } = user;
      return result;
    }

    // Login failed, increment
    await this.redisService.incrementLoginFailures(email);
    return null;
  }

  async login(
    user: AuthenticatedUser,
    existingFamilyId?: string,
  ): Promise<TokensResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    const familyId = existingFamilyId || uuidv4();
    const sessionId = uuidv4(); // JTI for access token

    // Generate access token
    const accessToken = this.jwtService.sign({
      ...payload,
      jti: sessionId,
      familyId,
    });

    // Generate refresh token
    const refreshJti = uuidv4();
    const expiresInRaw =
      this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
    // simplificando o ttl para o db (exemplo: 7 dias = 7 * 24 * 60 * 60 * 1000)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenRaw = this.jwtService.sign(
      { ...payload, jti: refreshJti, type: 'refresh', familyId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: expiresInRaw,
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10);

    const userAgent = this.cls.get<string>('userAgent') || '';
    const ipAddress = this.cls.get<string>('ipAddress') || '';
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const deviceType =
      device.type === 'mobile'
        ? 'MOBILE'
        : device.type === 'tablet'
          ? 'TABLET'
          : 'DESKTOP';
    const deviceName = `${os.name || 'Unknown OS'} - ${browser.name || 'Unknown Browser'}`;

    // --- ENFORCEMENT: Session Policy ---
    const policy = await this.securityPolicyService.getPolicy(user.tenantId);

    // Limits
    if (!existingFamilyId && policy.sessionPolicy.maxConcurrentSessions > 0) {
      // Find active sessions
      const activeSessions = await this.prisma.session.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: { lastActivityAt: 'asc' },
      });

      if (activeSessions.length >= policy.sessionPolicy.maxConcurrentSessions) {
        // Revoke the oldest one
        const oldestSession = activeSessions[0];
        await this.prisma.session.update({
          where: { id: oldestSession.id },
          data: { status: 'REVOKED' },
        });

        // Audit
        this.eventEmitter.emit('security.session.revoked', {
          tenantId: user.tenantId,
          userId: user.id,
          eventType: 'SESSION',
          action: 'REVOKED_BY_LIMIT',
          severity: SecurityLogSeverity.WARNING,
          details: {
            familyId: oldestSession.familyId,
            reason: 'Max concurrent sessions reached',
          },
        });
      }
    }

    // --- ENFORCEMENT: Identity Risk Engine ---
    if (!existingFamilyId) {
      const riskEvaluation = await this.identityRiskService.evaluateRisk({
        userId: user.id,
        ipAddress,
        userAgent,
        country: undefined, // GeoIP futuro
      });

      if (
        riskEvaluation.level === RiskLevel.HIGH ||
        riskEvaluation.level === RiskLevel.CRITICAL
      ) {
        this.eventEmitter.emit('security.risk.detected', {
          tenantId: user.tenantId,
          userId: user.id,
          eventType: 'SECURITY_RISK',
          action: 'HIGH_RISK_LOGIN',
          severity:
            riskEvaluation.level === RiskLevel.CRITICAL
              ? SecurityLogSeverity.CRITICAL
              : SecurityLogSeverity.WARNING,
          details: {
            riskScore: riskEvaluation.score,
            reasons: riskEvaluation.reasons,
            ipAddress,
          },
        });

        // Se Critical e Tenant tem política rigorosa, poderíamos bloquear ou exigir MFA forçado aqui
      }
    }

    if (!existingFamilyId) {
      // New login - Create Session
      await this.prisma.session.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          refreshTokenHash,
          familyId,
          deviceName,
          deviceType,
          browser: browser.name,
          os: os.name,
          ipAddress,
          userAgent,
          expiresAt,
        },
      });

      this.eventEmitter.emit('security.session.created', {
        tenantId: user.tenantId,
        userId: user.id,
        eventType: 'SESSION',
        action: 'CREATED',
        severity: SecurityLogSeverity.INFO,
        details: { familyId, deviceName, ipAddress },
      });
    } else {
      // Refreshing - Update existing Session
      await this.prisma.session.updateMany({
        where: { familyId, userId: user.id },
        data: {
          refreshTokenHash,
          expiresAt,
          lastActivityAt: new Date(),
          ipAddress, // update IP
          userAgent, // update UA
        },
      });
    }

    return {
      access_token: accessToken,
      refresh_token: refreshTokenRaw,
    };
  }

  async register(data: RegisterDto) {
    const { name, email, password, organizationName } = data;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('O e-mail informado já está em uso.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Tenant and User
    // Use a transaction to ensure both are created together
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Tenant
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + uuidv4().split('-')[0];
      const tenant = await tx.tenant.create({
        data: {
          name: organizationName,
          slug,
        },
      });

      // Create User
      const user = await tx.user.create({
        data: {
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          passwordHash: hashedPassword,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      return { tenant, user };
    });

    return {
      message: 'Usuário registrado com sucesso',
      userId: result.user.id,
      tenantId: result.tenant.id,
    };
  }

  async logout(userId: string, jti: string, exp: number) {
    // Revoke current access token
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl > 0) {
      await this.redisService.setBlacklistToken(jti, ttl);
    }
    // Optionally revoke the refresh token (would need the refresh jti from cookies or payload)
    // Or just revoke all sessions if requested
  }

  async refresh(refreshTokenRaw: string): Promise<TokensResponse> {
    try {
      const decoded = this.jwtService.verify(refreshTokenRaw, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (decoded.type !== 'refresh' || !decoded.familyId) {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar sessão no BD
      const session = await this.prisma.session.findFirst({
        where: { familyId: decoded.familyId, userId: decoded.sub },
      });

      if (!session) {
        throw new UnauthorizedException('Sessão não encontrada');
      }

      // Verificar se a sessão foi revogada (Reúso ou Logout)
      if (session.status === 'REVOKED') {
        this.eventEmitter.emit('security.session.reuse', {
          tenantId: decoded.tenantId,
          userId: decoded.sub,
          eventType: 'SECURITY_VIOLATION',
          action: 'TOKEN_REUSE_DETECTED',
          severity: SecurityLogSeverity.CRITICAL,
          details: {
            familyId: session.familyId,
            ipAddress: this.cls.get('ipAddress'),
          },
        });
        throw new UnauthorizedException('Sessão revogada ou expirada');
      }

      // Validar hash do token
      const isMatch = await bcrypt.compare(
        refreshTokenRaw,
        session.refreshTokenHash,
      );
      if (!isMatch) {
        // Tentativa de usar um token antigo (reúso) em uma sessão ativa
        // Revogar a sessão inteira imediatamente!
        await this.prisma.session.updateMany({
          where: { familyId: session.familyId },
          data: { status: 'REVOKED' },
        });

        this.eventEmitter.emit('security.session.hijack', {
          tenantId: decoded.tenantId,
          userId: decoded.sub,
          eventType: 'SECURITY_VIOLATION',
          action: 'SESSION_HIJACK_ATTEMPT',
          severity: SecurityLogSeverity.CRITICAL,
          details: {
            familyId: session.familyId,
            ipAddress: this.cls.get('ipAddress'),
          },
        });

        throw new UnauthorizedException(
          'Sessão comprometida. Faça login novamente.',
        );
      }

      // Sessão válida, token válido. Rotacionar!
      const user = await this.prisma.user.findFirst({
        where: { id: decoded.sub, deletedAt: null },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário inativo ou não encontrado');
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return this.login(userWithoutPassword, session.familyId);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  // Mocks for password reset
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) {
      // Return true anyway to prevent email enumeration
      return true;
    }

    // Generate random reset token and store in redis (e.g. 1 hour)
    const resetToken = uuidv4();
    await this.redisService.setRefreshToken(
      `reset:${user.id}`,
      resetToken,
      3600,
    ); // reuse method or create custom

    // TODO: Send email
    console.log(
      `[MOCK EMAIL] Para resetar a senha, use o token: ${resetToken} (UserID: ${user.id})`,
    );

    return true;
  }
}
