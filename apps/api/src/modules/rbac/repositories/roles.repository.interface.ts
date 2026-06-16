export interface IRoleRepository {
  findById(tenantId: string, id: string): Promise<any | null>;
  findByName(tenantId: string, name: string): Promise<any | null>;
  findAll(tenantId: string): Promise<any[]>;
  create(tenantId: string, data: any): Promise<any>;
  update(tenantId: string, id: string, data: any): Promise<any>;
  delete(tenantId: string, id: string): Promise<boolean>;

  assignPermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<void>;
  removePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<void>;

  assignRoleToUser(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void>;
  removeRoleFromUser(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void>;

  getUserEffectivePermissions(
    tenantId: string,
    userId: string,
  ): Promise<string[]>;
}

export const IRoleRepository = Symbol('IRoleRepository');
