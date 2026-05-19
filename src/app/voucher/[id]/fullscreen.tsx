// src/app/voucher/[id]/fullscreen.tsx
// Identyczny ze screenshotem: białe tło, store name, wielka zielona kwota,
// barcode/QR w białej karcie, kod pod spodem, "Pokaż ten kod kasjerowi"

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import Barcode from 'react-native-barcode-svg';
import QRCode from 'react-native-qrcode-svg';
import { useVoucherStore } from '@/store/voucherStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { formatValueShort } from '@/utils/voucher';
import { Ionicons } from '@expo/vector-icons';



export default function FullscreenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    const w = Dimensions.get('window').width;
    return w > 0 ? w : 375;
  });

  const qrSize = containerWidth * 0.6;
  const barcodeWidth = containerWidth - 80;
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

  // Biedronka i większość polskich sieci używa CODE128
  // EAN-13 ma dokładnie 12 cyfr (13. to cyfra kontrolna generowana automatycznie)
  // EAN-8 ma dokładnie 7 cyfr
  // Dla wszystkich innych (w tym długich kodów Biedronki) → CODE128
  function getBarcodeFormat(): string {
    const code = voucher!.code.replace(/\s/g, '');
    const onlyDigits = /^\d+$/.test(code);
    if (onlyDigits && code.length === 12) return 'EAN13';
    if (onlyDigits && code.length === 7) return 'EAN8';
    return 'CODE128';
  }

  const isQR = voucher.codeFormat === 'qr';
  const barcodeFormat = getBarcodeFormat();

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width: w } = e.nativeEvent.layout;
        if (w > 0) {
          setContainerWidth(w);
        }
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={20}>
        <Ionicons name="arrow-back" size={22} color="#333" />
      </Pressable>

      <View style={styles.content}>
        {/* Store + value */}
        <Text style={styles.storeName}>{voucher.storeName || 'Voucher'}</Text>
        <Text style={styles.value}>
          {formatValueShort(voucher.valueGrosze)}{' '}
          <Text style={styles.valueUnit}>zł</Text>
        </Text>

        {/* Code card */}
        <View style={styles.codeCard}>
          {isQR ? (
            <QRCode
              value={voucher.code}
              size={qrSize}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          ) : (
            <Barcode
              value={voucher.code}
              format={barcodeFormat}
              singleBarWidth={2}
              maxWidth={barcodeWidth}
              height={100}
              lineColor="#000000"
              backgroundColor="#FFFFFF"
            />
          )}
        </View>

        {/* Raw code */}
        <Text style={styles.rawCode} selectable>{voucher.code}</Text>

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