export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  passwordHistoryCount: number;
  expirationDays: number;
}

export interface SessionPolicy {
  maxConcurrentSessions: number;
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
  allowGlobalLogout: boolean;
}

export interface AuthenticationPolicy {
  mfaRequired: boolean;
  allowEmailLogin: boolean;
  allowUsernameLogin: boolean;
}

export interface AccessPolicy {
  allowedDomains: string[];
  blockedDomains: string[];
}

export interface InvitationPolicy {
  invitationExpirationHours: number;
  requireManualApproval: boolean;
}

export interface AuditPolicy {
  logRetentionDays: number;
  allowExport: boolean;
}

export interface TenantSecurityPolicyData {
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  authenticationPolicy: AuthenticationPolicy;
  accessPolicy: AccessPolicy;
  invitationPolicy: InvitationPolicy;
  auditPolicy: AuditPolicy;
}

export const DEFAULT_SECURITY_POLICY: TenantSecurityPolicyData = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
    preventCommonPasswords: true,
    passwordHistoryCount: 0,
    expirationDays: 0,
  },
  sessionPolicy: {
    maxConcurrentSessions: 3,
    idleTimeoutMinutes: 60,
    absoluteTimeoutHours: 24,
    allowGlobalLogout: true,
  },
  authenticationPolicy: {
    mfaRequired: false,
    allowEmailLogin: true,
    allowUsernameLogin: false,
  },
  accessPolicy: {
    allowedDomains: [],
    blockedDomains: [],
  },
  invitationPolicy: {
    invitationExpirationHours: 72,
    requireManualApproval: false,
  },
  auditPolicy: {
    logRetentionDays: 90,
    allowExport: true,
  },
};
