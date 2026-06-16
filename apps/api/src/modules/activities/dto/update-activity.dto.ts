import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ActivityType, ActivityPriority } from '@prisma/client';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @IsEnum(ActivityPriority)
  @IsOptional()
  priority?: ActivityPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
