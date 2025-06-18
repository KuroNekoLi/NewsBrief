import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BOOKMARKS: 'bookmarks',
  NEWS_CACHE: 'news_cache',
} as const;

/**
 * 儲存書籤列表
 */
export const saveBookmarks = async (bookmarks: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('儲存書籤失敗:', error);
  }
};

/**
 * 載入書籤列表
 */
export const loadBookmarks = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('載入書籤失敗:', error);
    return [];
  }
};

/**
 * 快取新聞資料
 */
export const cacheNews = async (news: any): Promise<void> => {
  try {
    const cacheData = {
      data: news,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(KEYS.NEWS_CACHE, JSON.stringify(cacheData));
  } catch (error) {
    console.error('快取新聞失敗:', error);
  }
};

/**
 * 載入快取的新聞資料
 */
export const loadCachedNews = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.NEWS_CACHE);
    if (data) {
      const parsed = JSON.parse(data);
      // 檢查快取是否過期（24小時）
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
      return isExpired ? null : parsed.data;
    }
    return null;
  } catch (error) {
    console.error('載入快取新聞失敗:', error);
    return null;
  }
};