// src/app/(tabs)/index.tsx
// Home screen — identyczny ze screenshotem:
// - "Zwrotka / Twoje vouchery w jednym miejscu"
// - Karta z "Dostępne środki" + wielka kwota + "X aktywnych voucherów"
// - "Ten miesiąc +XX zł" i "Wykorzystane X zł"
// - Duże zielone "Skanuj voucher" + "Dodaj ręcznie"
// - Pomarańczowy banner "1 voucher wygasa wkrótce"
// - "Aktywne vouchery" z listą kart

import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoucherStore, useExpiringVouchers } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValue, formatValueShort } from '@/utils/voucher';
import { formatDate, daysUntilExpiry } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

function VoucherCard({ id, storeName, code, valueGrosze, expiresAt, status, codeFormat }: {
  id: string; storeName: string; code: string;
  valueGrosze: number; expiresAt: string | null;
  status: string; codeFormat: string;
}) {
  const days = daysUntilExpiry(expiresAt);
  const expiringSoon = days !== null && days <= 7 && status === 'active';

  return (
    <Pressable
      style={styles.voucherCard}
      onPress={() => router.push(`/voucher/${id}`)}
      android_ripple={{ color: Colors.bg.overlay }}
    >
      {/* Status badge */}
      <View style={styles.voucherCardHeader}>
        <View style={styles.storeIcon}>
          <Ionicons name="storefront-outline" size={20} color={Colors.text.secondary} />
        </View>
        <Text style={styles.voucherStoreName} numberOfLines={1}>{storeName}</Text>
        <View style={styles.spacer} />
        {expiringSoon ? (
          <View style={styles.badgeWarn}>
            <Ionicons name="warning-outline" size={12} color={Colors.status.expiringSoon} />
            <Text style={styles.badgeWarnText}>Wygasa wkrótce</Text>
          </View>
        ) : (
          <View style={styles.badgeActive}>
            <View style={styles.badgeActiveDot} />
            <Text style={styles.badgeActiveText}>Aktywny</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} style={{ marginLeft: 4 }} />
      </View>

      {/* Code */}
      <Text style={styles.voucherCode} numberOfLines={1}>
        {codeFormat === 'qr' ? '⠿⠿ ' : '⠸⠸⠸ '}{code.slice(0, 20)}
      </Text>

      {/* Value */}
      <Text style={styles.voucherValue}>{formatValueShort(valueGrosze)} zł</Text>

      {/* Expiry */}
      <View style={styles.voucherFooter}>
        <Ionicons name="time-outline" size={13} color={expiringSoon ? Colors.status.expiringSoon : Colors.text.secondary} />
        <Text style={[styles.voucherExpiry, expiringSoon && styles.voucherExpirySoon]}>
          {expiresAt
            ? days !== null && days <= 1
              ? days === 0 ? 'Wygasa dzisiaj!' : 'Wygasa jutro'
              : `Wygasa ${formatDate(expiresAt)}`
            : 'Bez terminu'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const stats = useVoucherStore(s => s.stats);
  const vouchers = useVoucherStore(s => s.vouchers);
  const expiringVouchers = useExpiringVouchers();

  const activeVouchers = vouchers.filter(v => v.status === 'active');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── App header ───────────────────────── */}
        <View style={styles.appHeader}>
          <Text style={styles.appTitle}>Zwrotka</Text>
          <Text style={styles.appSubtitle}>Twoje vouchery w jednym miejscu</Text>
        </View>

        {/* ── Balance card ─────────────────────── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <Ionicons name="wallet-outline" size={20} color={Colors.accent.primary} />
            <Text style={styles.balanceCardLabel}>Dostępne środki</Text>
          </View>

          <Text style={styles.balanceAmount}>
            {formatValueShort(stats.totalActiveGrosze)}{' '}
            <Text style={styles.balanceAmountUnit}>zł</Text>
          </Text>

          <Pressable onPress={() => router.push('/(tabs)/historia')}>
            <Text style={styles.activeCount}>
              ↗ {stats.activeCount} aktywnych voucherów
            </Text>
          </Pressable>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceStats}>
            <View>
              <Text style={styles.balanceStatLabel}>Ten miesiąc</Text>
              <Text style={styles.balanceStatValue}>+{formatValue(stats.thisMonthGrosze)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.balanceStatLabel}>Wykorzystane</Text>
              <Text style={[styles.balanceStatValue, { color: Colors.text.secondary }]}>
                {formatValue(stats.usedGrosze)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Action buttons ────────────────────── */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.scanBtn}
            onPress={() => router.push('/scan')}
            android_ripple={{ color: Colors.accent.light }}
          >
            <Ionicons name="scan" size={20} color="#fff" />
            <Text style={styles.scanBtnText}>Skanuj voucher</Text>
          </Pressable>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/voucher/add')}
            android_ripple={{ color: Colors.bg.overlay }}
          >
            <Ionicons name="add" size={20} color={Colors.text.primary} />
            <Text style={styles.addBtnText}>Dodaj ręcznie</Text>
          </Pressable>
        </View>

        {/* ── Expiry warning banner ─────────────── */}
        {expiringVouchers.length > 0 && (
          <Pressable
            style={styles.expiryBanner}
            onPress={() => router.push('/(tabs)/historia')}
          >
            <Ionicons name="warning" size={18} color={Colors.status.expiringSoon} />
            <View style={styles.expiryBannerText}>
              <Text style={styles.expiryBannerTitle}>
                {expiringVouchers.length === 1
                  ? '1 voucher wygasa wkrótce'
                  : `${expiringVouchers.length} vouchery wygasają wkrótce`}
              </Text>
              <Text style={styles.expiryBannerSub}>Wykorzystaj przed utratą ważności</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.status.expiringSoon} />
          </Pressable>
        )}

        {/* ── Active vouchers list ──────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktywne vouchery</Text>
          <Pressable onPress={() => router.push('/(tabs)/historia')}>
            <View style={styles.historyLink}>
              <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.historyLinkText}>Historia</Text>
            </View>
          </Pressable>
        </View>

        {activeVouchers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={40} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Brak aktywnych voucherów</Text>
            <Text style={styles.emptySubtitle}>Zeskanuj paragon z automatu lub dodaj ręcznie.</Text>
          </View>
        ) : (
          activeVouchers.map(v => (
            <VoucherCard
              key={v.id}
              id={v.id}
              storeName={v.storeName || v.label}
              code={v.code}
              valueGrosze={v.valueGrosze}
              expiresAt={v.expiresAt}
              status={v.status}
              codeFormat={v.codeFormat}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['4xl'] },

  appHeader: { paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  appTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.text.primary,
  },
  appSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Balance card — dark card with content
  balanceCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  balanceCardLabel: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weight.medium,
  },
  balanceAmount: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  balanceAmountUnit: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
  },
  activeCount: {
    fontSize: Typography.size.sm,
    color: Colors.accent.primary,
    fontWeight: Typography.weight.medium,
    marginTop: Spacing.xs,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginVertical: Spacing.md,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStatLabel: {
    fontSize: Typography.size.xs,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  balanceStatValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
  },

  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  scanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.elevated,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border.strong,
  },
  addBtnText: {
    color: Colors.text.primary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },

  // Expiry banner
  expiryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.status.expiringSoonBg,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#4A3000',
  },
  expiryBannerText: { flex: 1 },
  expiryBannerTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.status.expiringSoon,
  },
  expiryBannerSub: {
    fontSize: Typography.size.xs,
    color: '#C9A227',
    marginTop: 1,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.text.primary,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyLinkText: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },

  // Voucher card — identyczny ze screenshotem
  voucherCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  voucherCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  storeIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  voucherStoreName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  spacer: { flex: 1 },
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.status.activeBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: '#1A4A2E',
  },
  badgeActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.status.active,
  },
  badgeActiveText: {
    fontSize: Typography.size.xs,
    color: Colors.status.active,
    fontWeight: Typography.weight.semibold,
  },
  badgeWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.status.expiringSoonBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: '#4A3000',
  },
  badgeWarnText: {
    fontSize: Typography.size.xs,
    color: Colors.status.expiringSoon,
    fontWeight: Typography.weight.semibold,
  },
  voucherCode: {
    fontSize: Typography.size.xs,
    color: Colors.text.tertiary,
    fontFamily: 'monospace',
    marginBottom: Spacing.xs,
  },
  voucherValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.accent.primary,
    marginBottom: Spacing.xs,
  },
  voucherFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voucherExpiry: {
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
  },
  voucherExpirySoon: {
    color: Colors.status.expiringSoon,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
