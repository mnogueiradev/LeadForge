import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadTemperature, LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  contactId: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadTemperature)
  @IsOptional()
  temperature?: LeadTemperature;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  estimatedValue?: number;
}
