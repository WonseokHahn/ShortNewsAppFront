import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader, AlertCircle, Sparkles } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import NewsFilter from '../components/NewsFilter';
import { newsAPI } from '../services/api';
import { useNewsStore, useSettingsStore, useAuthStore } from '../store/useStore';

export default function HomePage() {
  const { news, loading, error, filters, setNews, setLoading, setError, setFilters } = useNewsStore();
  const { autoRefresh, refreshInterval, favoriteKeywords } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // For non-authenticated users, ignore favorite keywords
  const activeFavoriteKeywords = isAuthenticated ? favoriteKeywords : [];

  // Trending news fetch function
  const fetchTrendingNews = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await newsAPI.getTrendingNews();
      setNews(response.data.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching trending news:', err);
      setError('뉴스를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setNews]);

  // Main fetch function that uses favorites if available, otherwise trending
  const fetchNews = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      // If user is authenticated and has favorite keywords, fetch news for each keyword
      if (activeFavoriteKeywords && activeFavoriteKeywords.length > 0) {
        const allNews = [];

        for (const keyword of activeFavoriteKeywords) {
          try {
            const response = await newsAPI.searchNews(keyword, 10, true);
            // Add the source keyword to each news item
            const newsWithKeyword = response.data.data.map(item => ({
              ...item,
              sourceKeyword: keyword
            }));
            allNews.push(...newsWithKeyword);
          } catch (err) {
            console.error(`Error fetching news for keyword "${keyword}":`, err);
          }
        }

        // Remove duplicates based on newsId or news_id
        const uniqueNews = allNews.filter((news, index, self) =>
          index === self.findIndex(n =>
            (n.newsId || n.news_id) === (news.newsId || news.news_id)
          )
        );

        // Sort by publication date (newest first)
        uniqueNews.sort((a, b) => {
          const dateA = new Date(a.pubDate || a.pub_date);
          const dateB = new Date(b.pubDate || b.pub_date);
          return dateB - dateA;
        });

        setNews(uniqueNews);
      } else {
        // No favorites or not authenticated, fetch trending news
        await fetchTrendingNews(silent);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('뉴스를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [activeFavoriteKeywords, setLoading, setError, setNews, fetchTrendingNews]);

  // Fetch news based on favorite keywords or trending if none
  useEffect(() => {
    if (news.length === 0) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh setup (only for authenticated users)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchNews(true);
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, refreshInterval, fetchNews]);

  const handleSearch = async (keyword) => {
    if (!keyword.trim()) {
      fetchNews();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFilters({ keyword });

      const response = await newsAPI.searchNews(keyword, 20, true);
      // Add the source keyword to search results
      const newsWithKeyword = response.data.data.map(item => ({
        ...item,
        sourceKeyword: keyword
      }));
      setNews(newsWithKeyword);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error searching news:', err);
      setError('검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);

    // If category filter is applied, fetch by category
    if (newFilters.category) {
      try {
        setLoading(true);
        setError(null);

        const response = await newsAPI.getNewsByCategory(newFilters.category, 20);
        setNews(response.data.data);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Error fetching category news:', err);
        setError('카테고리 뉴스를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter news by sentiment if needed (client-side)
  const filteredNews = filters.sentiment
    ? news.filter((item) => item.sentiment === filters.sentiment)
    : news;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
            AI 뉴스 피드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            실시간 뉴스 요약 및 감정 분석
          </p>
        </div>
        <button
          onClick={() => fetchNews()}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* Last Refresh Time */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        마지막 업데이트: {lastRefresh.toLocaleTimeString('ko-KR')}
        {isAuthenticated && autoRefresh && ` (${refreshInterval >= 60 ? `${refreshInterval / 60}시간` : `${refreshInterval}분`}마다 자동 새로고침)`}
      </div>

      {/* Favorite Keywords Info */}
      {isAuthenticated && activeFavoriteKeywords && activeFavoriteKeywords.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>즐겨찾기 키워드로 뉴스 표시 중:</strong>{' '}
            <span className="font-medium">{activeFavoriteKeywords.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Filters */}
      <NewsFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">뉴스를 분석하는 중...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            GPT가 요약 및 감정 분석을 수행하고 있습니다
          </p>
        </div>
      )}

      {/* News Grid */}
      {!loading && filteredNews.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            총 <strong className="text-primary-600 dark:text-primary-400">{filteredNews.length}</strong>개의 뉴스
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map((item, index) => (
              <NewsCard key={item.newsId || item.news_id || index} news={item} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredNews.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            뉴스가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            다른 키워드나 필터로 검색해보세요
          </p>
          <button onClick={() => fetchNews()} className="btn-primary">
            뉴스 새로고침
          </button>
        </div>
      )}
    </div>
  );
}
