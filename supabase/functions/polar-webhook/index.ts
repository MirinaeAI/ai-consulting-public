import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Webhooks } from "jsr:@polar-sh/deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PolarWebhookPayload {
    type: string;
    data: {
        id: string;
        customer?: {
            id: string;
            email: string;
        };
        subscription?: {
            id: string;
            status: string;
            current_period_start: string;
            current_period_end: string;
            customer_id: string;
            customer?: {
                id: string;
                email: string;
            };
        };
        order?: {
            id: string;
            customer_id: string;
            customer?: {
                id: string;
                email: string;
            };
        };
        // 직접 속성들 (이벤트에 따라 다를 수 있음)
        status?: string;
        current_period_start?: string;
        current_period_end?: string;
        customer_id?: string;
        customer_email?: string;
        [key: string]: any;
    };
}

serve(async (req) => {
    // CORS 처리
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    // Polar 웹훅 핸들러 생성

    console.log(Deno.env.get('POLAR_WEBHOOK_SECRET'))
    const webhookHandler = Webhooks({
        webhookSecret: Deno.env.get('POLAR_WEBHOOK_SECRET'),
        onPayload: async (payload: PolarWebhookPayload) => {
            console.log('Polar 웹훅 이벤트 수신:', payload.type)

            // Supabase 클라이언트 초기화
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            const supabase = createClient(supabaseUrl, supabaseServiceKey)

            try {
                // 이벤트 타입별 처리
                switch (payload.type) {
                    case 'subscription.created':
                    case 'subscription.updated':
                        await handleSubscriptionEvent(supabase, payload)
                        break

                    case 'subscription.cancelled':
                        await handleSubscriptionCancellation(supabase, payload)
                        break

                    case 'order.created':
                        await handleOrderCreated(supabase, payload)
                        break

                    default:
                        console.log('처리되지 않은 이벤트 타입:', payload.type)
                }
            } catch (error) {
                console.error('웹훅 이벤트 처리 오류:', error)
                throw error
            }
        }
    })

    // 웹훅 핸들러 실행
    return await webhookHandler(req)
})

// 구독 생성/업데이트 처리
async function handleSubscriptionEvent(supabase: any, payload: PolarWebhookPayload) {
    const { data } = payload

    // 고객 정보 확인
    const customerEmail = data.customer?.email || data.subscription?.customer?.email || data.customer_email
    if (!customerEmail) {
        console.error('고객 이메일이 없습니다:', data)
        return
    }

    // 이메일로 사용자 찾기 (올바른 방법)
    const { data: user, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('사용자 목록 조회 오류:', userError)
        return
    }

    const foundUser = user.users.find((u: any) => u.email === customerEmail)

    if (!foundUser) {
        console.error('사용자를 찾을 수 없습니다:', customerEmail)
        return
    }

    const subscription = data.subscription || data
    const now = new Date().toISOString()
    const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end).toISOString()
        : null

    // 구독 정보 업데이트 또는 생성
    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: foundUser.id,
            plan: 'premium',
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            starts_at: subscription.current_period_start
                ? new Date(subscription.current_period_start).toISOString()
                : now,
            ends_at: currentPeriodEnd,
            stripe_subscription_id: subscription.id, // Polar 구독 ID를 저장
            stripe_customer_id: subscription.customer_id,
            updated_at: now
        }, {
            onConflict: 'user_id'
        })

    if (error) {
        console.error('구독 정보 업데이트 오류:', error)
        throw error
    }

    console.log('구독 정보 업데이트 완료:', foundUser.email)
}

// 구독 취소 처리
async function handleSubscriptionCancellation(supabase: any, payload: PolarWebhookPayload) {
    const { data } = payload

    const customerEmail = data.customer?.email || data.subscription?.customer?.email || data.customer_email
    if (!customerEmail) {
        console.error('고객 이메일이 없습니다:', data)
        return
    }

    // 이메일로 사용자 찾기 (올바른 방법)
    const { data: user, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('사용자 목록 조회 오류:', userError)
        return
    }

    const foundUser = user.users.find((u: any) => u.email === customerEmail)

    if (!foundUser) {
        console.error('사용자를 찾을 수 없습니다:', customerEmail)
        return
    }

    // 구독 상태를 취소로 업데이트
    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', foundUser.id)

    if (error) {
        console.error('구독 취소 처리 오류:', error)
        throw error
    }

    console.log('구독 취소 처리 완료:', foundUser.email)
}

// 주문 생성 처리 (결제 완료)
async function handleOrderCreated(supabase: any, payload: PolarWebhookPayload) {
    const { data } = payload

    console.log('주문 생성 처리:', data)

    // 주문 생성 시 추가 로직 (이메일 발송, 로그 기록 등)
    // 구독 정보는 subscription.created/updated 이벤트에서 처리됨
} 