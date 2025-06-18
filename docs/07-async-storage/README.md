# 💾 AsyncStorage 本地數據持久化

基於 NewsBrief 專案的 AsyncStorage 企業級本地數據持久化實戰

## 🎯 學習目標

- 掌握 AsyncStorage 書籤系統的儲存策略
- 學會數據序列化與反序列化最佳實踐
- 理解錯誤處理與資料遷移機制
- 實作快取過期機制與數據同步

## 📚 目錄

1. [AsyncStorage 基礎概念](#1-asyncstorage-基礎概念)
2. [書籤系統儲存策略](#2-書籤系統儲存策略)
3. [數據序列化與反序列化](#3-數據序列化與反序列化)
4. [錯誤處理與資料遷移](#4-錯誤處理與資料遷移)
5. [快取過期機制實作](#5-快取過期機制實作)
6. [實戰案例：NewsBrief 持久化架構](#6-實戰案例newsbrief-持久化架構)

---

## 1. AsyncStorage 基礎概念

### 1.1 AsyncStorage 核心特性

```typescript
/**
 * AsyncStorage 核心特性
 * - 異步 API 設計
 * - Key-Value 儲存結構
 * - 字串類型數據存儲
 * - 跨平台兼容性
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 基本操作示例
 */
export class AsyncStorageExample {
  /**
   * 儲存數據
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      console.log('數據儲存成功');
    } catch (error) {
      console.error('儲存失敗:', error);
    }
  }

  /**
   * 讀取數據
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('讀取失敗:', error);
      return null;
    }
  }

  /**
   * 移除數據
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log('數據移除成功');
    } catch (error) {
      console.error('移除失敗:', error);
    }
  }

  /**
   * 批量操作
   */
  static async multiSet(keyValuePairs: string[][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      console.log('批量儲存成功');
    } catch (error) {
      console.error('批量儲存失敗:', error);
    }
  }
}
```

### 1.2 數據儲存策略設計

```typescript
/**
 * NewsBrief 數據儲存策略
 * 基於實際專案需求的儲存設計
 */
export enum StorageKeys {
  // 書籤相關
  BOOKMARKS = 'news_bookmarks',
  BOOKMARK_METADATA = 'bookmark_metadata',
  
  // 用戶偏好
  USER_PREFERENCES = 'user_preferences',
  THEME_SETTINGS = 'theme_settings',
  LANGUAGE_SETTINGS = 'language_settings',
  
  // 快取數據
  NEWS_CACHE = 'news_cache',
  SEARCH_HISTORY = 'search_history',
  
  // 應用狀態
  APP_VERSION = 'app_version',
  LAST_UPDATE_TIME = 'last_update_time'
}

/**
 * 儲存策略配置
 */
interface StorageConfig {
  key: StorageKeys;
  ttl?: number; // 生存時間（毫秒）
  compress?: boolean; // 是否壓縮
  encrypt?: boolean; // 是否加密
  backup?: boolean; // 是否備份
}

/**
 * 儲存管理器基類
 */
export abstract class BaseStorageManager {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * 生成帶時間戳的儲存對象
   */
  protected createStorageObject<T>(data: T) {
    return {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  /**
   * 檢查數據是否過期
   */
  protected isExpired(timestamp: number): boolean {
    if (!this.config.ttl) return false;
    return Date.now() - timestamp > this.config.ttl;
  }

  /**
   * 抽象方法：保存數據
   */
  abstract save<T>(data: T): Promise<void>;

  /**
   * 抽象方法：載入數據
   */
  abstract load<T>(): Promise<T | null>;

  /**
   * 抽象方法：清除數據
   */
  abstract clear(): Promise<void>;
}
```

---

## 2. 書籤系統儲存策略

### 2.1 書籤數據模型

```typescript
/**
 * 書籤數據模型
 * 基於 NewsBrief 實際需求設計
 */
export interface BookmarkItem {
  // 基本文章資訊
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  
  // 書籤特定資訊
  bookmarkedAt: number; // 加入書籤的時間戳
  category?: string; // 用戶自定義分類
  tags?: string[]; // 標籤
  notes?: string; // 個人筆記
  isRead?: boolean; // 是否已讀
  priority?: 'low' | 'medium' | 'high'; // 優先級
}

/**
 * 書籤元數據
 */
export interface BookmarkMetadata {
  totalCount: number;
  categories: string[];
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'error';
  version: string;
}

/**
 * 書籤儲存容器
 */
export interface BookmarkStorage {
  items: BookmarkItem[];
  metadata: BookmarkMetadata;
  timestamp: number;
  version: string;
}
```

### 2.2 書籤管理器實作

```typescript
/**
 * 書籤管理器
 * 處理書籤的 CRUD 操作與持久化
 */
export class BookmarkManager extends BaseStorageManager {
  private static instance: BookmarkManager;
  private cache: BookmarkItem[] = [];
  private metadata: BookmarkMetadata;

  constructor() {
    super({
      key: StorageKeys.BOOKMARKS,
      ttl: 0, // 書籤永不過期
      backup: true
    });

    this.metadata = {
      totalCount: 0,
      categories: [],
      lastModified: Date.now(),
      syncStatus: 'synced',
      version: '1.0'
    };
  }

  /**
   * 單例模式
   */
  static getInstance(): BookmarkManager {
    if (!BookmarkManager.instance) {
      BookmarkManager.instance = new BookmarkManager();
    }
    return BookmarkManager.instance;
  }

  /**
   * 初始化：載入儲存的書籤
   */
  async initialize(): Promise<void> {
    try {
      const stored = await this.load<BookmarkStorage>();
      if (stored) {
        this.cache = stored.items || [];
        this.metadata = stored.metadata || this.metadata;
        console.log(`載入 ${this.cache.length} 個書籤`);
      }
    } catch (error) {
      console.error('書籤初始化失敗:', error);
      await this.handleCorruptedData();
    }
  }

  /**
   * 新增書籤
   */
  async addBookmark(article: Omit<BookmarkItem, 'bookmarkedAt'>): Promise<boolean> {
    try {
      // 檢查是否已存在
      const exists = this.cache.some(item => item.url === article.url);
      if (exists) {
        console.warn('書籤已存在:', article.url);
        return false;
      }

      // 創建書籤項目
      const bookmarkItem: BookmarkItem = {
        ...article,
        bookmarkedAt: Date.now(),
        isRead: false,
        priority: 'medium'
      };

      // 添加到快取
      this.cache.unshift(bookmarkItem); // 最新的在前面

      // 更新元數據
      this.updateMetadata();

      // 持久化
      await this.save(this.createStorageData());

      console.log('書籤新增成功:', article.title);
      return true;
    } catch (error) {
      console.error('新增書籤失敗:', error);
      return false;
    }
  }

  /**
   * 移除書籤
   */
  async removeBookmark(url: string): Promise<boolean> {
    try {
      const initialLength = this.cache.length;
      this.cache = this.cache.filter(item => item.url !== url);

      if (this.cache.length === initialLength) {
        console.warn('書籤不存在:', url);
        return false;
      }

      // 更新元數據
      this.updateMetadata();

      // 持久化
      await this.save(this.createStorageData());

      console.log('書籤移除成功:', url);
      return true;
    } catch (error) {
      console.error('移除書籤失敗:', error);
      return false;
    }
  }

  /**
   * 更新書籤
   */
  async updateBookmark(url: string, updates: Partial<BookmarkItem>): Promise<boolean> {
    try {
      const index = this.cache.findIndex(item => item.url === url);
      if (index === -1) {
        console.warn('書籤不存在:', url);
        return false;
      }

      // 更新書籤
      this.cache[index] = {
        ...this.cache[index],
        ...updates
      };

      // 更新元數據
      this.updateMetadata();

      // 持久化
      await this.save(this.createStorageData());

      console.log('書籤更新成功:', url);
      return true;
    } catch (error) {
      console.error('更新書籤失敗:', error);
      return false;
    }
  }

  /**
   * 獲取所有書籤
   */
  getAllBookmarks(): BookmarkItem[] {
    return [...this.cache];
  }

  /**
   * 根據分類獲取書籤
   */
  getBookmarksByCategory(category: string): BookmarkItem[] {
    return this.cache.filter(item => item.category === category);
  }

  /**
   * 搜尋書籤
   */
  searchBookmarks(query: string): BookmarkItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.cache.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.notes?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * 檢查是否為書籤
   */
  isBookmarked(url: string): boolean {
    return this.cache.some(item => item.url === url);
  }

  /**
   * 清空所有書籤
   */
  async clearAllBookmarks(): Promise<void> {
    try {
      this.cache = [];
      this.updateMetadata();
      await this.save(this.createStorageData());
      console.log('所有書籤已清空');
    } catch (error) {
      console.error('清空書籤失敗:', error);
    }
  }

  /**
   * 獲取書籤統計
   */
  getBookmarkStats() {
    const categories = [...new Set(this.cache.map(item => item.category).filter(Boolean))];
    const unreadCount = this.cache.filter(item => !item.isRead).length;
    const totalSize = this.calculateDataSize();

    return {
      total: this.cache.length,
      categories: categories.length,
      unread: unreadCount,
      size: totalSize,
      lastModified: this.metadata.lastModified
    };
  }

  /**
   * 實作基類的抽象方法
   */
  async save<T>(data: T): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await AsyncStorage.setItem(this.config.key, serialized);
    } catch (error) {
      throw new Error(`儲存失敗: ${error}`);
    }
  }

  async load<T>(): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(this.config.key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
      return null;
    } catch (error) {
      throw new Error(`載入失敗: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.config.key);
      this.cache = [];
      this.updateMetadata();
    } catch (error) {
      throw new Error(`清除失敗: ${error}`);
    }
  }

  /**
   * 私有方法：更新元數據
   */
  private updateMetadata(): void {
    const categories = [...new Set(this.cache.map(item => item.category).filter(Boolean))];
    
    this.metadata = {
      totalCount: this.cache.length,
      categories,
      lastModified: Date.now(),
      syncStatus: 'pending',
      version: '1.0'
    };
  }

  /**
   * 私有方法：創建儲存數據
   */
  private createStorageData(): BookmarkStorage {
    return {
      items: this.cache,
      metadata: this.metadata,
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  /**
   * 私有方法：計算數據大小
   */
  private calculateDataSize(): number {
    const data = this.createStorageData();
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * 私有方法：處理損壞的數據
   */
  private async handleCorruptedData(): Promise<void> {
    console.warn('檢測到損壞的書籤數據，進行重置');
    this.cache = [];
    this.updateMetadata();
    await this.save(this.createStorageData());
  }
}
```

---

## 3. 數據序列化與反序列化

### 3.1 安全的序列化處理

```typescript
/**
 * 安全的數據序列化工具
 * 處理複雜數據類型與錯誤恢復
 */
export class SerializationUtils {
  /**
   * 安全序列化
   */
  static safeStringify<T>(data: T, replacer?: (key: string, value: any) => any): string {
    try {
      return JSON.stringify(data, replacer);
    } catch (error) {
      console.error('序列化失敗:', error);
      // 回退策略：移除可能有問題的屬性
      return JSON.stringify(this.sanitizeData(data));
    }
  }

  /**
   * 安全反序列化
   */
  static safeParse<T>(jsonString: string, reviver?: (key: string, value: any) => any): T | null {
    try {
      return JSON.parse(jsonString, reviver) as T;
    } catch (error) {
      console.error('反序列化失敗:', error);
      return null;
    }
  }

  /**
   * 數據清理
   */
  private static sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'function') {
      return undefined; // 移除函數
    }

    if (data instanceof Date) {
      return data.toISOString(); // 轉換日期為字串
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item)).filter(item => item !== undefined);
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedValue = this.sanitizeData(value);
        if (sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * 數據壓縮（簡化版）
   */
  static compress(data: string): string {
    // 簡單的壓縮：移除多餘空格
    return data.replace(/\s+/g, ' ').trim();
  }

  /**
   * 數據解壓縮
   */
  static decompress(compressedData: string): string {
    // 對應解壓縮邏輯
    return compressedData;
  }
}

/**
 * 帶版本管理的序列化
 */
export class VersionedSerializer {
  private static readonly CURRENT_VERSION = '1.0';

  /**
   * 序列化帶版本信息的數據
   */
  static serialize<T>(data: T, version?: string): string {
    const versionedData = {
      version: version || this.CURRENT_VERSION,
      timestamp: Date.now(),
      data
    };
    
    return SerializationUtils.safeStringify(versionedData);
  }

  /**
   * 反序列化並檢查版本
   */
  static deserialize<T>(serializedData: string): { data: T; version: string; timestamp: number } | null {
    const parsed = SerializationUtils.safeParse(serializedData);
    
    if (!parsed || !parsed.version || !parsed.data) {
      return null;
    }

    // 版本檢查
    if (parsed.version !== this.CURRENT_VERSION) {
      console.warn(`版本不匹配: 期望 ${this.CURRENT_VERSION}, 實際 ${parsed.version}`);
      // 可以在這裡實作版本遷移邏輯
    }

    return {
      data: parsed.data as T,
      version: parsed.version,
      timestamp: parsed.timestamp || Date.now()
    };
  }
}
```

### 3.2 類型安全的儲存介面

```typescript
/**
 * 類型安全的儲存介面
 * 確保存取數據的類型一致性
 */
export class TypedStorage {
  /**
   * 類型安全的設置方法
   */
  static async setTypedItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = VersionedSerializer.serialize(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`設置 ${key} 失敗: ${error}`);
    }
  }

  /**
   * 類型安全的獲取方法
   */
  static async getTypedItem<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) {
        return null;
      }

      const deserialized = VersionedSerializer.deserialize<T>(stored);
      return deserialized ? deserialized.data : null;
    } catch (error) {
      console.error(`獲取 ${key} 失敗:`, error);
      return null;
    }
  }

  /**
   * 帶默認值的獲取方法
   */
  static async getTypedItemWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.getTypedItem<T>(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * 批量類型安全操作
   */
  static async multiSetTyped<T>(items: Array<{ key: string; value: T }>): Promise<void> {
    try {
      const keyValuePairs: string[][] = items.map(({ key, value }) => [
        key,
        VersionedSerializer.serialize(value)
      ]);
      
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      throw new Error(`批量設置失敗: ${error}`);
    }
  }

  /**
   * 批量獲取
   */
  static async multiGetTyped<T>(keys: string[]): Promise<Array<{ key: string; value: T | null }>> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      
      return results.map(([key, stored]) => ({
        key,
        value: stored ? VersionedSerializer.deserialize<T>(stored)?.data || null : null
      }));
    } catch (error) {
      console.error('批量獲取失敗:', error);
      return keys.map(key => ({ key, value: null }));
    }
  }
}
```

---

## 4. 錯誤處理與資料遷移

### 4.1 錯誤處理策略

```typescript
/**
 * 儲存錯誤類型
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DATA_CORRUPTED = 'DATA_CORRUPTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 自定義儲存錯誤
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * 錯誤處理管理器
 */
export class StorageErrorHandler {
  /**
   * 處理 AsyncStorage 錯誤
   */
  static handleAsyncStorageError(error: any): StorageError {
    if (error.message?.includes('quota')) {
      return new StorageError(
        StorageErrorType.QUOTA_EXCEEDED,
        '儲存空間不足，請清理一些數據',
        error
      );
    }

    if (error.message?.includes('permission')) {
      return new StorageError(
        StorageErrorType.PERMISSION_DENIED,
        '沒有儲存權限',
        error
      );
    }

    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      return new StorageError(
        StorageErrorType.DATA_CORRUPTED,
        '數據已損壞，將進行重置',
        error
      );
    }

    return new StorageError(
      StorageErrorType.UNKNOWN_ERROR,
      '儲存操作失敗',
      error
    );
  }

  /**
   * 錯誤恢復策略
   */
  static async recoverFromError(error: StorageError, key: string): Promise<boolean> {
    switch (error.type) {
      case StorageErrorType.QUOTA_EXCEEDED:
        return await this.handleQuotaExceeded();
        
      case StorageErrorType.DATA_CORRUPTED:
        return await this.handleDataCorruption(key);
        
      case StorageErrorType.PERMISSION_DENIED:
        return await this.handlePermissionDenied();
        
      default:
        return false;
    }
  }

  /**
   * 處理儲存空間不足
   */
  private static async handleQuotaExceeded(): Promise<boolean> {
    try {
      // 清理過期的快取數據
      await this.cleanupExpiredCache();
      
      // 壓縮現有數據
      await this.compressExistingData();
      
      return true;
    } catch (error) {
      console.error('清理儲存空間失敗:', error);
      return false;
    }
  }

  /**
   * 處理數據損壞
   */
  private static async handleDataCorruption(key: string): Promise<boolean> {
    try {
      // 嘗試恢復備份
      const backup = await AsyncStorage.getItem(`${key}_backup`);
      if (backup) {
        await AsyncStorage.setItem(key, backup);
        return true;
      }

      // 沒有備份則重置為默認值
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('數據恢復失敗:', error);
      return false;
    }
  }

  /**
   * 處理權限問題
   */
  private static async handlePermissionDenied(): Promise<boolean> {
    // 降級到記憶體儲存
    console.warn('降級到記憶體儲存模式');
    return false;
  }

  /**
   * 清理過期快取
   */
  private static async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.includes('_cache'));
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = SerializationUtils.safeParse(stored);
          if (parsed && parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            if (age > 24 * 60 * 60 * 1000) { // 超過 24 小時
              await AsyncStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('清理快取失敗:', error);
    }
  }

  /**
   * 壓縮現有數據
   */
  private static async compressExistingData(): Promise<void> {
    // 實作數據壓縮邏輯
    console.log('執行數據壓縮...');
  }
}
```

### 4.2 資料遷移系統

```typescript
/**
 * 數據遷移管理器
 */
export class DataMigrationManager {
  private static readonly MIGRATION_KEY = 'data_migration_version';
  private static readonly CURRENT_VERSION = 3;

  /**
   * 檢查並執行必要的遷移
   */
  static async checkAndMigrate(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentMigrationVersion();
      
      if (currentVersion < this.CURRENT_VERSION) {
        console.log(`開始數據遷移：從版本 ${currentVersion} 到 ${this.CURRENT_VERSION}`);
        await this.performMigration(currentVersion);
      }
    } catch (error) {
      console.error('數據遷移失敗:', error);
    }
  }

  /**
   * 獲取當前遷移版本
   */
  private static async getCurrentMigrationVersion(): Promise<number> {
    try {
      const version = await AsyncStorage.getItem(this.MIGRATION_KEY);
      return version ? parseInt(version, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 執行遷移
   */
  private static async performMigration(fromVersion: number): Promise<void> {
    const migrations = [
      this.migrateToV1, // 0 -> 1
      this.migrateToV2, // 1 -> 2
      this.migrateToV3  // 2 -> 3
    ];

    for (let i = fromVersion; i < this.CURRENT_VERSION; i++) {
      console.log(`執行遷移 v${i} -> v${i + 1}`);
      await migrations[i]();
      await this.setMigrationVersion(i + 1);
    }
  }

  /**
   * 設置遷移版本
   */
  private static async setMigrationVersion(version: number): Promise<void> {
    await AsyncStorage.setItem(this.MIGRATION_KEY, version.toString());
  }

  /**
   * 遷移到版本 1：添加書籤元數據
   */
  private static async migrateToV1(): Promise<void> {
    try {
      const bookmarks = await AsyncStorage.getItem(StorageKeys.BOOKMARKS);
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks);
        if (Array.isArray(parsed)) {
          // 舊格式：直接是陣列
          const newFormat: BookmarkStorage = {
            items: parsed,
            metadata: {
              totalCount: parsed.length,
              categories: [],
              lastModified: Date.now(),
              syncStatus: 'synced',
              version: '1.0'
            },
            timestamp: Date.now(),
            version: '1.0'
          };
          
          await AsyncStorage.setItem(StorageKeys.BOOKMARKS, JSON.stringify(newFormat));
        }
      }
    } catch (error) {
      console.error('遷移到 v1 失敗:', error);
    }
  }

  /**
   * 遷移到版本 2：添加書籤分類
   */
  private static async migrateToV2(): Promise<void> {
    try {
      const bookmarks = await TypedStorage.getTypedItem<BookmarkStorage>(StorageKeys.BOOKMARKS);
      if (bookmarks) {
        // 為每個書籤添加默認分類
        const updatedItems = bookmarks.items.map(item => ({
          ...item,
          category: item.category || 'general',
          tags: item.tags || [],
          isRead: item.isRead || false
        }));

        const updatedBookmarks: BookmarkStorage = {
          ...bookmarks,
          items: updatedItems,
          metadata: {
            ...bookmarks.metadata,
            categories: [...new Set(updatedItems.map(item => item.category))]
          }
        };

        await TypedStorage.setTypedItem(StorageKeys.BOOKMARKS, updatedBookmarks);
      }
    } catch (error) {
      console.error('遷移到 v2 失敗:', error);
    }
  }

  /**
   * 遷移到版本 3：添加優先級
   */
  private static async migrateToV3(): Promise<void> {
    try {
      const bookmarks = await TypedStorage.getTypedItem<BookmarkStorage>(StorageKeys.BOOKMARKS);
      if (bookmarks) {
        const updatedItems = bookmarks.items.map(item => ({
          ...item,
          priority: item.priority || 'medium'
        }));

        const updatedBookmarks: BookmarkStorage = {
          ...bookmarks,
          items: updatedItems
        };

        await TypedStorage.setTypedItem(StorageKeys.BOOKMARKS, updatedBookmarks);
      }
    } catch (error) {
      console.error('遷移到 v3 失敗:', error);
    }
  }
}
```

---

## 5. 快取過期機制實作

### 5.1 智能快取管理

```typescript
/**
 * 快取項目介面
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存時間（毫秒）
  accessCount: number;
  lastAccessed: number;
}

/**
 * 智能快取管理器
 */
export class SmartCacheManager {
  private static readonly MAX_CACHE_SIZE = 50; // 最大快取項目數
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30分鐘

  /**
   * 設置快取項目
   */
  static async setCacheItem<T>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      const cacheKey = this.getCacheKey(key);
      await TypedStorage.setTypedItem(cacheKey, cacheItem);
      
      // 檢查快取大小並清理
      await this.cleanupIfNeeded();
    } catch (error) {
      console.error('設置快取失敗:', error);
    }
  }

  /**
   * 獲取快取項目
   */
  static async getCacheItem<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const cacheItem = await TypedStorage.getTypedItem<CacheItem<T>>(cacheKey);

      if (!cacheItem) {
        return null;
      }

      // 檢查是否過期
      if (this.isExpired(cacheItem)) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      // 更新訪問統計
      await this.updateAccessStats(cacheKey, cacheItem);

      return cacheItem.data;
    } catch (error) {
      console.error('獲取快取失敗:', error);
      return null;
    }
  }

  /**
   * 檢查快取是否存在且有效
   */
  static async hasCacheItem(key: string): Promise<boolean> {
    const data = await this.getCacheItem(key);
    return data !== null;
  }

  /**
   * 移除快取項目
   */
  static async removeCacheItem(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('移除快取失敗:', error);
    }
  }

  /**
   * 清空所有快取
   */
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('清空快取失敗:', error);
    }
  }

  /**
   * 獲取快取統計
   */
  static async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    expiredItems: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let totalSize = 0;
      let expiredItems = 0;

      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          totalSize += stored.length;
          
          const cacheItem = SerializationUtils.safeParse(stored);
          if (cacheItem && this.isExpired(cacheItem)) {
            expiredItems++;
          }
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize,
        expiredItems
      };
    } catch (error) {
      console.error('獲取快取統計失敗:', error);
      return { totalItems: 0, totalSize: 0, expiredItems: 0 };
    }
  }

  /**
   * 私有方法：生成快取鍵
   */
  private static getCacheKey(key: string): string {
    return `cache_${key}`;
  }

  /**
   * 私有方法：檢查是否過期
   */
  private static isExpired<T>(cacheItem: CacheItem<T>): boolean {
    return Date.now() - cacheItem.timestamp > cacheItem.ttl;
  }

  /**
   * 私有方法：更新訪問統計
   */
  private static async updateAccessStats<T>(
    cacheKey: string,
    cacheItem: CacheItem<T>
  ): Promise<void> {
    try {
      const updatedItem: CacheItem<T> = {
        ...cacheItem,
        accessCount: cacheItem.accessCount + 1,
        lastAccessed: Date.now()
      };
      
      await TypedStorage.setTypedItem(cacheKey, updatedItem);
    } catch (error) {
      // 訪問統計更新失敗不影響主要功能
      console.warn('更新快取訪問統計失敗:', error);
    }
  }

  /**
   * 私有方法：清理過期和超量快取
   */
  private static async cleanupIfNeeded(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));

      // 清理過期項目
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const cacheItem = SerializationUtils.safeParse(stored);
          if (cacheItem && this.isExpired(cacheItem)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }

      // 如果仍然超過最大數量，清理最少訪問的項目
      const remainingKeys = await AsyncStorage.getAllKeys();
      const remainingCacheKeys = remainingKeys.filter(key => key.startsWith('cache_'));

      if (remainingCacheKeys.length > this.MAX_CACHE_SIZE) {
        await this.cleanupLeastUsed(remainingCacheKeys);
      }
    } catch (error) {
      console.error('快取清理失敗:', error);
    }
  }

  /**
   * 私有方法：清理最少使用的項目
   */
  private static async cleanupLeastUsed(cacheKeys: string[]): Promise<void> {
    try {
      const cacheItems: Array<{ key: string; accessCount: number; lastAccessed: number }> = [];

      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const cacheItem = SerializationUtils.safeParse(stored);
          if (cacheItem) {
            cacheItems.push({
              key,
              accessCount: cacheItem.accessCount || 0,
              lastAccessed: cacheItem.lastAccessed || 0
            });
          }
        }
      }

      // 排序：訪問次數少且最久未訪問的排在前面
      cacheItems.sort((a, b) => {
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

      // 移除最少使用的項目
      const toRemove = cacheItems.slice(0, cacheItems.length - this.MAX_CACHE_SIZE + 10);
      const keysToRemove = toRemove.map(item => item.key);
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`清理了 ${keysToRemove.length} 個最少使用的快取項目`);
    } catch (error) {
      console.error('清理最少使用項目失敗:', error);
    }
  }
}
```

---

## 6. 實戰案例：NewsBrief 持久化架構

### 6.1 完整的持久化系統

```typescript
/**
 * NewsBrief 持久化管理器
 * 整合所有持久化功能的主要管理器
 */
export class NewsBriefStorageManager {
  private bookmarkManager: BookmarkManager;
  private static instance: NewsBriefStorageManager;

  private constructor() {
    this.bookmarkManager = BookmarkManager.getInstance();
  }

  static getInstance(): NewsBriefStorageManager {
    if (!NewsBriefStorageManager.instance) {
      NewsBriefStorageManager.instance = new NewsBriefStorageManager();
    }
    return NewsBriefStorageManager.instance;
  }

  /**
   * 初始化所有持久化組件
   */
  async initialize(): Promise<void> {
    try {
      console.log('初始化 NewsBrief 持久化系統...');

      // 執行數據遷移
      await DataMigrationManager.checkAndMigrate();

      // 初始化書籤管理器
      await this.bookmarkManager.initialize();

      // 清理過期快取
      await this.cleanupExpiredData();

      console.log('持久化系統初始化完成');
    } catch (error) {
      console.error('持久化系統初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 書籤相關操作
   */
  get bookmarks() {
    return {
      add: this.bookmarkManager.addBookmark.bind(this.bookmarkManager),
      remove: this.bookmarkManager.removeBookmark.bind(this.bookmarkManager),
      update: this.bookmarkManager.updateBookmark.bind(this.bookmarkManager),
      getAll: this.bookmarkManager.getAllBookmarks.bind(this.bookmarkManager),
      getByCategory: this.bookmarkManager.getBookmarksByCategory.bind(this.bookmarkManager),
      search: this.bookmarkManager.searchBookmarks.bind(this.bookmarkManager),
      isBookmarked: this.bookmarkManager.isBookmarked.bind(this.bookmarkManager),
      clear: this.bookmarkManager.clearAllBookmarks.bind(this.bookmarkManager),
      getStats: this.bookmarkManager.getBookmarkStats.bind(this.bookmarkManager)
    };
  }

  /**
   * 用戶偏好設定
   */
  async setUserPreference<T>(key: string, value: T): Promise<void> {
    try {
      const prefKey = `${StorageKeys.USER_PREFERENCES}_${key}`;
      await TypedStorage.setTypedItem(prefKey, value);
    } catch (error) {
      console.error('設置用戶偏好失敗:', error);
    }
  }

  async getUserPreference<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const prefKey = `${StorageKeys.USER_PREFERENCES}_${key}`;
      return await TypedStorage.getTypedItemWithDefault(prefKey, defaultValue);
    } catch (error) {
      console.error('獲取用戶偏好失敗:', error);
      return defaultValue;
    }
  }

  /**
   * 新聞快取管理
   */
  async cacheNews(category: string, articles: Article[]): Promise<void> {
    try {
      const cacheKey = `news_${category}`;
      await SmartCacheManager.setCacheItem(cacheKey, articles, 15 * 60 * 1000); // 15分鐘
    } catch (error) {
      console.error('快取新聞失敗:', error);
    }
  }

  async getCachedNews(category: string): Promise<Article[] | null> {
    try {
      const cacheKey = `news_${category}`;
      return await SmartCacheManager.getCacheItem<Article[]>(cacheKey);
    } catch (error) {
      console.error('獲取快取新聞失敗:', error);
      return null;
    }
  }

  /**
   * 搜尋歷史管理
   */
  async addSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      
      // 移除重複項目並添加到前面
      const updatedHistory = [
        query,
        ...history.filter(item => item !== query)
      ].slice(0, 20); // 限制為 20 個

      await TypedStorage.setTypedItem(StorageKeys.SEARCH_HISTORY, updatedHistory);
    } catch (error) {
      console.error('添加搜尋歷史失敗:', error);
    }
  }

  async getSearchHistory(): Promise<string[]> {
    try {
      return await TypedStorage.getTypedItemWithDefault(StorageKeys.SEARCH_HISTORY, []);
    } catch (error) {
      console.error('獲取搜尋歷史失敗:', error);
      return [];
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageKeys.SEARCH_HISTORY);
    } catch (error) {
      console.error('清空搜尋歷史失敗:', error);
    }
  }

  /**
   * 獲取儲存使用統計
   */
  async getStorageStats(): Promise<{
    bookmarks: any;
    cache: any;
    totalSize: number;
  }> {
    try {
      const [bookmarkStats, cacheStats] = await Promise.all([
        this.bookmarks.getStats(),
        SmartCacheManager.getCacheStats()
      ]);

      // 計算總大小
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          totalSize += stored.length;
        }
      }

      return {
        bookmarks: bookmarkStats,
        cache: cacheStats,
        totalSize
      };
    } catch (error) {
      console.error('獲取儲存統計失敗:', error);
      return {
        bookmarks: {},
        cache: { totalItems: 0, totalSize: 0, expiredItems: 0 },
        totalSize: 0
      };
    }
  }

  /**
   * 清理過期數據
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      // 清理過期快取
      const cacheStats = await SmartCacheManager.getCacheStats();
      if (cacheStats.expiredItems > 0) {
        console.log(`清理 ${cacheStats.expiredItems} 個過期快取項目`);
        await SmartCacheManager.clearAllCache();
      }

      // 清理舊的搜尋歷史（超過 30 天）
      const history = await this.getSearchHistory();
      if (history.length > 10) {
        const recentHistory = history.slice(0, 10);
        await TypedStorage.setTypedItem(StorageKeys.SEARCH_HISTORY, recentHistory);
      }
    } catch (error) {
      console.error('清理過期數據失敗:', error);
    }
  }

  /**
   * 導出數據（用於備份）
   */
  async exportData(): Promise<string> {
    try {
      const [bookmarks, preferences, searchHistory] = await Promise.all([
        this.bookmarks.getAll(),
        TypedStorage.getTypedItem(StorageKeys.USER_PREFERENCES),
        this.getSearchHistory()
      ]);

      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        bookmarks,
        preferences,
        searchHistory
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('導出數據失敗:', error);
      throw error;
    }
  }

  /**
   * 導入數據（用於恢復）
   */
  async importData(data: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.bookmarks) {
        // 清空現有書籤
        await this.bookmarks.clear();
        
        // 導入書籤
        for (const bookmark of parsed.bookmarks) {
          await this.bookmarks.add(bookmark);
        }
      }

      if (parsed.preferences) {
        await TypedStorage.setTypedItem(StorageKeys.USER_PREFERENCES, parsed.preferences);
      }

      if (parsed.searchHistory) {
        await TypedStorage.setTypedItem(StorageKeys.SEARCH_HISTORY, parsed.searchHistory);
      }

      console.log('數據導入成功');
      return true;
    } catch (error) {
      console.error('導入數據失敗:', error);
      return false;
    }
  }
}
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **數據結構設計**
    - 使用結構化的數據模型
    - 包含版本信息和時間戳
    - 適當的元數據管理

2. **錯誤處理**
    - 實作完善的錯誤恢復機制
    - 提供數據備份和恢復功能
    - 處理儲存空間不足等異常情況

3. **性能優化**
    - 實作智能快取機制
    - 定期清理過期數據
    - 批量操作提升效率

### ❌ 常見陷阱

1. **數據序列化問題**

```typescript
// ❌ 避免：直接儲存複雜對象
await AsyncStorage.setItem('data', complexObject);

// ✅ 建議：安全序列化
await TypedStorage.setTypedItem('data', complexObject);
```

2. **缺少錯誤處理**

```typescript
// ❌ 避免：無錯誤處理
const data = JSON.parse(stored);

// ✅ 建議：安全解析
const data = SerializationUtils.safeParse(stored);
```

---

## 🔗 相關教學

- [Redux Toolkit 企業級狀態管理](../03-redux-toolkit/README.md)
- [React Hooks 完全攻略](../02-react-hooks/README.md)
- [錯誤處理與應用程式品質](../12-error-handling/README.md)

---

## 📖 延伸閱讀

- [AsyncStorage 官方文件](https://react-native-async-storage.github.io/async-storage/)
- [React Native 數據持久化最佳實踐](https://reactnative.dev/docs/asyncstorage)
- [移動應用數據管理策略](https://developer.android.com/guide/topics/data)