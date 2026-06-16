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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import {
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  GetOrganizationUseCase,
  ListOrganizationsUseCase,
  ArchiveOrganizationUseCase,
  DeleteOrganizationUseCase,
  ChangeOrganizationOwnerUseCase,
} from '../usecases';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  ChangeOwnerDto,
} from '../dtos/organizations.dto';
import { OrganizationStatus, CompanySize } from '@prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly archiveOrganizationUseCase: ArchiveOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly changeOwnerUseCase: ChangeOrganizationOwnerUseCase,
  ) {}

  @Post()
  @RequirePermissions('organizations.create')
  async create(@Req() req: any, @Body() data: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      data,
    );
  }

  @Get()
  @RequirePermissions('organizations.read')
  async list(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: OrganizationStatus,
    @Query('industry') industry?: string,
    @Query('companySize') companySize?: CompanySize,
    @Query('ownerUserId') ownerUserId?: string,
  ) {
    return this.listOrganizationsUseCase.execute({
      tenantId: req.user.tenantId,
      page,
      limit: limit > 100 ? 100 : limit,
      search,
      status,
      industry,
      companySize,
      ownerUserId,
    });
  }

  @Get(':id')
  @RequirePermissions('organizations.read')
  async get(@Req() req: any, @Param('id') id: string) {
    return this.getOrganizationUseCase.execute(req.user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('organizations.update')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateOrganizationDto,
  ) {
    return this.updateOrganizationUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
      data,
    );
  }

  @Patch(':id/owner')
  @RequirePermissions('organizations.assign_owner')
  async changeOwner(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: ChangeOwnerDto,
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
  @RequirePermissions('organizations.update')
  async archive(@Req() req: any, @Param('id') id: string) {
    await this.archiveOrganizationUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
    );
    return { success: true };
  }

  @Delete(':id')
  @RequirePermissions('organizations.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.deleteOrganizationUseCase.execute(
      req.user.tenantId,
      req.user.sub,
      id,
    );
    return { success: true };
  }
}
