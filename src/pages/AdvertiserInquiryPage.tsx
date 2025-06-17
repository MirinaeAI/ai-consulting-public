import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Building2, User, Mail, Phone, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';

interface AdvertiserInquiryForm {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    budget?: number;
    message: string;
}

const AdvertiserInquiryPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<AdvertiserInquiryForm>();

    const onSubmit = async (data: AdvertiserInquiryForm) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. 데이터베이스에 저장
            const { error: dbError } = await supabase
                .from('advertiser_inquiries')
                .insert([{
                    company_name: data.companyName,
                    contact_name: data.contactName,
                    email: data.email,
                    phone: data.phone || null,
                    budget: data.budget || null,
                    message: data.message
                }]);

            if (dbError) throw dbError;

            // 2. Make 웹훅으로 전송 (구글 스프레드시트 및 슬랙 연동용)
            const webhookResponse = await fetch('https://hook.eu2.make.com/khxdr6x4vmtgptgg3irerlvcyh9230ne', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'advertiser_inquiry',
                    data: {
                        company_name: data.companyName,
                        contact_name: data.contactName,
                        email: data.email,
                        phone: data.phone || '',
                        budget: data.budget || 0,
                        message: data.message,
                        created_at: new Date().toISOString()
                    }
                }),
            });

            if (!webhookResponse.ok) {
                console.warn('웹훅 전송 실패, 하지만 데이터베이스 저장은 성공');
            }

            setIsSuccess(true);
            reset();
        } catch (err: any) {
            console.error('광고주 문의 제출 오류:', err);
            setError('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            문의가 접수되었습니다
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            새 문의하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center">
                    <Building2 className="mx-auto h-12 w-12 text-indigo-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        광고주 문의
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        AI 툴 추천 서비스에 광고하고 싶으신가요? 문의사항을 남겨주세요.
                    </p>
                </div>

                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                <Building2 className="inline w-4 h-4 mr-1" />
                                회사명 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="companyName"
                                    type="text"
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.companyName ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="회사명을 입력해주세요"
                                    {...register('companyName', {
                                        required: '회사명을 입력해주세요'
                                    })}
                                />
                                {errors.companyName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.companyName.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                                <User className="inline w-4 h-4 mr-1" />
                                담당자명 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="contactName"
                                    type="text"
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.contactName ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="담당자명을 입력해주세요"
                                    {...register('contactName', {
                                        required: '담당자명을 입력해주세요'
                                    })}
                                />
                                {errors.contactName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.contactName.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                <Mail className="inline w-4 h-4 mr-1" />
                                이메일 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="이메일을 입력해주세요"
                                    {...register('email', {
                                        required: '이메일을 입력해주세요',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: '유효한 이메일 주소를 입력해주세요',
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                <Phone className="inline w-4 h-4 mr-1" />
                                전화번호
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    type="tel"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="전화번호를 입력해주세요 (선택사항)"
                                    {...register('phone')}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                                <DollarSign className="inline w-4 h-4 mr-1" />
                                광고 예산 (원)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="budget"
                                    type="number"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="예상 광고 예산을 입력해주세요 (선택사항)"
                                    {...register('budget', {
                                        min: { value: 0, message: '예산은 0 이상이어야 합니다' }
                                    })}
                                />
                                {errors.budget && (
                                    <p className="mt-2 text-sm text-red-600">{errors.budget.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                <MessageSquare className="inline w-4 h-4 mr-1" />
                                문의 내용 *
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="message"
                                    rows={4}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.message ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="문의하실 내용을 상세히 작성해주세요"
                                    {...register('message', {
                                        required: '문의 내용을 입력해주세요',
                                        minLength: { value: 10, message: '문의 내용은 최소 10자 이상 입력해주세요' }
                                    })}
                                />
                                {errors.message && (
                                    <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? '제출 중...' : '문의하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdvertiserInquiryPage; 