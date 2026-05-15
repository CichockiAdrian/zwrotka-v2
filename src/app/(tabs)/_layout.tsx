// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors, Typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.bg.surface,
          borderTopColor: Colors.border.default,
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 60 : 82,
          paddingBottom: Platform.OS === 'android' ? 6 : 22,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: Colors.bg.base },
        headerTintColor: Colors.text.primary,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="historia"
        options={{
          title: 'Historia',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <TabIcon name={focused ? 'time' : 'time-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statystyki"
        options={{
          title: 'Statystyki',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ustawienia"
        options={{
          title: 'Ustawienia',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
