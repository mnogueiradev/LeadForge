export function hexToHsl(hex: string): string {
  // Remove hash se existir
  hex = hex.replace(/^#/, '');

  // Converte 3 dígitos para 6 dígitos
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Parse r, g, b
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Retorna formato exigido pelo Tailwind/Shadcn: "H S% L%"
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

/**
 * Retorna a cor de texto ideal (clara ou escura) dependendo da cor de fundo em Hex.
 * Para HSL Shadcn: Retorna "240 5.9% 10%" para fundo claro e "0 0% 98%" para fundo escuro.
 */
export function getContrastHslForHex(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Fórmula YIQ para contraste
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Se for maior que 128, a cor é clara, então a fonte deve ser escura (preta/cinza escuro).
  // Se for menor, a cor é escura, a fonte deve ser clara (branca).
  return yiq >= 128 ? "240 5.9% 10%" : "0 0% 98%";
}
