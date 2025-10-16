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

// Settings store
export const useSettingsStore = create(
  persist(
    (set) => ({
      autoRefresh: true,
      refreshInterval: 5, // minutes
      summaryType: 'compact', // compact or detailed
      favoriteKeywords: [],
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setSummaryType: (summaryType) => set({ summaryType }),
      addFavoriteKeyword: (keyword) =>
        set((state) => ({
          favoriteKeywords: [...state.favoriteKeywords, keyword],
        })),
      removeFavoriteKeyword: (keyword) =>
        set((state) => ({
          favoriteKeywords: state.favoriteKeywords.filter((k) => k !== keyword),
        })),
      setFavoriteKeywords: (keywords) => set({ favoriteKeywords: keywords }),
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
