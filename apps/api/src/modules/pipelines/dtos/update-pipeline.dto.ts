import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdatePipelineDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
