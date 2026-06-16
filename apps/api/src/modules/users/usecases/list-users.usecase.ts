import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../repositories/users.repository.interface';
import { UserPaginationDto } from '../dtos/user-pagination.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
  ) {}

  async execute(tenantId: string, params: UserPaginationDto) {
    const { data, total } = await this.userRepository.findAll(tenantId, {
      page: params.page || 1,
      limit: params.limit || 10,
      sort: params.sort || 'createdAt',
      direction: params.direction || 'desc',
      search: params.search,
      isActive: params.isActive,
    });

    const sanitizedData = data.map((user) => {
      const { passwordHash, ...result } = user;
      return result;
    });

    return {
      data: sanitizedData,
      meta: {
        total,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(total / (params.limit || 10)),
      },
    };
  }
}
