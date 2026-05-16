import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '@/theme/tokens';
import { useSettingsStore } from '@/store/settingsStore';
import { useVoucherStore } from '@/store/voucherStore';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrateVouchers = useVoucherStore(s => s.hydrate);
  const runAutoExpiry = useVoucherStore(s => s.runAutoExpiry);
  const hydrateSettings = useSettingsStore(s => s.hydrate);

  useEffect(() => {
    (async () => {
      try {
        await hydrateSettings();
        // Removed seedIfEmpty(SEED_VOUCHERS) to ensure a clean app for new users
        await hydrateVouchers();
        await runAutoExpiry();
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg.base },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          animation: 'none',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen
          name="voucher/[id]"
          options={{ title: 'Szczegóły' }}
        />
        <Stack.Screen
          name="voucher/[id]/fullscreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="voucher/add"
          options={{ title: 'Dodaj voucher', presentation: 'modal' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
