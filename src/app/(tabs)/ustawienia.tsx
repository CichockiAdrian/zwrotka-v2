// src/app/(tabs)/ustawienia.tsx
// Identyczny ze screenshotem: sekcje z ikonami w kółkach, toggles

import { ScrollView, StyleSheet, Text, View, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { useVoucherStore } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

type RowIcon = {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
};

type SettingsRowProps = {
  icon?: RowIcon;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
};

function SettingsRow({ icon, label, sublabel, right, onPress, destructive, isLast }: SettingsRowProps) {
  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress && !right}
      android_ripple={{ color: Colors.bg.overlay }}
    >
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={18} color={icon.color} />
        </View>
      )}
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      {right}
      {onPress && !right && (
        <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function UstawieniaScreen() {
  const settings = useSettingsStore(s => s.settings);
  const update = useSettingsStore(s => s.update);

  function makeSwitch(key: 'expiryReminders' | 'autoBrightness' | 'hapticEnabled' | 'keepScreenAwakeOnScan') {
    return (
      <Switch
        value={settings[key]}
        onValueChange={v => update(key, v)}
        trackColor={{ false: Colors.bg.overlay, true: '#166534' }}
        thumbColor={settings[key] ? Colors.accent.primary : Colors.text.tertiary}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Ustawienia</Text>
          <Text style={styles.subtitle}>Dostosuj aplikację do swoich potrzeb</Text>
        </View>

        <Section title="Preferencje">
          <SettingsRow
            icon={{ name: 'notifications-outline', bg: '#1A2D3A', color: '#60A5FA' }}
            label="Przypomnienia o wygasaniu"
            sublabel="Powiadom mnie przed wygaśnięciem voucheru"
            right={makeSwitch('expiryReminders')}
          />
          <SettingsRow
            icon={{ name: 'sunny-outline', bg: '#2D2000', color: '#FBBF24' }}
            label="Automatyczna jasność"
            sublabel="Zwiększ jasność przy pokazywaniu kodu"
            right={makeSwitch('autoBrightness')}
          />
          <SettingsRow
            icon={{ name: 'swap-vertical-outline', bg: '#1A1A2D', color: '#A78BFA' }}
            label="Domyślne sortowanie"
            sublabel="Data wygaśnięcia (od najwcześniejszej)"
            onPress={() => {}}
            isLast
          />
        </Section>

        <Section title="Prywatność i bezpieczeństwo">
          <SettingsRow
            icon={{ name: 'shield-outline', bg: '#1A2D1A', color: '#4ADE80' }}
            label="Polityka prywatności"
            onPress={() => {}}
          />
          <SettingsRow
            icon={{ name: 'trash-outline', bg: '#2D1A1A', color: '#EF4444' }}
            label="Usuń wszystkie dane"
            sublabel="Trwale usuń wszystkie vouchery"
            onPress={() => {
              Alert.alert(
                'Usuń wszystkie dane',
                'Tej operacji nie można cofnąć. Wszystkie vouchery zostaną usunięte.',
                [
                  { text: 'Anuluj', style: 'cancel' },
                  { text: 'Usuń wszystko', style: 'destructive', onPress: () => {} },
                ]
              );
            }}
            destructive
            isLast
          />
        </Section>

        <Section title="Pomoc i wsparcie">
          <SettingsRow
            icon={{ name: 'help-circle-outline', bg: '#1A2D2D', color: '#22D3EE' }}
            label="Centrum pomocy"
            onPress={() => {}}
          />
          <SettingsRow
            icon={{ name: 'information-circle-outline', bg: '#1A1A2D', color: '#818CF8' }}
            label="O aplikacji"
            sublabel="Wersja 1.0.0"
            isLast
          />
        </Section>

        <Text style={styles.footer}>
          Zwrotka © 2026{'\n'}
          Wszystkie vouchery są przechowywane lokalnie
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  content: { paddingBottom: Spacing['4xl'] },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.extrabold, color: Colors.text.primary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.text.secondary, marginTop: 2 },

  section: { marginTop: Spacing.xl, paddingHorizontal: Spacing.base },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionBody: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  rowIcon: {
    width: 36, height: 36,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: Typography.size.base, color: Colors.text.primary, fontWeight: Typography.weight.medium },
  rowLabelDestructive: { color: Colors.status.expired },
  rowSublabel: { fontSize: Typography.size.xs, color: Colors.text.secondary, marginTop: 1 },

  footer: {
    textAlign: 'center',
    fontSize: Typography.size.xs,
    color: Colors.text.tertiary,
    lineHeight: 18,
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
});
