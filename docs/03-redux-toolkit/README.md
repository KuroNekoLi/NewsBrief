# ⚡ Redux Toolkit 企業級狀態管理

基於 NewsBrief 專案的 Redux Toolkit 企業級狀態管理實戰

## 🎯 學習目標

- 掌握 Redux Toolkit 現代狀態管理架構
- 理解從 React Context 到 Redux 的遷移策略
- 學會 createSlice 與 createAsyncThunk 最佳實踐
- 實作類型安全的 Redux TypeScript 整合

## 📚 目錄

1. [Redux Toolkit 核心概念](#1-redux-toolkit-核心概念)
2. [從 Context 到 Redux 的遷移](#2-從-context-到-redux-的遷移)
3. [createSlice 現代 Reducer 模式](#3-createslice-現代-reducer-模式)
4. [createAsyncThunk 異步操作](#4-createasyncthunk-異步操作)
5. [類型安全的 Redux 整合](#5-類型安全的-redux-整合)
6. [實戰案例：NewsBrief Store 架構](#6-實戰案例newsbrief-store-架構)

---

## 1. Redux Toolkit 核心概念

### 1.1 為什麼選擇 Redux Toolkit？

**傳統 Redux 的問題：**

- 樣板代碼過多
- 配置複雜
- 需要多個依賴包
- 不變性處理繁瑣

**Redux Toolkit 的解決方案：**

- 內建 Immer 處理不變性
- 簡化的 API 設計
- 內建 Redux DevTools 支援
- TypeScript 優先設計

### 1.2 核心 API 概覽

```typescript
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Redux Toolkit 核心 API
 */
// 1. configureStore - 配置 Store
const store = configureStore({
  reducer: {
    news: newsSlice.reducer,
    bookmarks: bookmarksSlice.reducer
  }
});

// 2. createSlice - 創建 Reducer 和 Actions
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    // 同步 actions
  },
  extraReducers: (builder) => {
    // 異步 actions
  }
});

// 3. createAsyncThunk - 處理異步操作
const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (category: string) => {
    // 異步邏輯
  }
);
```

---

## 2. 從 Context 到 Redux 的遷移

### 2.1 原有 Context 架構分析

```typescript
/**
 * 原有的 BookmarkContext (遷移前)
 * 來自 NewsBrief 初期實作
 */
interface BookmarkContextType {
  bookmarks: Article[];
  isBookmarked: (url: string) => boolean;
  addBookmark: (article: Article) => void;
  removeBookmark: (url: string) => void;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);

const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  const addBookmark = useCallback((article: Article) => {
    setBookmarks(prev => [...prev, article]);
  }, []);

  const removeBookmark = useCallback((url: string) => {
    setBookmarks(prev => prev.filter(article => article.url !== url));
  }, []);

  // 效能問題：每次渲染都創建新的 value 物件
  const value = {
    bookmarks,
    isBookmarked: (url: string) => bookmarks.some(article => article.url === url),
    addBookmark,
    removeBookmark,
    clearBookmarks: () => setBookmarks([])
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
```

### 2.2 遷移步驟與策略

```typescript
/**
 * 第一步：分析現有狀態結構
 */
interface AppState {
  // 新聞相關狀態
  news: {
    articles: Article[];
    loading: boolean;
    error: string | null;
    category: string;
  };
  
  // 書籤相關狀態
  bookmarks: {
    items: Article[];
    loading: boolean;
  };
  
  // UI 相關狀態
  ui: {
    theme: 'light' | 'dark';
    language: string;
  };
}

/**
 * 第二步：設計 Store 架構
 */
import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './slices/newsSlice';
import bookmarksReducer from './slices/bookmarksSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    bookmarks: bookmarksReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: __DEV__
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2.3 漸進式遷移策略

```typescript
/**
 * 混合模式：Context 與 Redux 共存
 * 允許逐步遷移而不影響現有功能
 */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      {/* 舊的 Context（逐步移除） */}
      <BookmarkProvider>
        {/* 新的應用程式 */}
        {children}
      </BookmarkProvider>
    </Provider>
  );
};

/**
 * 遷移輔助 Hook
 * 提供相同 API 但使用 Redux 實作
 */
export const useBookmarksLegacy = () => {
  // 使用 Redux 但保持原有 API
  const bookmarks = useAppSelector(state => state.bookmarks.items);
  const dispatch = useAppDispatch();

  return {
    bookmarks,
    isBookmarked: (url: string) => bookmarks.some(article => article.url === url),
    addBookmark: (article: Article) => dispatch(addBookmark(article)),
    removeBookmark: (url: string) => dispatch(removeBookmark(url)),
    clearBookmarks: () => dispatch(clearBookmarks())
  };
};
```

---

## 3. createSlice 現代 Reducer 模式

### 3.1 基本 Slice 結構

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 新聞 Slice 狀態介面
 */
interface NewsState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  category: string;
  lastUpdated: number | null;
}

/**
 * 初始狀態
 */
const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  category: 'general',
  lastUpdated: null
};

/**
 * 新聞 Slice 定義
 */
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    /**
     * 設定載入狀態
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    /**
     * 設定新聞文章
     */
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },

    /**
     * 設定錯誤狀態
     */
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * 切換分類
     */
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      // 切換分類時清空現有文章
      state.articles = [];
      state.error = null;
    },

    /**
     * 清空新聞數據
     */
    clearNews: (state) => {
      state.articles = [];
      state.error = null;
      state.lastUpdated = null;
    },

    /**
     * 更新單篇文章（例如：書籤狀態）
     */
    updateArticle: (state, action: PayloadAction<{ url: string; updates: Partial<Article> }>) => {
      const { url, updates } = action.payload;
      const articleIndex = state.articles.findIndex(article => article.url === url);
      
      if (articleIndex !== -1) {
        // Immer 允許直接修改
        Object.assign(state.articles[articleIndex], updates);
      }
    }
  }
});

// 導出 actions
export const {
  setLoading,
  setArticles,
  setError,
  setCategory,
  clearNews,
  updateArticle
} = newsSlice.actions;

// 導出 reducer
export default newsSlice.reducer;
```

### 3.2 進階 Slice 模式

```typescript
/**
 * 書籤 Slice - 更複雜的狀態管理
 */
interface BookmarksState {
  items: Article[];
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  lastSyncTime: number | null;
}

const initialBookmarksState: BookmarksState = {
  items: [],
  loading: false,
  error: null,
  syncStatus: 'idle',
  lastSyncTime: null
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: initialBookmarksState,
  reducers: {
    /**
     * 新增書籤
     */
    addBookmark: (state, action: PayloadAction<Article>) => {
      const article = action.payload;
      
      // 檢查是否已存在
      const exists = state.items.some(item => item.url === article.url);
      if (!exists) {
        state.items.push({
          ...article,
          bookmarkedAt: Date.now() // 添加書籤時間
        });
      }
    },

    /**
     * 移除書籤
     */
    removeBookmark: (state, action: PayloadAction<string>) => {
      const url = action.payload;
      state.items = state.items.filter(item => item.url !== url);
    },

    /**
     * 批量新增書籤
     */
    addMultipleBookmarks: (state, action: PayloadAction<Article[]>) => {
      const newArticles = action.payload;
      
      newArticles.forEach(article => {
        const exists = state.items.some(item => item.url === article.url);
        if (!exists) {
          state.items.push({
            ...article,
            bookmarkedAt: Date.now()
          });
        }
      });
    },

    /**
     * 重新排序書籤
     */
    reorderBookmarks: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedItem] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, movedItem);
    },

    /**
     * 清空所有書籤
     */
    clearBookmarks: (state) => {
      state.items = [];
      state.lastSyncTime = Date.now();
    },

    /**
     * 設定同步狀態
     */
    setSyncStatus: (state, action: PayloadAction<BookmarksState['syncStatus']>) => {
      state.syncStatus = action.payload;
      if (action.payload === 'success') {
        state.lastSyncTime = Date.now();
      }
    }
  }
});

export const {
  addBookmark,
  removeBookmark,
  addMultipleBookmarks,
  reorderBookmarks,
  clearBookmarks,
  setSyncStatus
} = bookmarksSlice.actions;

export default bookmarksSlice.reducer;
```

---

## 4. createAsyncThunk 異步操作

### 4.1 基本異步 Thunk

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * 獲取新聞的異步 Thunk
 */
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params: { category: string; country?: string }, { rejectWithValue }) => {
    try {
      const { category, country = 'us' } = params;
      
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}`,
        {
          headers: {
            'X-API-Key': process.env.REACT_APP_NEWS_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || '獲取新聞失敗');
      }

      return {
        articles: data.articles,
        category,
        timestamp: Date.now()
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '網路錯誤'
      );
    }
  }
);

/**
 * 搜尋新聞的異步 Thunk
 */
export const searchNews = createAsyncThunk(
  'news/searchNews',
  async (params: { query: string; sortBy?: string }, { rejectWithValue }) => {
    try {
      const { query, sortBy = 'publishedAt' } = params;
      
      if (!query.trim()) {
        throw new Error('搜尋關鍵字不能為空');
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}`,
        {
          headers: {
            'X-API-Key': process.env.REACT_APP_NEWS_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error(`搜尋失敗: ${response.status}`);
      }

      const data = await response.json();
      return {
        articles: data.articles,
        query,
        timestamp: Date.now()
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '搜尋失敗'
      );
    }
  }
);
```

### 4.2 在 Slice 中處理異步狀態

```typescript
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    // 同步 reducers...
  },
  extraReducers: (builder) => {
    // 處理 fetchNews
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.category = action.payload.category;
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 處理 searchNews
    builder
      .addCase(searchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(searchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});
```

### 4.3 複雜異步操作處理

```typescript
/**
 * 帶快取的新聞獲取
 */
export const fetchNewsWithCache = createAsyncThunk(
  'news/fetchNewsWithCache',
  async (
    params: { category: string; forceRefresh?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const { category, forceRefresh = false } = params;
      
      // 檢查快取
      const lastUpdated = state.news.lastUpdated;
      const currentCategory = state.news.category;
      const cacheValid = lastUpdated && 
                        (Date.now() - lastUpdated < 5 * 60 * 1000) && // 5分鐘
                        currentCategory === category;

      if (cacheValid && !forceRefresh) {
        // 使用快取數據
        return {
          articles: state.news.articles,
          category,
          timestamp: lastUpdated,
          fromCache: true
        };
      }

      // 獲取新數據
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&country=us`,
        {
          headers: {
            'X-API-Key': process.env.REACT_APP_NEWS_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        articles: data.articles,
        category,
        timestamp: Date.now(),
        fromCache: false
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取新聞失敗'
      );
    }
  }
);

/**
 * 同步書籤到雲端
 */
export const syncBookmarks = createAsyncThunk(
  'bookmarks/sync',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const bookmarks = state.bookmarks.items;

      // 設定同步狀態
      dispatch(setSyncStatus('syncing'));

      // 模擬雲端同步
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 實際實作會調用雲端 API
      const response = await fetch('/api/bookmarks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmarks })
      });

      if (!response.ok) {
        throw new Error('同步失敗');
      }

      dispatch(setSyncStatus('success'));
      
      return {
        syncedCount: bookmarks.length,
        timestamp: Date.now()
      };
    } catch (error) {
      dispatch(setSyncStatus('failed'));
      return rejectWithValue(
        error instanceof Error ? error.message : '同步失敗'
      );
    }
  }
);
```

---

## 5. 類型安全的 Redux 整合

### 5.1 類型安全的 Hooks

```typescript
/**
 * 類型安全的 Redux Hooks
 * src/store/hooks.ts
 */
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 類型化的 useAppDispatch Hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * 類型化的 useAppSelector Hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * 組合 Hook：新聞相關操作
 */
export const useNews = () => {
  const dispatch = useAppDispatch();
  const newsState = useAppSelector(state => state.news);

  return {
    ...newsState,
    fetchNews: (category: string) => dispatch(fetchNews({ category })),
    searchNews: (query: string) => dispatch(searchNews({ query })),
    setCategory: (category: string) => dispatch(setCategory(category)),
    clearNews: () => dispatch(clearNews())
  };
};

/**
 * 組合 Hook：書籤相關操作
 */
export const useBookmarks = () => {
  const dispatch = useAppDispatch();
  const bookmarksState = useAppSelector(state => state.bookmarks);

  return {
    ...bookmarksState,
    addBookmark: (article: Article) => dispatch(addBookmark(article)),
    removeBookmark: (url: string) => dispatch(removeBookmark(url)),
    clearBookmarks: () => dispatch(clearBookmarks()),
    syncBookmarks: () => dispatch(syncBookmarks()),
    isBookmarked: (url: string) => 
      bookmarksState.items.some(item => item.url === url)
  };
};
```

### 5.2 Selector 最佳實踐

```typescript
/**
 * 記憶化 Selectors
 * src/store/selectors/newsSelectors.ts
 */
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

/**
 * 基本 Selectors
 */
export const selectNewsState = (state: RootState) => state.news;
export const selectBookmarksState = (state: RootState) => state.bookmarks;

/**
 * 記憶化的複雜 Selectors
 */
export const selectFilteredArticles = createSelector(
  [selectNewsState, (state: RootState, searchQuery: string) => searchQuery],
  (newsState, searchQuery) => {
    if (!searchQuery.trim()) {
      return newsState.articles;
    }

    return newsState.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
);

/**
 * 帶書籤狀態的文章 Selector
 */
export const selectArticlesWithBookmarkStatus = createSelector(
  [selectNewsState, selectBookmarksState],
  (newsState, bookmarksState) => {
    const bookmarkUrls = new Set(bookmarksState.items.map(item => item.url));
    
    return newsState.articles.map(article => ({
      ...article,
      isBookmarked: bookmarkUrls.has(article.url)
    }));
  }
);

/**
 * 統計 Selectors
 */
export const selectNewsStats = createSelector(
  [selectNewsState, selectBookmarksState],
  (newsState, bookmarksState) => ({
    totalArticles: newsState.articles.length,
    totalBookmarks: bookmarksState.items.length,
    lastUpdated: newsState.lastUpdated,
    hasError: !!newsState.error,
    isLoading: newsState.loading
  })
);
```

### 5.3 中間件與增強器

```typescript
/**
 * Store 配置與中間件
 * src/store/index.ts
 */
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import newsReducer from './slices/newsSlice';
import bookmarksReducer from './slices/bookmarksSlice';
import uiReducer from './slices/uiSlice';

/**
 * 持久化配置
 */
const bookmarksPersistConfig = {
  key: 'bookmarks',
  storage: AsyncStorage,
  whitelist: ['items'] // 只持久化書籤項目
};

const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
  whitelist: ['theme', 'language'] // 只持久化 UI 設定
};

/**
 * 日誌中間件（僅開發環境）
 */
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  if (__DEV__) {
    console.group(`🔄 ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Before:', store.getState());
  }
  
  const result = next(action);
  
  if (__DEV__) {
    console.log('After:', store.getState());
    console.groupEnd();
  }
  
  return result;
};

/**
 * Store 配置
 */
export const store = configureStore({
  reducer: {
    news: newsReducer,
    bookmarks: persistReducer(bookmarksPersistConfig, bookmarksReducer),
    ui: persistReducer(uiPersistConfig, uiReducer)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(__DEV__ ? [loggerMiddleware] : []),
  devTools: __DEV__
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 6. 實戦案例：NewsBrief Store 架構

### 6.1 完整的 Store 設置

```typescript
/**
 * NewsBrief 主 Store 配置
 * 整合所有功能模組
 */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Slices
import newsSlice from './slices/newsSlice';
import bookmarksSlice from './slices/bookmarksSlice';
import searchSlice from './slices/searchSlice';
import uiSlice from './slices/uiSlice';

/**
 * 根 Reducer 組合
 */
const rootReducer = combineReducers({
  news: newsSlice,
  bookmarks: bookmarksSlice,
  search: searchSlice,
  ui: uiSlice
});

/**
 * 持久化配置
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['bookmarks', 'ui'], // 只持久化必要數據
  blacklist: ['news', 'search'] // 新聞和搜尋數據不持久化
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Store 配置
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: __DEV__
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 6.2 實際使用案例

```typescript
/**
 * HeadlinesScreen 使用 Redux
 */
import React, { useEffect } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNews, setCategory } from '../store/slices/newsSlice';

const HeadlinesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 選擇需要的狀態
  const { articles, loading, error, category } = useAppSelector(state => state.news);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  /**
   * 初始載入
   */
  useEffect(() => {
    dispatch(fetchNews({ category }));
  }, [dispatch, category]);

  /**
   * 重新整理
   */
  const handleRefresh = () => {
    dispatch(fetchNews({ category, forceRefresh: true }));
  };

  /**
   * 分類切換
   */
  const handleCategoryChange = (newCategory: string) => {
    dispatch(setCategory(newCategory));
  };

  /**
   * 書籤切換
   */
  const handleBookmarkToggle = (article: Article) => {
    if (isBookmarked(article.url)) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  };

  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <NewsCard
          article={item}
          isBookmarked={isBookmarked(item.url)}
          onBookmarkToggle={() => handleBookmarkToggle(item)}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      }
    />
  );
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **狀態結構設計**
    - 扁平化的狀態結構
    - 按功能模組組織 Slices
    - 適當的資料正規化

2. **類型安全**
    - 使用 TypeScript 定義所有介面
    - 類型化的 Hooks 和 Selectors
    - 嚴格的 payload 類型檢查

3. **性能優化**
    - 使用 createSelector 記憶化計算
    - 合理的狀態分割
    - 避免不必要的重渲染

### ❌ 常見陷阱

1. **過度使用 Redux**

```typescript
// ❌ 避免：本地 UI 狀態放入 Redux
const [modalVisible, setModalVisible] = useState(false);

// ✅ 建議：全域狀態才使用 Redux
const theme = useAppSelector(state => state.ui.theme);
```

2. **直接修改狀態**

```typescript
// ❌ 避免：直接修改（Redux Toolkit 外）
state.articles.push(newArticle);

// ✅ 建議：在 createSlice 中使用 Immer
state.articles.push(newArticle); // 在 reducer 中是安全的
```

---

## 🔗 相關教學

- [React Hooks 完全攻略](../02-react-hooks/README.md)
- [RTK Query 數據獲取與緩存](../04-rtk-query/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)

---

## 📖 延伸閱讀

- [Redux Toolkit 官方文件](https://redux-toolkit.js.org/)
- [Redux 最佳實踐](https://redux.js.org/style-guide/style-guide)
- [Immer 不變性處理](https://immerjs.github.io/immer/)