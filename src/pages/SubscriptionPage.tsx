import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePolarSubscription } from '../hooks/usePolarSubscription';
import { Crown, Check, Zap, Calendar, CreditCard, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const {
        subscription,
        polarSubscriptions,
        loading,
        hasActiveSubscription,
        hasActiveTrial,
        getTrialDaysRemaining,
        handleSubscribe,
        handleCancelSubscription,
        openCustomerPortal,
        syncSubscriptionData
    } = usePolarSubscription();

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onSubscribe = async () => {
        if (!user) return;

        setIsProcessing(true);
        setError(null);

        try {
            await handleSubscribe();
        } catch (err: any) {
            setError(err.message || '결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const onCancelSubscription = async () => {
        if (!user || !subscription) return;

        const confirmCancel = window.confirm('정말로 구독을 취소하시겠습니까?');
        if (!confirmCancel) return;

        setIsProcessing(true);
        setError(null);

        try {
            await handleCancelSubscription();
        } catch (err: any) {
            setError(err.message || '구독 취소 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const onOpenCustomerPortal = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            await openCustomerPortal();
        } catch (err: any) {
            setError(err.message || '고객 포털 열기 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const onRefreshSubscription = async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            await syncSubscriptionData();
        } catch (err: any) {
            setError(err.message || '구독 정보 새로고침 중 오류가 발생했습니다.');
        } finally {
            setIsRefreshing(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                    <Crown className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-6">
                        구독 관리를 하려면 먼저 로그인해주세요.
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
                <div className="max-w-4xl mx-auto">
                    {/* 헤더 */}
                    <div className="text-center mb-12">
                        <Crown className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">구독 관리</h1>
                        <p className="text-gray-600">AI 컨설팅 서비스 구독을 관리하세요</p>

                        {/* 새로고침 버튼 */}
                        <button
                            onClick={onRefreshSubscription}
                            disabled={isRefreshing}
                            className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? '새로고침 중...' : '구독 정보 새로고침'}
                        </button>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* 현재 구독 상태 */}
                    {subscription && (
                        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">현재 구독 상태</h2>
                                {hasActiveSubscription() && (
                                    <button
                                        onClick={onOpenCustomerPortal}
                                        disabled={isProcessing}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        결제 관리
                                    </button>
                                )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">플랜</h3>
                                    <div className="flex items-center">
                                        {subscription.plan === 'premium' ? (
                                            <Crown className="w-5 h-5 text-indigo-600 mr-2" />
                                        ) : (
                                            <div className="w-5 h-5 bg-gray-300 rounded mr-2" />
                                        )}
                                        <span className="text-lg font-semibold text-gray-900">
                                            {subscription.plan === 'premium' ? '프리미엄' : '무료'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">상태</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : subscription.status === 'trial'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {subscription.status === 'active' && '활성'}
                                        {subscription.status === 'trial' && '무료 체험'}
                                        {subscription.status === 'cancelled' && '취소됨'}
                                        {subscription.status === 'expired' && '만료됨'}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        {hasActiveTrial() ? '체험 종료일' : '갱신일'}
                                    </h3>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                        <span className="text-gray-900">
                                            {hasActiveTrial() && subscription.trial_ends_at
                                                ? new Date(subscription.trial_ends_at).toLocaleDateString()
                                                : subscription.ends_at
                                                    ? new Date(subscription.ends_at).toLocaleDateString()
                                                    : '무기한'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {hasActiveTrial() && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Zap className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="text-blue-800">
                                            무료 체험 {getTrialDaysRemaining()}일 남음
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 플랜 비교 */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
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

                            {subscription?.plan === 'free' && (
                                <div className="text-center py-2 text-gray-500 font-medium">
                                    현재 플랜
                                </div>
                            )}
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

                            {/* 버튼 영역 */}
                            {!hasActiveSubscription() ? (
                                <button
                                    onClick={onSubscribe}
                                    disabled={isProcessing}
                                    className="w-full bg-white text-indigo-600 py-3 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? '처리 중...' : hasActiveTrial() ? '프리미엄으로 업그레이드' : '7일 무료 체험 시작'}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-center py-2 text-indigo-200 font-medium">
                                        현재 플랜
                                    </div>
                                    <button
                                        onClick={onCancelSubscription}
                                        disabled={isProcessing}
                                        className="w-full bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? '처리 중...' : '구독 취소'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 결제 내역 (프리미엄 사용자만) */}
                    {hasActiveSubscription() && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">결제 내역</h2>
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>결제 내역이 없습니다.</p>
                                <p className="text-sm">결제 처리 시스템이 완성되면 여기에 표시됩니다.</p>
                            </div>
                        </div>
                    )}

                    {/* Polar 구독 정보 (디버깅용) */}
                    {polarSubscriptions && polarSubscriptions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Polar 구독 정보</h2>
                            <div className="space-y-4">
                                {polarSubscriptions.map((polarSub, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">상태</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${polarSub.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {polarSub.status}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">현재 기간 종료</h4>
                                                <span className="text-gray-900">
                                                    {polarSub.current_period_end
                                                        ? new Date(polarSub.current_period_end).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">취소 예정</h4>
                                                <span className="text-gray-900">
                                                    {polarSub.cancel_at_period_end ? '예' : '아니오'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage; 