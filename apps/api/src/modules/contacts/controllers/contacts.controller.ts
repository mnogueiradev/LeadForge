import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/auth-payload.interface';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  CreateContactUseCase,
  UpdateContactUseCase,
  GetContactUseCase,
  ListContactsUseCase,
  ArchiveContactUseCase,
  DeleteContactUseCase,
  ChangeContactOwnerUseCase,
} from '../usecases';
import {
  CreateContactDto,
  UpdateContactDto,
  ChangeContactOwnerDto,
} from '../dtos/contacts.dto';
import { ContactStatus, ContactSource } from '@prisma/client';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly getContactUseCase: GetContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly archiveContactUseCase: ArchiveContactUseCase,
    private readonly deleteContactUseCase: DeleteContactUseCase,
    private readonly changeOwnerUseCase: ChangeContactOwnerUseCase,
  ) {}

  @Post()
  @RequirePermissions('contacts.create')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() data: CreateContactDto,
  ) {
    return this.createContactUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      data,
    );
  }

  @Get()
  @RequirePermissions('contacts.read')
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: ContactStatus,
    @Query('source') source?: ContactSource,
    @Query('organizationId') organizationId?: string,
    @Query('ownerUserId') ownerUserId?: string,
  ) {
    return this.listContactsUseCase.execute({
      tenantId: req.user.tenantId,
      page,
      limit: limit > 100 ? 100 : limit,
      search,
      status,
      source,
      organizationId,
      ownerUserId,
    });
  }

  @Get(':id')
  @RequirePermissions('contacts.read')
  async get(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.getContactUseCase.execute(req.user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('contacts.update')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() data: UpdateContactDto,
  ) {
    return this.updateContactUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data,
    );
  }

  @Patch(':id/owner')
  @RequirePermissions('contacts.assign_owner')
  async changeOwner(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() data: ChangeContactOwnerDto,
  ) {
    await this.changeOwnerUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data.newOwnerId,
    );
    return { success: true };
  }

  @Patch(':id/archive')
  @RequirePermissions('contacts.update')
  async archive(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.archiveContactUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
    );
    return { success: true };
  }

  @Delete(':id')
  @RequirePermissions('contacts.delete')
  async delete(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.deleteContactUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
    );
    return { success: true };
  }
}
