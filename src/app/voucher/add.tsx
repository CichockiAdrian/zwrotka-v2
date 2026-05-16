// src/app/voucher/add.tsx
import { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TextInput,
  Pressable, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVoucherStore } from '@/store/voucherStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { parsePLNToGrosze, generateDefaultLabel } from '@/utils/voucher';
import { Ionicons } from '@expo/vector-icons';
import type { CodeFormat } from '@/types/voucher';

type AddParams = { code?: string; format?: CodeFormat };

export default function AddVoucherScreen() {
  const params = useLocalSearchParams<AddParams>();
  const addVoucher = useVoucherStore(s => s.addVoucher);
  const hapticEnabled = useSettingsStore(s => s.settings.hapticEnabled);

  const [code, setCode] = useState(params.code ?? '');
  const [valueInput, setValueInput] = useState('');
  const [storeName, setStoreName] = useState('');
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!code.trim()) e.code = 'Kod jest wymagany.';
    if (!valueInput.trim()) e.value = 'Wartość jest wymagana.';
    else if (parsePLNToGrosze(valueInput) === null) e.value = 'Podaj poprawną wartość, np. 2.50';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const grosze = parsePLNToGrosze(valueInput)!;
      const effectiveLabel = label.trim() || generateDefaultLabel(storeName);
      const voucher = await addVoucher({
        code: code.trim(),
        codeFormat: params.format ?? 'unknown',
        valueGrosze: grosze,
        label: effectiveLabel,
        storeName: storeName.trim(),
        expiresAt: expiresAt.trim() ? new Date(expiresAt.trim()).toISOString() : null,
        notes: notes.trim(),
        source: params.code ? 'scan' : 'manual',
      });
      if (hapticEnabled) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/voucher/${voucher.id}`);
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać vouchera.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg.base }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Scanned code preview */}
        {params.code && (
          <View style={styles.scannedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accent.primary} />
            <Text style={styles.scannedText}>Kod zeskanowany pomyślnie</Text>
          </View>
        )}

        <Field label="Kod vouchera *" error={errors.code}>
          <TextInput
            style={[styles.input, errors.code ? styles.inputError : undefined]}
            value={code}
            onChangeText={setCode}
            placeholder="np. BIEDRONKA2024050801"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={!params.code}
          />
        </Field>

        <Field label="Wartość (PLN) *" error={errors.value}>
          <View style={styles.valueRow}>
            <TextInput
              style={[styles.input, styles.valueInput, errors.value ? styles.inputError : undefined]}
              value={valueInput}
              onChangeText={setValueInput}
              placeholder="0.00"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="decimal-pad"
              autoFocus={!!params.code}
            />
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>zł</Text>
            </View>
          </View>
        </Field>

        <Field label="Sklep / automat">
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="np. Biedronka, Lidl..."
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Nazwa (opcjonalnie)">
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder={generateDefaultLabel(storeName)}
            placeholderTextColor={Colors.text.tertiary}
          />
        </Field>

        <Field label="Data ważności (opcjonalnie)">
          <TextInput
            style={styles.input}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="numbers-and-punctuation"
          />
        </Field>

        <Field label="Notatki (opcjonalnie)">
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Dodatkowe informacje..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          android_ripple={{ color: Colors.accent.light }}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz voucher'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.base,
  },
  scannedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.muted,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#1A4A2E',
  },
  scannedText: {
    fontSize: Typography.size.sm,
    color: Colors.accent.primary,
    fontWeight: Typography.weight.medium,
  },
  field: { gap: Spacing.xs },
  fieldLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
  },
  fieldError: {
    fontSize: Typography.size.xs,
    color: Colors.status.expired,
  },
  input: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  inputError: { borderColor: Colors.status.expired },
  inputMultiline: { minHeight: 80, paddingTop: Spacing.md },
  valueRow: { flexDirection: 'row', gap: Spacing.sm },
  valueInput: { flex: 1 },
  currencyBadge: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  currencyText: {
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    fontWeight: Typography.weight.medium,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.primary,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: '#fff',
  },
});
