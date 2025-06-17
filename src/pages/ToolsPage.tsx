import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FavoriteButton from '../components/FavoriteButton';

const ensureAbsoluteUrl = (url: string | undefined | null): string => {
  if (!url) return '#'; // URL이 없는 경우 기본값

  // 시작과 끝의 따옴표 제거 (작은따옴표, 큰따옴표 모두)
  let cleanUrl = url.trim().replace(/^['"]|['"]$/g, '');

  // 이미 프로토콜이 있는지 확인 (http:// 또는 https://)
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl; // 이미 있으면 그대로 반환
  }
  // 없다면 https:// 를 기본으로 추가
  return `https://${cleanUrl}`;
};

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  price_min: number | null;
  price_max: number | null;
  is_free_tier: boolean | null;
  categories: string[];
  is_promoted: boolean | null;
}

const ITEMS_PER_PAGE = 12; // 페이지당 보여줄 아이템 수
const SIBLING_COUNT = 1; // 현재 페이지 좌우로 보여줄 페이지 번호 개수
const DOTS = '...'; // 생략 부호

// 페이지네이션 아이템 생성 로직
const generatePaginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | string)[] => {
  const totalPageNumbers = siblingCount + 5; // firstPage + lastPage + currentPage + 2*siblings + 2*DOTS

  /*
    Case 1: 총 페이지 수가 최대 표시 가능 페이지 수보다 작거나 같으면 모든 페이지 번호 표시
  */
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages
  );

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  /*
    Case 2: 왼쪽 생략 부호만 표시
    1 ... (c-1) c (c+1) ... N
  */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPages];
  }

  /*
    Case 3: 오른쪽 생략 부호만 표시
    1 ... (c-1) c (c+1) ... N
  */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }

  /*
    Case 4: 양쪽 생략 부호 모두 표시
    1 ... (c-s) ... c ... (c+s) ... N
  */
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  // 기본적으로 모든 페이지를 보여주는 경우는 위에서 처리됨
  return []; // 발생하지 않아야 하는 케이스
};

const ToolsPage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTools, setTotalTools] = useState(0);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase.from('tools').select('*', { count: 'exact' });
        let countQuery = supabase.from('tools').select('*', { count: 'exact', head: true });

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
          countQuery = countQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (priceFilter === 'free') {
          query = query.is('is_free_tier', true);
          countQuery = countQuery.is('is_free_tier', true);
        } else if (priceFilter === 'paid') {
          query = query.or('is_free_tier.is.false,is_free_tier.is.null');
          countQuery = countQuery.or('is_free_tier.is.false,is_free_tier.is.null');
        }

        // 정렬 적용
        query = query.order('is_promoted', { ascending: false })
          .order('name', { ascending: sortOrder === 'asc' });
        // 페이지네이션 적용
        query = query.range(from, to);

        const { data, error, count } = await query;
        const { error: countErrorOnly, count: totalCountOnly } = await countQuery; // countQuery는 필터링된 전체 개수만 가져옴

        if (error) throw error;
        if (countErrorOnly) throw countErrorOnly;

        setTotalTools(totalCountOnly || 0);

        const toolsWithCategories = await Promise.all(
          (data || []).map(async (tool) => {
            const { data: categoryData } = await supabase
              .from('tool_categories')
              .select('categories(name)')
              .eq('tool_id', tool.id);
            const categories = categoryData?.map((cat: any) => cat.categories.name) || [];
            return { ...tool, categories };
          })
        );
        setTools(toolsWithCategories as Tool[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '도구 목록을 가져오는데 실패했습니다.');
        setTools([]); // 에러 발생 시 도구 목록 초기화
        setTotalTools(0); // 에러 발생 시 전체 도구 수 초기화
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [currentPage, sortOrder, searchQuery, priceFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // 검색 시 1페이지로
  };

  const handlePriceFilterChange = (value: 'all' | 'free' | 'paid') => {
    setPriceFilter(value);
    setCurrentPage(1); // 필터 변경 시 1페이지로
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // 정렬 변경 시 1페이지로 (필수는 아니지만 일관성을 위해 추가)
  }

  const totalPages = Math.ceil(totalTools / ITEMS_PER_PAGE);
  const paginationItems = generatePaginationItems(currentPage, totalPages, SIBLING_COUNT);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && tools.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">도구 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error && tools.length === 0) { // 에러 발생하고, 도구 목록이 없을 때만 에러 메시지 표시
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">AI 도구 갤러리</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="도구 검색..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={priceFilter}
                onChange={(e) => handlePriceFilterChange(e.target.value as 'all' | 'free' | 'paid')}
                className="pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input"
                aria-label="가격 필터"
              >
                <option value="all">모든 가격</option>
                <option value="free">무료</option>
                <option value="paid">유료</option>
              </select>

              <button
                onClick={handleSortOrderChange}
                className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-accent text-foreground"
              >
                <ArrowUpDown className="h-5 w-5" />
                {sortOrder === 'asc' ? '오름차순' : '내림차순'}
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-4">데이터를 불러오는 중...</div>}
        {!loading && tools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">해당 조건에 맞는 도구가 없습니다.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {tool.name}
                    {tool.is_promoted && (
                      <span className="ml-2 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full align-middle">
                        추천
                      </span>
                    )}
                  </h3>
                  <FavoriteButton toolId={tool.id} />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {tool.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {tool.categories.map(category => (
                    <span
                      key={category}
                      className="inline-block bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="flex gap-2">
                    {tool.is_free_tier && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        무료 플랜
                      </span>
                    )}
                    <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                      {(tool.price_min ?? 0) === 0 ? '무료' : `${tool.price_min ?? 0}$`}
                      {tool.price_max ? ` - ${tool.price_max}$` : '+'}
                    </span>
                  </div>

                  <a
                    href={ensureAbsoluteUrl(tool.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              이전
            </button>
            {paginationItems.map((item, index) => {
              if (item === DOTS) {
                return (
                  <span key={`${item}-${index}`} className="px-4 py-2">
                    {DOTS}
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item as number)}
                  disabled={loading}
                  className={`px-4 py-2 border rounded-lg disabled:opacity-50 ${currentPage === item ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                  {item}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;