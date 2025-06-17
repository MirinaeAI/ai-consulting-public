import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AdminUser {
  user_id: string;
  email: string;
}

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        
        if (!data) {
          navigate('/');
          return;
        }
        
        fetchAdmins();
      } catch (err) {
        console.error('어드민 권한 확인 오류:', err);
        navigate('/');
      }
    };

    const fetchAdmins = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_users');
        if (error) throw error;
        setAdminUsers(data || []);
      } catch (err) {
        console.error('어드민 목록 로딩 오류:', err);
        setError('어드민 목록을 불러오는데 실패했습니다.');
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

  const handleAddAdmin = async () => {
    try {
      const { data: userId, error } = await supabase.rpc('add_admin_user', {
        admin_email: newAdminEmail
      });

      if (error) throw error;

      // 새로운 어드민을 목록에 추가
      setAdminUsers(prev => [...prev, { user_id: userId, email: newAdminEmail }]);
      setNewAdminEmail('');
    } catch (err: any) {
      console.error('어드민 추가 오류:', err);
      setError(err.message || '어드민 추가에 실패했습니다.');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('remove_admin_user', {
        admin_user_id: userId
      });

      if (error) throw error;

      setAdminUsers(prev => prev.filter(admin => admin.user_id !== userId));
    } catch (err: any) {
      console.error('어드민 제거 오류:', err);
      setError(err.message || '어드민 제거에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">어드민 관리</h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <input
              type="email"
              placeholder="새 어드민 이메일"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddAdmin}
              className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">어드민 목록</h3>
            <div className="space-y-2">
              {adminUsers.map((admin) => (
                <div
                  key={admin.user_id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{admin.email}</span>
                  <button
                    onClick={() => handleRemoveAdmin(admin.user_id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {adminUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">등록된 어드민이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;