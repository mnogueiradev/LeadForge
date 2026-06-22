import { IsOptional, IsString } from 'class-validator';

export class QuerySettingsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
