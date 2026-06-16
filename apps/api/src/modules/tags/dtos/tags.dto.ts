import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
  Length,
} from 'class-validator';
import { EntityType } from '@prisma/client';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid HEX code (e.g., #FF0000)',
  })
  color?: string;
}

export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid HEX code (e.g., #FF0000)',
  })
  color?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AssignTagDto {
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @IsString()
  @IsNotEmpty()
  entityType: EntityType;

  @IsString()
  @IsNotEmpty()
  entityId: string;
}
