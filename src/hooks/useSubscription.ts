import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface Subscription {
    id: string;
    user_id: string;
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    starts_at: string;
    ends_at: string | null;
    trial_ends_at: string | null;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
}

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = async () => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            setSubscription(data || null);
            setError(null);
        } catch (err: any) {
            console.error('구독 정보 로딩 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const hasActiveSubscription = () => {
        if (!subscription) return false;
        return subscription.status === 'active' &&
            (subscription.ends_at === null || new Date(subscription.ends_at) > new Date());
    };

    const hasActiveTrial = () => {
        if (!subscription) return false;
        return subscription.status === 'trial' &&
            subscription.trial_ends_at &&
            new Date(subscription.trial_ends_at) > new Date();
    };

    const canUseConsultation = () => {
        return hasActiveSubscription() || hasActiveTrial();
    };

    const getTrialDaysRemaining = () => {
        if (!subscription || !subscription.trial_ends_at) return 0;
        const now = new Date();
        const trialEnd = new Date(subscription.trial_ends_at);
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    return {
        subscription,
        loading,
        error,
        hasActiveSubscription,
        hasActiveTrial,
        canUseConsultation,
        getTrialDaysRemaining,
        refetch: fetchSubscription
    };
} 