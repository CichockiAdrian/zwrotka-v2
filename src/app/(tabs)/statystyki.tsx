import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useVoucherStore } from '@/store/voucherStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValueShort } from '@/utils/voucher';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
    .slice(0, 10); // Pokazujemy więcej sklepów skoro nie ma wykresu
}

export default function StatystykiScreen() {
  const stats = useVoucherStore(s => s.stats);
  const vouchers = useVoucherStore(s => s.vouchers);
  const topStores = getTopStores(vouchers);
  const currentMonth = format(new Date(), 'LLLL yyyy', { locale: pl });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Statystyki</Text>
          <Text style={styles.subtitle}>{currentMonth}</Text>
        </View>

        {/* 4 statystyki w gridzie */}
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

        {/* Najczęstsze sklepy — teraz to jest główna sekcja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ranking sklepów</Text>
          {topStores.length > 0 ? (
            topStores.map((store, i) => (
              <View key={store.name} style={[styles.storeRow, i === 0 && { borderTopWidth: 0 }]}>
                <View style={styles.storeIcon}>
                  <Ionicons name="storefront-outline" size={18} color={Colors.text.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCount}>{store.count} {store.count === 1 ? 'voucher' : 'vouchery'}</Text>
                </View>
                <Text style={styles.storeValue}>{formatValueShort(store.total)} zł</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: Colors.text.tertiary, textAlign: 'center', paddingVertical: Spacing.lg }}>
              Dodaj vouchery, aby zobaczyć statystyki sklepów.
            </Text>
          )}
        </View>
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
