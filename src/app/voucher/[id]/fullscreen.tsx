// src/app/voucher/[id]/fullscreen.tsx
// Identyczny ze screenshotem: białe tło, store name, wielka zielona kwota,
// QR code w białej karcie, kod pod spodem, "Pokaż ten kod kasjerowi"

import { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { useVoucherStore } from '@/store/voucherStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValueShort } from '@/utils/voucher';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

// Prosty QR-like placeholder z deterministycznym wzorem
function QRPlaceholder({ code, size }: { code: string; size: number }) {
  const cells = 14;
  const cellSize = size / cells;

  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff' }}>
      {Array.from({ length: cells * cells }).map((_, i) => {
        const x = i % cells;
        const y = Math.floor(i / cells);
        const charCode = code.charCodeAt((x * 3 + y * 7) % code.length);
        const isCornerBlock =
          (x < 4 && y < 4) || (x >= cells - 4 && y < 4) || (x < 4 && y >= cells - 4);
        const dark = isCornerBlock ? (x === 0 || x === 3 || y === 0 || y === 3) : ((charCode + x + y) % 2 === 0);
        return (
          <View
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: dark ? '#0D1117' : '#fff',
            }}
          />
        );
      })}
    </View>
  );
}

// Barcode placeholder
function BarcodePlaceholder({ code, width: w }: { code: string; width: number }) {
  const barCount = 50;
  return (
    <View style={{ width: w, height: 100, flexDirection: 'row', alignItems: 'stretch', backgroundColor: '#fff' }}>
      {Array.from({ length: barCount }).map((_, i) => {
        const c = code.charCodeAt(i % code.length);
        const barW = ((c + i) % 3) + 1;
        const dark = (c + i) % 3 !== 0;
        return (
          <View
            key={i}
            style={{ width: barW * 3, height: '100%', backgroundColor: dark ? '#0D1117' : '#fff' }}
          />
        );
      })}
    </View>
  );
}

export default function FullscreenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const voucher = useVoucherStore(s => s.vouchers.find(v => v.id === id));
  const keepAwake = useSettingsStore(s => s.settings.keepScreenAwakeOnScan);
  const autoBrightness = useSettingsStore(s => s.settings.autoBrightness);

  if (keepAwake) useKeepAwake();

  useEffect(() => {
    if (!autoBrightness) return;
    let orig: number;
    Brightness.requestPermissionsAsync().then(({ granted }) => {
      if (!granted) return;
      Brightness.getBrightnessAsync().then(b => {
        orig = b;
        Brightness.setBrightnessAsync(1.0);
      });
    });
    return () => {
      if (orig !== undefined) Brightness.setBrightnessAsync(orig);
    };
  }, [autoBrightness]);

  if (!voucher) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#333' }}>Voucher nie znaleziony.</Text>
      </View>
    );
  }

  const isQR = voucher.codeFormat === 'qr' || voucher.codeFormat === 'unknown';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={20}>
        <Ionicons name="arrow-back" size={22} color="#333" />
      </Pressable>

      <View style={styles.content}>
        {/* Store + value — identyczne ze screenshotem */}
        <Text style={styles.storeName}>{voucher.storeName || 'Voucher'}</Text>
        <Text style={styles.value}>
          {formatValueShort(voucher.valueGrosze)}{' '}
          <Text style={styles.valueUnit}>zł</Text>
        </Text>

        {/* Code card — biała karta z cieniem jak na screenshocie */}
        <View style={styles.codeCard}>
          {isQR ? (
            <QRPlaceholder code={voucher.code} size={QR_SIZE} />
          ) : (
            <BarcodePlaceholder code={voucher.code} width={QR_SIZE} />
          )}
        </View>

        {/* Raw code */}
        <Text style={styles.rawCode} selectable>{voucher.code.toUpperCase()}</Text>

        {/* Instruction */}
        <Text style={styles.instruction}>Pokaż ten kod kasjerowi</Text>
      </View>

      {/* Bottom hint */}
      <Text style={styles.bottomHint}>
        Zwiększ jasność ekranu dla lepszej czytelności kodu
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    paddingTop: 48,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: Spacing.base,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  storeName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: '#1A1A2E',
    textAlign: 'center',
  },
  value: {
    fontSize: 52,
    fontWeight: Typography.weight.extrabold,
    color: Colors.accent.primary,
    letterSpacing: -2,
    textAlign: 'center',
  },
  valueUnit: {
    fontSize: 32,
    fontWeight: Typography.weight.bold,
    color: Colors.accent.primary,
  },
  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    marginVertical: Spacing.lg,
  },
  rawCode: {
    fontSize: Typography.size.base,
    fontFamily: 'monospace',
    color: '#555',
    letterSpacing: 2,
    textAlign: 'center',
  },
  instruction: {
    fontSize: Typography.size.base,
    color: '#888',
    textAlign: 'center',
  },
  bottomHint: {
    fontSize: Typography.size.xs,
    color: '#AAA',
    textAlign: 'center',
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
});
