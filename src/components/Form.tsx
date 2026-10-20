import { ReactNode, useState } from 'react';
import { Platform, TextInput, TextInputProps, View } from 'react-native';

import { T } from '@/components/Typography';
import { colors, fonts } from '@/theme';

// Removes the browser focus ring; we draw our own focus border instead.
export const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {};

export function FieldLabel({ children, error, right }: { children: string; error?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
      <T variant="small" weight="medium" color={colors.text}>
        {children}
      </T>
      {error ? (
        <T variant="small" color={colors.danger}>
          {error}
        </T>
      ) : (
        right ?? null
      )}
    </View>
  );
}

export function Input({
  label,
  error,
  multiline,
  labelRight,
  ...props
}: TextInputProps & { label: string; error?: string; labelRight?: ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <FieldLabel error={error} right={labelRight}>
        {label}
      </FieldLabel>
      <TextInput
        {...props}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={colors.faint}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            fontFamily: fonts.body,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: error ? colors.danger : focused ? colors.accent : colors.line,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: multiline ? 150 : 52,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          noOutline,
        ]}
      />
    </View>
  );
}
