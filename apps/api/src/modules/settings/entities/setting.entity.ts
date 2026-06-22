import { Exclude, Expose } from 'class-transformer';

export class SettingEntity {
  @Exclude()
  tenantId: string;

  key: string;

  @Exclude()
  valueJson: any;

  @Expose()
  get value(): any {
    return this.valueJson;
  }

  constructor(partial: Partial<SettingEntity>) {
    Object.assign(this, partial);
  }
}
