import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CreateInvitationUseCase } from '../usecases/create-invitation.usecase';
import { ResendInvitationUseCase } from '../usecases/resend-invitation.usecase';
import { CancelInvitationUseCase } from '../usecases/cancel-invitation.usecase';
import { ListInvitationsUseCase } from '../usecases/list-invitations.usecase';
import { CreateInvitationDto } from '../dtos/create-invitation.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private createInvitationUseCase: CreateInvitationUseCase,
    private resendInvitationUseCase: ResendInvitationUseCase,
    private cancelInvitationUseCase: CancelInvitationUseCase,
    private listInvitationsUseCase: ListInvitationsUseCase,
  ) {}

  @Get()
  @RequirePermissions('users.read') // same permission to view users
  async findAll(@CurrentUser() user: any) {
    return this.listInvitationsUseCase.execute(user.tenantId);
  }

  @Post()
  @RequirePermissions('users.create')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Max 5 convites por minuto por usuário
  async create(@CurrentUser() user: any, @Body() data: CreateInvitationDto) {
    return this.createInvitationUseCase.execute(user.tenantId, user.sub, data);
  }

  @Post(':id/resend')
  @RequirePermissions('users.update')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // Max 3 reenvios por minuto por usuário
  async resend(@CurrentUser() user: any, @Param('id') id: string) {
    return this.resendInvitationUseCase.execute(user.tenantId, id, user.sub);
  }

  @Post(':id/cancel')
  @RequirePermissions('users.delete')
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cancelInvitationUseCase.execute(user.tenantId, id);
  }
}
