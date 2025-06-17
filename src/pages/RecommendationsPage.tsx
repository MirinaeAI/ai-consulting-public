import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FavoriteButton from '../components/FavoriteButton';

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  price_min: number | null;
  price_max: number | null;
  is_free_tier: boolean;
}

interface Recommendation {
  id: string;
  tool_id: string;
  order: number;
  tool: Tool;
}

const RecommendationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .select(`
            id,
            tool_id,
            order,
            tool:tools (
              id,
              name,
              description,
              url,
              price_min,
              price_max,
              is_free_tier
            )
          `)
          .eq('consultation_id', id)
          .order('order');

        if (error) throw error;

        setRecommendations(data || []);
      } catch (err) {
        console.error('추천 결과를 불러오는 중 오류가 발생했습니다:', err);
        setError('추천 결과를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRecommendations();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">맞춤 도구 추천</h1>
          <p className="text-gray-600">
            상담 내용을 바탕으로 다음과 같은 도구들을 추천드립니다.
          </p>
        </div>
        
        <div className="space-y-8">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{recommendation.tool.name}</h3>
                </div>
                <FavoriteButton toolId={recommendation.tool.id} />
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 mb-4">{recommendation.tool.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {recommendation.tool.is_free_tier && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                      무료 요금제 제공
                    </span>
                  )}
                  
                  {(recommendation.tool.price_min !== null || recommendation.tool.price_max !== null) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {recommendation.tool.price_min === 0 ? '무료' : `${recommendation.tool.price_min?.toLocaleString()}원`}
                      {recommendation.tool.price_max !== null && ` ~ ${recommendation.tool.price_max.toLocaleString()}원`}
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  <a
                    href={recommendation.tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                  >
                    웹사이트 방문
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">아직 추천된 도구가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;