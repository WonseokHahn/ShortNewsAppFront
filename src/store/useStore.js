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
        set({ user: null, token: null, isAuthenticated: false });

        // Reset settings store to default values
        useSettingsStore.setState({
          autoRefresh: false,
          refreshInterval: 60,
          summaryType: 'compact',
          favoriteKeywords: [],
          isSynced: false,
          isLoading: false
        });

        // Clear news store on logout
        useNewsStore.setState({
          news: [],
          loading: false,
          error: null
        });
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// News store with persistence to keep news when navigating between pages
export const useNewsStore = create(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'news-storage',
      // Only persist news array to keep localStorage size manageable
      partialize: (state) => ({ news: state.news }),
    }
  )
);

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
          console.log('[loadSettings] Fetching settings from backend...');
          const { settingsAPI } = await import('../services/api');
          const response = await settingsAPI.getUserSettings();
          console.log('[loadSettings] Response:', response);
          const { data } = response.data;
          console.log('[loadSettings] Settings data:', data);

          set({
            autoRefresh: data.autoRefresh,
            refreshInterval: data.refreshInterval,
            summaryType: data.summaryType,
            favoriteKeywords: data.favoriteKeywords,
            isSynced: true,
            isLoading: false
          });

          console.log('[loadSettings] Settings loaded successfully, keywords:', data.favoriteKeywords);
          return data;
        } catch (error) {
          console.error('[loadSettings] Failed to load settings:', error);
          console.error('[loadSettings] Error details:', error.response?.data || error.message);
          set({ isSynced: false, isLoading: false });
          return null;
        }
      },

      // Save settings to backend (debounced to avoid too many requests)
      saveSettings: async () => {
        try {
          console.log('[saveSettings] Saving settings to backend...');
          const { settingsAPI } = await import('../services/api');
          const state = get();

          console.log('[saveSettings] Current state:', {
            autoRefresh: state.autoRefresh,
            refreshInterval: state.refreshInterval,
            summaryType: state.summaryType,
            favoriteKeywords: state.favoriteKeywords
          });

          const response = await settingsAPI.updateUserSettings({
            autoRefresh: state.autoRefresh,
            refreshInterval: state.refreshInterval,
            summaryType: state.summaryType,
            favoriteKeywords: state.favoriteKeywords
          });

          console.log('[saveSettings] Save successful:', response);
          set({ isSynced: true });
        } catch (error) {
          console.error('[saveSettings] Failed to save settings to backend:', error);
          console.error('[saveSettings] Error details:', error.response?.data || error.message);
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
