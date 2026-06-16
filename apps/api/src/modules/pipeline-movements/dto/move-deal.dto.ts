import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { MovementSource } from '@prisma/client';

export class MoveDealDto {
  @IsString()
  @IsNotEmpty()
  toStageId: string;

  @IsEnum(MovementSource)
  @IsOptional()
  source?: MovementSource;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
