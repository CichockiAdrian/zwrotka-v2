// src/theme/tokens.ts
// Design tokens odwzorowane z screenshotów

export const Colors = {
  bg: {
    base: '#0D1117',        // główne tło - bardzo ciemne granatowe
    surface: '#161B22',     // karty, listy
    elevated: '#21262D',    // inputy, chipy
    overlay: '#30363D',     // dividers, borders
    card: '#1C2128',        // karty voucherów
  },

  // Główny akcent - zielony jak na screenshotach
  accent: {
    primary: '#2ECC71',     // główny zielony przycisk, aktywne elementy
    light: '#27AE60',       // hover/pressed
    muted: '#0D2818',       // tło z akcentem
    glow: 'rgba(46,204,113,0.15)',
  },

  // Statusy
  status: {
    active: '#2ECC71',
    activeBg: '#0D2818',
    expiringSoon: '#F59E0B',
    expiringSoonBg: '#2D1F00',
    expired: '#EF4444',
    expiredBg: '#2D0A0A',
    used: '#6B7280',
    usedBg: '#1F2937',
  },

  // Tekst
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#484F58',
    inverse: '#0D1117',
    accent: '#2ECC71',
  },

  // Obramowania
  border: {
    default: '#21262D',
    strong: '#30363D',
    accent: '#2ECC71',
  },

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Kolory kart statystyk (ze screenshotu)
  stats: {
    green: { bg: '#0D2818', border: '#1A4A2E' },
    blue: { bg: '#0D1A2D', border: '#1A3050' },
    purple: { bg: '#1A0D2D', border: '#331A50' },
    orange: { bg: '#2D1500', border: '#4A2A00' },
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export const Typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;
