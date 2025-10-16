import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Settings } from 'lucide-react';

const navigation = [
  { name: '뉴스 피드', to: '/', icon: Home },
  { name: '통계', to: '/stats', icon: BarChart3 },
  { name: '설정', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version Info */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Version 1.0.0
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Powered by GPT-4o mini
        </p>
      </div>
    </aside>
  );
}
