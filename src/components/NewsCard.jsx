import { useEffect } from 'react';
import { ExternalLink, Clock, TrendingUp, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { settingsAPI } from '../services/api';
import { useAuthStore } from '../store/useStore';

export default function NewsCard({ news }) {
  const { isAuthenticated } = useAuthStore();

  // Track news view for statistics (only once per card mount)
  useEffect(() => {
    const newsId = news.id || news.news_id || news.newsId;
    console.log('[NewsCard] useEffect triggered');
    console.log('[NewsCard] - isAuthenticated:', isAuthenticated);
    console.log('[NewsCard] - newsId:', newsId);
    console.log('[NewsCard] - news object keys:', Object.keys(news));

    if (!isAuthenticated) {
      console.log('[NewsCard] Skipping - not authenticated');
      return;
    }

    if (!newsId) {
      console.error('[NewsCard] ERROR: No news ID found!');
      console.error('[NewsCard] News object:', news);
      return;
    }

    console.log('[NewsCard] ✓ Calling trackNewsView for ID:', newsId);
    settingsAPI.trackNewsView(newsId)
      .then((response) => {
        console.log('[NewsCard] ✓ Successfully tracked news ID:', newsId);
        console.log('[NewsCard] Response:', response.data);
      })
      .catch(err => {
        console.error('[NewsCard] ✗ Failed to track news ID:', newsId);
        console.error('[NewsCard] Error:', err.response?.data || err.message);
      });
  }, [isAuthenticated, news]);

  const getSentimentBadge = (sentiment, confidence) => {
    const badges = {
      positive: 'badge-positive',
      negative: 'badge-negative',
      neutral: 'badge-neutral',
    };

    const sentimentText = {
      positive: '긍정',
      negative: '부정',
      neutral: '중립',
    };

    return (
      <span className={badges[sentiment] || badges.neutral}>
        {sentimentText[sentiment] || '중립'} ({Math.round((confidence || 0.5) * 100)}%)
      </span>
    );
  };

  return (
    <div className="card hover:scale-[1.02] transition-transform duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1 mr-2 line-clamp-2">
          {news.title}
        </h3>
        <a
          href={news.originalLink || news.original_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          aria-label="Open article"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Summary */}
      {(news.summary || news.summary_text) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-primary-600 dark:text-primary-400">AI 요약:</strong>{' '}
            {news.summary || news.summary_text}
          </p>
        </div>
      )}

      {/* Original Description */}
      {news.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {news.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* Sentiment */}
        {news.sentiment && getSentimentBadge(news.sentiment, news.sentimentConfidence || news.confidence)}

        {/* Source Keyword (if fetched via favorite keyword) */}
        {news.sourceKeyword && (
          <div className="flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700">
            <Search className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium">{news.sourceKeyword}</span>
          </div>
        )}

        {/* Date */}
        {(news.pubDate || news.pub_date) && (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              {format(new Date(news.pubDate || news.pub_date), 'MM월 dd일 HH:mm', { locale: ko })}
            </span>
          </div>
        )}

        {/* Category */}
        {news.category && (
          <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {news.category}
          </span>
        )}
      </div>

      {/* Keywords */}
      {news.keywords && news.keywords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400 mt-1" />
            {news.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment Reason */}
      {(news.sentimentReason || news.reason) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            {news.sentimentReason || news.reason}
          </p>
        </div>
      )}
    </div>
  );
}
