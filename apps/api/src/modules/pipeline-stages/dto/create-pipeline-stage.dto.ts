import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  Matches,
  Length,
} from 'class-validator';

export class CreatePipelineStageDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex code (e.g., #FF0000)',
  })
  color?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsBoolean()
  @IsOptional()
  isInitialStage?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinalStage?: boolean;

  @IsBoolean()
  @IsOptional()
  isWonStage?: boolean;

  @IsBoolean()
  @IsOptional()
  isLostStage?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
