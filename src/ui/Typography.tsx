import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppTheme } from './useAppTheme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  color?: string;
  weight?: 'normal' | 'bold' | '600' | '800';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body', 
  color, 
  weight, 
  align,
  style, 
  children, 
  ...props 
}) => {
  const { colors } = useAppTheme();

  const variantStyles = {
    h1: { fontSize: 32, fontWeight: '800' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    body: { fontSize: 16, fontWeight: 'normal' as const },
    caption: { fontSize: 12, fontWeight: 'normal' as const },
  };

  return (
    <Text 
      style={[
        variantStyles[variant],
        { 
          color: color || colors.text, 
          fontWeight: weight || variantStyles[variant].fontWeight,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
