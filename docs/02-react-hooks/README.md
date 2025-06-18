# 🎣 React Hooks 完全攻略

基於 NewsBrief 專案的 React Hooks 企業級應用實戰

## 🎯 學習目標

- 深度理解 useState, useEffect, useCallback, useMemo 核心 Hooks
- 掌握自定義 Hooks 設計模式 (useNews, useBookmarks)
- 學會 Hook 依賴陣列最佳實踐
- 掌握性能優化技巧與陷阱避免

## 📚 目錄

1. [useState 狀態管理深度解析](#1-usestate-狀態管理深度解析)
2. [useEffect 副作用處理完全指南](#2-useeffect-副作用處理完全指南)
3. [useCallback 與 useMemo 性能優化](#3-usecallback-與-usememo-性能優化)
4. [自定義 Hooks 設計模式](#4-自定義-hooks-設計模式)
5. [Hook 依賴陣列最佳實踐](#5-hook-依賴陣列最佳實踐)
6. [實戰案例：NewsBrief Hooks 架構](#6-實戰案例newsbrief-hooks-架構)

---

## 1. useState 狀態管理深度解析

### 1.1 基本用法與類型安全

```typescript
import React, { useState, useCallback } from 'react';

/**
 * 新聞搜尋組件 - useState 基本應用
 * 來自 NewsBrief 搜尋功能
 */
const NewsSearch: React.FC = () => {
  // 基本字串狀態
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 布林狀態
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 複雜物件狀態
  const [searchFilters, setSearchFilters] = useState<{
    category: string;
    sortBy: 'publishedAt' | 'relevancy' | 'popularity';
    language: string;
  }>({
    category: 'general',
    sortBy: 'publishedAt',
    language: 'zh'
  });

  /**
   * 處理搜尋查詢變更
   */
  const handleQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * 處理篩選器更新 - 函數式更新
   */
  const updateFilters = useCallback((updates: Partial<typeof searchFilters>) => {
    setSearchFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  return (
    // JSX 實作...
  );
};
```

### 1.2 複雜狀態管理模式

```typescript
import React, { useState, useReducer } from 'react';

/**
 * 複雜狀態的 Reducer 模式
 * 當狀態邏輯複雜時的替代方案
 */
interface NewsState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

type NewsAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { articles: Article[]; hasMore: boolean } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'LOAD_MORE'; payload: Article[] }
  | { type: 'RESET' };

/**
 * 新聞狀態 Reducer
 */
const newsReducer = (state: NewsState, action: NewsAction): NewsState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        articles: action.payload.articles,
        hasMore: action.payload.hasMore,
        page: 1
      };
      
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case 'LOAD_MORE':
      return {
        ...state,
        articles: [...state.articles, ...action.payload],
        page: state.page + 1
      };
      
    case 'RESET':
      return {
        articles: [],
        loading: false,
        error: null,
        page: 0,
        hasMore: true
      };
      
    default:
      return state;
  }
};

/**
 * 使用 useReducer 管理複雜狀態
 */
const NewsListWithReducer: React.FC = () => {
  const [state, dispatch] = useReducer(newsReducer, {
    articles: [],
    loading: false,
    error: null,
    page: 0,
    hasMore: true
  });

  // 狀態操作函數...
};
```

### 1.3 狀態初始化最佳實踐

```typescript
import React, { useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 延遲初始化 - 避免昂貴的初始計算
 */
const BookmarksManager: React.FC = () => {
  // ❌ 避免：每次渲染都執行昂貴計算
  // const [bookmarks, setBookmarks] = useState(getInitialBookmarks());

  // ✅ 建議：使用延遲初始化
  const [bookmarks, setBookmarks] = useState<Article[]>(() => {
    // 只在組件首次渲染時執行
    return [];
  });

  /**
   * 從 AsyncStorage 載入書籤 - 正確的異步初始化
   */
  const loadBookmarks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('載入書籤失敗:', error);
    }
  }, []);

  // useEffect 處理異步初始化
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);
};
```

---

## 2. useEffect 副作用處理完全指南

### 2.1 基本模式與清理

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * 網路狀態監控 - useEffect 基本模式
 * 來自 NewsBrief 網路處理
 */
const NetworkMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  /**
   * 網路狀態監聽 - 訂閱模式
   */
  useEffect(() => {
    // 訂閱網路狀態變化
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    // 清理函數：組件卸載時取消訂閱
    return () => {
      unsubscribe();
    };
  }, []); // 空依賴陣列：只在掛載/卸載時執行

  /**
   * 網路狀態變化處理
   */
  useEffect(() => {
    if (!isConnected) {
      console.log('網路連線中斷');
      // 顯示離線提示
    } else {
      console.log('網路連線已恢復');
      // 重新獲取數據
    }
  }, [isConnected]); // 依賴 isConnected：狀態變化時執行

  return null;
};
```

### 2.2 異步操作處理

```typescript
import React, { useState, useEffect, useRef } from 'react';

/**
 * 異步數據獲取 - 正確處理競態條件
 */
const NewsLoader: React.FC<{ category: string }> = ({ category }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 用於取消過期的請求
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 獲取新聞數據 - 處理競態條件
   */
  useEffect(() => {
    // 取消前一個請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 創建新的 AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    /**
     * 異步獲取函數
     */
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=${category}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NewsApiResponse = await response.json();
        
        // 檢查請求是否已被取消
        if (!controller.signal.aborted) {
          setArticles(data.articles);
        }
      } catch (err) {
        // 忽略取消的請求錯誤
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : '獲取新聞失敗');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    // 清理函數：取消請求
    return () => {
      controller.abort();
    };
  }, [category]); // 依賴 category：分類變化時重新獲取

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { articles, loading, error };
};
```

### 2.3 依賴陣列深度解析

```typescript
import React, { useEffect, useCallback, useRef } from 'react';

/**
 * 依賴陣列最佳實踐示例
 */
const NewsRefresh: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  /**
   * ❌ 錯誤：遺漏依賴
   */
  const badEffect = () => {
    useEffect(() => {
      // articles 被使用但未在依賴陣列中
      console.log('當前文章數量:', articles.length);
    }, []); // 遺漏 articles 依賴
  };

  /**
   * ✅ 正確：完整依賴
   */
  useEffect(() => {
    console.log('當前文章數量:', articles.length);
  }, [articles]); // 包含所有依賴

  /**
   * ✅ 正確：使用函數式更新避免依賴
   */
  const autoRefresh = useCallback(() => {
    intervalRef.current = setInterval(() => {
      // 使用函數式更新，避免依賴 articles
      setArticles(prev => {
        if (prev.length > 0) {
          console.log('自動重新整理');
          // 重新獲取邏輯...
        }
        return prev;
      });
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // 無需依賴 articles

  /**
   * ✅ 正確：使用 useRef 存儲最新值
   */
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  useEffect(() => {
    const timer = setInterval(() => {
      // 使用 ref 獲取最新值，避免依賴問題
      if (articlesRef.current.length > 0) {
        console.log('使用 ref 獲取最新文章數量:', articlesRef.current.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []); // 不需要依賴 articles
};
```

---

## 3. useCallback 與 useMemo 性能優化

### 3.1 useCallback 記憶化函數

```typescript
import React, { useState, useCallback, memo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

/**
 * 新聞卡片組件 - 使用 memo 防止不必要重渲染
 */
const NewsCard = memo<{
  article: Article;
  onPress: (article: Article) => void;
  onBookmark: (article: Article) => void;
}>(({ article, onPress, onBookmark }) => {
  return (
    // 卡片 UI...
  );
});

/**
 * 新聞列表 - useCallback 最佳實踐
 */
const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  /**
   * ✅ 正確：使用 useCallback 記憶化事件處理函數
   */
  const handleArticlePress = useCallback((article: Article) => {
    // 導航到文章詳情
    console.log('打開文章:', article.title);
  }, []); // 無外部依賴

  /**
   * ✅ 正確：包含依賴的 useCallback
   */
  const handleBookmarkToggle = useCallback((article: Article) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(article.url)) {
        newBookmarks.delete(article.url);
      } else {
        newBookmarks.add(article.url);
      }
      return newBookmarks;
    });
  }, []); // 使用函數式更新，無需依賴 bookmarks

  /**
   * ❌ 錯誤：過度使用 useCallback
   */
  const badCallback = useCallback(() => {
    // 簡單邏輯不需要 useCallback
    return 'Hello World';
  }, []);

  /**
   * 記憶化的渲染函數
   */
  const renderItem: ListRenderItem<Article> = useCallback(({ item }) => (
    <NewsCard
      article={item}
      onPress={handleArticlePress}
      onBookmark={handleBookmarkToggle}
    />
  ), [handleArticlePress, handleBookmarkToggle]);

  /**
   * 記憶化的 key 提取器
   */
  const keyExtractor = useCallback((item: Article) => item.url, []);

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};
```

### 3.2 useMemo 記憶化計算

```typescript
import React, { useState, useMemo, useCallback } from 'react';

/**
 * 新聞過濾與排序 - useMemo 應用
 */
const NewsFilter: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  /**
   * ✅ 正確：記憶化昂貴的計算
   */
  const filteredAndSortedArticles = useMemo(() => {
    console.log('重新計算過濾與排序'); // 只在依賴變化時執行

    let filtered = articles;

    // 過濾邏輯
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.source.name.includes(selectedCategory)
      );
    }

    // 排序邏輯
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return sorted;
  }, [articles, searchQuery, selectedCategory, sortBy]); // 完整的依賴列表

  /**
   * ✅ 正確：記憶化統計計算
   */
  const articleStats = useMemo(() => {
    const total = filteredAndSortedArticles.length;
    const categories = new Set(
      filteredAndSortedArticles.map(article => article.source.name)
    );
    const todayCount = filteredAndSortedArticles.filter(article => {
      const today = new Date().toDateString();
      const articleDate = new Date(article.publishedAt).toDateString();
      return today === articleDate;
    }).length;

    return {
      total,
      categoriesCount: categories.size,
      todayCount
    };
  }, [filteredAndSortedArticles]);

  /**
   * ❌ 錯誤：記憶化簡單值
   */
  const badMemo = useMemo(() => {
    return articles.length; // 簡單計算不需要 useMemo
  }, [articles]);

  /**
   * ✅ 正確：記憶化物件避免重複創建
   */
  const listProps = useMemo(() => ({
    showsVerticalScrollIndicator: false,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 5,
  }), []); // 靜態物件，無依賴

  return (
    <FlatList
      data={filteredAndSortedArticles}
      {...listProps}
    />
  );
};
```

---

## 4. 自定義 Hooks 設計模式

### 4.1 useNews Hook 實作

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 自定義新聞 Hook - 封裝新聞獲取邏輯
 * 來自 NewsBrief 專案的實際實作
 */
export const useNews = (category: string = 'general') => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: Article[]; timestamp: number }>>(new Map());

  /**
   * 獲取新聞數據
   */
  const fetchNews = useCallback(async (isRefresh: boolean = false) => {
    // 檢查快取 (5分鐘有效期)
    const cached = cacheRef.current.get(category);
    const now = Date.now();
    if (cached && !isRefresh && (now - cached.timestamp) < 5 * 60 * 1000) {
      setArticles(cached.data);
      return;
    }

    // 取消前一個請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&country=us`,
        {
          signal: controller.signal,
          headers: {
            'X-API-Key': process.env.REACT_APP_NEWS_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (!controller.signal.aborted) {
        setArticles(data.articles);
        // 更新快取
        cacheRef.current.set(category, {
          data: data.articles,
          timestamp: now
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : '獲取新聞失敗');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [category]);

  /**
   * 重新整理數據
   */
  const refresh = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  /**
   * 清除快取
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // 初始載入與分類變化時重新獲取
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    articles,
    loading,
    error,
    refreshing,
    refresh,
    clearCache,
    refetch: fetchNews
  };
};
```

### 4.2 useBookmarks Hook 實作

```typescript
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 書籤管理 Hook
 * 整合本地儲存與狀態管理
 */
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [bookmarkUrls, setBookmarkUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const STORAGE_KEY = 'news_bookmarks';

  /**
   * 從本地儲存載入書籤
   */
  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const articles: Article[] = JSON.parse(stored);
        setBookmarks(articles);
        setBookmarkUrls(new Set(articles.map(article => article.url)));
      }
    } catch (error) {
      console.error('載入書籤失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 儲存書籤到本地儲存
   */
  const saveBookmarks = useCallback(async (articles: Article[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (error) {
      console.error('儲存書籤失敗:', error);
    }
  }, []);

  /**
   * 新增書籤
   */
  const addBookmark = useCallback((article: Article) => {
    if (bookmarkUrls.has(article.url)) {
      return; // 已存在
    }

    const newBookmarks = [...bookmarks, article];
    setBookmarks(newBookmarks);
    setBookmarkUrls(prev => new Set(prev).add(article.url));
    saveBookmarks(newBookmarks);
  }, [bookmarks, bookmarkUrls, saveBookmarks]);

  /**
   * 移除書籤
   */
  const removeBookmark = useCallback((articleUrl: string) => {
    const newBookmarks = bookmarks.filter(article => article.url !== articleUrl);
    setBookmarks(newBookmarks);
    setBookmarkUrls(prev => {
      const newSet = new Set(prev);
      newSet.delete(articleUrl);
      return newSet;
    });
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  /**
   * 切換書籤狀態
   */
  const toggleBookmark = useCallback((article: Article) => {
    if (bookmarkUrls.has(article.url)) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  }, [bookmarkUrls, addBookmark, removeBookmark]);

  /**
   * 檢查是否為書籤
   */
  const isBookmarked = useCallback((articleUrl: string): boolean => {
    return bookmarkUrls.has(articleUrl);
  }, [bookmarkUrls]);

  /**
   * 清除所有書籤
   */
  const clearAllBookmarks = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setBookmarks([]);
      setBookmarkUrls(new Set());
    } catch (error) {
      console.error('清除書籤失敗:', error);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
    refresh: loadBookmarks
  };
};
```

### 4.3 組合式 Hooks 模式

```typescript
/**
 * 組合多個 Hooks 的高階 Hook
 * 提供完整的新聞應用功能
 */
export const useNewsApp = (initialCategory: string = 'general') => {
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  
  // 組合基礎 Hooks
  const newsHook = useNews(currentCategory);
  const bookmarksHook = useBookmarks();
  
  /**
   * 切換分類
   */
  const changeCategory = useCallback((category: string) => {
    setCurrentCategory(category);
  }, []);

  /**
   * 搜尋新聞
   */
  const searchNews = useCallback(async (query: string) => {
    // 搜尋邏輯實作...
  }, []);

  /**
   * 統一的錯誤處理
   */
  const error = newsHook.error;
  const loading = newsHook.loading || bookmarksHook.loading;

  return {
    // 新聞相關
    articles: newsHook.articles,
    loading,
    error,
    refreshNews: newsHook.refresh,
    
    // 書籤相關
    bookmarks: bookmarksHook.bookmarks,
    isBookmarked: bookmarksHook.isBookmarked,
    toggleBookmark: bookmarksHook.toggleBookmark,
    
    // 分類相關
    currentCategory,
    changeCategory,
    
    // 搜尋功能
    searchNews
  };
};
```

---

## 5. Hook 依賴陣列最佳實踐

### 5.1 依賴陣列常見問題

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 依賴陣列問題集合
 */
const DependencyProblems: React.FC = () => {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  /**
   * 問題 1: 遺漏依賴導致閉包問題
   */
  const badEffect1 = () => {
    useEffect(() => {
      const timer = setInterval(() => {
        // ❌ count 永遠是初始值 0，因為缺少依賴
        console.log('Current count:', count);
        setCount(count + 1); // 這會造成無限迴圈
      }, 1000);

      return () => clearInterval(timer);
    }, []); // ❌ 遺漏 count 依賴
  };

  /**
   * 解決方案 1: 使用函數式更新
   */
  const goodEffect1 = () => {
    useEffect(() => {
      const timer = setInterval(() => {
        // ✅ 使用函數式更新，獲取最新值
        setCount(prev => {
          console.log('Current count:', prev);
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []); // ✅ 無需依賴 count
  };

  /**
   * 問題 2: 物件依賴導致無限重渲染
   */
  const badEffect2 = () => {
    const userConfig = { id: user?.id, type: 'premium' }; // ❌ 每次渲染都創建新物件

    useEffect(() => {
      if (userConfig.id) {
        console.log('用戶配置變更:', userConfig);
      }
    }, [userConfig]); // ❌ userConfig 每次都是新物件
  };

  /**
   * 解決方案 2: 解構依賴或使用 useMemo
   */
  const goodEffect2 = () => {
    const userId = user?.id;

    useEffect(() => {
      if (userId) {
        const userConfig = { id: userId, type: 'premium' };
        console.log('用戶配置變更:', userConfig);
      }
    }, [userId]); // ✅ 只依賴原始值
  };

  /**
   * 問題 3: 函數依賴導致不必要的執行
   */
  const fetchUserData = (id: string) => {
    // 獲取用戶數據...
  };

  const badEffect3 = () => {
    useEffect(() => {
      if (user?.id) {
        fetchUserData(user.id); // ❌ fetchUserData 每次渲染都是新函數
      }
    }, [user, fetchUserData]); // ❌ fetchUserData 會導致無限執行
  };

  /**
   * 解決方案 3: 使用 useCallback 或 useRef
   */
  const fetchUserDataCallback = useCallback((id: string) => {
    // 獲取用戶數據...
  }, []);

  const goodEffect3 = () => {
    useEffect(() => {
      if (user?.id) {
        fetchUserDataCallback(user.id);
      }
    }, [user, fetchUserDataCallback]); // ✅ fetchUserDataCallback 被記憶化
  };
};
```

### 5.2 ESLint 規則與自動檢測

```javascript
// .eslintrc.js 配置
module.exports = {
  extends: [
    "react-hooks/exhaustive-deps"
  ],
  rules: {
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        "additionalHooks": "(useMyCustomHook|useAnotherCustomHook)"
      }
    ]
  }
};
```

```typescript
/**
 * 自定義 Hook 的依賴檢查
 */
export const useCustomEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => {
  useEffect(effect, deps);
};

// 使用時 ESLint 會檢查依賴
const MyComponent: React.FC = () => {
  const [value, setValue] = useState(0);

  useCustomEffect(() => {
    console.log(value); // ESLint 會警告缺少 value 依賴
  }, []); // ❌ 應該包含 value

  useCustomEffect(() => {
    console.log(value);
  }, [value]); // ✅ 正確的依賴
};
```

---

## 6. 實戰案例：NewsBrief Hooks 架構

### 6.1 Headlines Screen Hook 整合

```typescript
/**
 * Headlines Screen 的完整 Hook 整合
 * 來自 NewsBrief 實際代碼
 */
import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const HeadlinesScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // 使用自定義 Hooks
  const { articles, loading, error, refresh } = useNews(selectedCategory);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  /**
   * 記憶化的渲染函數
   */
  const renderArticle = useCallback(({ item: article }: { item: Article }) => (
    <Card style={{ margin: 8 }}>
      <Card.Content>
        <Title>{article.title}</Title>
        <Paragraph>{article.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button
          mode={isBookmarked(article.url) ? 'contained' : 'outlined'}
          onPress={() => toggleBookmark(article)}
        >
          {isBookmarked(article.url) ? '已收藏' : '收藏'}
        </Button>
      </Card.Actions>
    </Card>
  ), [isBookmarked, toggleBookmark]);

  /**
   * 記憶化的 key 提取器
   */
  const keyExtractor = useCallback((item: Article) => item.url, []);

  /**
   * 分類變更處理
   */
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  if (error) {
    return (
      <Card>
        <Card.Content>
          <Title>錯誤</Title>
          <Paragraph>{error}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={refresh}>重試</Button>
        </Card.Actions>
      </Card>
    );
  }

  return (
    <FlatList
      data={articles}
      renderItem={renderArticle}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
        />
      }
    />
  );
};
```

### 6.2 性能監控 Hook

```typescript
import { useEffect, useRef } from 'react';

/**
 * 性能監控 Hook
 * 用於追蹤組件渲染性能
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (__DEV__) {
      console.log(`[性能監控] ${componentName}:`, {
        renderCount: renderCountRef.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`
      });
    }
    
    lastRenderTimeRef.current = now;
  });

  return {
    renderCount: renderCountRef.current
  };
};

/**
 * 在組件中使用性能監控
 */
const MonitoredComponent: React.FC = () => {
  const { renderCount } = usePerformanceMonitor('MonitoredComponent');
  
  return (
    <View>
      {__DEV__ && <Text>渲染次數: {renderCount}</Text>}
    </View>
  );
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **明確的依賴管理**
    - 使用 ESLint exhaustive-deps 規則
    - 優先使用函數式更新避免依賴
    - 複雜物件使用 useMemo 記憶化

2. **適當的記憶化**
    - 只對昂貴計算使用 useMemo
    - 傳遞給子組件的函數使用 useCallback
    - 避免過度最佳化

3. **自定義 Hooks 設計**
    - 單一職責原則
    - 清晰的 API 設計
    - 適當的錯誤處理

### ❌ 常見陷阱

1. **過度最佳化**

```typescript
// ❌ 避免：無意義的 useCallback
const simpleHandler = useCallback(() => {
  console.log('click');
}, []);

// ✅ 建議：簡單函數直接定義
const simpleHandler = () => {
  console.log('click');
};
```

2. **依賴陣列錯誤**

```typescript
// ❌ 避免：遺漏依賴
useEffect(() => {
  doSomething(data);
}, []); // data 應該在依賴中

// ✅ 建議：完整依賴
useEffect(() => {
  doSomething(data);
}, [data]);
```

---

## 🔗 相關教學

- [React Native 基礎與 TypeScript 整合](../01-react-native-typescript/README.md)
- [Redux Toolkit 企業級狀態管理](../03-redux-toolkit/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)

---

## 📖 延伸閱讀

- [React Hooks 官方文件](https://react.dev/reference/react)
- [React Hooks 最佳實踐](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [ESLint React Hooks 規則](https://www.npmjs.com/package/eslint-plugin-react-hooks)