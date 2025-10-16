import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, Activity, Hash, Loader } from 'lucide-react';
import { newsAPI } from '../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatsPage() {
  const [sentimentStats, setSentimentStats] = useState(null);
  const [keywordStats, setKeywordStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [sentimentRes, keywordRes] = await Promise.all([
        newsAPI.getSentimentStats({ days }),
        newsAPI.getKeywordStats({ days, limit: 10 }),
      ]);

      setSentimentStats(sentimentRes.data);
      setKeywordStats(keywordRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sentiment Pie Chart Data
  const sentimentChartData = sentimentStats ? {
    labels: sentimentStats.data.map((item) => {
      const labels = { positive: '긍정', negative: '부정', neutral: '중립' };
      return labels[item.sentiment] || item.sentiment;
    }),
    datasets: [
      {
        data: sentimentStats.data.map((item) => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Green for positive
          'rgba(239, 68, 68, 0.8)',  // Red for negative
          'rgba(156, 163, 175, 0.8)', // Gray for neutral
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  // Keyword Bar Chart Data
  const keywordChartData = keywordStats ? {
    labels: keywordStats.data.map((item) => item.keyword),
    datasets: [
      {
        label: '뉴스 빈도',
        data: keywordStats.data.map((item) => item.frequency),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        },
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">통계를 로드하는 중...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary-600" />
          뉴스 통계 대시보드
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          감정 분석 및 키워드 트렌드
        </p>
      </div>

      {/* Period Selector */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          분석 기간
        </label>
        <div className="flex gap-2">
          {[1, 7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {d === 1 ? '오늘' : `${d}일`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {sentimentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">긍정 뉴스</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-300 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'positive')?.count || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'positive')?.percentage || 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">부정 뉴스</p>
                <p className="text-3xl font-bold text-red-800 dark:text-red-300 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'negative')?.count || 0}
                </p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'negative')?.percentage || 0}%
                </p>
              </div>
              <Activity className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">중립 뉴스</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-300 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'neutral')?.count || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">
                  {sentimentStats.data.find((s) => s.sentiment === 'neutral')?.percentage || 0}%
                </p>
              </div>
              <Hash className="w-12 h-12 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Pie Chart */}
        {sentimentChartData && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              감정 분포
            </h2>
            <div className="h-80">
              <Pie data={sentimentChartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              총 {sentimentStats?.total || 0}개의 뉴스 분석
            </div>
          </div>
        )}

        {/* Keyword Bar Chart */}
        {keywordChartData && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              인기 키워드 Top 10
            </h2>
            <div className="h-80">
              <Bar data={keywordChartData} options={barChartOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              최근 {days}일간 키워드 빈도
            </div>
          </div>
        )}
      </div>

      {/* Keyword List */}
      {keywordStats && keywordStats.data.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            상세 키워드 통계
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">순위</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">키워드</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">빈도</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">감정</th>
                </tr>
              </thead>
              <tbody>
                {keywordStats.data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">#{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.keyword}</td>
                    <td className="py-3 px-4 text-right text-primary-600 dark:text-primary-400 font-semibold">
                      {item.frequency}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {item.sentiments?.map((s, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 text-xs rounded ${
                              s === 'positive'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : s === 'negative'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {s === 'positive' ? '긍정' : s === 'negative' ? '부정' : '중립'}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
