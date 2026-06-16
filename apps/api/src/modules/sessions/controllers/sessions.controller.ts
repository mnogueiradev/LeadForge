import {
  Controller,
  Get,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { ListSessionsUseCase } from '../usecases/list-sessions.usecase';
import { RevokeSessionUseCase } from '../usecases/revoke-session.usecase';
import { GlobalLogoutUseCase } from '../usecases/global-logout.usecase';

import { JwtPayload } from '../../auth/interfaces/auth-payload.interface';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

interface Session {
  familyId: string;
  isCurrent?: boolean;
  [key: string]: unknown;
}

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly globalLogoutUseCase: GlobalLogoutUseCase,
  ) {}

  @Get()
  async getSessions(@Request() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const familyId = req.user.familyId;

    const sessions = await this.listSessionsUseCase.execute(userId as string);
    return {
      data: sessions.map((s: Session) => ({
        ...s,
        isCurrent: s.familyId === familyId,
      })),
    };
  }

  @Delete('global')
  async globalLogout(@Request() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.globalLogoutUseCase.execute(
      req.user.tenantId,
      userId as string,
      req.user.familyId as string,
    );
  }

  @Delete(':id')
  async revokeSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') sessionId: string,
  ) {
    const userId = req.user.sub;
    return this.revokeSessionUseCase.execute(
      req.user.tenantId,
      userId as string,
      sessionId,
      false,
    );
  }

  @Delete(':id/terminate')
  @RequirePermissions('sessions.terminate')
  async terminateAnySession(
    @Request() req: AuthenticatedRequest,
    @Param('id') sessionId: string,
  ) {
    // Admin force terminate
    const userId = req.user.sub;
    return this.revokeSessionUseCase.execute(
      req.user.tenantId,
      userId as string,
      sessionId,
      true,
    );
  }
}
