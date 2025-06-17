import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Menu, History, Bookmark } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">AI 툴 추천</Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">홈</Link>
          <Link to="/tools" className="text-gray-700 hover:text-indigo-600">도구 갤러리</Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">서비스 소개</Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center text-gray-700 hover:text-indigo-600"
              >
                <UserCircle className="mr-1" size={20} />
                <span>내 계정</span>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                  >
                    프로필
                  </Link>
                  <Link 
                    to="/history" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                  >
                    <div className="flex items-center">
                      <History size={16} className="mr-2" />
                      상담 내역
                    </div>
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                  >
                    <div className="flex items-center">
                      <Bookmark size={16} className="mr-2" />
                      저장한 도구
                    </div>
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/signin" 
                className="text-gray-700 hover:text-indigo-600"
              >
                로그인
              </Link>
              <Link 
                to="/signup" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
        
        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700">
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4">
          <Link to="/" className="block py-2 text-gray-700 hover:text-indigo-600">홈</Link>
          <Link to="/tools" className="block py-2 text-gray-700 hover:text-indigo-600">도구 갤러리</Link>
          <Link to="/about" className="block py-2 text-gray-700 hover:text-indigo-600">서비스 소개</Link>
          
          {user ? (
            <>
              <Link to="/profile" className="block py-2 text-gray-700 hover:text-indigo-600">프로필</Link>
              <Link to="/history" className="block py-2 text-gray-700 hover:text-indigo-600">
                <div className="flex items-center">
                  <History size={16} className="mr-2" />
                  상담 내역
                </div>
              </Link>
              <Link to="/favorites" className="block py-2 text-gray-700 hover:text-indigo-600">
                <div className="flex items-center">
                  <Bookmark size={16} className="mr-2" />
                  저장한 도구
                </div>
              </Link>
              <button 
                onClick={() => signOut()}
                className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="block py-2 text-gray-700 hover:text-indigo-600">로그인</Link>
              <Link to="/signup" className="block py-2 text-gray-700 hover:text-indigo-600">회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;