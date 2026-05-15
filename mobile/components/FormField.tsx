import { T } from '@/constants/theme';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  badge,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  badge?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
        {badge && <Text style={styles.fieldBadge}> · {badge}</Text>}
      </View>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.textFaint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { gap: 8 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'baseline' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textFaint,
    letterSpacing: 0.8,
  },
  fieldBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: T.textFaint,
    letterSpacing: 0.5,
  },
  fieldInput: {
    height: 52,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 16,
    fontSize: 15,
    color: T.text,
  },
});
