import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityLogSeverity } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { RevokeSessionUseCase } from '../sessions/usecases/revoke-session.usecase';
import { JwtPayload } from './interfaces/auth-payload.interface';

// Extend Express Request to include typed user
declare global {
  namespace Express {
    // passport uses Express.User
    interface User extends JwtPayload {}
    interface Request {
      user?: User;
    }
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private eventEmitter: EventEmitter2,
    private revokeSessionUseCase: RevokeSessionUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      this.eventEmitter.emit('security.auth.login.failed', {
        tenantId: 'SYSTEM', // Unknown tenant for failed logins if we don't have user
        eventType: 'AUTH',
        action: 'LOGIN_FAILED',
        severity: SecurityLogSeverity.WARNING,
        details: { email: body.email },
      });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.authService.login(user);

    this.eventEmitter.emit('security.auth.login.success', {
      tenantId: user.tenantId,
      userId: user.id,
      eventType: 'AUTH',
      action: 'LOGIN_SUCCESS',
      severity: SecurityLogSeverity.INFO,
    });

    // Set HttpOnly Cookies
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // We can also send access_token via cookie or payload. Usually payload is fine for access token if short-lived.
    return { access_token: tokens.access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Extract typed payload from request
    const payload = this.extractAndValidateJwtPayload(req);

    if (payload) {
      // Blacklist access token immediately
      await this.authService.logout(payload.sub, payload.jti, payload.exp as number);

      // Revoke Session in DB (jti of access token is the session ID)
      try {
        await this.revokeSessionUseCase.execute(
          payload.tenantId,
          payload.sub,
          payload.jti,
          false,
        );
      } catch (error) {
        // Ignore if already revoked or not found
        console.debug('Session revocation failed:', error);
      }

      this.eventEmitter.emit('security.auth.logout', {
        tenantId: payload.tenantId,
        userId: payload.sub,
        eventType: 'AUTH',
        action: 'LOGOUT',
        severity: SecurityLogSeverity.INFO,
      });
    }

    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Logout successful' };
  }

  // Type guard helper to safely extract and validate JWT payload from request
  private extractAndValidateJwtPayload(req: Request): JwtPayload | null {
    const user = req.user as JwtPayload | undefined;

    // Validate that all required fields are present
    if (
      user &&
      user.sub &&
      user.email &&
      user.tenantId &&
      user.jti &&
      typeof user.exp === 'number' &&
      typeof user.iat === 'number'
    ) {
      return user;
    }

    return null;
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: import('./dtos/register.dto').RegisterDto) {
    return await this.authService.register(body);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { cookies: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokens.access_token };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return {
      message: 'Se o e-mail existir, um link de recuperação foi enviado.',
    };
  }
}
