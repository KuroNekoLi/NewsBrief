import React, { useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Surface, Text, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetHeadlinesQuery } from '../store/api/newsApi';
import { clearAllBookmarks, removeBookmark, loadBookmarksAsync } from '../store/slices/bookmarksSlice';
import { selectBookmarkItems, selectBookmarksLoading } from '../store/selectors/bookmarksSelectors';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Article } from '../types';

/**
 * 書籤頁面 - 使用Redux管理狀態
 */
export const BookmarksScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 獲取書籤相關狀態
  const bookmarkItems = useAppSelector(selectBookmarkItems);
  const isBookmarksLoading = useAppSelector(selectBookmarksLoading);
  
  // 獲取所有新聞數據
  const { data: allNews = [], isLoading: isNewsLoading } = useGetHeadlinesQuery({ 
    category: 'technology', 
    country: 'us' 
  });

  // 載入書籤數據
  useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, [dispatch]);

  /**
   * 取得書籤文章
   */
  const bookmarkedArticles = allNews.filter(article => bookmarkItems.includes(article.id));

  /**
   * 檢查是否已加入書籤
   */
  const isBookmarked = useCallback((articleId: string) => {
    return bookmarkItems.includes(articleId);
  }, [bookmarkItems]);

  /**
   * 處理書籤切換（移除）
   */
  const handleBookmarkToggle = useCallback((articleId: string) => {
    dispatch(removeBookmark(articleId));
  }, [dispatch]);

  /**
   * 渲染新聞項目
   */
  const renderNewsItem = useCallback(({ item }: { item: Article }) => (
    <NewsCard
      article={item}
      isBookmarked={isBookmarked(item.id)}
      onBookmarkToggle={handleBookmarkToggle}
    />
  ), [isBookmarked, handleBookmarkToggle]);

  /**
   * 項目分隔符
   */
  const keyExtractor = useCallback((item: Article) => item.id, []);

  /**
   * 處理清除所有書籤
   */
  const handleClearAll = useCallback(() => {
    dispatch(clearAllBookmarks());
  }, [dispatch]);

  /**
   * 渲染空狀態
   */
  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          尚無收藏的新聞
        </Text>
        <Text variant="bodyMedium" style={styles.emptyMessage}>
          點擊新聞卡片上的星號按鈕來收藏您感興趣的新聞
        </Text>
      </Card.Content>
    </Card>
  );

  const isLoading = isBookmarksLoading || isNewsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.customHeader}>
          <Text style={styles.customHeaderTitle}>我的書籤</Text>
        </View>
        <LoadingSpinner message="載入書籤中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.customHeaderTitle}>
            我的書籤 ({bookmarkItems.length})
          </Text>
          {bookmarkItems.length > 0 && (
            <IconButton
              icon="delete-sweep"
              size={24}
              onPress={handleClearAll}
              iconColor="#ff9800"
            />
          )}
        </View>
      </View>
      
      <Surface style={styles.surface}>
        {bookmarkedArticles.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={bookmarkedArticles}
            renderItem={renderNewsItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={3}
            onEndReachedThreshold={0.1}
          />
        )}
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffde7',  // 黃色背景
  },
  customHeader: {
    backgroundColor: '#fffde7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d1b16',
    textAlign: 'left',
    flex: 1,
  },
  surface: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyCard: {
    margin: 16,
    marginTop: 60,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});
