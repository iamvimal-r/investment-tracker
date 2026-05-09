export const Colors = {
  background: '#0A0E1A',
  surface: '#111827',
  card: '#1A2235',
  cardBorder: 'rgba(108, 99, 255, 0.15)',
  cardBorderLight: 'rgba(255,255,255,0.07)',

  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A44CC',
  accent: '#00D4AA',
  accentLight: '#00F5C4',
  accentDark: '#00A882',

  danger: '#FF4D6A',
  dangerLight: '#FF6B82',
  warning: '#FFB547',
  warningLight: '#FFC96B',
  success: '#00D4AA',

  gold: '#FFD700',
  crypto: '#F7931A',
  stock: '#6C63FF',
  mf: '#00D4AA',
  fd: '#FF9500',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.38)',
  textDisabled: 'rgba(255,255,255,0.25)',

  white: '#FFFFFF',
  black: '#000000',

  // Gradient arrays
  gradientPrimary: ['#6C63FF', '#4A44CC'] as [string, string],
  gradientAccent: ['#00D4AA', '#00A882'] as [string, string],
  gradientDanger: ['#FF4D6A', '#CC3655'] as [string, string],
  gradientGold: ['#FFD700', '#FFA500'] as [string, string],
  gradientCard: ['rgba(26,34,53,0.95)', 'rgba(17,24,39,0.98)'] as [string, string],
  gradientBackground: ['#0A0E1A', '#111827'] as [string, string],
  gradientHero: ['#0A0E1A', '#1A0E3A', '#0A1A2E'] as [string, string, string],

  assetColors: {
    stock: '#6C63FF',
    crypto: '#F7931A',
    mutual_fund: '#00D4AA',
    gold: '#FFD700',
    fd: '#FF9500',
    nps: '#E91E8C',       // Vibrant pink (NPS government scheme)
    pf: '#2196F3',        // Blue (provident fund)
    lic: '#4CAF50',       // Green (LIC brand)
    post_life: '#FF5722', // Deep orange (Post Office brand)
    tata_aia: '#9C27B0',  // Purple (TATA AIA brand)
  } as Record<string, string>,
};
