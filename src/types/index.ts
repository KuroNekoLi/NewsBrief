/**
 * 新聞文章介面定義
 */
export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author?: string;
  content?: string;
}

/**
 * News API 回應格式
 */
export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

/**
 * 書籤上下文型別
 */
export interface BookmarkContextType {
  bookmarks: string[];
  addBookmark: (articleId: string) => void;
  removeBookmark: (articleId: string) => void;
  clearAllBookmarks: () => void;
  isBookmarked: (articleId: string) => boolean;
}

/**
 * 新聞卡片組件屬性
 */
export interface NewsCardProps {
  article: Article;
  isBookmarked: boolean;
  onBookmarkToggle: (articleId: string) => void;
  onPress?: () => void;
}