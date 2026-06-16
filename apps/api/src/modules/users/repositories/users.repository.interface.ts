import { User } from '@prisma/client';

export interface IUserRepository {
  findById(tenantId: string, id: string): Promise<User | null>;
  findByEmail(tenantId: string, email: string): Promise<User | null>;
  findAll(
    tenantId: string,
    params: {
      page: number;
      limit: number;
      sort: string;
      direction: 'asc' | 'desc';
      search?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: User[]; total: number }>;
  create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User>;
  update(tenantId: string, id: string, data: Partial<User>): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
