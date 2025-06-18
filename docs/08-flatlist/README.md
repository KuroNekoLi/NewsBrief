# 📱 FlatList 高性能列表渲染

基於 NewsBrief 專案的 FlatList 企業級高性能列表渲染實戰

## 🎯 學習目標

- 掌握 FlatList 虛擬化列表原理與配置
- 學會記憶化 renderItem 和 keyExtractor 最佳實踐
- 實作下拉刷新 (RefreshControl) 機制
- 理解效能優化參數調教

## 📚 目錄

1. [FlatList 基礎概念](#1-flatlist-基礎概念)
2. [虛擬化列表原理](#2-虛擬化列表原理)
3. [記憶化渲染最佳實踐](#3-記憶化渲染最佳實踐)
4. [下拉刷新機制](#4-下拉刷新機制)
5. [效能優化配置](#5-效能優化配置)
6. [實戰案例：NewsBrief 新聞列表](#6-實戰案例newsbrief-新聞列表)

---

## 1. FlatList 基礎概念

### 1.1 FlatList 核心特性

```typescript
/**
 * FlatList 核心概念
 * - 虛擬化滾動：只渲染可見項目
 * - 記憶體優化：自動回收不可見組件
 * - 性能優良：適合大數據量列表
 * - 內建功能：下拉刷新、無限滾動
 */
import React from 'react';
import { FlatList, ListRenderItem } from 'react-native';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

/**
 * 基本 FlatList 使用示例
 */
export const BasicFlatListExample: React.FC = () => {
  const [articles, setArticles] = React.useState<Article[]>([]);

  /**
   * 渲染單個項目
   */
  const renderItem: ListRenderItem<Article> = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  /**
   * 生成唯一鍵值
   */
  const keyExtractor = (item: Article, index: number): string => {
    return item.url || `article-${index}`;
  };

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
    />
  );
};
```

### 1.2 FlatList vs ScrollView 對比

```typescript
/**
 * FlatList vs ScrollView 效能對比
 */
export class ListPerformanceComparison {
  /**
   * ScrollView 適用場景
   * - 小數據量（< 100 項目）
   * - 複雜布局需求
   * - 需要精確控制滾動
   */
  static readonly ScrollViewUseCases = {
    maxItems: 100,
    complexity: 'high',
    scrollControl: 'precise'
  };

  /**
   * FlatList 適用場景
   * - 大數據量（> 100 項目）
   * - 同質化項目結構
   * - 效能要求高
   */
  static readonly FlatListUseCases = {
    maxItems: 'unlimited',
    complexity: 'medium',
    performance: 'optimized'
  };

  /**
   * 記憶體使用對比測試
   */
  static measureMemoryUsage(itemCount: number) {
    return {
      scrollView: itemCount * 100, // 每個項目約 100KB
      flatList: Math.min(itemCount, 20) * 100 // 最多 20 個項目在記憶體中
    };
  }
}
```

---

## 2. 虛擬化列表原理

### 2.1 虛擬化機制詳解

```typescript
/**
 * 虛擬化列表原理解析
 */
export class VirtualizationPrinciple {
  /**
   * 視窗管理器
   * 控制可見項目的渲染
   */
  static class ViewportManager {
    private visibleItems: number = 10;
    private bufferItems: number = 5;

    /**
     * 計算需要渲染的項目範圍
     */
    calculateRenderRange(scrollOffset: number, itemHeight: number): {
      startIndex: number;
      endIndex: number;
    } {
      const viewportHeight = 800; // 假設螢幕高度
      
      const startIndex = Math.max(
        0,
        Math.floor(scrollOffset / itemHeight) - this.bufferItems
      );
      
      const endIndex = Math.min(
        startIndex + this.visibleItems + (this.bufferItems * 2),
        1000 // 假設總項目數
      );

      return { startIndex, endIndex };
    }

    /**
     * 記憶體回收策略
     */
    recycleComponents(unusedIndices: number[]): void {
      console.log(`回收 ${unusedIndices.length} 個組件`);
      // 實際實作會將組件移至回收池
    }
  }

  /**
   * 項目高度估算器
   */
  static class ItemHeightEstimator {
    private averageHeight: number = 100;
    private measuredHeights: Map<number, number> = new Map();

    /**
     * 估算項目高度
     */
    estimateHeight(index: number): number {
      const measured = this.measuredHeights.get(index);
      return measured || this.averageHeight;
    }

    /**
     * 記錄實際測量高度
     */
    recordHeight(index: number, height: number): void {
      this.measuredHeights.set(index, height);
      this.updateAverageHeight();
    }

    /**
     * 更新平均高度
     */
    private updateAverageHeight(): void {
      const heights = Array.from(this.measuredHeights.values());
      this.averageHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    }
  }
}
```

### 2.2 性能監控與優化

```typescript
/**
 * FlatList 性能監控器
 */
export class FlatListPerformanceMonitor {
  private renderTimes: number[] = [];
  private scrollEvents: number[] = [];

  /**
   * 監控渲染性能
   */
  measureRenderPerformance<T>(
    component: React.ComponentType<any>,
    props: any
  ): React.ComponentType<any> {
    return React.memo((componentProps: any) => {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const endTime = performance.now();
        this.recordRenderTime(endTime - startTime);
      });

      return React.createElement(component, componentProps);
    });
  }

  /**
   * 記錄渲染時間
   */
  private recordRenderTime(time: number): void {
    this.renderTimes.push(time);
    
    // 保持最近 100 次記錄
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }

    // 警告慢渲染
    if (time > 16.67) { // 超過一幀時間
      console.warn(`慢渲染檢測: ${time.toFixed(2)}ms`);
    }
  }

  /**
   * 獲取性能報告
   */
  getPerformanceReport(): {
    averageRenderTime: number;
    maxRenderTime: number;
    slowRenders: number;
  } {
    const avgTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    const maxTime = Math.max(...this.renderTimes);
    const slowRenders = this.renderTimes.filter(time => time > 16.67).length;

    return {
      averageRenderTime: avgTime,
      maxRenderTime: maxTime,
      slowRenders
    };
  }
}
```

---

## 3. 記憶化渲染最佳實踐

### 3.1 React.memo 與 useCallback 整合

```typescript
/**
 * 新聞卡片組件 - 記憶化最佳實踐
 */
interface NewsCardProps {
  article: Article;
  onPress: (article: Article) => void;
  onBookmark: (article: Article) => void;
  isBookmarked: boolean;
}

/**
 * 記憶化的新聞卡片組件
 */
export const NewsCard = React.memo<NewsCardProps>(({
  article,
  onPress,
  onBookmark,
  isBookmarked
}) => {
  /**
   * 記憶化點擊處理器
   */
  const handlePress = React.useCallback(() => {
    onPress(article);
  }, [onPress, article]);

  const handleBookmark = React.useCallback(() => {
    onBookmark(article);
  }, [onBookmark, article]);

  return (
    <Card style={styles.newsCard} onPress={handlePress}>
      <Card.Cover 
        source={{ uri: article.urlToImage || '' }}
        style={styles.cardCover}
      />
      <Card.Content>
        <Title numberOfLines={2}>{article.title}</Title>
        <Paragraph numberOfLines={3}>
          {article.description}
        </Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          onPress={handleBookmark}
        />
      </Card.Actions>
    </Card>
  );
}, (prevProps, nextProps) => {
  // 自定義比較函數
  return (
    prevProps.article.url === nextProps.article.url &&
    prevProps.isBookmarked === nextProps.isBookmarked
  );
});

NewsCard.displayName = 'NewsCard';
```

### 3.2 智能 keyExtractor 設計

```typescript
/**
 * 智能鍵值提取器
 */
export class SmartKeyExtractor {
  private keyCache: Map<string, string> = new Map();
  private fallbackCounter: number = 0;

  /**
   * 生成穩定的唯一鍵值
   */
  extractKey = (item: Article, index: number): string => {
    // 優先使用 URL 作為唯一標識
    if (item.url) {
      return this.sanitizeKey(item.url);
    }

    // 次選：標題 + 發布時間
    if (item.title && item.publishedAt) {
      const compositeKey = `${item.title}-${item.publishedAt}`;
      return this.sanitizeKey(compositeKey);
    }

    // 最後手段：使用索引
    const fallbackKey = `fallback-${this.fallbackCounter++}`;
    console.warn(`使用回退鍵值: ${fallbackKey}`);
    return fallbackKey;
  };

  /**
   * 清理鍵值字符串
   */
  private sanitizeKey(key: string): string {
    // 檢查快取
    if (this.keyCache.has(key)) {
      return this.keyCache.get(key)!;
    }

    // 清理特殊字符
    const sanitized = key
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100); // 限制長度

    // 快取結果
    this.keyCache.set(key, sanitized);
    
    // 限制快取大小
    if (this.keyCache.size > 1000) {
      const firstKey = this.keyCache.keys().next().value;
      this.keyCache.delete(firstKey);
    }

    return sanitized;
  }

  /**
   * 清空快取
   */
  clearCache(): void {
    this.keyCache.clear();
    this.fallbackCounter = 0;
  }
}
```

---

## 4. 下拉刷新機制

### 4.1 RefreshControl 實作

```typescript
/**
 * 智能下拉刷新管理器
 */
export class RefreshControlManager {
  private isRefreshing: boolean = false;
  private lastRefreshTime: number = 0;
  private minRefreshInterval: number = 2000; // 最小刷新間隔 2 秒

  /**
   * 執行刷新操作
   */
  async performRefresh(refreshFunction: () => Promise<void>): Promise<void> {
    const now = Date.now();
    
    // 防止頻繁刷新
    if (now - this.lastRefreshTime < this.minRefreshInterval) {
      console.log('刷新頻率過高，忽略本次請求');
      return;
    }

    if (this.isRefreshing) {
      console.log('正在刷新中，忽略重複請求');
      return;
    }

    try {
      this.isRefreshing = true;
      this.lastRefreshTime = now;
      
      await refreshFunction();
      
      console.log('刷新完成');
    } catch (error) {
      console.error('刷新失敗:', error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 獲取刷新狀態
   */
  getRefreshState(): {
    isRefreshing: boolean;
    canRefresh: boolean;
    timeUntilNextRefresh: number;
  } {
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    const canRefresh = timeSinceLastRefresh >= this.minRefreshInterval;
    
    return {
      isRefreshing: this.isRefreshing,
      canRefresh,
      timeUntilNextRefresh: Math.max(0, this.minRefreshInterval - timeSinceLastRefresh)
    };
  }
}

/**
 * 帶刷新功能的新聞列表組件
 */
interface NewsListWithRefreshProps {
  articles: Article[];
  onRefresh: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
}

export const NewsListWithRefresh: React.FC<NewsListWithRefreshProps> = ({
  articles,
  onRefresh,
  onLoadMore
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const refreshManager = React.useRef(new RefreshControlManager()).current;

  /**
   * 處理下拉刷新
   */
  const handleRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshManager.performRefresh(onRefresh);
    } catch (error) {
      console.error('刷新處理失敗:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshManager]);

  /**
   * 處理加載更多
   */
  const handleLoadMore = React.useCallback(async () => {
    if (!onLoadMore || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      await onLoadMore();
    } catch (error) {
      console.error('加載更多失敗:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [onLoadMore, loadingMore]);

  /**
   * 渲染列表項目
   */
  const renderItem: ListRenderItem<Article> = React.useCallback(({ item }) => (
    <NewsCard
      article={item}
      onPress={(article) => console.log('打開文章:', article.title)}
      onBookmark={(article) => console.log('書籤操作:', article.title)}
      isBookmarked={false}
    />
  ), []);

  /**
   * 渲染底部加載指示器
   */
  const renderFooter = React.useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.footerText}>載入更多...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.url || `article-${index}`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#FFB000']} // Android
          tintColor="#FFB000" // iOS
          title="下拉刷新"
          titleColor="#666"
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
};
```

---

## 5. 效能優化配置

### 5.1 關鍵性能參數調教

```typescript
/**
 * FlatList 效能優化配置
 */
export const OptimizedFlatListConfig = {
  /**
   * 基礎性能配置
   */
  performance: {
    // 初始渲染項目數量
    initialNumToRender: 10,
    
    // 視窗大小（螢幕倍數）
    windowSize: 5,
    
    // 最大渲染項目數
    maxToRenderPerBatch: 5,
    
    // 渲染批次間隔
    updateCellsBatchingPeriod: 100,
    
    // 滾動時移除過時視圖
    removeClippedSubviews: true,
    
    // 獲取項目布局優化
    getItemLayout: (data: any[], index: number) => ({
      length: 120, // 固定項目高度
      offset: 120 * index,
      index
    })
  },

  /**
   * 記憶體優化配置
   */
  memory: {
    // 啟用虛擬化
    disableVirtualization: false,
    
    // 項目分隔符組件
    ItemSeparatorComponent: () => (
      <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
    ),
    
    // 列表為空時顯示
    ListEmptyComponent: () => (
      <View style={styles.emptyContainer}>
        <Text>暫無內容</Text>
      </View>
    )
  }
};

/**
 * 自適應性能配置生成器
 */
export class AdaptivePerformanceConfig {
  /**
   * 根據設備性能生成配置
   */
  static generateConfig(deviceInfo: {
    ram: number; // GB
    isLowEnd: boolean;
    platform: 'ios' | 'android';
  }): typeof OptimizedFlatListConfig.performance {
    const baseConfig = OptimizedFlatListConfig.performance;

    if (deviceInfo.isLowEnd || deviceInfo.ram < 3) {
      // 低端設備優化
      return {
        ...baseConfig,
        initialNumToRender: 5,
        windowSize: 3,
        maxToRenderPerBatch: 3,
        updateCellsBatchingPeriod: 200
      };
    }

    if (deviceInfo.ram >= 6) {
      // 高端設備可提升性能
      return {
        ...baseConfig,
        initialNumToRender: 15,
        windowSize: 7,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 50
      };
    }

    return baseConfig;
  }

  /**
   * 動態調整配置
   */
  static adjustForDataSize(
    config: typeof OptimizedFlatListConfig.performance,
    dataSize: number
  ): typeof OptimizedFlatListConfig.performance {
    if (dataSize > 1000) {
      // 大數據集優化
      return {
        ...config,
        windowSize: Math.min(config.windowSize, 4),
        maxToRenderPerBatch: Math.min(config.maxToRenderPerBatch, 3)
      };
    }

    return config;
  }
}
```

### 5.2 性能監控實作

```typescript
/**
 * FlatList 性能監控組件
 */
export const MonitoredFlatList = <T extends any>(props: {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onPerformanceReport?: (report: PerformanceReport) => void;
}) => {
  const performanceMonitor = React.useRef(new FlatListPerformanceMonitor()).current;
  const [performanceMetrics, setPerformanceMetrics] = React.useState<PerformanceReport | null>(null);

  /**
   * 監控滾動性能
   */
  const handleScroll = React.useCallback((event: any) => {
    const now = performance.now();
    // 記錄滾動事件時間
    performanceMonitor.recordScrollEvent(now);
  }, [performanceMonitor]);

  /**
   * 定期生成性能報告
   */
  React.useEffect(() => {
    const interval = setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      setPerformanceMetrics(report);
      props.onPerformanceReport?.(report);
    }, 5000); // 每 5 秒報告一次

    return () => clearInterval(interval);
  }, [performanceMonitor, props.onPerformanceReport]);

  /**
   * 包裝渲染函數以監控性能
   */
  const monitoredRenderItem: ListRenderItem<T> = React.useCallback((info) => {
    const startTime = performance.now();
    const result = props.renderItem(info);
    const endTime = performance.now();
    
    performanceMonitor.recordRenderTime(endTime - startTime);
    return result;
  }, [props.renderItem, performanceMonitor]);

  return (
    <>
      <FlatList
        {...props}
        renderItem={monitoredRenderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {__DEV__ && performanceMetrics && (
        <PerformanceOverlay metrics={performanceMetrics} />
      )}
    </>
  );
};

/**
 * 性能覆蓋層（開發模式）
 */
const PerformanceOverlay: React.FC<{ metrics: PerformanceReport }> = ({ metrics }) => (
  <View style={styles.performanceOverlay}>
    <Text style={styles.metricText}>
      平均渲染: {metrics.averageRenderTime.toFixed(2)}ms
    </Text>
    <Text style={styles.metricText}>
      慢渲染: {metrics.slowRenders}
    </Text>
    <Text style={styles.metricText}>
      FPS: {(1000 / metrics.averageRenderTime).toFixed(1)}
    </Text>
  </View>
);
```

---

## 6. 實戰案例：NewsBrief 新聞列表

### 6.1 完整的新聞列表實作

```typescript
/**
 * NewsBrief 新聞列表組件
 * 整合所有 FlatList 最佳實踐
 */
interface NewsBriefListProps {
  category: string;
}

export const NewsBriefList: React.FC<NewsBriefListProps> = ({ category }) => {
  const dispatch = useAppDispatch();
  const { 
    articles, 
    isLoading, 
    error, 
    hasMore,
    refreshing 
  } = useAppSelector(state => state.news);
  
  const bookmarks = useAppSelector(state => state.bookmarks.items);
  const navigation = useNavigation();

  // 性能優化：記憶化計算
  const keyExtractor = React.useMemo(() => {
    const extractor = new SmartKeyExtractor();
    return extractor.extractKey;
  }, []);

  const refreshManager = React.useRef(new RefreshControlManager()).current;

  /**
   * 載入新聞數據
   */
  const loadNews = React.useCallback(async () => {
    try {
      await dispatch(fetchNews({ 
        category, 
        page: 1,
        refresh: true 
      })).unwrap();
    } catch (error) {
      console.error('載入新聞失敗:', error);
    }
  }, [dispatch, category]);

  /**
   * 載入更多新聞
   */
  const loadMoreNews = React.useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      await dispatch(fetchNews({ 
        category, 
        page: Math.floor(articles.length / 20) + 1,
        refresh: false 
      })).unwrap();
    } catch (error) {
      console.error('載入更多失敗:', error);
    }
  }, [dispatch, category, hasMore, isLoading, articles.length]);

  /**
   * 處理下拉刷新
   */
  const handleRefresh = React.useCallback(async () => {
    await refreshManager.performRefresh(loadNews);
  }, [refreshManager, loadNews]);

  /**
   * 處理文章點擊
   */
  const handleArticlePress = React.useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { article });
  }, [navigation]);

  /**
   * 處理書籤操作
   */
  const handleBookmarkToggle = React.useCallback((article: Article) => {
    const isBookmarked = bookmarks.some(bookmark => bookmark.url === article.url);
    
    if (isBookmarked) {
      dispatch(removeBookmark(article.url));
    } else {
      dispatch(addBookmark(article));
    }
  }, [dispatch, bookmarks]);

  /**
   * 渲染新聞項目
   */
  const renderNewsItem: ListRenderItem<Article> = React.useCallback(({ item, index }) => {
    const isBookmarked = bookmarks.some(bookmark => bookmark.url === item.url);

    return (
      <NewsCard
        article={item}
        onPress={handleArticlePress}
        onBookmark={handleBookmarkToggle}
        isBookmarked={isBookmarked}
      />
    );
  }, [bookmarks, handleArticlePress, handleBookmarkToggle]);

  /**
   * 渲染列表頭部
   */
  const renderHeader = React.useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
      <Text style={styles.articleCount}>
        {articles.length} 篇文章
      </Text>
    </View>
  ), [category, articles.length]);

  /**
   * 渲染空列表
   */
  const renderEmpty = React.useCallback(() => (
    <View style={styles.emptyContainer}>
      <IconButton icon="newspaper-variant-outline" size={64} />
      <Text style={styles.emptyTitle}>暫無新聞</Text>
      <Text style={styles.emptySubtitle}>請下拉刷新或稍後再試</Text>
    </View>
  ), []);

  /**
   * 渲染底部載入器
   */
  const renderFooter = React.useCallback(() => {
    if (!isLoading || articles.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFB000" />
        <Text style={styles.footerText}>載入更多新聞...</Text>
      </View>
    );
  }, [isLoading, articles.length]);

  /**
   * 初始化載入
   */
  React.useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <View style={styles.container}>
      <MonitoredFlatList
        data={articles}
        renderItem={renderNewsItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FFB000']}
            tintColor="#FFB000"
            title="下拉刷新"
          />
        }
        onEndReached={loadMoreNews}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        {...OptimizedFlatListConfig.performance}
        {...OptimizedFlatListConfig.memory}
      />
    </View>
  );
};

/**
 * 樣式定義
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  headerContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  articleCount: {
    fontSize: 14,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666'
  },
  performanceOverlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5
  },
  metricText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace'
  }
});
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **記憶化優化**
    - 使用 React.memo 包裝列表項目
    - 實作穩定的 keyExtractor
    - 記憶化事件處理器

2. **性能配置**
    - 根據設備性能調整參數
    - 啟用虛擬化和視圖回收
    - 合理設置批次渲染參數

3. **用戶體驗**
    - 實作下拉刷新機制
    - 提供載入狀態反饋
    - 處理空列表狀態

### ❌ 常見陷阱

1. **不穩定的 key**

```typescript
// ❌ 避免：使用索引作為 key
keyExtractor={(item, index) => index.toString()}

// ✅ 建議：使用穩定的唯一標識
keyExtractor={(item, index) => item.id || `stable-${index}`}
```

2. **未記憶化的渲染函數**

```typescript
// ❌ 避免：每次重新創建函數
const renderItem = ({ item }) => <ItemComponent item={item} />;

// ✅ 建議：使用 useCallback 記憶化
const renderItem = React.useCallback(({ item }) => (
  <ItemComponent item={item} />
), []);
```

---

## 🔗 相關教學

- [React Hooks 完全攻略](../02-react-hooks/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)
- [錯誤處理與應用程式品質](../12-error-handling/README.md)

---

## 📖 延伸閱讀

- [FlatList 官方文件](https://reactnative.dev/docs/flatlist)
- [React Native 性能優化指南](https://reactnative.dev/docs/performance)
- [虛擬化列表最佳實踐](https://reactnative.dev/docs/optimizing-flatlist-configuration)