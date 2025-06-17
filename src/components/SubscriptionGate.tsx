import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { Crown, Clock, Zap, Check } from 'lucide-react';

interface SubscriptionGateProps {
    children: React.ReactNode;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
    const { user } = useAuth();
    const { loading, canUseConsultation, hasActiveTrial, getTrialDaysRemaining } = useSubscription();

    // 로딩 중일 때
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // 로그인하지 않은 사용자
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                    <Crown className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-6">
                        AI 컨설팅 서비스를 이용하려면 먼저 로그인해주세요.
                    </p>
                    <Link
                        to="/signin"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                    >
                        로그인하기
                    </Link>
                </div>
            </div>
        );
    }

    // 구독이나 트라이얼이 있는 사용자
    if (canUseConsultation()) {
        // 트라이얼 사용자에게는 남은 일수 표시
        if (hasActiveTrial()) {
            const daysRemaining = getTrialDaysRemaining();
            return (
                <div className="relative">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4">
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-yellow-800 text-sm">
                                무료 트라이얼 {daysRemaining}일 남음
                            </span>
                            <Link
                                to="/subscription"
                                className="ml-auto text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                            >
                                프리미엄 업그레이드 →
                            </Link>
                        </div>
                    </div>
                    {children}
                </div>
            );
        }

        return <>{children}</>;
    }

    // 구독이 없는 사용자에게 결제 안내
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <Crown className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            AI 컨설팅 서비스
                        </h1>
                        <p className="text-xl text-gray-600">
                            전문가급 AI 도구 추천을 받으려면 프리미엄 플랜이 필요합니다
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* 무료 플랜 */}
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">무료 플랜</h3>
                                <div className="text-3xl font-bold text-gray-600">₩0</div>
                                <div className="text-gray-500">영구 무료</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-3" />
                                    <span>AI 도구 갤러리 이용</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-3" />
                                    <span>즐겨찾기 기능</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-3" />
                                    <span>기본 검색 및 필터</span>
                                </li>
                            </ul>

                            <Link
                                to="/tools"
                                className="w-full block text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
                            >
                                도구 갤러리 이용하기
                            </Link>
                        </div>

                        {/* 프리미엄 플랜 */}
                        <div className="bg-indigo-600 text-white rounded-lg shadow-lg p-8 relative">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-indigo-900 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                                추천
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">프리미엄 플랜</h3>
                                <div className="text-3xl font-bold">₩9,900</div>
                                <div className="text-indigo-200">월 구독</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-indigo-200 mr-3" />
                                    <span>무료 플랜의 모든 기능</span>
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                                    <span>AI 맞춤 컨설팅</span>
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                                    <span>전문가급 도구 추천</span>
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                                    <span>상담 내역 저장</span>
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                                    <span>우선 고객 지원</span>
                                </li>
                            </ul>

                            <Link
                                to="/subscription"
                                className="w-full block text-center bg-white text-indigo-600 py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors"
                            >
                                7일 무료 체험 시작
                            </Link>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            궁금한 점이 있으신가요?
                        </p>
                        <Link
                            to="/contact"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            문의하기 →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionGate; 