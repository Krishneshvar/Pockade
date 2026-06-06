import { useColorScheme } from 'react-native';
import { useThemeStore } from '../core/themeStore';
import { colors } from './colors';

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();

  const activeTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  
  return {
    activeTheme,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      ...colors[activeTheme],
    }
  };
};
