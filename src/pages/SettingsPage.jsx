import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, X, Cloud, HardDrive } from 'lucide-react';
import { useSettingsStore, useAuthStore } from '../store/useStore';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const [savedMessage, setSavedMessage] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // Load settings from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      settings.loadSettings();
    }
  }, [isAuthenticated]);

  const handleSave = () => {
    setSavedMessage('설정이 저장되었습니다!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    settings.addFavoriteKeyword(newKeyword.trim());
    setNewKeyword('');
    handleSave();
  };

  const handleRemoveKeyword = (keyword) => {
    settings.removeFavoriteKeyword(keyword);
    handleSave();
  };

  const favoritesList = settings.favoriteKeywords.map((k) => ({ keyword: k }));

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          설정
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-gray-600 dark:text-gray-400">
            앱 맞춤 설정 및 즐겨찾기 관리
          </p>
          {isAuthenticated && (
            <div className="flex items-center gap-1 text-xs">
              {settings.isSynced ? (
                <>
                  <Cloud className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">클라우드 동기화됨</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">로컬 저장</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
          <p className="text-green-800 dark:text-green-300">{savedMessage}</p>
        </div>
      )}

      {/* Auto Refresh Settings */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          자동 새로고침
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                자동 새로고침 활성화
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                설정한 시간마다 자동으로 뉴스를 새로고침합니다
              </p>
            </div>
            <button
              onClick={() => {
                settings.setAutoRefresh(!settings.autoRefresh);
                handleSave();
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.autoRefresh ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                새로고침 간격
              </label>
              <div className="flex flex-wrap gap-2">
                {[60, 120, 180, 240, 360].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      settings.setRefreshInterval(minutes);
                      handleSave();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.refreshInterval === minutes
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {minutes / 60}시간
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                긴 간격으로 설정하면 API 비용이 절약됩니다
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Type Settings */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          요약 스타일
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              settings.setSummaryType('compact');
              handleSave();
            }}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              settings.summaryType === 'compact'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">간결형 (3문장)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  핵심 내용만 빠르게 파악
                </p>
              </div>
              {settings.summaryType === 'compact' && (
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => {
              settings.setSummaryType('detailed');
              handleSave();
            }}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              settings.summaryType === 'detailed'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">상세형 (5문장)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  자세한 내용 포함
                </p>
              </div>
              {settings.summaryType === 'detailed' && (
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Favorite Keywords */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          즐겨찾기 키워드
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          자주 검색하는 키워드를 저장하세요. 홈페이지에서 이 키워드들로 자동 검색됩니다.
          {!isAuthenticated && ' (로그인하면 클라우드에 저장됩니다)'}
        </p>

        {/* Add Keyword */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="키워드 입력 (예: 삼성전자, 금리)"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            className="input flex-1"
          />
          <button onClick={handleAddKeyword} className="btn-primary">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Keywords List */}
        {favoritesList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favoritesList.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg"
              >
                <span>{item.keyword}</span>
                <button
                  onClick={() => handleRemoveKeyword(item.keyword)}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            저장된 키워드가 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
