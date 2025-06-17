import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building2, Mail, Phone, DollarSign, Calendar, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';

interface AdvertiserInquiry {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    budget: number | null;
    message: string;
    status: 'pending' | 'contacted' | 'completed' | 'rejected' | null;
    created_at: string | null;
    updated_at: string | null;
}

const AdminAdvertiserInquiriesPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<AdvertiserInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const { data, error } = await supabase.rpc('is_admin');
                if (error) throw error;

                if (!data) {
                    navigate('/');
                    return;
                }

                fetchInquiries();
            } catch (err) {
                console.error('어드민 권한 확인 오류:', err);
                navigate('/');
            }
        };

        const fetchInquiries = async () => {
            try {
                const { data, error } = await supabase
                    .from('advertiser_inquiries')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setInquiries(data || []);
            } catch (err: any) {
                console.error('광고주 문의 로딩 오류:', err);
                setError('광고주 문의를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            checkAdminAccess();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
        setUpdatingStatus(inquiryId);
        try {
            const { error } = await supabase
                .from('advertiser_inquiries')
                .update({
                    status: newStatus as 'pending' | 'contacted' | 'completed' | 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', inquiryId);

            if (error) throw error;

            setInquiries(prev =>
                prev.map(inquiry =>
                    inquiry.id === inquiryId
                        ? { ...inquiry, status: newStatus as any, updated_at: new Date().toISOString() }
                        : inquiry
                )
            );
        } catch (err: any) {
            console.error('상태 업데이트 오류:', err);
            setError('상태 업데이트에 실패했습니다.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'contacted':
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return '대기 중';
            case 'contacted':
                return '연락함';
            case 'completed':
                return '완료';
            case 'rejected':
                return '거절';
            default:
                return '알 수 없음';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'contacted':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">광고주 문의 관리</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        광고주들의 문의사항을 확인하고 상태를 관리하세요.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {inquiries.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">문의가 없습니다</h3>
                                <p className="mt-1 text-sm text-gray-500">아직 등록된 광고주 문의가 없습니다.</p>
                            </div>
                        ) : (
                            inquiries.map((inquiry) => (
                                <li key={inquiry.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {inquiry.company_name}
                                                    </h3>
                                                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status || 'pending')}`}>
                                                        {getStatusIcon(inquiry.status || 'pending')}
                                                        <span className="ml-1">{getStatusText(inquiry.status || 'pending')}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(inquiry.created_at || '').toLocaleDateString('ko-KR')}
                                                </div>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    <span className="font-medium">{inquiry.contact_name}</span>
                                                    <span className="ml-1">({inquiry.email})</span>
                                                </div>

                                                {inquiry.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {inquiry.phone}
                                                    </div>
                                                )}

                                                {inquiry.budget && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <DollarSign className="w-4 h-4 mr-2" />
                                                        {inquiry.budget.toLocaleString()}원
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex items-start">
                                                    <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {inquiry.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center space-x-3">
                                                <select
                                                    value={inquiry.status || 'pending'}
                                                    onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                                                    disabled={updatingStatus === inquiry.id}
                                                    className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    aria-label={`${inquiry.company_name} 문의 상태 변경`}
                                                >
                                                    <option value="pending">대기 중</option>
                                                    <option value="contacted">연락함</option>
                                                    <option value="completed">완료</option>
                                                    <option value="rejected">거절</option>
                                                </select>
                                                {updatingStatus === inquiry.id && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                                                )}
                                                <a
                                                    href={`mailto:${inquiry.email}?subject=AI 툴 추천 서비스 광고 문의 답변&body=안녕하세요 ${inquiry.contact_name}님,%0D%0A%0D%0A${inquiry.company_name}에서 보내주신 광고 문의 건에 대해 답변드립니다.`}
                                                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                                                >
                                                    이메일 답장
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminAdvertiserInquiriesPage; 