import { useColorScheme } from 'react-native';
import { useThemeStore } from '../core/themeStore';
import { colors } from './colors';

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const { theme, colorBlindMode } = useThemeStore();
  const activeTheme = theme === 'system'
    ? systemColorScheme === 'dark'
      ? 'dark'
      : 'light'
    : theme;

  return {
    activeTheme,
    colors: {
      primary: colorBlindMode === 'off' ? colors.primary : colors.colorBlind.primary,
      secondary: colorBlindMode === 'off' ? colors.secondary : colors.colorBlind.secondary,
      accent: colorBlindMode === 'off' ? colors.accent : colors.colorBlind.accent,
      ...colors[activeTheme],
    },
  };
};
