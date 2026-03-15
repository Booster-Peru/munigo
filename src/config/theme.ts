export const palette = {
  primary: '#135bec',
  background: '#0a0a0b',
  surface: '#121214',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  border: '#27272a',
  accent: '#3b82f6',
  error: '#ef4444',
  success: '#10b981',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const theme = {
  colors: palette,
  shadows,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 56,
  },
  roundness: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
  },
};
