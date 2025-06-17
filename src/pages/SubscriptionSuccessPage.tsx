import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePolarSubscription } from '../hooks/usePolarSubscription';
import { Crown, Check, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SubscriptionSuccessPage: React.FC = () => {
    const { user } = useAuth();
    const { syncSubscriptionData, hasActiveSubscription } = usePolarSubscription();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [checkAttempts, setCheckAttempts] = useState(0);
    const [showManualRefresh, setShowManualRefresh] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }

        // 웹훅이 구독 정보를 업데이트할 시간을 주기 위해 잠시 대기
        const checkSubscriptionStatus = async () => {
            setIsChecking(true);

            // 3초 대기 후 구독 상태 확인
            setTimeout(async () => {
                await syncSubscriptionData();
                setIsChecking(false);

                // 구독이 활성화되지 않았다면 재시도 옵션 제공
                if (!hasActiveSubscription() && checkAttempts < 3) {
                    setCheckAttempts(prev => prev + 1);
                    setTimeout(() => {
                        setIsChecking(true);
                        checkSubscriptionStatus();
                    }, 2000);
                } else if (!hasActiveSubscription()) {
                    setShowManualRefresh(true);
                }
            }, 3000);
        };

        checkSubscriptionStatus();
    }, [user, navigate, syncSubscriptionData, hasActiveSubscription, checkAttempts]);

    const handleManualRefresh = async () => {
        setIsChecking(true);
        setShowManualRefresh(false);
        await syncSubscriptionData();
        setIsChecking(false);

        if (!hasActiveSubscription()) {
            setShowManualRefresh(true);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                    <Crown className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-6">
                        결제 정보를 확인하려면 먼저 로그인해주세요.
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

    if (isChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                    <Loader className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 처리 확인 중...</h2>
                    <p className="text-gray-600 mb-4">
                        결제가 완료되었습니다. 구독 정보를 확인하고 있습니다.
                    </p>
                    {checkAttempts > 0 && (
                        <p className="text-sm text-gray-500">
                            재시도 중... ({checkAttempts}/3)
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (hasActiveSubscription()) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h2>
                    <p className="text-gray-600 mb-6">
                        프리미엄 플랜 구독이 성공적으로 활성화되었습니다.
                        이제 AI 컨설팅 서비스를 이용하실 수 있습니다.
                    </p>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center">
                            <Crown className="w-5 h-5 text-indigo-600 mr-2" />
                            <span className="text-indigo-800 font-medium">프리미엄 플랜 활성화</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            to="/consultation"
                            className="block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                        >
                            AI 컨설팅 시작하기
                        </Link>
                        <Link
                            to="/subscription"
                            className="block text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            구독 관리로 이동
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 구독이 아직 활성화되지 않은 경우
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">구독 정보 확인 중</h2>
                <p className="text-gray-600 mb-6">
                    결제가 완료되었지만 구독 정보가 아직 업데이트되지 않았습니다.
                    잠시 후 다시 확인해주세요.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                        💡 결제 처리에는 최대 몇 분이 소요될 수 있습니다.
                        웹훅을 통해 자동으로 구독 정보가 업데이트됩니다.
                    </p>
                </div>

                <div className="space-y-3">
                    {showManualRefresh && (
                        <button
                            onClick={handleManualRefresh}
                            className="flex items-center justify-center w-full bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            구독 정보 새로고침
                        </button>
                    )}
                    <Link
                        to="/subscription"
                        className="block text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        구독 관리로 이동
                    </Link>
                    <Link
                        to="/contact"
                        className="block text-gray-600 hover:text-gray-700 text-sm"
                    >
                        문제가 지속되면 고객 지원에 문의하세요
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccessPage; 