import { IsOptional } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  value?: any;
}
