import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ActivityType, ActivityPriority } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

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

  // Relations
  @IsUUID()
  @IsNotEmpty()
  ownerUserId: string;

  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  contactId?: string;

  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  organizationId?: string;

  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  leadId?: string;

  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  dealId?: string;
}
