import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScanner } from '@/hooks/useScanner';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  const { state, result, hasPermission, requestPermission, handleScan } = useScanner();
  const hapticEnabled = useSettingsStore(s => s.settings.hapticEnabled);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (state === 'success' && result) {
      if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/voucher/add', params: { code: result.code, format: result.format } });
    }
  }, [state, result]);

  useEffect(() => {
    if (hasPermission === null) requestPermission();
  }, []);

  if (hasPermission === false || state === 'denied') {
    return (
      <View style={styles.permDenied}>
        <SafeAreaView style={styles.permSafe}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </Pressable>
          <View style={styles.permContent}>
            <View style={styles.permIcon}>
              <Ionicons name="camera-outline" size={48} color={Colors.text.tertiary} />
            </View>
            <Text style={styles.permTitle}>Brak dostępu do aparatu</Text>
            <Text style={styles.permSub}>Zezwól na dostęp w ustawieniach telefonu</Text>
            <Pressable style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Zezwól</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/voucher/add')}>
              <Text style={styles.manualLink}>Wpisz kod ręcznie</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" />

      {/* Camera */}
      {hasPermission ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={state !== 'success' ? handleScan : undefined}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0F1A' }]} />
      )}

      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Zeskanuj voucher</Text>
            <Text style={styles.headerSub}>Umieść kod w ramce</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderArea}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />

            <View style={styles.centerContent}>
              <Ionicons name="camera" size={36} color={Colors.accent.primary} />
              <Text style={styles.scanningText}>Skanowanie...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '70%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Actions - Removed gallery as requested */}
        <View style={styles.bottomActions}>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons 
              name={torch ? "flashlight" : "flashlight-outline"} 
              size={24} 
              color={torch ? Colors.accent.primary : Colors.text.secondary} 
            />
            <Text style={[styles.actionBtnText, torch && { color: Colors.accent.primary }]}>Latarka</Text>
          </Pressable>
          
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.replace('/voucher/add')}
          >
            <Text style={[styles.actionBtnIcon, { fontSize: 22 }]}>T</Text>
            <Text style={styles.actionBtnText}>Wpisz ręcznie</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>Przyłóż kod QR lub kod kreskowy do ramki</Text>
      </SafeAreaView>
    </View>
  );
}

const VF = 260;
const C = 30;
const CW = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F1A' },
  overlay: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.base },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text.primary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold, textAlign: 'center' },
  headerSub: { color: Colors.text.secondary, fontSize: Typography.size.xs, textAlign: 'center' },
  viewfinderArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { width: VF, height: VF, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: C, height: C, borderColor: Colors.accent.primary },
  tl: { top: 0, left: 0, borderTopWidth: CW, borderLeftWidth: CW, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: CW, borderRightWidth: CW, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CW, borderLeftWidth: CW, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: CW, borderRightWidth: CW, borderBottomRightRadius: 4 },
  centerContent: { alignItems: 'center', gap: Spacing.sm },
  scanningText: { color: Colors.text.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.medium },
  progressBar: { width: 160, height: 3, backgroundColor: Colors.bg.overlay, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent.primary, borderRadius: 2 },
  bottomActions: { 
    flexDirection: 'row', 
    backgroundColor: Colors.bg.surface, 
    marginHorizontal: Spacing.base, 
    borderRadius: Radii.lg, 
    overflow: 'hidden', 
    marginBottom: Spacing.sm 
  },
  actionBtn: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: Spacing.base, 
    gap: Spacing.xs, 
    backgroundColor: Colors.bg.elevated, 
    borderWidth: 0.5, 
    borderColor: Colors.border.default 
  },
  actionBtnText: { color: Colors.text.secondary, fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },
  actionBtnIcon: { color: Colors.text.secondary, fontWeight: Typography.weight.bold },
  hint: { color: Colors.text.tertiary, fontSize: Typography.size.xs, textAlign: 'center', paddingBottom: Spacing.base },
  permDenied: { flex: 1, backgroundColor: Colors.bg.base },
  permSafe: { flex: 1 },
  permContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base, paddingHorizontal: Spacing.xl },
  permIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.bg.surface, alignItems: 'center', justifyContent: 'center' },
  permTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.text.primary, textAlign: 'center' },
  permSub: { fontSize: Typography.size.base, color: Colors.text.secondary, textAlign: 'center' },
  permBtn: { backgroundColor: Colors.accent.primary, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: Radii.full, marginTop: Spacing.sm },
  permBtnText: { color: '#fff', fontWeight: Typography.weight.semibold, fontSize: Typography.size.base },
  manualLink: { color: Colors.text.secondary, fontSize: Typography.size.base, textDecorationLine: 'underline', marginTop: Spacing.sm },
});
