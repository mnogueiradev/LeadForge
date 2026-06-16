export class DataMasker {
  private static readonly SENSITIVE_KEYS = [
    'password',
    'passwordHash',
    'token',
    'secret',
    'hash',
    'apikey',
    'api_key',
    'credentials',
    'credential',
    'cvv',
    'creditcard',
  ];

  /**
   * Recursively masks sensitive data in objects and arrays.
   * @param data - The data to mask (object, array, or primitive)
   * @returns A new object/array with sensitive values replaced with '[REDACTED]'
   */
  static mask<T>(data: T): T {
    // Handle null and undefined
    if (data === null || data === undefined) {
      return data;
    }

    // Handle primitives - return as-is
    if (typeof data !== 'object') {
      return data;
    }

    // Handle Arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.mask(item)) as T;
    }

    // Handle Objects
    const maskedData = { ...data } as Record<string, unknown>;
    const keys = Object.keys(maskedData);

    for (const key of keys) {
      const value = maskedData[key];

      if (this.isSensitiveKey(key)) {
        // Mask sensitive values
        maskedData[key] = '[REDACTED]';
      } else if (this.isObject(value)) {
        // Recursively mask nested objects
        maskedData[key] = this.mask(value);
      }
    }

    return maskedData as T;
  }

  /**
   * Type guard to check if a value is a non-null object
   */
  private static isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
  }

  /**
   * Checks if a key represents a sensitive field that should be masked
   */
  private static isSensitiveKey(key: string): boolean {
    const normalizedKey = key.toLowerCase();
    return this.SENSITIVE_KEYS.some((sensitiveKey) =>
      normalizedKey.includes(sensitiveKey),
    );
  }
}
