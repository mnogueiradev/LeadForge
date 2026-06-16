import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsNumber,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EntityType, CustomFieldType } from '@prisma/client';

export class CustomFieldOptionDto {
  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class CustomFieldValidationDto {
  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsString()
  regex?: string;
}

export class CreateCustomFieldDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CustomFieldType)
  fieldType: CustomFieldType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldOptionDto)
  options?: CustomFieldOptionDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomFieldValidationDto)
  validation?: CustomFieldValidationDto;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldOptionDto)
  options?: CustomFieldOptionDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomFieldValidationDto)
  validation?: CustomFieldValidationDto;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class SetCustomFieldValueDto {
  @IsString()
  slug: string;

  value: any;
}

export class SetEntityCustomFieldsDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  entityId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetCustomFieldValueDto)
  fields: SetCustomFieldValueDto[];
}
