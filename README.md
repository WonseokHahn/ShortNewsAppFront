# NewsInsight.AI - Frontend

React-based frontend for AI-powered news summarization and sentiment analysis.

## Features

- Modern, responsive UI with Tailwind CSS
- Dark mode support
- Real-time news feed with AI summaries
- Sentiment analysis visualization
- Keyword-based filtering
- Statistics dashboard with Chart.js
- User authentication
- Auto-refresh functionality
- Customizable settings

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   ├── NewsCard.jsx
│   │   └── NewsFilter.jsx
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── StatsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── store/          # State management
│   │   └── useStore.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Features Overview

### 1. News Feed (HomePage)
- Display trending news from multiple categories
- AI-powered summaries (3-sentence format)
- Sentiment badges (positive/negative/neutral)
- Keyword tags
- Auto-refresh every N minutes
- Search by keyword
- Filter by category and sentiment

### 2. Statistics Dashboard (StatsPage)
- Sentiment distribution pie chart
- Top keywords bar chart
- Detailed keyword statistics table
- Customizable time periods (1, 7, 14, 30 days)
- Summary cards with counts and percentages

### 3. Settings (SettingsPage)
- Auto-refresh toggle and interval
- Summary type selection (compact/detailed)
- Favorite keywords management
- Cloud sync with authentication

### 4. Authentication
- User registration and login
- JWT token-based auth
- Profile management
- Favorite keywords sync

### 5. Theme Support
- Dark mode toggle
- Persistent theme preference
- Smooth transitions
- Custom color schemes

## API Integration

The frontend communicates with the backend API:

```javascript
// Example API calls
import { newsAPI, authAPI } from './services/api';

// Fetch trending news
const news = await newsAPI.getTrendingNews();

// Search news by keyword
const results = await newsAPI.searchNews('삼성전자', 20);

// Get sentiment statistics
const stats = await newsAPI.getSentimentStats({ days: 7 });

// User login
const response = await authAPI.login({ username, password });
```

## State Management

Using Zustand for global state:

```javascript
// Theme store
const { theme, toggleTheme } = useThemeStore();

// Auth store
const { user, isAuthenticated, login, logout } = useAuthStore();

// News store
const { news, loading, filters, setNews, setFilters } = useNewsStore();

// Settings store
const { autoRefresh, refreshInterval, setAutoRefresh } = useSettingsStore();
```

## Styling

Tailwind CSS utility classes with custom components:

```jsx
<div className="card">         {/* White/dark card with shadow */}
<button className="btn-primary"> {/* Primary button */}
<span className="badge-positive"> {/* Positive sentiment badge */}
```

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Adaptive layouts for all screen sizes
- Touch-friendly interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React Router
- Lazy loading for heavy components
- Optimized bundle size
- Efficient re-renders with proper state management
- Image optimization
- API request caching

## License

MIT
