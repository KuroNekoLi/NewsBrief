# 🧩 React Native 組件模式與最佳實踐

基於 NewsBrief 專案的 React Native 組件設計與實作指南

## 🎯 學習目標

- 掌握 React Native 組件設計原則
- 學會常見組件模式與最佳實踐
- 理解組件重用與組合策略
- 掌握高性能組件開發技巧

## 📚 目錄

1. [組件設計基本原則](#1-組件設計基本原則)
2. [常見組件模式](#2-常見組件模式)
3. [組件重用與組合](#3-組件重用與組合)
4. [高性能組件開發](#4-高性能組件開發)
5. [實戰案例：NewsBrief 組件架構](#5-實戰案例newsbrief-組件架構)

---

## 1. 組件設計基本原則

### 1.1 單一職責原則

組件應該只有一個職責，這使得組件更容易理解、測試和維護。

```typescript
// ❌ 不好的做法：一個組件負責太多功能
const NewsItem = ({ article, onBookmark, onShare, onTranslate }) => {
  // 處理書籤邏輯
  // 處理分享邏輯
  // 處理翻譯邏輯
  // 渲染新聞內容
  return (/* 複雜的 JSX */);
};

// ✅ 好的做法：拆分為多個單一職責的組件
const NewsContent = ({ article }) => {
  return (/* 只負責渲染新聞內容 */);
};

const BookmarkButton = ({ article, onBookmark }) => {
  return (/* 只負責書籤功能 */);
};

const ShareButton = ({ article, onShare }) => {
  return (/* 只負責分享功能 */);
};

const NewsItem = ({ article }) => {
  return (
    <View>
      <NewsContent article={article} />
      <View style={styles.actions}>
        <BookmarkButton article={article} onBookmark={handleBookmark} />
        <ShareButton article={article} onShare={handleShare} />
      </View>
    </View>
  );
};
```

### 1.2 組件接口設計

良好的組件接口設計應該清晰、一致且易於使用。

```typescript
import { StyleProp, ViewStyle } from 'react-native';

// ✅ 良好的組件接口設計
interface ButtonProps {
  // 必要屬性
  title: string;
  onPress: () => void;
  
  // 可選屬性
  disabled?: boolean;
  loading?: boolean;
  
  // 樣式相關
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  
  // 子組件
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  return (/* 組件實現 */);
};
```

### 1.3 組件命名規範

清晰的命名有助於理解組件的用途和功能。

```typescript
// ✅ 組件命名最佳實踐

// 1. 使用 PascalCase 命名組件
const NewsCard = () => { /* ... */ };

// 2. 使用描述性名稱
const ArticlePreview = () => { /* ... */ }; // 比 Card 更具描述性

// 3. 高階組件使用 with 前綴
const withErrorBoundary = (Component) => { /* ... */ };

// 4. 容器組件使用 Container 後綴
const NewsListContainer = () => { /* ... */ };

// 5. 特定功能的組件使用功能描述
const LoadingSpinner = () => { /* ... */ };
const ErrorMessage = () => { /* ... */ };
```

---

## 2. 常見組件模式

### 2.1 展示型組件與容器型組件

將 UI 渲染邏輯與數據/業務邏輯分離。

```typescript
// ✅ 展示型組件：只負責渲染，通過 props 接收數據
interface NewsCardProps {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  onPress: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  imageUrl,
  date,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ✅ 容器型組件：負責數據獲取和業務邏輯
import { useGetHeadlinesQuery } from '../store/api/newsApi';

const HeadlinesContainer: React.FC = () => {
  const { data: articles, isLoading, error } = useGetHeadlinesQuery({ category: 'technology' });
  
  const handleArticlePress = (article) => {
    // 處理文章點擊邏輯
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => (
        <NewsCard
          title={item.title}
          description={item.description}
          imageUrl={item.urlToImage}
          date={item.publishedAt}
          onPress={() => handleArticlePress(item)}
        />
      )}
      keyExtractor={item => item.id}
    />
  );
};
```

### 2.2 錯誤邊界模式

使用錯誤邊界捕獲和處理組件樹中的 JavaScript 錯誤。

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  error?: Error | null;
  retry?: () => void;
}

/**
 * 錯誤邊界組件
 * 用於顯示友好的錯誤信息並提供重試選項
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  error, 
  retry 
}) => {
  if (error) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              發生錯誤
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {error.message || '載入資料時發生未知錯誤'}
            </Text>
            {retry && (
              <Button 
                mode="contained" 
                onPress={retry}
                style={styles.button}
              >
                重試
              </Button>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

// 使用方式
const SafeComponent = () => {
  const [error, setError] = useState<Error | null>(null);
  const { data, isLoading, refetch } = useGetHeadlinesQuery();
  
  return (
    <ErrorBoundary error={error} retry={refetch}>
      <HeadlinesScreen />
    </ErrorBoundary>
  );
};
```

### 2.3 複合組件模式

創建一組相關組件，通過組合提供完整功能。

```typescript
// ✅ 複合組件模式
const Card = {
  Container: ({ children, style }) => (
    <View style={[styles.container, style]}>
      {children}
    </View>
  ),
  
  Image: ({ source, style }) => (
    <Image source={source} style={[styles.image, style]} />
  ),
  
  Title: ({ children, style }) => (
    <Text style={[styles.title, style]}>{children}</Text>
  ),
  
  Content: ({ children, style }) => (
    <View style={[styles.content, style]}>
      {children}
    </View>
  ),
  
  Footer: ({ children, style }) => (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  ),
};

// 使用方式
const ArticleCard = ({ article }) => (
  <Card.Container>
    <Card.Image source={{ uri: article.urlToImage }} />
    <Card.Content>
      <Card.Title>{article.title}</Card.Title>
      <Text>{article.description}</Text>
    </Card.Content>
    <Card.Footer>
      <Text>{article.publishedAt}</Text>
      <BookmarkButton article={article} />
    </Card.Footer>
  </Card.Container>
);
```

---

## 3. 組件重用與組合

### 3.1 高階組件 (HOC)

高階組件是一個函數，接收一個組件並返回一個新組件。

```typescript
/**
 * 高階組件：添加加載狀態處理
 */
function withLoading<P>(Component: React.ComponentType<P>) {
  return function WithLoading(props: P & { isLoading: boolean; loadingText?: string }) {
    const { isLoading, loadingText = '載入中...', ...componentProps } = props;
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      );
    }
    
    return <Component {...(componentProps as P)} />;
  };
}

// 使用方式
const NewsList = ({ articles }) => (
  <FlatList
    data={articles}
    renderItem={({ item }) => <NewsCard article={item} />}
    keyExtractor={item => item.id}
  />
);

const NewsListWithLoading = withLoading(NewsList);

// 在父組件中
<NewsListWithLoading 
  articles={articles} 
  isLoading={isLoading} 
  loadingText="正在獲取最新新聞..."
/>
```

### 3.2 自定義 Hooks

將組件邏輯提取到可重用的 hooks 中。

```typescript
/**
 * 自定義 Hook：處理新聞文章的書籤功能
 */
function useBookmarks() {
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  
  const isBookmarked = useCallback((url: string) => {
    return bookmarks.some(bookmark => bookmark.url === url);
  }, [bookmarks]);
  
  const addBookmark = useCallback((article: Article) => {
    dispatch(bookmarksActions.addBookmark(article));
  }, [dispatch]);
  
  const removeBookmark = useCallback((url: string) => {
    dispatch(bookmarksActions.removeBookmark(url));
  }, [dispatch]);
  
  const toggleBookmark = useCallback((article: Article) => {
    if (isBookmarked(article.url)) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  }, [isBookmarked, removeBookmark, addBookmark]);
  
  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark
  };
}

// 在組件中使用
const NewsCard = ({ article }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.url);
  
  return (
    <Card>
      {/* 文章內容 */}
      <TouchableOpacity onPress={() => toggleBookmark(article)}>
        <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} />
      </TouchableOpacity>
    </Card>
  );
};
```

### 3.3 組件組合與 Props 傳遞

使用組件組合和 props 傳遞創建靈活的組件。

```typescript
/**
 * 使用組件組合和 props 傳遞
 */
// 基礎按鈕組件
const Button = ({ onPress, style, children }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    {children}
  </TouchableOpacity>
);

// 特定功能按鈕
const BookmarkButton = ({ article, style }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.url);
  
  return (
    <Button 
      onPress={() => toggleBookmark(article)} 
      style={[styles.bookmarkButton, style]}
    >
      <Icon 
        name={bookmarked ? 'bookmark' : 'bookmark-outline'} 
        size={20} 
        color={bookmarked ? '#FFD700' : '#666'}
      />
    </Button>
  );
};

// 在父組件中使用
const ArticleActions = ({ article }) => (
  <View style={styles.actions}>
    <BookmarkButton article={article} />
    <ShareButton article={article} />
    <TranslateButton article={article} />
  </View>
);
```

---

## 4. 高性能組件開發

### 4.1 記憶化與重渲染優化

使用 React.memo、useCallback 和 useMemo 優化性能。

```typescript
import React, { useCallback, useMemo } from 'react';

/**
 * 使用 React.memo 記憶化組件
 */
interface NewsCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

// 使用 React.memo 避免不必要的重渲染
const NewsCard = React.memo(({ article, onPress }: NewsCardProps) => {
  // 使用 useCallback 記憶化回調函數
  const handlePress = useCallback(() => {
    onPress(article);
  }, [article, onPress]);
  
  // 使用 useMemo 記憶化計算結果
  const formattedDate = useMemo(() => {
    return new Date(article.publishedAt).toLocaleDateString();
  }, [article.publishedAt]);
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={{ uri: article.urlToImage }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
});

// 自定義比較函數，只比較關鍵屬性
const arePropsEqual = (prevProps: NewsCardProps, nextProps: NewsCardProps) => {
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.title === nextProps.article.title &&
    prevProps.article.urlToImage === nextProps.article.urlToImage &&
    prevProps.article.publishedAt === nextProps.article.publishedAt &&
    prevProps.onPress === nextProps.onPress
  );
};

// 使用自定義比較函數的 React.memo
const OptimizedNewsCard = React.memo(NewsCard, arePropsEqual);
```

### 4.2 延遲加載與虛擬化

使用延遲加載和虛擬化技術優化大列表性能。

```typescript
import { FlatList } from 'react-native';

/**
 * 使用 FlatList 虛擬化長列表
 */
const NewsFeed = ({ articles }) => {
  // 配置 FlatList 性能優化選項
  return (
    <FlatList
      data={articles}
      renderItem={({ item }) => <NewsCard article={item} />}
      keyExtractor={item => item.id}
      
      // 性能優化配置
      initialNumToRender={10}        // 初始渲染數量
      maxToRenderPerBatch={5}        // 每批次渲染數量
      windowSize={5}                 // 可視窗口大小
      removeClippedSubviews={true}   // 移除不可見組件
      updateCellsBatchingPeriod={50} // 批次更新間隔
      
      // 分頁加載
      onEndReached={loadMoreArticles}
      onEndReachedThreshold={0.5}
      
      // 列表頭尾組件
      ListHeaderComponent={<NewsHeader />}
      ListFooterComponent={isLoadingMore ? <LoadingIndicator /> : null}
      
      // 空列表和分隔線
      ListEmptyComponent={<EmptyListMessage />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};
```

### 4.3 避免不必要的狀態更新

優化狀態更新以避免不必要的渲染。

```typescript
/**
 * 避免不必要的狀態更新
 */
// ❌ 不好的做法：每次渲染都創建新對象
const BadComponent = () => {
  const [count, setCount] = useState(0);
  
  // 每次渲染都創建新的樣式對象，導致子組件重渲染
  const dynamicStyles = {
    container: {
      backgroundColor: count % 2 === 0 ? '#fff' : '#f0f0f0',
    }
  };
  
  return (
    <View style={dynamicStyles.container}>
      <ChildComponent />
      <Button onPress={() => setCount(count + 1)} title="Increment" />
    </View>
  );
};

// ✅ 好的做法：使用 useMemo 記憶化樣式對象
const GoodComponent = () => {
  const [count, setCount] = useState(0);
  
  // 只在 count 變化時重新計算樣式
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: count % 2 === 0 ? '#fff' : '#f0f0f0',
    }
  }), [count]);
  
  return (
    <View style={dynamicStyles.container}>
      <ChildComponent />
      <Button onPress={() => setCount(count + 1)} title="Increment" />
    </View>
  );
};
```

---

## 5. 實戰案例：NewsBrief 組件架構

### 5.1 NewsBrief 組件層次結構

```
src/
├── components/                # 共享組件
│   ├── ErrorBoundary.tsx      # 錯誤邊界組件
│   ├── LoadingSpinner.tsx     # 加載指示器
│   └── NewsCard.tsx           # 新聞卡片組件
├── screens/                   # 頁面組件
│   ├── HeadlinesScreen.tsx    # 頭條頁面
│   ├── BookmarksScreen.tsx    # 書籤頁面
│   ├── SearchScreen.tsx       # 搜索頁面
│   └── TranslateScreen.tsx    # 翻譯頁面
└── navigation/                # 導航組件
    └── TabNavigator.tsx       # 底部標籤導航
```

### 5.2 NewsCard 組件實現

```typescript
import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useBookmarks } from '../hooks/useBookmarks';
import { Article } from '../types';
import { SmartImage } from './SmartImage';

interface NewsCardProps {
  article: Article;
  onPress?: (article: Article) => void;
}

/**
 * 新聞卡片組件
 * 展示新聞文章的摘要信息
 */
export const NewsCard = React.memo(({ article, onPress }: NewsCardProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.url);
  
  const handlePress = useCallback(() => {
    onPress?.(article);
  }, [article, onPress]);
  
  const handleBookmarkPress = useCallback((e) => {
    e.stopPropagation();
    toggleBookmark(article);
  }, [article, toggleBookmark]);
  
  const formattedDate = new Date(article.publishedAt).toLocaleDateString();
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <SmartImage
          source={{ uri: article.urlToImage }}
          style={styles.image}
          placeholder={require('../assets/images/news-placeholder.png')}
        />
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          <Text variant="bodySmall" style={styles.description} numberOfLines={3}>
            {article.description}
          </Text>
          <View style={styles.footer}>
            <Text variant="labelSmall" style={styles.date}>
              {formattedDate}
            </Text>
            <TouchableOpacity onPress={handleBookmarkPress}>
              <Text style={[styles.bookmark, bookmarked && styles.bookmarked]}>
                {bookmarked ? '✅' : '📋'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  image: {
    height: 200,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#999',
  },
  bookmark: {
    fontSize: 18,
  },
  bookmarked: {
    color: '#FFD700',
  },
});
```

### 5.3 組件設計經驗總結

1. **組件粒度**：NewsBrief 專案中，我們將組件拆分為適當的粒度，既保證了組件的可重用性，又避免了過度拆分導致的複雜性。

2. **狀態管理分離**：使用 Redux 和自定義 Hooks 將狀態管理邏輯與 UI 渲染邏輯分離，使組件更加專注於其主要職責。

3. **性能優化**：對於頻繁重渲染的組件（如 NewsCard），使用 React.memo 和其他記憶化技術減少不必要的渲染。

4. **錯誤處理**：實現了 ErrorBoundary 組件，統一處理組件樹中的錯誤，提供一致的錯誤 UI 和重試機制。

5. **組件文檔**：為關鍵組件提供了清晰的 TypeScript 類型定義和 JSDoc 註釋，使其他開發者能夠更容易理解和使用這些組件。

---

通過學習 NewsBrief 專案的組件模式，你將能夠在自己的 React Native 專案中實現更加模塊化、可維護和高性能的組件架構。