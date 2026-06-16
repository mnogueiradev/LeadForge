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
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/auth-payload.interface';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  ListTagsUseCase,
} from '../usecases';
import { CreateTagDto, UpdateTagDto } from '../dtos/tags.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(
    private readonly createUseCase: CreateTagUseCase,
    private readonly updateUseCase: UpdateTagUseCase,
    private readonly deleteUseCase: DeleteTagUseCase,
    private readonly listUseCase: ListTagsUseCase,
  ) {}

  @Post()
  @RequirePermissions('tags.create')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() data: CreateTagDto,
  ) {
    return this.createUseCase.execute(req.user.tenantId, req.user.sub, data);
  }

  @Get()
  @RequirePermissions('tags.read')
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.listUseCase.execute(
      req.user.tenantId,
      includeInactive === 'true',
    );
  }

  @Patch(':id')
  @RequirePermissions('tags.update')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() data: UpdateTagDto,
  ) {
    return this.updateUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data,
    );
  }

  @Delete(':id')
  @RequirePermissions('tags.delete')
  async delete(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    await this.deleteUseCase.execute(req.user.tenantId, req.user.sub, id);
    return { success: true };
  }
}
