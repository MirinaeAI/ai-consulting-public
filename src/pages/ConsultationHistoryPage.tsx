import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { History, Calendar, Clock } from 'lucide-react';

interface Consultation {
  id: string;
  purpose: string;
  org_size: string | null;
  budget: number | null;
  created_at: string;
  recommendations: {
    id: string;
    tool: {
      name: string;
      description: string;
    };
  }[];
}

const ConsultationHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchConsultations = async () => {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            *,
            recommendations (
              id,
              tool: tools (
                name,
                description
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConsultations(data || []);
      } catch (err: any) {
        console.error('상담 내역 로딩 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">상담 내역을 보려면 먼저 로그인해주세요.</p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
              >
                다시 시도하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <History className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">상담 내역</h1>
          </div>

          {consultations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">아직 상담 내역이 없습니다</h2>
              <p className="text-gray-600 mb-6">
                AI 전문가와 상담을 통해 최적의 AI 도구를 추천받아보세요.
              </p>
              <Link
                to="/consultation"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
              >
                상담 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {consultation.purpose}
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(consultation.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(consultation.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/recommendations/${consultation.id}`}
                        className="inline-block bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100"
                      >
                        추천 결과 보기
                      </Link>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">조직 규모</span>
                          <p className="text-gray-900">{consultation.org_size || '미지정'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">예산</span>
                          <p className="text-gray-900">
                            {consultation.budget
                              ? `${consultation.budget.toLocaleString()}원`
                              : '미지정'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">추천된 도구</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {consultation.recommendations.map((rec) => (
                            <span
                              key={rec.id}
                              className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700"
                            >
                              {rec.tool.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistoryPage;