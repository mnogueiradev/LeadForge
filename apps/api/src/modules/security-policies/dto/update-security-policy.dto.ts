import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PasswordPolicyDto {
  @IsOptional() @IsNumber() minLength?: number;
  @IsOptional() @IsBoolean() requireUppercase?: boolean;
  @IsOptional() @IsBoolean() requireLowercase?: boolean;
  @IsOptional() @IsBoolean() requireNumbers?: boolean;
  @IsOptional() @IsBoolean() requireSpecialChars?: boolean;
  @IsOptional() @IsBoolean() preventCommonPasswords?: boolean;
  @IsOptional() @IsNumber() passwordHistoryCount?: number;
  @IsOptional() @IsNumber() expirationDays?: number;
}

class SessionPolicyDto {
  @IsOptional() @IsNumber() maxConcurrentSessions?: number;
  @IsOptional() @IsNumber() idleTimeoutMinutes?: number;
  @IsOptional() @IsNumber() absoluteTimeoutHours?: number;
  @IsOptional() @IsBoolean() allowGlobalLogout?: boolean;
}

class AuthenticationPolicyDto {
  @IsOptional() @IsBoolean() mfaRequired?: boolean;
  @IsOptional() @IsBoolean() allowEmailLogin?: boolean;
  @IsOptional() @IsBoolean() allowUsernameLogin?: boolean;
}

class AccessPolicyDto {
  @IsOptional() @IsArray() @IsString({ each: true }) allowedDomains?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) blockedDomains?: string[];
}

class InvitationPolicyDto {
  @IsOptional() @IsNumber() invitationExpirationHours?: number;
  @IsOptional() @IsBoolean() requireManualApproval?: boolean;
}

class AuditPolicyDto {
  @IsOptional() @IsNumber() logRetentionDays?: number;
  @IsOptional() @IsBoolean() allowExport?: boolean;
}

export class UpdateSecurityPolicyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy?: PasswordPolicyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SessionPolicyDto)
  sessionPolicy?: SessionPolicyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AuthenticationPolicyDto)
  authenticationPolicy?: AuthenticationPolicyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessPolicyDto)
  accessPolicy?: AccessPolicyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvitationPolicyDto)
  invitationPolicy?: InvitationPolicyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AuditPolicyDto)
  auditPolicy?: AuditPolicyDto;
}
