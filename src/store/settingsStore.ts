// src/store/settingsStore.ts
import { create } from 'zustand';
import type { AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { getAllSettings, setSetting } from '@/db/settingsRepository';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  hydrate: () => Promise<void>;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  hydrate: async () => {
    const settings = await getAllSettings();
    set({ settings, isLoaded: true });
  },

  update: async (key, value) => {
    await setSetting(key, value);
    set({ settings: { ...get().settings, [key]: value } });
  },
}));
