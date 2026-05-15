// src/app/index.tsx
// Redirect entry point — jeśli onboarding nie skończony, pokaż go
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';

export default function Index() {
  const onboardingCompleted = useSettingsStore(s => s.settings.onboardingCompleted);
  const isLoaded = useSettingsStore(s => s.isLoaded);

  if (!isLoaded) return null;

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
}
