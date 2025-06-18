import React, { useCallback, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetHeadlinesQuery } from '../store/api/newsApi';
import { addBookmark, removeBookmark, loadBookmarksAsync } from '../store/slices/bookmarksSlice';
import { selectBookmarkItems } from '../store/selectors/bookmarksSelectors';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Article } from '../types';

/**
 * 頭條新聞頁面 - 使用Redux管理狀態
 */
export const HeadlinesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 獲取書籤列表
  const bookmarkItems = useAppSelector(selectBookmarkItems);
  
  // 使用RTK Query獲取新聞數據
  const { 
    data: articles = [], 
    isLoading, 
    error, 
    refetch, 
    isFetching 
  } = useGetHeadlinesQuery({ 
    category: 'technology', 
    country: 'us' 
  });

  // 載入書籤數據
  useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, [dispatch]);

  /**
   * 檢查是否已加入書籤
   */
  const isBookmarked = useCallback((articleId: string) => {
    return bookmarkItems.includes(articleId);
  }, [bookmarkItems]);

  /**
   * 處理書籤切換
   */
  const handleBookmarkToggle = useCallback((articleId: string) => {
    if (isBookmarked(articleId)) {
      dispatch(removeBookmark(articleId));
    } else {
      dispatch(addBookmark(articleId));
    }
  }, [dispatch, isBookmarked]);

  /**
   * 渲染新聞項目
   */
  const renderNewsItem = useCallback(({ item }: { item: Article }) => {
    return (
      <NewsCard
        article={item}
        isBookmarked={isBookmarked(item.id)}
        onBookmarkToggle={handleBookmarkToggle}
      />
    );
  }, [handleBookmarkToggle, isBookmarked]);

  /**
   * 項目分隔符
   */
  const keyExtractor = useCallback((item: Article) => item.id, []);

  // 除錯：顯示載入狀態和錯誤資訊
  console.log('HeadlinesScreen 狀態:', {
    articlesCount: articles.length,
    isLoading,
    error: error,
    isFetching
  });

  if (isLoading && !articles.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.customHeader}>
          <Text style={styles.customHeaderTitle}>科技頭條</Text>
        </View>
        <LoadingSpinner message="載入新聞中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderTitle}>科技頭條</Text>
      </View>
      
      <ErrorBoundary error={error} retry={() => refetch()}>
        <Surface style={styles.surface}>
          <FlatList
            data={articles}
            renderItem={renderNewsItem}
            keyExtractor={keyExtractor}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetch}
                colors={['#ff9800']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={3}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              console.log('已到達列表底部');
            }}
            ListFooterComponent={() => (
              <View style={{ 
                padding: 20, 
                alignItems: 'center' 
              }}>
                <Text style={{ 
                  color: '#666', 
                  fontSize: 14 
                }}>
                  {articles.length > 0 ? '已顯示所有新聞' : ''}
                </Text>
              </View>
            )}
          />
        </Surface>
      </ErrorBoundary>
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
  customHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d1b16',
    textAlign: 'left',
  },
  surface: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
});
