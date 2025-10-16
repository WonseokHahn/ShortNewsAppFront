import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
  { value: 'economy', label: '경제' },
  { value: 'it', label: 'IT/기술' },
  { value: 'society', label: '사회' },
  { value: 'politics', label: '정치' },
  { value: 'culture', label: '문화' },
  { value: 'sports', label: '스포츠' },
  { value: 'world', label: '국제' },
];

const SENTIMENTS = [
  { value: 'positive', label: '긍정' },
  { value: 'negative', label: '부정' },
  { value: 'neutral', label: '중립' },
];

export default function NewsFilter({ filters, onFilterChange, onSearch }) {
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  const handleCategoryChange = (category) => {
    onFilterChange({ category: category === filters.category ? null : category });
  };

  const handleSentimentChange = (sentiment) => {
    onFilterChange({ sentiment: sentiment === filters.sentiment ? null : sentiment });
  };

  const hasActiveFilters = filters.category || filters.sentiment || filters.keyword;

  const clearFilters = () => {
    setKeyword('');
    onFilterChange({ category: null, sentiment: null, keyword: '' });
  };

  return (
    <div className="card mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="키워드로 뉴스 검색... (예: 삼성전자, 금리, 부동산)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          검색
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </form>

      {/* Filter Options */}
      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === cat.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              감정 분석
            </label>
            <div className="flex flex-wrap gap-2">
              {SENTIMENTS.map((sent) => (
                <button
                  key={sent.value}
                  onClick={() => handleSentimentChange(sent.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sentiment === sent.value
                      ? sent.value === 'positive'
                        ? 'bg-green-600 text-white'
                        : sent.value === 'negative'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {sent.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">활성 필터:</span>
          {filters.category && (
            <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {CATEGORIES.find((c) => c.value === filters.category)?.label}
            </span>
          )}
          {filters.sentiment && (
            <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {SENTIMENTS.find((s) => s.value === filters.sentiment)?.label}
            </span>
          )}
          {filters.keyword && (
            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              키워드: {filters.keyword}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
