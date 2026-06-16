/**
 * MFA Readiness - Preparação Arquitetural para Phase 2
 */

export enum MFAType {
  TOTP = 'TOTP', // Authenticator App (Google, Authy)
  WEBAUTHN = 'WEBAUTHN', // Passkeys (FaceID, TouchID, YubiKey)
  SMS = 'SMS', // SMS (Depreciado/Baixa Segurança)
  BACKUP = 'BACKUP', // Recovery Codes
}

export enum IdentityAssuranceLevel {
  IAL1 = 'IAL1', // Self-asserted (Email/Password)
  IAL2 = 'IAL2', // Identity Proofed (Document Verification)
  IAL3 = 'IAL3', // Strongly Proofed (In-person / Biometric bind)
}

export interface MFAConfiguration {
  id: string;
  userId: string;
  type: MFAType;
  secret?: string; // Encrypted TOTP secret
  publicKeyCredentialId?: string; // WebAuthn Credential ID
  transports?: string[]; // WebAuthn Transports
  isDefault: boolean;
  isEnabled: boolean;
  createdAt: Date;
}

export interface DeviceTrustLevel {
  deviceId: string;
  isTrusted: boolean;
  isKnown: boolean;
  lastVerifiedAt: Date;
}
