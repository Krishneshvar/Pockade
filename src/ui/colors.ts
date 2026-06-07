export type ThemeType = 'light' | 'dark' | 'system';

export const colors = {
  primary: '#6366F1', // Electric Indigo
  secondary: '#10B981', // Mint Burst
  accent: '#F59E0B', // Mango Tango
  colorBlind: {
    primary: '#2563EB',
    secondary: '#059669',
    accent: '#D97706',
  },
  light: {
    background: '#F8FAFC', // Cloud White
    surface: '#E2E8F0', // Layer Gray (Light)
    text: '#0F172A', // Midnight Slate for contrast
    textSecondary: '#64748B', 
  },
  dark: {
    background: '#0F172A', // Midnight Slate
    surface: '#1E293B', // Layer Gray (Dark)
    text: '#F8FAFC', // Cloud White for contrast
    textSecondary: '#94A3B8',
  }
};
