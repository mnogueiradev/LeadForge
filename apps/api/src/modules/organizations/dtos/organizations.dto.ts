import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MaxLength,
  IsUUID,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationStatus, CompanySize } from '@prisma/client';

export class OrganizationAddressDto {
  @IsString()
  @MaxLength(255)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(50)
  state: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @IsString()
  @MaxLength(50)
  country: string;
}

export class CreateOrganizationDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  document?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationAddressDto)
  address?: OrganizationAddressDto;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  document?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationAddressDto)
  address?: OrganizationAddressDto;
}

export class ChangeOwnerDto {
  @IsUUID()
  newOwnerId: string;
}
