import { create } from 'zustand';
import type { Voucher, VoucherFilters, VoucherSort, VoucherStats, CreateVoucherInput, UpdateVoucherInput } from '@/types/voucher';
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher, expireOverdueVouchers, deleteAllVouchers } from '@/db/voucherRepository';
import { computeStats } from '@/utils/voucher';
import { addDays, parseISO, differenceInDays } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface VoucherState {
  vouchers: Voucher[];
  isLoading: boolean;
  error: string | null;
  filters: VoucherFilters;
  sort: VoucherSort;
  stats: VoucherStats;

  hydrate: () => Promise<void>;
  addVoucher: (input: CreateVoucherInput) => Promise<Voucher>;
  editVoucher: (id: string, input: UpdateVoucherInput) => Promise<void>;
  markUsed: (id: string) => Promise<void>;
  removeVoucher: (id: string) => Promise<void>;
  clearAllVouchers: () => Promise<void>;
  runAutoExpiry: () => Promise<void>;
  setFilters: (f: Partial<VoucherFilters>) => void;
  setSort: (s: VoucherSort) => void;
  resetFilters: () => void;
  scheduleReminders: () => Promise<void>;
}

const DEFAULT_FILTERS: VoucherFilters = { status: 'all', search: '' };
const DEFAULT_SORT: VoucherSort = { key: 'expiresAt', direction: 'asc' };

export const useVoucherStore = create<VoucherState>((set, get) => ({
  vouchers: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  stats: computeStats([]),

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const { sort } = get();
      const vouchers = await getAllVouchers(sort.key, sort.direction);
      set({ vouchers, stats: computeStats(vouchers), isLoading: false });
      await get().scheduleReminders();
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addVoucher: async (input) => {
    const created = await createVoucher(input);
    const vouchers = [created, ...get().vouchers];
    set({ vouchers, stats: computeStats(vouchers) });
    await get().scheduleReminders();
    return created;
  },

  editVoucher: async (id, input) => {
    const updated = await updateVoucher(id, input);
    if (!updated) return;
    const vouchers = get().vouchers.map(v => v.id === id ? updated : v);
    set({ vouchers, stats: computeStats(vouchers) });
    await get().scheduleReminders();
  },

  markUsed: async (id) => get().editVoucher(id, { status: 'used' }),

  removeVoucher: async (id) => {
    await deleteVoucher(id);
    const vouchers = get().vouchers.filter(v => v.id !== id);
    set({ vouchers, stats: computeStats(vouchers) });
    await get().scheduleReminders();
  },

  clearAllVouchers: async () => {
    await deleteAllVouchers();
    set({ vouchers: [], stats: computeStats([]) });
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  runAutoExpiry: async () => {
    const changed = await expireOverdueVouchers();
    if (changed > 0) await get().hydrate();
  },

  setFilters: (partial) => set({ filters: { ...get().filters, ...partial } }),
  setSort: (sort) => { set({ sort }); get().hydrate(); },
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  scheduleReminders: async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.cancelAllScheduledNotificationsAsync();

      const activeVouchers = get().vouchers.filter(v => v.status === 'active' && v.expiresAt);
      
      for (const v of activeVouchers) {
        if (!v.expiresAt) continue;
        const expiryDate = parseISO(v.expiresAt);
        const diff = differenceInDays(expiryDate, new Date());

        // Przypomnienie 1 dzień przed
        if (diff >= 1) {
          const trigger = new Date(expiryDate);
          trigger.setDate(trigger.getDate() - 1);
          trigger.setHours(10, 0, 0, 0); // 10:00 rano dzień przed

          if (trigger > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Twój voucher wygaśnie jutro!',
                body: `${v.storeName || 'Voucher'}: Zaplanuj zakupy, aby go wykorzystać.`,
                data: { voucherId: v.id },
              },
              trigger,
            });
          }
        }

        // Przypomnienie w dniu wygaśnięcia
        const triggerToday = new Date(expiryDate);
        triggerToday.setHours(9, 0, 0, 0); // 09:00 rano w dniu wygaśnięcia
        if (triggerToday > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Twój voucher wygasa dziś!',
              body: `${v.storeName || 'Voucher'}: To ostatnia szansa na jego użycie!`,
              data: { voucherId: v.id },
            },
            trigger: triggerToday,
          });
        }
      }
    } catch (e) {
      console.warn('Błąd harmonogramu powiadomień:', e);
    }
  },
}));

// Selectors
export function useFilteredVouchers() {
  return useVoucherStore(s => {
    const { vouchers, filters } = s;
    return vouchers.filter(v => {
      if (filters.status !== 'all' && v.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!v.label.toLowerCase().includes(q) &&
            !v.storeName.toLowerCase().includes(q) &&
            !v.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  });
}

export function useExpiringVouchers() {
  return useVoucherStore(s => {
    const week = addDays(new Date(), 7);
    return s.vouchers.filter(
      v => v.status === 'active' && v.expiresAt && parseISO(v.expiresAt) < week
    );
  });
}
