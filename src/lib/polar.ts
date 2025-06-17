import { Polar } from '@polar-sh/sdk';

// Polar 클라이언트 초기화
const accessToken = import.meta.env.VITE_POLAR_ACCESS_TOKEN;
const environment = import.meta.env.VITE_POLAR_ENVIRONMENT || 'sandbox'; // 'sandbox' 또는 'production'

const polar = new Polar({
    accessToken: accessToken
});

// 웹훅 엔드포인트 URL
const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/polar-webhook`;

// 제품 ID 상수
export const POLAR_PRODUCTS = {
    PREMIUM_MONTHLY: import.meta.env.VITE_POLAR_PREMIUM_PRODUCT_ID || '',
};

/**
 * 체크아웃 세션 생성
 */
export const createCheckoutSession = async (customerEmail: string): Promise<string> => {
    try {
        console.log('체크아웃 세션 생성 시작:', customerEmail);

        const productId = import.meta.env.VITE_POLAR_PREMIUM_PRODUCT_ID;
        if (!productId) {
            throw new Error('VITE_POLAR_PREMIUM_PRODUCT_ID 환경변수가 설정되지 않았습니다.');
        }

        // 고객 생성 또는 가져오기
        const customer = await getOrCreateCustomer(customerEmail);

        // 체크아웃 세션 생성 - Polar API 형식
        const checkoutSession = await polar.checkouts.create({
            products: [productId],
            customerId: customer.id,
            successUrl: `${window.location.origin}/subscription/success`,
            metadata: {
                customerEmail: customerEmail,
                source: 'web_app'
            }
        });

        console.log('체크아웃 세션 생성 완료:', checkoutSession);

        if (!checkoutSession.url) {
            throw new Error('체크아웃 URL이 생성되지 않았습니다.');
        }

        return checkoutSession.url;

    } catch (error) {
        console.error('체크아웃 세션 생성 오류:', error);
        throw new Error(`체크아웃 세션 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

/**
 * 이메일로 고객 정보 조회
 */
export const getCustomer = async (email: string): Promise<any | null> => {
    try {
        console.log('고객 정보 조회 시작:', email);

        // Polar SDK의 고객 조회
        const customersResult = await polar.customers.list({
            email: email,
            limit: 1
        });

        console.log('고객 조회 결과:', customersResult);

        // 페이지네이션 결과 처리
        const customers = [];
        for await (const customer of customersResult) {
            customers.push(customer);
            break; // 첫 번째 결과만 필요
        }

        return customers.length > 0 ? customers[0] : null;
    } catch (error) {
        console.error('고객 정보 조회 오류:', error);
        return null;
    }
};

/**
 * 고객 생성
 */
export const createCustomer = async (email: string, name?: string): Promise<any> => {
    try {
        console.log('고객 생성 시작:', { email, name });

        const customer = await polar.customers.create({
            email: email,
            name: name || email,
            metadata: {
                source: 'ai-consulting-app'
            }
        });

        console.log('고객 생성 성공:', customer);
        return customer;
    } catch (error: any) {
        console.error('고객 생성 오류:', error);

        // 이미 존재하는 고객인 경우 조회해서 반환
        if (error.message && error.message.includes('already exists')) {
            console.log('고객이 이미 존재합니다. 기존 고객 정보를 조회합니다.');
            const existingCustomer = await getCustomer(email);
            if (existingCustomer) {
                return existingCustomer;
            }
        }

        throw error;
    }
};

/**
 * 고객 정보 가져오기 또는 생성
 */
export const getOrCreateCustomer = async (email: string, name?: string) => {
    try {
        console.log('고객 정보 처리 시작:', email);

        // 기존 고객 검색
        const existingCustomer = await getCustomer(email);

        if (existingCustomer) {
            console.log('기존 고객 발견:', existingCustomer);
            return existingCustomer;
        }

        // 새 고객 생성
        const newCustomer = await polar.customers.create({
            email: email,
            name: name || email.split('@')[0],
            metadata: {
                source: 'web_app',
                createdAt: new Date().toISOString()
            }
        });

        console.log('새 고객 생성 완료:', newCustomer);
        return newCustomer;

    } catch (error) {
        console.error('고객 정보 처리 오류:', error);
        throw new Error(`고객 정보 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 구독 정보 조회
export const getSubscriptions = async (customerId: string) => {
    try {
        const subscriptionsResult = await polar.subscriptions.list({
            customerId: customerId,
            limit: 10
        });

        // 페이지네이션 결과를 배열로 변환
        const subscriptions = [];
        for await (const subscription of subscriptionsResult) {
            subscriptions.push(subscription);
        }

        return subscriptions;

    } catch (error) {
        console.error('구독 정보 조회 오류:', error);
        throw new Error(`구독 정보 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 구독 취소
export const cancelSubscription = async (subscriptionId: string) => {
    try {
        // Polar SDK에서 구독 취소 방법 확인 필요
        // 현재는 임시로 에러 발생
        throw new Error('구독 취소 기능은 Polar 대시보드에서 직접 처리해주세요.');

    } catch (error) {
        console.error('구독 취소 오류:', error);
        throw new Error(`구독 취소 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 웹훅 시그니처 검증 (클라이언트 사이드에서는 사용하지 않음)
export const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
    // 실제 구현에서는 HMAC-SHA256 검증
    // 이 함수는 서버 사이드에서만 사용해야 함
    return true;
};

// 고객 포털 URL 생성 (Polar에서 지원하는 경우)
export const createCustomerPortalSession = async (customerId: string): Promise<string> => {
    try {
        // Polar에서 고객 포털을 지원하는 경우의 구현
        // 현재는 Polar 대시보드로 리다이렉트
        return 'https://polar.sh/dashboard';

    } catch (error) {
        console.error('고객 포털 세션 생성 오류:', error);
        throw new Error(`고객 포털 세션 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 웹훅 엔드포인트 설정 (개발용 - 실제로는 Polar 대시보드에서 설정)
export const setupWebhook = async () => {
    try {
        console.log('웹훅 엔드포인트:', WEBHOOK_URL);
        console.log('Polar 대시보드에서 다음 URL을 웹훅 엔드포인트로 설정하세요:');
        console.log(WEBHOOK_URL);

        return WEBHOOK_URL;

    } catch (error) {
        console.error('웹훅 설정 오류:', error);
        throw error;
    }
};

export default polar; 