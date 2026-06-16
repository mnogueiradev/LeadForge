export interface IPermissionRepository {
  findAll(): Promise<any[]>;
  findByNames(names: string[]): Promise<any[]>;
}

export const IPermissionRepository = Symbol('IPermissionRepository');
