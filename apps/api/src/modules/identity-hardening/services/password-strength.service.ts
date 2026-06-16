import { Injectable } from '@nestjs/common';

export enum PasswordStrength {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG',
}

@Injectable()
export class PasswordStrengthService {
  /**
   * Avalia a força da senha baseada em entropia e critérios estruturais.
   */
  evaluate(password: string): {
    strength: PasswordStrength;
    score: number;
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    if (!password || password.length < 8) {
      return {
        strength: PasswordStrength.WEAK,
        score: 0,
        feedback: ['Senha muito curta.'],
      };
    }

    // Comprimento
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 15;

    // Complexidade
    if (/[a-z]/.test(password)) score += 10;
    else feedback.push('Adicione letras minúsculas.');

    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push('Adicione letras maiúsculas.');

    if (/[0-9]/.test(password)) score += 10;
    else feedback.push('Adicione números.');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push('Adicione caracteres especiais.');

    // Variedade de caracteres (Entropia simples)
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 5) score += 5;
    if (uniqueChars > 10) score += 10;

    let strength = PasswordStrength.WEAK;
    if (score >= 80) {
      strength = PasswordStrength.VERY_STRONG;
    } else if (score >= 60) {
      strength = PasswordStrength.STRONG;
    } else if (score >= 40) {
      strength = PasswordStrength.MEDIUM;
    }

    return { strength, score, feedback };
  }
}
