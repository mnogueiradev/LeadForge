/**
 * JWT Payload interface for type safety
 */
export interface JwtPayload {
  sub: string; // User ID (standard JWT claim)
  id?: string; // Alias for sub (backward compatibility)
  email: string;
  tenantId: string;
  jti: string; // JWT ID (session ID)
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
  type?: 'access' | 'refresh';
  familyId?: string;
}

/**
 * User object returned from validation (without password hash)
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tokens response from login/refresh
 */
export interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Decoded JWT payload with required refresh token fields
 */
export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
  familyId: string;
}

