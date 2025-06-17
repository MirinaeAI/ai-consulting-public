import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      {/* 히어로 섹션 */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            당신에게 딱 맞는 AI 솔루션을 찾아드립니다
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            비즈니스 상황, 조직 규모, 예산에 맞는 최적의 AI 도구 조합을 5분 안에 추천해 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/consultation"
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              맞춤 추천 받기
            </Link>
            <Link
              to="/tools"
              className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              도구 갤러리 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">왜 AI 툴 추천 서비스인가요?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">맞춤형 추천</h3>
              <p className="text-gray-600">
                당신의 비즈니스 상황과 예산에 맞는 최적의 AI 도구 조합을 추천해 드립니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">시간 절약</h3>
              <p className="text-gray-600">
                수많은 AI 도구를 직접 비교하는 시간을 절약하고, 검증된 추천을 받아보세요.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">전문가 조언</h3>
              <p className="text-gray-600">
                AI 전문가의 조언을 바탕으로 최신 트렌드와 효과적인 도입 전략을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 px-4 bg-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">지금 바로 시작하세요</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            5분 안에 당신의 비즈니스에 맞는 AI 솔루션을 찾아보세요.
          </p>
          {user ? (
            <Link
              to="/consultation"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              맞춤 추천 받기
            </Link>
          ) : (
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              무료로 가입하기
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;