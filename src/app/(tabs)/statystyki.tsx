// src/app/(tabs)/statystyki.tsx
// Identyczny ze screenshotem: 4 kolorowe karty w gridzie, wykres słupkowy, sklepy

import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useVoucherStore } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValue, formatValueShort } from '@/utils/voucher';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.base * 2;

// Oblicz dane do wykresu (ostatnie 7 dni)
function getWeeklyData(vouchers: ReturnType<typeof useVoucherStore.getState>['vouchers']) {
  const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const now = new Date();
  return days.map((label, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const total = vouchers
      .filter(v => {
        const c = new Date(v.createdAt);
        return c >= dayStart && c <= dayEnd;
      })
      .reduce((s, v) => s + v.valueGrosze, 0);

    return { label, value: total };
  });
}

// Sklepy pogrupowane
function getTopStores(vouchers: ReturnType<typeof useVoucherStore.getState>['vouchers']) {
  const map = new Map<string, { count: number; total: number }>();
  for (const v of vouchers) {
    const name = v.storeName || 'Inne';
    const curr = map.get(name) ?? { count: 0, total: 0 };
    map.set(name, { count: curr.count + 1, total: curr.total + v.valueGrosze });
  }
  return Array.from(map.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = (CHART_WIDTH - Spacing.base * 2) / data.length - 8;
  const chartHeight = 100;

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={chartStyles.barCol}>
            <View style={[chartStyles.bar, {
              height: Math.max((d.value / maxVal) * chartHeight, 4),
              width: barWidth,
            }]} />
            <Text style={chartStyles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { paddingTop: Spacing.sm },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 130 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.xs },
  bar: { backgroundColor: Colors.accent.primary, borderRadius: 4 },
  barLabel: { fontSize: 10, color: Colors.text.tertiary, fontWeight: '500' },
});

export default function StatystykiScreen() {
  const stats = useVoucherStore(s => s.stats);
  const vouchers = useVoucherStore(s => s.vouchers);
  const weekData = getWeeklyData(vouchers);
  const topStores = getTopStores(vouchers);
  const currentMonth = format(new Date(), 'LLLL yyyy', { locale: pl });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Statystyki</Text>
          <Text style={styles.subtitle}>{currentMonth}</Text>
        </View>

        {/* 4 statystyki w gridzie — identyczne ze screenshotem */}
        <View style={styles.statsGrid}>
          {/* Odzyskane środki — zielona */}
          <View style={[styles.statCard, { backgroundColor: Colors.stats.green.bg, borderColor: Colors.stats.green.border }]}>
            <Ionicons name="wallet-outline" size={22} color={Colors.accent.primary} />
            <Text style={[styles.statValue, { color: Colors.accent.primary }]}>
              {formatValueShort(stats.totalActiveGrosze)} zł
            </Text>
            <Text style={styles.statLabel}>Odzyskane środki</Text>
          </View>

          {/* Wykorzystane — niebieska */}
          <View style={[styles.statCard, { backgroundColor: Colors.stats.blue.bg, borderColor: Colors.stats.blue.border }]}>
            <Ionicons name="trending-up-outline" size={22} color="#60A5FA" />
            <Text style={[styles.statValue, { color: '#60A5FA' }]}>
              {formatValueShort(stats.usedGrosze)} zł
            </Text>
            <Text style={styles.statLabel}>Wykorzystane</Text>
          </View>

          {/* Aktywne vouchery — fioletowa */}
          <View style={[styles.statCard, { backgroundColor: Colors.stats.purple.bg, borderColor: Colors.stats.purple.border }]}>
            <Ionicons name="cube-outline" size={22} color="#A78BFA" />
            <Text style={[styles.statValue, { color: '#A78BFA' }]}>
              {stats.activeCount}
            </Text>
            <Text style={styles.statLabel}>Aktywne vouchery</Text>
          </View>

          {/* Łącznie — pomarańczowa */}
          <View style={[styles.statCard, { backgroundColor: Colors.stats.orange.bg, borderColor: Colors.stats.orange.border }]}>
            <Ionicons name="calendar-outline" size={22} color="#FB923C" />
            <Text style={[styles.statValue, { color: '#FB923C' }]}>
              {stats.totalCount}
            </Text>
            <Text style={styles.statLabel}>Łącznie voucherów</Text>
          </View>
        </View>

        {/* Wykres tygodniowy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miesięczny przegląd</Text>
          <BarChart data={weekData} />
        </View>

        {/* Najczęstsze sklepy */}
        {topStores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Najczęstsze sklepy</Text>
            {topStores.map(store => (
              <View key={store.name} style={styles.storeRow}>
                <View style={styles.storeIcon}>
                  <Ionicons name="storefront-outline" size={18} color={Colors.text.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCount}>{store.count} voucherów</Text>
                </View>
                <Text style={styles.storeValue}>{formatValueShort(store.total)} zł</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.base },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['4xl'] },
  header: { paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.extrabold, color: Colors.text.primary },
  subtitle: { fontSize: Typography.size.sm, color: Colors.text.secondary, marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: {
    width: (width - Spacing.base * 2 - Spacing.sm) / 2,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  statValue: { fontSize: Typography.size.xl, fontWeight: Typography.weight.extrabold },
  statLabel: { fontSize: Typography.size.xs, color: Colors.text.secondary },

  section: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  sectionTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },

  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.default },
  storeIcon: { width: 36, height: 36, borderRadius: Radii.sm, backgroundColor: Colors.bg.elevated, alignItems: 'center', justifyContent: 'center' },
  storeName: { fontSize: Typography.size.base, fontWeight: Typography.weight.medium, color: Colors.text.primary },
  storeCount: { fontSize: Typography.size.xs, color: Colors.text.secondary },
  storeValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.text.secondary },
});
