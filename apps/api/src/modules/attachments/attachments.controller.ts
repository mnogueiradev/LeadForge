import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Delete,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { ClsService } from 'nestjs-cls';
import { EntityType } from '@prisma/client';

@Controller('attachments')
export class AttachmentsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly cls: ClsService,
  ) {}

  @Post(':entityType/:entityId')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions('attachments.write')
  async uploadFile(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Param('entityId') entityId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const tenantId = this.cls.get('tenantId');
    const userId = this.cls.get('userId');

    return this.attachmentsService.create(
      tenantId,
      userId,
      entityType,
      entityId,
      file,
    );
  }

  @Get(':entityType/:entityId')
  @RequirePermissions('attachments.read')
  async getAttachments(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    const tenantId = this.cls.get('tenantId');
    return this.attachmentsService.findAllByEntity(tenantId, entityType, entityId);
  }

  @Delete(':id')
  @RequirePermissions('attachments.write')
  async removeAttachment(@Param('id') id: string) {
    const tenantId = this.cls.get('tenantId');
    await this.attachmentsService.remove(tenantId, id);
    return { success: true };
  }
}
