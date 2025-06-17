import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AI 툴 추천</h3>
            <p className="text-gray-300">
              당신의 비즈니스 상황에 맞는 최적의 AI 솔루션을 찾아드립니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">문의하기</h3>
            <p className="text-gray-300">
              이메일: contact@aitoolrecommender.com<br />
              전화: 02-123-4567
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">광고 문의</h3>
            <p className="text-gray-300 mb-2">
              플랫폼에 광고하고 싶으신가요?
            </p>
            <Link
              to="/advertiser-inquiry"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              광고주 문의하기
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} AI 툴 추천 서비스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;