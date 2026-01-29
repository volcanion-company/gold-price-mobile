import React from 'react';
import { View, Text } from 'react-native';
import { useThemeContext } from '../../contexts';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  footer?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  footer,
}) => {
  const { colors } = useThemeContext();

  return (
    <View className="mb-6">
      {/* Section Title */}
      {title && (
        <Text 
          className="text-xs font-medium uppercase tracking-wider px-4 mb-2"
          style={{ color: colors.textSecondary }}
        >
          {title}
        </Text>
      )}

      {/* Section Content */}
      <View 
        className="rounded-2xl overflow-hidden mx-4 shadow-sm"
        style={{ backgroundColor: colors.card }}
      >
        {React.Children.map(children, (child, index) => (
          <>
            {index > 0 && <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />}
            {child}
          </>
        ))}
      </View>

      {/* Section Footer */}
      {footer && (
        <Text 
          className="text-xs px-4 mt-2"
          style={{ color: colors.textSecondary }}
        >
          {footer}
        </Text>
      )}
    </View>
  );
};
