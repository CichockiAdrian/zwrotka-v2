// src/app/voucher/[id].tsx
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useVoucherStore } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValue, formatValueShort } from '@/utils/voucher';
import { formatDate, formatRelative, daysUntilExpiry } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

export default function VoucherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const voucher = useVoucherStore(s => s.vouchers.find(v => v.id === id));
  const markUsed = useVoucherStore(s => s.markUsed);
  const removeVoucher = useVoucherStore(s => s.removeVoucher);
  const [copied, setCopied] = useState(false);

  if (!voucher) {
    return <View style={styles.center}><Text style={styles.notFound}>Nie znaleziono vouchera.</Text></View>;
  }

  const days = daysUntilExpiry(voucher.expiresAt);
  const isActive = voucher.status === 'active';
  const expiringSoon = isActive && days !== null && days <= 7;

  async function handleCopy() {
    await Clipboard.setStringAsync(voucher!.code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMarkUsed() {
    Alert.alert('Oznacz jako użyty', 'Czy voucher został zrealizowany?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Tak', onPress: async () => { await markUsed(voucher!.id); router.back(); } },
    ]);
  }

  function handleDelete() {
    Alert.alert('Usuń voucher', 'Tej operacji nie można cofnąć.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: async () => { await removeVoucher(voucher!.id); router.back(); } },
    ]);
  }

  function getStatusBadge() {
    if (voucher!.status === 'used') return <View style={[styles.badge, { backgroundColor: Colors.bg.elevated, borderColor: Colors.border.strong }]}><Text style={[styles.badgeText, { color: Colors.text.secondary }]}>Użyty</Text></View>;
    if (voucher!.status === 'expired') return <View style={[styles.badge, { backgroundColor: Colors.status.expiredBg, borderColor: '#4A1A1A' }]}><Text style={[styles.badgeText, { color: Colors.status.expired }]}>Wygasły</Text></View>;
    if (expiringSoon) return <View style={[styles.badge, { backgroundColor: Colors.status.expiringSoonBg, borderColor: '#4A3000' }]}><Text style={[styles.badgeText, { color: Colors.status.expiringSoon }]}>Wygasa wkrótce</Text></View>;
    return <View style={[styles.badge, { backgroundColor: Colors.status.activeBg, borderColor: '#1A4A2E' }]}><View style={styles.activeDot} /><Text style={[styles.badgeText, { color: Colors.status.active }]}>Aktywny</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{
        title: voucher.storeName || voucher.label || 'Voucher',
        headerBackTitle: 'Wstecz',
        headerRight: () => (
          <Pressable onPress={handleDelete} style={styles.headerActionBtn} hitSlop={12}>
            <Ionicons name="trash-outline" size={18} color={Colors.status.expired} />
          </Pressable>
        ),
      }} />
      <View style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Value hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroStore}>{voucher.storeName || 'Voucher'}</Text>
            <Text style={styles.heroValue}>
              {formatValueShort(voucher.valueGrosze)}{' '}
              <Text style={styles.heroUnit}>zł</Text>
            </Text>
            {getStatusBadge()}
            {days !== null && isActive && (
              <Text style={[styles.expiryNote, expiringSoon && { color: Colors.status.expiringSoon }]}>
                {days <= 0 ? 'Wygasa dzisiaj!' : `Ważny jeszcze ${days} dni`}
              </Text>
            )}
          </View>

          {/* Code display */}
          <Pressable
            style={styles.codeCard}
            onPress={() => router.push(`/voucher/${voucher.id}/fullscreen`)}
          >
            <View style={styles.codeVisual}>
              {voucher.codeFormat === 'qr' ? (
                <Ionicons name="qr-code" size={80} color={Colors.text.primary} />
              ) : (
                <View style={styles.barcodeVisual}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <View key={i} style={[styles.bar, {
                      flex: (voucher.code.charCodeAt(i % voucher.code.length) % 3) + 1,
                      opacity: (voucher.code.charCodeAt(i % voucher.code.length) % 2 === 0) ? 1 : 0,
                    }]} />
                  ))}
                </View>
              )}
            </View>
            <Text style={styles.codeText}>{voucher.code}</Text>
            <View style={styles.fullscreenHint}>
              <Ionicons name="expand-outline" size={14} color={Colors.text.tertiary} />
              <Text style={styles.fullscreenHintText}>Dotknij aby powiększyć</Text>
            </View>
          </Pressable>

          {/* Copy button */}
          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? Colors.accent.primary : Colors.text.secondary} />
            <Text style={[styles.copyBtnText, copied && { color: Colors.accent.primary }]}>
              {copied ? 'Skopiowano!' : 'Kopiuj kod'}
            </Text>
          </Pressable>

          {/* Details */}
          <View style={styles.detailCard}>
            {[
              { label: 'Sklep', value: voucher.storeName || '—' },
              { label: 'Format', value: voucher.codeFormat.toUpperCase() },
              { label: 'Wystawiony', value: formatDate(voucher.issuedAt) },
              voucher.expiresAt ? { label: 'Ważny do', value: formatDate(voucher.expiresAt) } : null,
              voucher.usedAt ? { label: 'Użyty', value: formatRelative(voucher.usedAt) } : null,
              { label: 'Dodano', value: formatRelative(voucher.createdAt) },
            ].filter(Boolean).map((row, i, arr) => (
              <View key={row!.label} style={[styles.detailRow, i < arr.length - 1 && styles.detailRowBorder]}>
                <Text style={styles.detailLabel}>{row!.label}</Text>
                <Text style={styles.detailValue}>{row!.value}</Text>
              </View>
            ))}
          </View>

          {voucher.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Notatki</Text>
              <Text style={styles.notesText}>{voucher.notes}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Fixed Footer with Action buttons */}
        {isActive && (
          <View style={styles.fixedFooter}>
            <Pressable
              style={styles.fullscreenBtn}
              onPress={() => router.push(`/voucher/${voucher.id}/fullscreen`)}
            >
              <Ionicons name="expand" size={20} color="#fff" />
              <Text style={styles.fullscreenBtnText}>Pokaż na pełnym ekranie</Text>
            </Pressable>
            <Pressable style={styles.usedBtn} onPress={handleMarkUsed}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.usedBtnText}>Oznacz jako użyty</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.base },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 140 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg.base },
  notFound: { color: Colors.text.secondary, fontSize: Typography.size.base },
  fixedFooter: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: Spacing.base, 
    backgroundColor: Colors.bg.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },

  heroCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  heroStore: { fontSize: Typography.size.base, color: Colors.text.secondary },
  heroValue: { fontSize: Typography.size['4xl'], fontWeight: Typography.weight.extrabold, color: Colors.text.primary, letterSpacing: -1 },
  heroUnit: { fontSize: Typography.size['2xl'] },
  expiryNote: { fontSize: Typography.size.sm, color: Colors.text.secondary },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full, borderWidth: 1 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.active },
  badgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },

  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  codeVisual: { alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  barcodeVisual: { flexDirection: 'row', alignItems: 'stretch', height: 72, width: 280, gap: 0.5 },
  bar: { height: '100%', backgroundColor: Colors.bg.elevated, borderRadius: 0.5 },
  codeText: { fontSize: Typography.size.sm, fontFamily: 'monospace', color: Colors.bg.elevated, letterSpacing: 1 },
  fullscreenHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fullscreenHintText: { fontSize: Typography.size.xs, color: Colors.bg.elevated },

  copyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bg.surface, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.border.default,
  },
  copyBtnText: { fontSize: Typography.size.sm, color: Colors.text.secondary, fontWeight: Typography.weight.medium },

  detailCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.border.default, overflow: 'hidden',
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border.default },
  detailLabel: { fontSize: Typography.size.sm, color: Colors.text.secondary },
  detailValue: { fontSize: Typography.size.sm, color: Colors.text.primary, textAlign: 'right', maxWidth: '60%' },

  notesCard: { backgroundColor: Colors.bg.surface, borderRadius: Radii.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border.default },
  notesLabel: { fontSize: Typography.size.xs, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.xs },
  notesText: { fontSize: Typography.size.base, color: Colors.text.secondary, lineHeight: 22 },
  fullscreenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, backgroundColor: Colors.accent.primary, borderRadius: Radii.lg },
  fullscreenBtnText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: '#fff' },
  usedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, backgroundColor: Colors.bg.surface, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.border.default },
  usedBtnText: { fontSize: Typography.size.base, color: Colors.text.secondary },
});
