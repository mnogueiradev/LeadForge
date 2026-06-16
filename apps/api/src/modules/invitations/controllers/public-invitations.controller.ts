import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { AcceptInvitationUseCase } from '../usecases/accept-invitation.usecase';
import { GetInvitationUseCase } from '../usecases/get-invitation.usecase';
import { AcceptInvitationDto } from '../dtos/accept-invitation.dto';

@Controller('invite')
export class PublicInvitationsController {
  constructor(
    private acceptInvitationUseCase: AcceptInvitationUseCase,
    private getInvitationUseCase: GetInvitationUseCase,
  ) {}

  @Public()
  @Get(':token')
  async getInvite(@Param('token') token: string) {
    return this.getInvitationUseCase.execute(token);
  }

  @Public()
  @Post(':token/accept')
  async acceptInvite(
    @Param('token') token: string,
    @Body() data: AcceptInvitationDto,
  ) {
    return this.acceptInvitationUseCase.execute(token, data);
  }
}
