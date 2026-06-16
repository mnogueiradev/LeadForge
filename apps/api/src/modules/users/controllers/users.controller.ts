import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserPaginationDto } from '../dtos/user-pagination.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateUserUseCase } from '../usecases/create-user.usecase';
import { UpdateUserUseCase } from '../usecases/update-user.usecase';
import { GetUserUseCase } from '../usecases/get-user.usecase';
import { ListUsersUseCase } from '../usecases/list-users.usecase';
import { DeactivateUserUseCase } from '../usecases/deactivate-user.usecase';
import { ActivateUserUseCase } from '../usecases/activate-user.usecase';
import { UpdateProfileUseCase } from '../usecases/update-profile.usecase';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: any, @Query() query: UserPaginationDto) {
    return this.listUsersUseCase.execute(user.tenantId, query);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.getUserUseCase.execute(user.tenantId, user.sub);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.getUserUseCase.execute(user.tenantId, id);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() data: CreateUserDto) {
    return this.createUserUseCase.execute(user.tenantId, data);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() data: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(user.tenantId, user.sub, data);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(user.tenantId, id, data);
  }

  @Patch(':id/activate')
  async activate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.activateUserUseCase.execute(user.tenantId, id);
  }

  @Patch(':id/deactivate')
  async deactivate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.deactivateUserUseCase.execute(user.tenantId, id);
  }
}
