import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/auth-payload.interface';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  AssignTagUseCase,
  RemoveTagUseCase,
  ListEntityTagsUseCase,
} from '../usecases';
import { AssignTagDto } from '../dtos/tags.dto';
import { EntityType } from '@prisma/client';

@Controller('tags/assignments')
@UseGuards(JwtAuthGuard)
export class TagAssignmentsController {
  constructor(
    private readonly assignUseCase: AssignTagUseCase,
    private readonly removeUseCase: RemoveTagUseCase,
    private readonly listEntityTagsUseCase: ListEntityTagsUseCase,
  ) {}

  @Post()
  @RequirePermissions('tags.assign')
  async assign(
    @Req() req: Request & { user: JwtPayload },
    @Body() data: AssignTagDto,
  ) {
    await this.assignUseCase.execute(req.user.tenantId, req.user.sub, data);
    return { success: true };
  }

  @Delete(':tagId/:entityType/:entityId')
  @RequirePermissions('tags.assign') // Consider assign/remove same perm level
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('tagId') tagId: string,
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    await this.removeUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      tagId,
      entityType,
      entityId,
    );
    return { success: true };
  }

  @Get(':entityType/:entityId')
  @RequirePermissions('tags.read')
  async getEntityTags(
    @Req() req: Request & { user: JwtPayload },
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.listEntityTagsUseCase.execute(
      req.user.tenantId,
      entityType,
      entityId,
    );
  }
}
