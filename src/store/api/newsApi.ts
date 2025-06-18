import{createApi, fetchBaseQuery}from '@reduxjs/toolkit/query/react';
import {Article, NewsApiResponse}from '../../types';

// 定義 API 查詢參數類型
interface NewsQueryParams {

category?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}

interface SearchNewsParams {
  query: string;
  page?: number;
  pageSize?: number;
}

/**
 * 企業級 RTK Query API
 * 
 * 優勢：
 * - 自動快取管理
 * - 請求去重
 * - 背景更新
 * - 樂觀更新
 * - 錯誤重試
 */
export const newsApi = createApi({
  reducerPath: 'newsApi',
  
  // 基礎查詢配置
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://newsapi.org/v2',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set('X-API-Key', 'e2960cc78cdf4505be6a0100ddbf4579');
      return headers;
    },
  }),
  
  // 標籤系統 - 用於緩存失效
  tagTypes: ['News', 'Headlines'],
  
  // API 端點定義
  endpoints: (builder) => ({
    // 獲取頭條新聞
    getHeadlines: builder.query<Article[], NewsQueryParams>({
      query: ({ category = 'technology', country = 'us', page = 1, pageSize = 20 }) => 
        `/top-headlines?category=${category}&country=${country}&page=${page}&pageSize=${pageSize}`,
      
      // 轉換回應數據
      transformResponse: (response: NewsApiResponse): Article[] => {
        return response.articles.map((article, index) => ({
          ...article,
          id: article.url || `article-${index}-${Date.now()}`,
        }));
      },
      
      // 快取標籤
      providesTags: ['Headlines'],
      
      // 快取時間配置
      keepUnusedDataFor: 300, // 5分鐘
    }),
    
    // 搜尋新聞
    searchNews: builder.query<Article[], SearchNewsParams>({
      query: ({ query, page = 1, pageSize = 20 }) => 
        `/everything?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&sortBy=publishedAt`,
      
      transformResponse: (response: NewsApiResponse): Article[] => {
        return response.articles.map((article, index) => ({
          ...article,
          id: article.url || `search-${index}-${Date.now()}`,
        }));
      },
      
      providesTags: ['News'],
      keepUnusedDataFor: 180, // 3分鐘
    }),
    
    // 獲取特定來源的新聞
    getNewsBySource: builder.query<Article[], { source: string; page?: number }>({
      query: ({ source, page = 1 }) => 
        `/everything?sources=${source}&page=${page}&pageSize=20`,
      
      transformResponse: (response: NewsApiResponse): Article[] => {
        return response.articles.map((article, index) => ({
          ...article,
          id: article.url || `source-${index}-${Date.now()}`,
        }));
      },
      
      providesTags: (result, error, { source }) => [
        { type: 'News', id: source }
      ],
    }),
  }),
});

// 導出自動生成的 hooks
export const {
  useGetHeadlinesQuery,
  useSearchNewsQuery,
  useGetNewsBySourceQuery,
  
  // 懶載入版本
  useLazyGetHeadlinesQuery,
  useLazySearchNewsQuery,
  useLazyGetNewsBySourceQuery,
  
  // 手動觸發版本  
  util: { getRunningQueriesThunk },
} = newsApi;