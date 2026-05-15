// src/app/onboarding.tsx
// Onboarding identyczny ze screenshotami:
// - Ciemnogranatowe tło z gradient effect
// - Kolorowe kółka z ikonami (zielony, niebieski, fioletowy, zielony)
// - Dots indicator z aktywnym poszerzonym
// - Pełnoekranowy zielony CTA button
// - Pomiń w prawym górnym rogu

import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, Pressable, Dimensions,
  ScrollView, Animated
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors, Spacing, Typography, Radii } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  bullets?: string[];
};

const SLIDES: Slide[] = [
  {
    icon: 'refresh',
    iconColor: '#fff',
    iconBg: '#2ECC71',
    title: 'Wymień butelki',
    body: 'Oddaj butelki i puszki do automatu, a otrzymasz\nvoucher z kodem do wykorzystania przy kasie.',
  },
  {
    icon: 'scan',
    iconColor: '#fff',
    iconBg: '#3B82F6',
    title: 'Zeskanuj voucher',
    body: 'Zrób zdjęcie albo zeskanuj kod, żeby zapisać voucher w\ntelefonie i nie zgubić papierka.',
  },
  {
    icon: 'phone-portrait-outline',
    iconColor: '#fff',
    iconBg: '#8B5CF6',
    title: 'Pokaż voucher przy kasie',
    body: 'Otwórz zapisany voucher i pokaż pełny kod na ekranie\ntelefonu, gdy chcesz go wykorzystać.',
  },
  {
    icon: 'checkmark-circle',
    iconColor: '#fff',
    iconBg: '#2ECC71',
    title: 'Gotowe do działania',
    body: 'Trzymaj wszystkie vouchery w jednym miejscu, pilnuj\nkwot i terminów ważności.',
    bullets: ['Nie zgubisz papierka', 'Widzisz wszystkie kwoty', 'Sprawdzisz co wygasa'],
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const update = useSettingsStore(s => s.update);

  async function handleFinish() {
    await update('onboardingCompleted', true);
    router.replace('/(tabs)');
  }

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Gradient background overlay */}
      <View style={styles.gradientBg} />

      <SafeAreaView style={styles.safe}>
        {/* Pomiń */}
        <Pressable style={styles.skipBtn} onPress={handleFinish}>
          <Text style={styles.skipText}>Pomiń</Text>
        </Pressable>

        {/* Slide content */}
        <View style={styles.slideArea}>
          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
            <Ionicons name={slide.icon} size={48} color={slide.iconColor} />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>

          {/* Bullets (tylko ostatni slajd) */}
          {slide.bullets && (
            <View style={styles.bullets}>
              {slide.bullets.map(b => (
                <View key={b} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent.primary} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => setStep(i)}>
              <View style={[styles.dot, i === step && styles.dotActive]} />
            </Pressable>
          ))}
        </View>

        {/* CTA button — pełna szerokość, zaokrąglone */}
        <View style={styles.ctaWrapper}>
          <Pressable
            style={styles.ctaBtn}
            onPress={isLast ? handleFinish : () => setStep(s => s + 1)}
            android_ripple={{ color: Colors.accent.light }}
          >
            <Text style={styles.ctaText}>
              {isLast ? 'Przejdź do aplikacji' : 'Dalej'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2332',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1C2B3A',
    // Symulujemy gradient przez overlay
  },
  safe: {
    flex: 1,
  },

  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  skipText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.base,
  },

  slideArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.lg,
  },

  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  body: {
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bullets: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletText: {
    fontSize: Typography.size.base,
    color: Colors.accent.primary,
    fontWeight: Typography.weight.medium,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bg.overlay,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.accent.primary,
    borderRadius: 4,
  },

  // CTA
  ctaWrapper: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.lg,
  },
  ctaText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#fff',
  },
});
