import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    createCheckoutSession,
    getOrCreateCustomer,
    setupWebhook
} from '../lib/polar';

interface Subscription {
    id: string;
    user_id: string;
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    starts_at: string;
    ends_at?: string | null;
    trial_ends_at?: string | null;
    stripe_subscription_id?: string | null;
    stripe_customer_id?: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const usePolarSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    // 구독 데이터 동기화 (웹훅에 의해 자동 업데이트됨)
    const syncSubscriptionData = async () => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Supabase에서 구독 정보 가져오기
            const { data: supabaseSubscription, error: supabaseError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (supabaseError && supabaseError.code !== 'PGRST116') {
                console.error('Supabase 구독 조회 오류:', supabaseError);
                return;
            }

            setSubscription(supabaseSubscription);

        } catch (error) {
            console.error('구독 데이터 동기화 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 실시간 구독 변경 감지 (웹훅으로 업데이트된 데이터 실시간 반영)
    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel('subscription_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('구독 정보 실시간 업데이트:', payload);

                    if (payload.eventType === 'DELETE') {
                        setSubscription(null);
                    } else {
                        setSubscription(payload.new as Subscription);
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    // 구독하기 (웹훅이 결제 완료 후 자동으로 구독 정보 업데이트)
    const handleSubscribe = async () => {
        if (!user) throw new Error('로그인이 필요합니다.');

        try {
            console.log('구독 처리 시작:', user.email);

            // 웹훅 엔드포인트 확인 (개발용)
            const webhookUrl = await setupWebhook();
            console.log('웹훅 엔드포인트 설정됨:', webhookUrl);

            // 이메일 기반으로 체크아웃 세션 생성
            const checkoutUrl = await createCheckoutSession(user.email);

            console.log('체크아웃 URL 생성 성공:', checkoutUrl);

            // 체크아웃 페이지로 리다이렉트
            // 결제 완료 후 웹훅이 자동으로 구독 정보를 업데이트함
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('구독 처리 오류:', error);
            throw error;
        }
    };

    // 구독 취소 (웹훅이 취소 후 자동으로 구독 정보 업데이트)
    const handleCancelSubscription = async () => {
        if (!user) throw new Error('로그인이 필요합니다.');

        try {
            // Supabase에서 구독 상태 업데이트 (임시)
            // 실제로는 Polar API를 통해 취소하고 웹훅으로 업데이트되어야 함
            await supabase
                .from('subscriptions')
                .update({
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            console.log('구독 취소 요청 완료');

        } catch (error) {
            console.error('구독 취소 오류:', error);
            throw error;
        }
    };

    // 고객 포털 열기
    const openCustomerPortal = async () => {
        if (!user) throw new Error('로그인이 필요합니다.');

        try {
            // 고객 정보 가져오기 또는 생성
            const customer = await getOrCreateCustomer(user.email, user.user_metadata?.full_name);

            // 임시로 Polar 대시보드로 리다이렉트
            window.open('https://polar.sh/dashboard', '_blank');

        } catch (error) {
            console.error('고객 포털 열기 오류:', error);
            throw error;
        }
    };

    // 활성 구독 여부 확인
    const hasActiveSubscription = (): boolean => {
        if (!subscription) return false;
        return subscription.status === 'active' && subscription.plan === 'premium';
    };

    // 활성 트라이얼 여부 확인
    const hasActiveTrial = (): boolean => {
        if (!subscription) return false;
        if (subscription.status !== 'trial') return false;
        if (!subscription.trial_ends_at) return false;

        const trialEndDate = new Date(subscription.trial_ends_at);
        return trialEndDate > new Date();
    };

    // 트라이얼 남은 일수 계산
    const getTrialDaysRemaining = (): number => {
        if (!subscription?.trial_ends_at) return 0;

        const trialEndDate = new Date(subscription.trial_ends_at);
        const today = new Date();
        const diffTime = trialEndDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    };

    // AI 컨설팅 이용 가능 여부 확인
    const canUseConsultation = (): boolean => {
        return hasActiveSubscription() || hasActiveTrial();
    };

    // 웹훅 상태 확인 (개발용)
    const checkWebhookStatus = async () => {
        try {
            const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/polar-webhook`;

            // 웹훅 엔드포인트 테스트
            const response = await fetch(webhookUrl, {
                method: 'OPTIONS',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('웹훅 상태:', response.status === 200 ? '정상' : '오류');
            return response.status === 200;

        } catch (error) {
            console.error('웹훅 상태 확인 오류:', error);
            return false;
        }
    };

    useEffect(() => {
        syncSubscriptionData();

        // 웹훅 상태 확인 (개발용)
        checkWebhookStatus();
    }, [user]);

    return {
        subscription,
        polarSubscriptions: [], // 빈 배열로 호환성 유지
        loading,
        hasActiveSubscription,
        hasActiveTrial,
        getTrialDaysRemaining,
        canUseConsultation,
        handleSubscribe,
        handleCancelSubscription,
        openCustomerPortal,
        syncSubscriptionData,
        checkWebhookStatus
    };
}; 