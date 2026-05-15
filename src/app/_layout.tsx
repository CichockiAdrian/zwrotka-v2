// src/app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useVoucherStore } from '@/store/voucherStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/tokens';
import { seedIfEmpty } from '@/db/voucherRepository';
import { SEED_VOUCHERS } from '@/data/seedVouchers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrateVouchers = useVoucherStore(s => s.hydrate);
  const runAutoExpiry = useVoucherStore(s => s.runAutoExpiry);
  const hydrateSettings = useSettingsStore(s => s.hydrate);

  useEffect(() => {
    (async () => {
      try {
        await hydrateSettings();
        await seedIfEmpty(SEED_VOUCHERS);
        await hydrateVouchers();
        await runAutoExpiry();
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.bg.base },
            headerTintColor: Colors.text.primary,
            headerTitleStyle: { fontWeight: '600', fontSize: 17 },
            contentStyle: { backgroundColor: Colors.bg.base },
            animation: 'slide_from_right',
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen
            name="voucher/[id]"
            options={{ title: 'Szczegóły', headerBackTitle: '' }}
          />
          <Stack.Screen
            name="voucher/[id]/fullscreen"
            options={{ headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="voucher/add"
            options={{ title: 'Dodaj voucher', presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
