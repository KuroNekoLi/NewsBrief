# 🔄 RTK Query 數據獲取與緩存

基於 NewsBrief 專案的 RTK Query 企業級數據層實戰

## 🎯 學習目標

- 掌握 RTK Query 現代數據獲取架構
- 學會 API 層設計與最佳實踐
- 理解智能緩存策略與標籤系統
- 實作錯誤處理和重試機制

## 📚 目錄

1. [RTK Query 核心概念](#1-rtk-query-核心概念)
2. [API 層設計實戰](#2-api-層設計實戰)
3. [智能緩存策略配置](#3-智能緩存策略配置)
4. [標籤系統與緩存失效](#4-標籤系統與緩存失效)
5. [錯誤處理和重試機制](#5-錯誤處理和重試機制)
6. [實戰案例：NewsBrief API 架構](#6-實戰案例newsbrief-api-架構)

---

## 1. RTK Query 核心概念

### 1.1 為什麼選擇 RTK Query？

**傳統數據獲取的問題：**

- 手動管理載入和錯誤狀態
- 重複的 fetch 邏輯
- 缺乏智能緩存機制
- 難以處理競態條件

**RTK Query 的解決方案：**

- 自動管理載入狀態
- 內建緩存與失效機制
- 自動處理競態條件
- 強大的 TypeScript 支援

### 1.2 核心概念

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query 核心 API 結構
 */
const api = createApi({
  // API 識別名稱
  reducerPath: 'newsApi',
  
  // 基礎查詢配置
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://newsapi.org/v2/',
    prepareHeaders: (headers) => {
      headers.set('X-API-Key', process.env.REACT_APP_NEWS_API_KEY || '');
      return headers;
    },
  }),
  
  // 標籤類型定義
  tagTypes: ['Article', 'Category'],
  
  // 端點定義
  endpoints: (builder) => ({
    // Query：用於數據獲取
    getTopHeadlines: builder.query<NewsApiResponse, string>({
      query: (category) => `top-headlines?category=${category}&country=us`,
      providesTags: ['Article']
    }),
    
    // Mutation：用於數據變更
    addBookmark: builder.mutation<void, Article>({
      query: (article) => ({
        url: 'bookmarks',
        method: 'POST',
        body: article
      }),
      invalidatesTags: ['Article']
    })
  })
});
```

---

## 2. API 層設計實戰

### 2.1 基礎 API 配置

```typescript
/**
 * NewsBrief API 配置
 * src/store/api/newsApi.ts
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

/**
 * 自定義基礎查詢
 * 包含通用錯誤處理和認證
 */
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://newsapi.org/v2/',
  prepareHeaders: (headers, { getState }) => {
    // 添加 API Key
    headers.set('X-API-Key', process.env.REACT_APP_NEWS_API_KEY || '');
    
    // 添加用戶偏好語言
    const state = getState() as RootState;
    const language = state.ui?.language || 'zh';
    headers.set('Accept-Language', language);
    
    return headers;
  },
});

/**
 * 帶重試機制的查詢
 */
const baseQueryWithRetry: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // 如果是網路錯誤，重試最多 3 次
  if (result.error && result.error.status === 'FETCH_ERROR') {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && result.error) {
      console.log(`重試第 ${retryCount + 1} 次...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      result = await baseQuery(args, api, extraOptions);
      retryCount++;
    }
  }
  
  return result;
};

/**
 * News API 定義
 */
export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Headlines', 'Search', 'Bookmark'],
  keepUnusedDataFor: 300, // 5分鐘快取
  refetchOnMountOrArgChange: 900, // 15分鐘後重新獲取
  refetchOnReconnect: true,
  refetchOnFocus: false,
  endpoints: (builder) => ({
    // 將在下一節詳細定義
  })
});
```

### 2.2 端點定義模式

```typescript
/**
 * 完整的端點定義
 */
export const newsApi = createApi({
  // ... 基礎配置
  endpoints: (builder) => ({
    /**
     * 獲取頭條新聞
     */
    getTopHeadlines: builder.query<NewsApiResponse, TopHeadlinesParams>({
      query: ({ category = 'general', country = 'us', pageSize = 20 }) => ({
        url: 'top-headlines',
        params: {
          category,
          country,
          pageSize
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.articles.map(({ url }) => ({ type: 'Headlines' as const, id: url })),
              { type: 'Headlines', id: 'LIST' }
            ]
          : [{ type: 'Headlines', id: 'LIST' }],
      transformResponse: (response: NewsApiResponse) => ({
        ...response,
        articles: response.articles.filter(article => 
          article.title !== '[Removed]' && 
          article.urlToImage !== null
        )
      })
    }),

    /**
     * 搜尋新聞
     */
    searchNews: builder.query<NewsApiResponse, SearchNewsParams>({
      query: ({ q, sortBy = 'publishedAt', pageSize = 20, page = 1 }) => ({
        url: 'everything',
        params: {
          q,
          sortBy,
          pageSize,
          page
        }
      }),
      providesTags: (result, error, { q }) =>
        result
          ? [
              ...result.articles.map(({ url }) => ({ type: 'Search' as const, id: url })),
              { type: 'Search', id: q }
            ]
          : [{ type: 'Search', id: q }],
      serializeQueryArgs: ({ queryArgs }) => {
        // 自定義快取鍵，忽略 page 參數
        const { page, ...rest } = queryArgs;
        return rest;
      },
      merge: (currentCache, newItems, { arg }) => {
        // 合併分頁結果
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          articles: [...currentCache.articles, ...newItems.articles]
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // 搜尋關鍵字變更時強制重新獲取
        return currentArg?.q !== previousArg?.q;
      }
    }),

    /**
     * 獲取分類列表
     */
    getCategories: builder.query<Category[], void>({
      query: () => 'sources',
      transformResponse: (response: SourcesResponse) => {
        // 從來源列表中提取唯一分類
        const categories = Array.from(
          new Set(response.sources.map(source => source.category))
        ).map(category => ({
          id: category,
          name: category,
          displayName: getCategoryDisplayName(category)
        }));
        
        return categories;
      },
      providesTags: [{ type: 'Headlines', id: 'CATEGORIES' }]
    })
  })
});

/**
 * 類型定義
 */
interface TopHeadlinesParams {
  category?: string;
  country?: string;
  pageSize?: number;
}

interface SearchNewsParams {
  q: string;
  sortBy?: 'publishedAt' | 'relevancy' | 'popularity';
  pageSize?: number;
  page?: number;
}

interface Category {
  id: string;
  name: string;
  displayName: string;
}
```

### 2.3 Hooks 自動生成

```typescript
/**
 * RTK Query 自動生成的 Hooks
 */
export const {
  // Query Hooks
  useGetTopHeadlinesQuery,
  useLazyGetTopHeadlinesQuery,
  useSearchNewsQuery,
  useLazySearchNewsQuery,
  useGetCategoriesQuery,
  
  // Mutation Hooks (如果有)
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  
  // 選擇器
  selectTopHeadlinesData,
  selectSearchNewsData,
  
  // 工具函數
  util: { getRunningQueryThunk }
} = newsApi;

/**
 * 自定義 Hook 組合
 */
export const useNews = (category: string = 'general') => {
  const {
    data: headlines,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetTopHeadlinesQuery({ category });

  return {
    headlines: headlines?.articles || [],
    totalResults: headlines?.totalResults || 0,
    error,
    isLoading,
    isFetching,
    refetch,
    // 額外的便利方法
    isEmpty: !isLoading && (!headlines?.articles || headlines.articles.length === 0),
    hasError: !!error
  };
};

/**
 * 搜尋 Hook 與無限滾動
 */
export const useNewsSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchNewsParams>({
    q: '',
    page: 1
  });

  const {
    data: searchResults,
    error,
    isLoading,
    isFetching
  } = useSearchNewsQuery(searchParams, {
    skip: !searchParams.q.trim()
  });

  const loadMore = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  }, []);

  const search = useCallback((query: string) => {
    setSearchParams({
      q: query,
      page: 1
    });
  }, []);

  return {
    results: searchResults?.articles || [],
    error,
    isLoading,
    isFetching,
    search,
    loadMore,
    hasMore: searchResults ? 
      searchResults.articles.length < searchResults.totalResults : false
  };
};
```

---

## 3. 智能緩存策略配置

### 3.1 緩存時間配置

```typescript
/**
 * 分層緩存策略
 */
export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: baseQueryWithRetry,
  
  // 全域緩存設定
  keepUnusedDataFor: 300, // 5分鐘
  refetchOnMountOrArgChange: 900, // 15分鐘後重新獲取
  refetchOnReconnect: true,
  refetchOnFocus: false,
  
  endpoints: (builder) => ({
    /**
     * 頭條新聞 - 較短緩存時間
     */
    getTopHeadlines: builder.query<NewsApiResponse, TopHeadlinesParams>({
      query: (params) => ({ url: 'top-headlines', params }),
      keepUnusedDataFor: 180, // 3分鐘（覆蓋全域設定）
      providesTags: ['Headlines']
    }),

    /**
     * 搜尋結果 - 較長緩存時間
     */
    searchNews: builder.query<NewsApiResponse, SearchNewsParams>({
      query: (params) => ({ url: 'everything', params }),
      keepUnusedDataFor: 600, // 10分鐘
      providesTags: ['Search']
    }),

    /**
     * 分類列表 - 很長緩存時間
     */
    getCategories: builder.query<Category[], void>({
      query: () => 'sources',
      keepUnusedDataFor: 3600, // 1小時
      providesTags: ['Categories']
    })
  })
});
```

### 3.2 條件獲取與懶加載

```typescript
/**
 * 條件獲取模式
 */
const NewsComponent: React.FC<{ category: string }> = ({ category }) => {
  const [enabled, setEnabled] = useState(false);

  // 條件獲取：只在 enabled 為 true 時獲取
  const { data, isLoading } = useGetTopHeadlinesQuery(
    { category },
    {
      skip: !enabled, // 跳過查詢條件
      refetchOnMountOrArgChange: true
    }
  );

  // 懶加載：手動觸發
  const [trigger, { data: lazyData, isLoading: lazyLoading }] = 
    useLazyGetTopHeadlinesQuery();

  const handleLoadNews = useCallback(() => {
    trigger({ category });
  }, [category, trigger]);

  return (
    <View>
      <Button title="載入新聞" onPress={handleLoadNews} />
      {lazyLoading && <ActivityIndicator />}
      {/* 渲染結果... */}
    </View>
  );
};

/**
 * 預獲取模式
 */
const useNewsPrefetch = () => {
  const dispatch = useAppDispatch();

  const prefetchNews = useCallback((category: string) => {
    // 預獲取數據但不訂閱結果
    dispatch(
      newsApi.util.prefetch('getTopHeadlines', { category }, { force: false })
    );
  }, [dispatch]);

  const prefetchOnHover = useCallback((category: string) => {
    // 滑鼠懸停時預獲取
    dispatch(
      newsApi.util.prefetch('getTopHeadlines', { category }, { 
        force: false,
        ifOlderThan: 300 // 只有數據超過5分鐘才重新獲取
      })
    );
  }, [dispatch]);

  return { prefetchNews, prefetchOnHover };
};
```

### 3.3 緩存更新策略

```typescript
/**
 * 緩存更新與同步
 */
export const useCacheManagement = () => {
  const dispatch = useAppDispatch();

  /**
   * 手動更新緩存
   */
  const updateCache = useCallback((category: string, newData: Article[]) => {
    dispatch(
      newsApi.util.updateQueryData('getTopHeadlines', { category }, (draft) => {
        // 使用 Immer 語法直接修改
        draft.articles = newData;
        draft.totalResults = newData.length;
      })
    );
  }, [dispatch]);

  /**
   * 樂觀更新
   */
  const optimisticUpdate = useCallback((articleUrl: string, updates: Partial<Article>) => {
    // 更新所有相關的緩存
    const patches = dispatch(
      newsApi.util.updateQueryData('getTopHeadlines', { category: 'general' }, (draft) => {
        const article = draft.articles.find(a => a.url === articleUrl);
        if (article) {
          Object.assign(article, updates);
        }
      })
    );

    return () => {
      // 回滾函數
      dispatch(newsApi.util.patchQueryData('getTopHeadlines', { category: 'general' }, patches.inversePatches));
    };
  }, [dispatch]);

  /**
   * 失效特定緩存
   */
  const invalidateNews = useCallback((category?: string) => {
    if (category) {
      // 失效特定分類
      dispatch(newsApi.util.invalidateTags([{ type: 'Headlines', id: category }]));
    } else {
      // 失效所有新聞緩存
      dispatch(newsApi.util.invalidateTags(['Headlines']));
    }
  }, [dispatch]);

  /**
   * 重置所有緩存
   */
  const resetCache = useCallback(() => {
    dispatch(newsApi.util.resetApiState());
  }, [dispatch]);

  return {
    updateCache,
    optimisticUpdate,
    invalidateNews,
    resetCache
  };
};
```

---

## 4. 標籤系統與緩存失效

### 4.1 標籤系統設計

```typescript
/**
 * 標籤系統架構
 */
export const newsApi = createApi({
  tagTypes: [
    'Headlines',    // 頭條新聞
    'Search',      // 搜尋結果
    'Categories',  // 分類列表
    'Bookmark',    // 書籤
    'UserPref'     // 用戶偏好
  ],
  
  endpoints: (builder) => ({
    getTopHeadlines: builder.query<NewsApiResponse, TopHeadlinesParams>({
      query: (params) => ({ url: 'top-headlines', params }),
      
      // 提供標籤
      providesTags: (result, error, { category }) => {
        if (!result) return [{ type: 'Headlines', id: 'LIST' }];
        
        return [
          // 列表標籤
          { type: 'Headlines', id: 'LIST' },
          // 分類標籤
          { type: 'Headlines', id: category },
          // 個別文章標籤
          ...result.articles.map(article => ({
            type: 'Headlines' as const,
            id: article.url
          }))
        ];
      }
    }),

    searchNews: builder.query<NewsApiResponse, SearchNewsParams>({
      query: (params) => ({ url: 'everything', params }),
      
      providesTags: (result, error, { q }) => {
        if (!result) return [{ type: 'Search', id: q }];
        
        return [
          { type: 'Search', id: q },
          { type: 'Search', id: 'LIST' },
          ...result.articles.map(article => ({
            type: 'Search' as const,
            id: article.url
          }))
        ];
      }
    }),

    // Mutation 範例
    updateUserPreferences: builder.mutation<void, UserPreferences>({
      query: (preferences) => ({
        url: 'user/preferences',
        method: 'PUT',
        body: preferences
      }),
      
      // 失效相關標籤
      invalidatesTags: (result, error, preferences) => {
        const tags = [{ type: 'UserPref', id: 'LIST' }];
        
        // 如果偏好分類改變，失效相關新聞
        if (preferences.preferredCategories) {
          tags.push(...preferences.preferredCategories.map(category => ({
            type: 'Headlines' as const,
            id: category
          })));
        }
        
        return tags;
      }
    })
  })
});
```

### 4.2 智能失效策略

```typescript
/**
 * 條件失效策略
 */
const advancedInvalidation = {
  /**
   * 基於時間的失效
   */
  timeBasedInvalidation: (lastFetch: number, maxAge: number) => {
    return Date.now() - lastFetch > maxAge;
  },

  /**
   * 基於數據變化的失效
   */
  dataBasedInvalidation: (oldData: any, newData: any) => {
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  },

  /**
   * 自定義失效邏輯
   */
  customInvalidation: builder.mutation({
    query: (article: Article) => ({
      url: 'bookmarks',
      method: 'POST',
      body: article
    }),
    
    invalidatesTags: (result, error, article) => {
      // 複雜的失效邏輯
      const tags = [];
      
      // 總是失效書籤列表
      tags.push({ type: 'Bookmark', id: 'LIST' });
      
      // 如果是頭條新聞的文章，失效對應分類
      if (article.source?.category) {
        tags.push({ type: 'Headlines', id: article.source.category });
      }
      
      // 如果是搜尋結果，失效搜尋緩存
      if (article.searchQuery) {
        tags.push({ type: 'Search', id: article.searchQuery });
      }
      
      return tags;
    }
  })
};

/**
 * 批量失效工具
 */
export const useBatchInvalidation = () => {
  const dispatch = useAppDispatch();

  const invalidateMultiple = useCallback((
    tags: Array<{ type: string; id?: string }>
  ) => {
    tags.forEach(tag => {
      dispatch(newsApi.util.invalidateTags([tag]));
    });
  }, [dispatch]);

  const invalidateByPattern = useCallback((pattern: string) => {
    // 失效符合模式的所有標籤
    const state = store.getState();
    const apiState = state[newsApi.reducerPath];
    
    Object.keys(apiState.queries).forEach(queryKey => {
      if (queryKey.includes(pattern)) {
        const query = apiState.queries[queryKey];
        if (query?.endpointName) {
          dispatch(newsApi.util.invalidateTags([
            { type: query.endpointName, id: 'LIST' }
          ]));
        }
      }
    });
  }, [dispatch]);

  return { invalidateMultiple, invalidateByPattern };
};
```

---

## 5. 錯誤處理和重試機制

### 5.1 全域錯誤處理

```typescript
/**
 * 增強的錯誤處理
 */
const baseQueryWithErrorHandling: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    const { status, data } = result.error;
    
    // 處理不同類型的錯誤
    switch (status) {
      case 401:
        // 未授權 - 清除認證狀態
        api.dispatch(clearAuth());
        break;
        
      case 403:
        // 禁止訪問 - 顯示權限錯誤
        api.dispatch(showError('權限不足'));
        break;
        
      case 429:
        // 請求過於頻繁 - 延遲重試
        await new Promise(resolve => setTimeout(resolve, 5000));
        return baseQuery(args, api, extraOptions);
        
      case 'FETCH_ERROR':
        // 網路錯誤 - 檢查網路狀態
        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
          api.dispatch(setOfflineMode(true));
          return {
            error: {
              status: 'NETWORK_ERROR',
              data: '網路連線中斷，請檢查網路設定'
            }
          };
        }
        break;
        
      case 'TIMEOUT_ERROR':
        // 超時錯誤
        return {
          error: {
            status: 'TIMEOUT',
            data: '請求超時，請稍後再試'
          }
        };
        
      default:
        // 其他錯誤
        console.error('API 錯誤:', result.error);
    }
  }
  
  return result;
};

/**
 * 自動重試機制
 */
const createRetryQuery = (maxRetries: number = 3, delay: number = 1000) => {
  return async (args: any, api: any, extraOptions: any) => {
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      const result = await baseQueryWithErrorHandling(args, api, extraOptions);
      
      // 成功或非網路錯誤則返回
      if (!result.error || !shouldRetry(result.error)) {
        return result;
      }
      
      attempts++;
      
      if (attempts <= maxRetries) {
        // 指數退避延遲
        const retryDelay = delay * Math.pow(2, attempts - 1);
        console.log(`重試第 ${attempts} 次，等待 ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return await baseQueryWithErrorHandling(args, api, extraOptions);
  };
};

/**
 * 判斷是否應該重試
 */
const shouldRetry = (error: any): boolean => {
  // 網路錯誤或服務器錯誤才重試
  return error.status === 'FETCH_ERROR' || 
         error.status === 'TIMEOUT_ERROR' ||
         (typeof error.status === 'number' && error.status >= 500);
};
```

### 5.2 組件層錯誤處理

```typescript
/**
 * 錯誤處理 Hook
 */
export const useErrorHandler = () => {
  const [lastError, setLastError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    let message = '發生未知錯誤';
    
    if (error?.status) {
      switch (error.status) {
        case 'FETCH_ERROR':
          message = '網路連線失敗，請檢查網路設定';
          break;
        case 'TIMEOUT_ERROR':
          message = '請求超時，請稍後再試';
          break;
        case 401:
          message = '認證失敗，請重新登入';
          break;
        case 403:
          message = '權限不足，無法執行此操作';
          break;
        case 429:
          message = '請求過於頻繁，請稍後再試';
          break;
        case 500:
          message = '服務器錯誤，請稍後再試';
          break;
        default:
          if (error.data?.message) {
            message = error.data.message;
          }
      }
    }
    
    setLastError(message);
    return message;
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return { lastError, handleError, clearError };
};

/**
 * 新聞組件與錯誤處理
 */
const NewsWithErrorHandling: React.FC<{ category: string }> = ({ category }) => {
  const { lastError, handleError, clearError } = useErrorHandler();
  
  const {
    data: headlines,
    error,
    isLoading,
    refetch
  } = useGetTopHeadlinesQuery({ category });

  // 處理錯誤
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  // 重試處理
  const handleRetry = useCallback(() => {
    clearError();
    refetch();
  }, [clearError, refetch]);

  if (lastError) {
    return (
      <ErrorBoundary
        error={lastError}
        onRetry={handleRetry}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={headlines?.articles || []}
      renderItem={({ item }) => <NewsCard article={item} />}
    />
  );
};

/**
 * 錯誤邊界組件
 */
interface ErrorBoundaryProps {
  error: string;
  onRetry: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, onRetry }) => {
  return (
    <Card style={{ margin: 16 }}>
      <Card.Content>
        <Title>載入失敗</Title>
        <Paragraph>{error}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={onRetry}>
          重試
        </Button>
      </Card.Actions>
    </Card>
  );
};
```

---

## 6. 實戰案例：NewsBrief API 架構

### 6.1 完整 API 架構

```typescript
/**
 * NewsBrief 完整 API 架構
 * src/store/api/index.ts
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { createRetryQuery } from './baseQuery';

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: createRetryQuery(3, 1000),
  tagTypes: ['Headlines', 'Search', 'Categories', 'Bookmark'],
  
  endpoints: (builder) => ({
    // 頭條新聞
    getTopHeadlines: builder.query<NewsApiResponse, TopHeadlinesParams>({
      query: ({ category = 'general', country = 'us' }) => ({
        url: 'top-headlines',
        params: { category, country, pageSize: 20 }
      }),
      providesTags: (result, error, { category }) => [
        { type: 'Headlines', id: category },
        { type: 'Headlines', id: 'LIST' }
      ],
      transformResponse: (response: NewsApiResponse) => ({
        ...response,
        articles: response.articles
          .filter(article => 
            article.title !== '[Removed]' && 
            article.urlToImage
          )
          .map(article => ({
            ...article,
            id: article.url,
            bookmarked: false // 將由 selector 計算
          }))
      })
    }),

    // 搜尋新聞
    searchNews: builder.query<NewsApiResponse, SearchNewsParams>({
      query: ({ q, sortBy = 'publishedAt', page = 1 }) => ({
        url: 'everything',
        params: { q, sortBy, page, pageSize: 20 }
      }),
      providesTags: (result, error, { q }) => [
        { type: 'Search', id: q }
      ],
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return rest;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) return newItems;
        return {
          ...newItems,
          articles: [...currentCache.articles, ...newItems.articles]
        };
      }
    }),

    // 分類列表
    getCategories: builder.query<Category[], void>({
      query: () => 'sources',
      transformResponse: (response: SourcesResponse) => 
        Array.from(new Set(response.sources.map(s => s.category)))
          .map(category => ({
            id: category,
            name: category,
            displayName: getCategoryDisplayName(category)
          })),
      providesTags: [{ type: 'Categories', id: 'LIST' }]
    })
  })
});

// 導出 hooks
export const {
  useGetTopHeadlinesQuery,
  useLazyGetTopHeadlinesQuery,
  useSearchNewsQuery,
  useLazySearchNewsQuery,
  useGetCategoriesQuery
} = newsApi;
```

### 6.2 與 Redux Store 整合

```typescript
/**
 * Store 配置整合
 * src/store/index.ts
 */
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { newsApi } from './api';

export const store = configureStore({
  reducer: {
    // RTK Query API reducer
    [newsApi.reducerPath]: newsApi.reducer,
    
    // 其他 reducers
    bookmarks: bookmarksReducer,
    ui: uiReducer
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          // RTK Query actions
          ...Object.values(newsApi.util.getRunningQueryThunk.match)
        ]
      }
    }).concat(newsApi.middleware), // 添加 RTK Query middleware
    
  devTools: __DEV__
});

// 啟用 refetchOnFocus/refetchOnReconnect 行為
setupListeners(store.dispatch);
```

### 6.3 實際應用組件

```typescript
/**
 * Headlines Screen 完整實作
 */
const HeadlinesScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // 使用 RTK Query
  const {
    data: headlines,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetTopHeadlinesQuery({ category: selectedCategory });

  const { data: categories } = useGetCategoriesQuery();
  
  // 書籤狀態（來自 Redux）
  const bookmarks = useAppSelector(state => state.bookmarks.items);
  const dispatch = useAppDispatch();

  /**
   * 帶書籤狀態的文章
   */
  const articlesWithBookmarks = useMemo(() => {
    if (!headlines?.articles) return [];
    
    const bookmarkUrls = new Set(bookmarks.map(b => b.url));
    return headlines.articles.map(article => ({
      ...article,
      isBookmarked: bookmarkUrls.has(article.url)
    }));
  }, [headlines?.articles, bookmarks]);

  /**
   * 下拉重新整理
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 分類切換
   */
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  if (error) {
    return (
      <ErrorBoundary
        error={handleError(error)}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 分類選擇器 */}
      <CategorySelector
        categories={categories || []}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* 新聞列表 */}
      <FlatList
        data={articlesWithBookmarks}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            isBookmarked={item.isBookmarked}
            onBookmarkToggle={(article) => {
              if (item.isBookmarked) {
                dispatch(removeBookmark(article.url));
              } else {
                dispatch(addBookmark(article));
              }
            }}
          />
        )}
        keyExtractor={(item) => item.url}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          isLoading ? <LoadingSpinner /> : <EmptyState />
        }
      />
    </View>
  );
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **API 設計**
    - 使用類型安全的端點定義
    - 實作適當的錯誤處理機制
    - 合理配置緩存策略

2. **緩存管理**
    - 使用標籤系統管理緩存失效
    - 實作條件獲取避免不必要請求
    - 適當的預獲取提升用戶體驗

3. **錯誤處理**
    - 全域錯誤處理與本地錯誤處理結合
    - 實作智能重試機制
    - 提供用戶友好的錯誤訊息

### ❌ 常見陷阱

1. **過度獲取**

```typescript
// ❌ 避免：不必要的數據獲取
useGetTopHeadlinesQuery({ category }); // 無條件獲取

// ✅ 建議：條件獲取
useGetTopHeadlinesQuery({ category }, { skip: !shouldFetch });
```

2. **緩存策略不當**

```typescript
// ❌ 避免：過短的緩存時間
keepUnusedDataFor: 10 // 10秒太短

// ✅ 建議：合理的緩存時間
keepUnusedDataFor: 300 // 5分鐘
```

---

## 🔗 相關教學

- [Redux Toolkit 企業級狀態管理](../03-redux-toolkit/README.md)
- [網路請求與 API 整合實戰](../09-network-api/README.md)
- [錯誤處理與應用程式品質](../12-error-handling/README.md)

---

## 📖 延伸閱讀

- [RTK Query 官方文件](https://redux-toolkit.js.org/rtk-query/overview)
- [緩存策略最佳實踐](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)
- [錯誤處理指南](https://redux-toolkit.js.org/rtk-query/usage/error-handling)