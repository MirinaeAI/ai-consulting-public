import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Bookmark, Star, TrendingUp } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  price_min: number | null;
  price_max: number | null;
  is_free_tier: boolean | null;
  categories: string[];
}

interface PopularTool extends Tool {
  saved_count: number;
}

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Tool[]>([]);
  const [popularTools, setPopularTools] = useState<PopularTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 즐겨찾기 목록 가져오기
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select(`
            tools (
              id,
              name,
              description,
              url,
              price_min,
              price_max,
              is_free_tier,
              tool_categories (
                categories (
                  name
                )
              )
            )
          `)
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        const formattedFavorites = favoritesData.map(f => ({
          ...f.tools,
          categories: f.tools.tool_categories.map((tc: any) => tc.categories.name)
        }));

        setFavorites(formattedFavorites);

        // 인기 도구 목록 가져오기
        const { data: popularData, error: popularError } = await supabase
          .from('popular_tools')
          .select('*')
          .limit(10);

        if (popularError) throw popularError;
        setPopularTools(popularData || []);

      } catch (err: any) {
        console.error('데이터 로딩 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const removeFavorite = async (toolId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('tool_id', toolId);

      if (error) throw error;

      setFavorites(prev => prev.filter(tool => tool.id !== toolId));
    } catch (err: any) {
      console.error('즐겨찾기 삭제 오류:', err);
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">즐겨찾기를 보려면 먼저 로그인해주세요.</p>
          <Link
            to="/signin"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 즐겨찾기 섹션 */}
            <div>
              <div className="flex items-center mb-6">
                <Star className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">저장한 도구</h2>
              </div>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-4">아직 저장한 도구가 없습니다.</p>
                  <Link
                    to="/tools"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    도구 갤러리 둘러보기
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map(tool => (
                    <div key={tool.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                        <button
                          onClick={() => removeFavorite(tool.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Bookmark className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      <div className="mb-4">
                        {tool.categories.map(category => (
                          <span
                            key={category}
                            className="inline-block bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm mr-2 mb-2"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {tool.is_free_tier && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                              무료 플랜
                            </span>
                          )}
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {tool.price_min === 0 ? '무료' : `${tool.price_min}$`}
                            {tool.price_max ? ` - ${tool.price_max}$` : '+'}
                          </span>
                        </div>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          웹사이트 방문
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 인기 도구 섹션 */}
            <div>
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">이번 주 인기 도구</h2>
              </div>

              <div className="space-y-4">
                {popularTools.map((tool, index) => (
                  <div key={tool.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-indigo-600 mr-3">
                          #{index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Bookmark className="w-4 h-4 mr-1" />
                        <span>{tool.saved_count}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {tool.is_free_tier && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                            무료 플랜
                          </span>
                        )}
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {tool.price_min === 0 ? '무료' : `${tool.price_min}$`}
                          {tool.price_max ? ` - ${tool.price_max}$` : '+'}
                        </span>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        웹사이트 방문
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;