import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface FavoriteButtonProps {
  toolId: string;
  initialIsFavorite?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ toolId, initialIsFavorite = false }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, toolId]);

  const checkFavoriteStatus = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('tool_id', toolId)
        .maybeSingle();
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('즐겨찾기 상태 확인 오류:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      // 로그인이 필요한 경우 로그인 페이지로 이동
      window.location.href = '/signin';
      return;
    }

    try {
      setIsLoading(true);

      if (isFavorite) {
        // 즐겨찾기 삭제
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId);

        if (error) throw error;
      } else {
        // 즐겨찾기 추가
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, tool_id: toolId });

        if (error) throw error;
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
        isFavorite
          ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">
        {isFavorite ? '저장됨' : '저장하기'}
      </span>
    </button>
  );
};

export default FavoriteButton;