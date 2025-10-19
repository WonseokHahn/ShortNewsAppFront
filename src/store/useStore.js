import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Theme store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark mode
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Auth store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        // Clear settings storage when logging out
        localStorage.removeItem('settings-storage');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// News store
export const useNewsStore = create((set, get) => ({
  news: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    sentiment: null,
    keyword: '',
    sortBy: 'pub_date',
    order: 'DESC',
  },
  setNews: (news) => set({ news }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({
    filters: {
      category: null,
      sentiment: null,
      keyword: '',
      sortBy: 'pub_date',
      order: 'DESC',
    },
  }),
}));

// Settings store - Syncs with backend for authenticated users
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      autoRefresh: false,
      refreshInterval: 60,
      summaryType: 'compact',
      favoriteKeywords: [],
      isSynced: false,
      isLoading: false,

      // Load settings from backend
      loadSettings: async () => {
        try {
          set({ isLoading: true });
          const { settingsAPI } = await import('../services/api');
          const response = await settingsAPI.getUserSettings();
          const { data } = response.data;

          set({
            autoRefresh: data.autoRefresh,
            refreshInterval: data.refreshInterval,
            summaryType: data.summaryType,
            favoriteKeywords: data.favoriteKeywords,
            isSynced: true,
            isLoading: false
          });

          return data;
        } catch (error) {
          console.log('Using local settings (not authenticated)');
          set({ isSynced: false, isLoading: false });
          return null;
        }
      },

      // Save settings to backend (debounced to avoid too many requests)
      saveSettings: async () => {
        try {
          const { settingsAPI } = await import('../services/api');
          const state = get();

          await settingsAPI.updateUserSettings({
            autoRefresh: state.autoRefresh,
            refreshInterval: state.refreshInterval,
            summaryType: state.summaryType,
            favoriteKeywords: state.favoriteKeywords
          });

          set({ isSynced: true });
        } catch (error) {
          console.error('Failed to save settings to backend:', error);
          set({ isSynced: false });
        }
      },

      setAutoRefresh: (autoRefresh) => {
        set({ autoRefresh });
        get().saveSettings();
      },

      setRefreshInterval: (refreshInterval) => {
        set({ refreshInterval });
        get().saveSettings();
      },

      setSummaryType: (summaryType) => {
        set({ summaryType });
        get().saveSettings();
      },

      addFavoriteKeyword: (keyword) => {
        set((state) => ({
          favoriteKeywords: [...state.favoriteKeywords, keyword],
        }));
        get().saveSettings();
      },

      removeFavoriteKeyword: (keyword) => {
        set((state) => ({
          favoriteKeywords: state.favoriteKeywords.filter((k) => k !== keyword),
        }));
        get().saveSettings();
      },

      setFavoriteKeywords: (keywords) => {
        set({ favoriteKeywords: keywords });
        get().saveSettings();
      }
    }),
    {
      name: 'settings-storage',
    }
  )
);

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const { theme } = useThemeStore.getState();
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
