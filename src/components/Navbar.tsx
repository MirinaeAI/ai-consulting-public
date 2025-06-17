import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, History, Bookmark, UserCircle, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Crown } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (err) {
        console.error('어드민 상태 확인 오류:', err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">AI 툴 추천</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/consultation"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              AI 도구 추천
            </Link>
            <Link
              to="/tools"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              도구 갤러리
            </Link>
            <Link
              to="/advertiser-inquiry"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              광고 문의
            </Link>
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>AI 툴 추천</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="menu">
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/consultation"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      AI 도구 추천
                    </Link>
                    <Link
                      to="/tools"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      도구 갤러리
                    </Link>
                    <Link
                      to="/advertiser-inquiry"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      광고 문의
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          관리자 대시보드
                        </Link>
                        <Link
                          to="/admin/tools"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          관리자 도구 설정
                        </Link>
                        <Link
                          to="/admin/inquiries"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          광고주 문의 관리
                        </Link>
                      </>
                    )}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button asChild variant="default" className="hidden md:inline-flex">
              <Link to="/consultation">
                맞춤 추천 받기
              </Link>
            </Button>
          </div>

          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <UserCircle className="h-5 w-5" />
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        관리자 대시보드
                      </Link>
                      <Link
                        to="/admin/tools"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        관리자 도구 설정
                      </Link>
                      <Link
                        to="/admin/inquiries"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        광고주 문의 관리
                      </Link>
                    </>
                  )}
                  <Link
                    to="/subscription"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    구독 관리
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <History className="mr-2 h-4 w-4" />
                    상담 내역
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    저장한 도구
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/signin">로그인</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;