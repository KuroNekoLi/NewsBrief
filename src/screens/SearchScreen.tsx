import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Surface, Text, Card, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useLazySearchNewsQuery } from '../store/api/newsApi';
import { addBookmark, removeBookmark, loadBookmarksAsync } from '../store/slices/bookmarksSlice';
import { selectBookmarkItems } from '../store/selectors/bookmarksSelectors';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Article } from '../types';

/**
 * 新聞搜尋頁面 - 使用Redux管理狀態
 */
export const SearchScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarkItems = useAppSelector(selectBookmarkItems);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  
  // 使用懶載入的搜索查詢
    const [triggerSearch, {data, isLoading, isFetching}] = useLazySearchNewsQuery();

  // 載入書籤數據
  useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, [dispatch]);

  // 當搜索結果更新時，更新本地狀態
  useEffect(() => {
    if (data) {
      setSearchResults(data);
    }
  }, [data]);

  /**
   * 處理搜索
   */
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      triggerSearch({ query: searchQuery.trim() });
    }
  }, [searchQuery, triggerSearch]);

  /**
   * 處理搜索文字變更
   */
  const handleSearchTextChange = useCallback((query: string) => {
    setSearchQuery(query);
    // 清空之前的結果
    if (!query.trim()) {
      setSearchResults([]);
    }
  }, []);

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
   * 渲染空狀態
   */
  const renderEmptyState = () => {
    if (!searchQuery.trim()) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.cardContent}>
            <Text variant="displaySmall" style={styles.icon}>🔍</Text>
            <Text variant="headlineSmall" style={styles.title}>
              搜尋新聞
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              輸入關鍵字來搜尋相關新聞
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.cardContent}>
          <Text variant="displaySmall" style={styles.icon}>😔</Text>
          <Text variant="headlineSmall" style={styles.title}>
            找不到相關新聞
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            請嘗試其他關鍵字
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderTitle}>新聞搜尋</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜尋新聞..."
          onChangeText={handleSearchTextChange}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
          loading={isLoading || isFetching}
        />
      </View>
      
      <Surface style={styles.surface}>
        {(isLoading || isFetching) ? (
          <LoadingSpinner message="搜尋中..." />
        ) : searchResults.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderNewsItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
            onEndReachedThreshold={0.2}
          />
        )}
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffde7',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fffde7',
  },
  searchbar: {
    backgroundColor: '#fff',
    elevation: 2,
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
  cardContent: {
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    textAlign: 'center',
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
});
