// src/types/settings.ts

export interface AppSettings {
  hapticEnabled: boolean;
  keepScreenAwakeOnScan: boolean;
  autoBrightness: boolean;
  expiryReminders: boolean;
  defaultSortKey: 'createdAt' | 'valueGrosze' | 'expiresAt';
  onboardingCompleted: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  hapticEnabled: true,
  keepScreenAwakeOnScan: true,
  autoBrightness: true,
  expiryReminders: true,
  defaultSortKey: 'expiresAt',
  onboardingCompleted: false,
};
