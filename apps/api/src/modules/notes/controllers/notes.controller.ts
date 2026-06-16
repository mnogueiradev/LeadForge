import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { EntityType } from '@prisma/client';

import {
  CreateNoteUseCase,
  UpdateNoteUseCase,
  DeleteNoteUseCase,
  TogglePinNoteUseCase,
  ListEntityNotesUseCase,
} from '../usecases';
import {
  CreateNoteDto,
  UpdateNoteDto,
  TogglePinNoteDto,
} from '../dtos/notes.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(
    private readonly createUseCase: CreateNoteUseCase,
    private readonly updateUseCase: UpdateNoteUseCase,
    private readonly deleteUseCase: DeleteNoteUseCase,
    private readonly togglePinUseCase: TogglePinNoteUseCase,
    private readonly listEntityNotesUseCase: ListEntityNotesUseCase,
  ) {}

  @Post()
  @RequirePermissions('notes.create')
  async create(@Req() req: any, @Body() data: CreateNoteDto) {
    return this.createUseCase.execute(req.user.tenantId, req.user.sub, data);
  }

  @Patch(':id')
  @RequirePermissions('notes.update')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateNoteDto,
  ) {
    return this.updateUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data,
    );
  }

  @Delete(':id')
  @RequirePermissions('notes.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.deleteUseCase.execute(req.user.tenantId, req.user.sub, id);
    return { success: true };
  }

  @Patch(':id/pin')
  @RequirePermissions('notes.pin')
  async togglePin(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: TogglePinNoteDto,
  ) {
    return this.togglePinUseCase.execute(req.user.tenantId, id, data.isPinned);
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('notes.read')
  async getEntityNotes(
    @Req() req: any,
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.listEntityNotesUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      entityType,
      entityId,
    );
  }
}
