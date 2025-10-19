import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useThemeStore, useAuthStore, useSettingsStore } from './store/useStore';

function App() {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const settings = useSettingsStore();

  useEffect(() => {
    // Ensure theme class is applied on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load user settings from backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[App.jsx] User logged in, loading settings from DB...');
      settings.loadSettings().then((data) => {
        console.log('[App.jsx] Settings loaded:', data);
      });
    } else {
      console.log('[App.jsx] User logged out, using default settings');
    }
  }, [isAuthenticated, settings.loadSettings]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
