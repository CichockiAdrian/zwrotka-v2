// src/app/(tabs)/historia.tsx
// Identyczny ze screenshotem: tytuł "Historia", filter chips (Wszystkie/Aktywne/Użyte/Wygasłe)
// Lista kart z kolorowymi wartościami, badges statusów

import { StyleSheet, Text, View, FlatList, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoucherStore, useFilteredVouchers } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValueShort } from '@/utils/voucher';
import { formatDate, daysUntilExpiry } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import type { VoucherStatus } from '@/types/voucher';

const FILTERS: { label: string; value: VoucherStatus | 'all' }[] = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Aktywne', value: 'active' },
  { label: 'Użyte', value: 'used' },
  { label: 'Wygasłe', value: 'expired' },
];

function VoucherListItem({ id, storeName, code, valueGrosze, expiresAt, status, codeFormat }: {
  id: string; storeName: string; code: string;
  valueGrosze: number; expiresAt: string | null;
  status: VoucherStatus; codeFormat: string;
}) {
  const days = daysUntilExpiry(expiresAt);
  const expiringSoon = days !== null && days <= 7 && status === 'active';

  function getStatusBadge() {
    if (status === 'used') return (
      <View style={[styles.badge, styles.badgeUsed]}>
        <Ionicons name="checkmark-circle-outline" size={12} color="#9CA3AF" />
        <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>Wykorzystany</Text>
      </View>
    );
    if (status === 'expired') return (
      <View style={[styles.badge, styles.badgeExpired]}>
        <Ionicons name="close-circle-outline" size={12} color={Colors.status.expired} />
        <Text style={[styles.badgeText, { color: Colors.status.expired }]}>Wygasł</Text>
      </View>
    );
    if (expiringSoon) return (
      <View style={[styles.badge, styles.badgeWarn]}>
        <Ionicons name="warning-outline" size={12} color={Colors.status.expiringSoon} />
        <Text style={[styles.badgeText, { color: Colors.status.expiringSoon }]}>Wygasa wkrótce</Text>
      </View>
    );
    return (
      <View style={[styles.badge, styles.badgeActive]}>
        <View style={styles.activeDot} />
        <Text style={[styles.badgeText, { color: Colors.status.active }]}>Aktywny</Text>
      </View>
    );
  }

  function getExpiryText() {
    if (!expiresAt) return null;
    if (status === 'expired') return `Wygasa za ${days} dni`;
    if (days !== null && days <= 1) return days === 0 ? 'Wygasa dzisiaj!' : 'Wygasa jutro';
    return formatDate(expiresAt);
  }

  const valueColor = status === 'active'
    ? Colors.accent.primary
    : status === 'expired' ? Colors.status.expired
    : Colors.text.secondary;

  return (
    <Pressable
      style={styles.listItem}
      onPress={() => router.push(`/voucher/${id}`)}
      android_ripple={{ color: Colors.bg.overlay }}
    >
      <View style={styles.listItemHeader}>
        <View style={styles.storeIcon}>
          <Ionicons name="storefront-outline" size={18} color={Colors.text.secondary} />
        </View>
        <Text style={styles.storeName} numberOfLines={1}>{storeName}</Text>
        <View style={{ flex: 1 }} />
        {getStatusBadge()}
        <Ionicons name="chevron-forward" size={14} color={Colors.text.tertiary} style={{ marginLeft: 4 }} />
      </View>

      <Text style={styles.code} numberOfLines={1}>
        {codeFormat === 'qr' ? '⠿⠿ ' : '⠸⠸⠸ '}{code.slice(0, 22)}
      </Text>

      <Text style={[styles.value, { color: valueColor }]}>
        {formatValueShort(valueGrosze)} zł
      </Text>

      {expiresAt && (
        <View style={styles.expiryRow}>
          <Ionicons name="time-outline" size={12} color={Colors.text.tertiary} />
          <Text style={styles.expiryText}>{getExpiryText()}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function HistoriaScreen() {
  const filters = useVoucherStore(s => s.filters);
  const setFilters = useVoucherStore(s => s.setFilters);
  const vouchers = useFilteredVouchers();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historia</Text>
        <Text style={styles.subtitle}>Wszystkie twoje vouchery</Text>
      </View>

      {/* Filter chips */}
      <View style={{ flexGrow: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <Ionicons name="filter" size={18} color={Colors.text.secondary} style={{ marginRight: 4 }} />
          {FILTERS.map(f => (
            <Pressable
              key={f.value}
              style={[styles.chip, f.value === filters.status && styles.chipActive]}
              onPress={() => setFilters({ status: f.value })}
            >
              <Text style={[styles.chipText, f.value === filters.status && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={vouchers}
        style={{ flex: 1 }}
        keyExtractor={v => v.id}
        renderItem={({ item }) => (
          <VoucherListItem
            id={item.id}
            storeName={item.storeName || item.label}
            code={item.code}
            valueGrosze={item.valueGrosze}
            expiresAt={item.expiresAt}
            status={item.status}
            codeFormat={item.codeFormat}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={40} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Brak voucherów</Text>
            <Text style={styles.emptyText}>Dodaj pierwszy voucher skanując paragon.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.extrabold, color: Colors.text.primary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.text.secondary, marginTop: 2 },

  filtersRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.default,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  chipText: { 
    fontSize: Typography.size.sm, 
    color: Colors.text.secondary, 
    fontWeight: Typography.weight.medium,
    lineHeight: 18,
  },
  chipTextActive: { color: '#fff', fontWeight: Typography.weight.bold },

  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['4xl'] },

  listItem: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  listItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  storeIcon: {
    width: 32, height: 32,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  storeName: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radii.full, borderWidth: 1,
  },
  badgeActive: { backgroundColor: Colors.status.activeBg, borderColor: '#1A4A2E' },
  badgeWarn: { backgroundColor: Colors.status.expiringSoonBg, borderColor: '#4A3000' },
  badgeExpired: { backgroundColor: Colors.status.expiredBg, borderColor: '#4A1A1A' },
  badgeUsed: { backgroundColor: Colors.bg.elevated, borderColor: Colors.border.strong },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.active },
  badgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },

  code: { fontSize: Typography.size.xs, color: Colors.text.tertiary, fontFamily: 'monospace', marginBottom: Spacing.xs },
  value: { fontSize: Typography.size.lg, fontWeight: Typography.weight.extrabold, marginBottom: Spacing.xs },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryText: { fontSize: Typography.size.xs, color: Colors.text.secondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing['4xl'] },
  emptyTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  emptyText: { fontSize: Typography.size.sm, color: Colors.text.secondary, textAlign: 'center' },
});
