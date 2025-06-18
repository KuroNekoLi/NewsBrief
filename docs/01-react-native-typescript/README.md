# 📱 React Native 基礎與 TypeScript 整合

基於 NewsBrief 專案的 React Native + TypeScript 企業級開發實戰

## 🎯 學習目標

- 掌握 React Native 核心概念與架構
- 理解 TypeScript 在 React Native 中的配置與應用
- 學會企業級專案結構設計
- 熟悉開發環境設置與最佳實踐

## 📚 目錄

1. [React Native 核心概念](#1-react-native-核心概念)
2. [TypeScript 配置與最佳實踐](#2-typescript-配置與最佳實踐)
3. [專案結構設計原則](#3-專案結構設計原則)
4. [開發環境設置](#4-開發環境設置)
5. [實戰案例：NewsBrief 專案分析](#5-實戰案例newsbrief-專案分析)

---

## 1. React Native 核心概念

### 1.1 什麼是 React Native？

React Native 是 Facebook 開發的跨平台移動應用開發框架，允許使用 JavaScript 和 React 構建原生移動應用。

**核心優勢：**

- 一次開發，多平台運行
- 接近原生性能
- 豐富的第三方生態系統
- 熱重載提升開發效率

### 1.2 核心組件與 API

#### 基本組件

```typescript
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';

/**
 * 新聞卡片組件 - 展示核心組件的使用
 * 基於 NewsBrief 專案的實際實作
 */
const BasicNewsCard: React.FC = () => {
  return (
    <View style={{ padding: 16, backgroundColor: 'white' }}>
      <TouchableOpacity>
        <Image 
          source={{ uri: 'https://example.com/image.jpg' }}
          style={{ width: '100%', height: 200 }}
        />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
          新聞標題
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          新聞摘要內容...
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### 平台特定代碼

```typescript
import { Platform } from 'react-native';

/**
 * 平台檢測與條件渲染
 * 來自 NewsBrief 專案的實際需求
 */
const platformSpecificCode = () => {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  return {
    // iOS 需要額外的 SafeArea 處理
    paddingTop: isIOS ? 44 : 0,
    // Android 有不同的陰影實作
    shadowOffset: isIOS ? { width: 0, height: 2 } : undefined,
    elevation: isAndroid ? 4 : 0,
  };
};
```

---

## 2. TypeScript 配置與最佳實踐

### 2.1 TypeScript 配置文件

**tsconfig.json** - NewsBrief 專案配置

```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "index.js"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios"
  ]
}
```

### 2.2 類型定義最佳實踐

#### 介面定義

```typescript
/**
 * 新聞文章類型定義
 * 對應 News API 回應格式
 */
export interface Article {
  /** 文章標題 */
  title: string;
  /** 文章描述 */
  description: string | null;
  /** 圖片網址 */
  urlToImage: string | null;
  /** 文章網址 */
  url: string;
  /** 發布時間 */
  publishedAt: string;
  /** 來源資訊 */
  source: {
    id: string | null;
    name: string;
  };
}

/**
 * API 回應格式定義
 */
export interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: Article[];
}
```

#### 組件 Props 類型

```typescript
import React from 'react';
import { ViewStyle } from 'react-native';

/**
 * 新聞卡片組件的 Props 介面
 */
interface NewsCardProps {
  /** 新聞文章資料 */
  article: Article;
  /** 點擊處理函數 */
  onPress: (article: Article) => void;
  /** 書籤狀態 */
  isBookmarked: boolean;
  /** 書籤切換函數 */
  onBookmarkToggle: (article: Article) => void;
  /** 自定義樣式 */
  style?: ViewStyle;
}

/**
 * 類型安全的新聞卡片組件
 */
const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  isBookmarked,
  onBookmarkToggle,
  style
}) => {
  // 組件實作...
};
```

### 2.3 Hooks 類型安全

```typescript
import { useState, useCallback, useEffect } from 'react';

/**
 * 類型安全的自定義 Hook
 * 用於新聞資料獲取
 */
export const useNews = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 獲取新聞資料
   */
  const fetchNews = useCallback(async (category?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/news?category=${category || 'general'}`);
      const data: NewsApiResponse = await response.json();
      setArticles(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取新聞失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    fetchNews,
  };
};
```

---

## 3. 專案結構設計原則

### 3.1 目錄結構

NewsBrief 專案採用功能導向的目錄結構：

```
src/
├── components/          # 共用組件
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── NewsCard.tsx
├── hooks/              # 自定義 Hooks
│   ├── useBookmarks.ts
│   └── useNews.ts
├── navigation/         # 導航配置
│   └── TabNavigator.tsx
├── screens/           # 畫面組件
│   ├── BookmarksScreen.tsx
│   ├── HeadlinesScreen.tsx
│   ├── SearchScreen.tsx
│   └── TranslateScreen.tsx
├── services/          # API 與服務
│   ├── newsApi.ts
│   └── storage.ts
├── store/            # Redux 狀態管理
│   ├── api/          # RTK Query API
│   ├── slices/       # Redux Slices
│   ├── hooks.ts      # 類型安全的 Redux Hooks
│   └── index.ts      # Store 配置
└── types/            # 類型定義
    └── index.ts
```

### 3.2 命名慣例

**檔案命名：**

- 組件：PascalCase (NewsCard.tsx)
- Hooks：camelCase (useNews.ts)
- 服務：camelCase (newsApi.ts)
- 類型：camelCase (index.ts)

**變數命名：**

```typescript
// 組件名稱：PascalCase
const NewsCard: React.FC = () => {};

// 函數名稱：camelCase
const handlePress = () => {};

// 常數：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://newsapi.org/v2';

// 介面：PascalCase
interface NewsCardProps {}

// 類型別名：PascalCase
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

---

## 4. 開發環境設置

### 4.1 Metro 配置

**metro.config.js** - 來自 NewsBrief 專案

```javascript
const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro 打包器配置
 * 優化開發與構建性能
 */
module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
```

### 4.2 ESLint 配置

**.eslintrc.js** - 代碼品質保證

```javascript
module.exports = {
  root: true,
  extends: ['@react-native-community'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
```

### 4.3 除錯配置

```typescript
/**
 * 開發工具配置
 * 支援 Redux DevTools 與 Flipper
 */
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    // reducers...
  },
  devTools: __DEV__, // 僅在開發環境啟用
});

// Flipper 網路監控 (僅開發環境)
if (__DEV__) {
  require('react-native-flipper').default.addPlugin({
    getId() { return 'NetworkLogger'; },
    onConnect(connection) {
      // 網路請求監控...
    },
    onDisconnect() {
      // 清理...
    },
    runInBackground() {
      return false;
    }
  });
}
```

---

## 5. 實戰案例：NewsBrief 專案分析

### 5.1 主應用程式架構

**App.tsx** - 應用程式進入點

```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/store';
import TabNavigator from './src/navigation/TabNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

/**
 * 自定義主題配置
 * 採用黃色主色調
 */
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F9A825', // 主色調：黃色
    onPrimary: '#000000',
    primaryContainer: '#FFF59D',
    onPrimaryContainer: '#1F1F1F',
  },
};

/**
 * 主應用程式組件
 * 整合所有核心提供者
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <ErrorBoundary>
            <NavigationContainer>
              <TabNavigator />
            </NavigationContainer>
          </ErrorBoundary>
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
```

### 5.2 類型安全的 Redux Hooks

**src/store/hooks.ts** - 企業級類型安全

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 類型安全的 useAppDispatch Hook
 * 確保 dispatch 的動作具有正確類型
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * 類型安全的 useAppSelector Hook  
 * 提供完整的 RootState 類型推導
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 5.3 效能最佳化實踐

```typescript
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

/**
 * 最佳化的新聞列表組件
 * 使用記憶化避免不必要的重渲染
 */
const NewsList: React.FC<{ articles: Article[] }> = memo(({ articles }) => {
  /**
   * 記憶化的渲染函數
   * 避免每次重渲染時創建新函數
   */
  const renderArticle: ListRenderItem<Article> = useCallback(({ item }) => (
    <NewsCard article={item} />
  ), []);

  /**
   * 記憶化的 key 提取器
   * 提升 FlatList 效能
   */
  const keyExtractor = useCallback((item: Article) => item.url, []);

  /**
   * 記憶化的過濾文章
   * 只在 articles 變更時重新計算
   */
  const validArticles = useMemo(
    () => articles.filter(article => article.title && article.url),
    [articles]
  );

  return (
    <FlatList
      data={validArticles}
      renderItem={renderArticle}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
});
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **嚴格的 TypeScript 配置**
    - 啟用 `strict` 模式
    - 定義清晰的介面
    - 使用泛型增強類型安全

2. **一致的專案結構**
    - 功能導向的目錄組織
    - 清晰的命名慣例
    - 合理的檔案分層

3. **效能最佳化**
    - 使用 `React.memo` 避免不必要重渲染
    - `useCallback` 和 `useMemo` 記憶化
    - 正確配置 FlatList 參數

### ❌ 常見陷阱

1. **類型定義過度寬泛**

```typescript
// ❌ 避免：使用 any 類型
const handleData = (data: any) => {};

// ✅ 建議：具體的類型定義
const handleData = (data: Article[]) => {};
```

2. **不正確的依賴陣列**

```typescript
// ❌ 避免：遺漏依賴
useEffect(() => {
  fetchNews(category);
}, []); // category 應該在依賴陣列中

// ✅ 建議：完整的依賴
useEffect(() => {
  fetchNews(category);
}, [category, fetchNews]);
```

3. **效能問題**

```typescript
// ❌ 避免：在渲染函數中創建物件
<Component style={{ marginTop: 16 }} />

// ✅ 建議：使用 StyleSheet
const styles = StyleSheet.create({
  container: { marginTop: 16 }
});
<Component style={styles.container} />
```

---

## 🔗 相關教學

- [React Hooks 完全攻略](../02-react-hooks/README.md)
- [Redux Toolkit 企業級狀態管理](../03-redux-toolkit/README.md)
- [React Native Paper UI 組件庫](../05-paper-ui/README.md)

---

## 📖 延伸閱讀

- [React Native 官方文件](https://reactnative.dev/)
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Metro 官方文件](https://metrobundler.dev/)
- [ESLint React Native 規則](https://github.com/facebook/react-native/tree/main/packages/eslint-config-react-native-community)