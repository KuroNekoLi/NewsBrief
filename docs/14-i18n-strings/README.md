# 🌍 國際化與字串資源管理

基於 NewsBrief 專案的 React Native 國際化企業級實戰

## 🎯 學習目標

- 掌握 React Native 國際化 (i18n) 最佳實踐
- 學會字串資源統一管理與組織
- 理解多語系支援與切換機制
- 掌握 RTL (右到左) 語言支援

## 📚 目錄

1. [字串資源管理基礎](#1-字串資源管理基礎)
2. [i18n 架構設計](#2-i18n-架構設計)
3. [多語系實作與切換](#3-多語系實作與切換)
4. [動態內容國際化](#4-動態內容國際化)
5. [RTL 語言支援](#5-rtl-語言支援)
6. [實戰案例：NewsBrief 國際化](#6-實戰案例newsbrief-國際化)

---

## 1. 字串資源管理基礎

### 1.1 字串資源組織結構

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── news.json
│   │   └── errors.json
│   ├── zh-TW/
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── news.json
│   │   └── errors.json
│   ├── zh-CN/
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── news.json
│   │   └── errors.json
│   └── index.ts
```

### 1.2 字串資源檔案結構

```json
// src/locales/zh-TW/common.json
{
  "app": {
    "name": "新聞簡報",
    "version": "版本 {{version}}"
  },
  "actions": {
    "save": "儲存",
    "cancel": "取消",
    "delete": "刪除",
    "confirm": "確認",
    "retry": "重試",
    "refresh": "重新整理",
    "share": "分享"
  },
  "status": {
    "loading": "載入中...",
    "error": "發生錯誤",
    "success": "成功",
    "noData": "沒有資料",
    "offline": "離線模式"
  }
}
```

```json
// src/locales/zh-TW/navigation.json
{
  "tabs": {
    "headlines": "頭條新聞",
    "search": "搜尋",
    "bookmarks": "收藏",
    "translate": "翻譯"
  },
  "headers": {
    "headlines": "今日頭條",
    "search": "搜尋新聞",
    "bookmarks": "我的收藏",
    "translate": "翻譯工具"
  }
}
```

```json
// src/locales/zh-TW/news.json
{
  "categories": {
    "general": "一般",
    "business": "商業",
    "technology": "科技",
    "health": "健康",
    "sports": "體育",
    "entertainment": "娛樂"
  },
  "article": {
    "readMore": "閱讀更多",
    "bookmark": "收藏",
    "bookmarked": "已收藏",
    "share": "分享",
    "publishedAt": "發布於 {{date}}",
    "source": "來源：{{source}}"
  },
  "search": {
    "placeholder": "搜尋新聞...",
    "noResults": "找不到相關新聞",
    "searchHistory": "搜尋記錄"
  }
}
```

### 1.3 字串資源管理器

```typescript
/**
 * 字串資源管理器
 * 統一管理所有語言資源
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// 引入語言資源
import enCommon from './en/common.json';
import enNavigation from './en/navigation.json';
import enNews from './en/news.json';
import enErrors from './en/errors.json';

import zhTWCommon from './zh-TW/common.json';
import zhTWNavigation from './zh-TW/navigation.json';
import zhTWNews from './zh-TW/news.json';
import zhTWErrors from './zh-TW/errors.json';

import zhCNCommon from './zh-CN/common.json';
import zhCNNavigation from './zh-CN/navigation.json';
import zhCNNews from './zh-CN/news.json';
import zhCNErrors from './zh-CN/errors.json';

/**
 * 支援的語言列表
 */
export const SUPPORTED_LANGUAGES = {
  'en': { name: 'English', nativeName: 'English' },
  'zh-TW': { name: 'Traditional Chinese', nativeName: '繁體中文' },
  'zh-CN': { name: 'Simplified Chinese', nativeName: '简体中文' }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * 語言資源整合
 */
export const LANGUAGE_RESOURCES = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    news: enNews,
    errors: enErrors
  },
  'zh-TW': {
    common: zhTWCommon,
    navigation: zhTWNavigation,
    news: zhTWNews,
    errors: zhTWErrors
  },
  'zh-CN': {
    common: zhCNCommon,
    navigation: zhCNNavigation,
    news: zhCNNews,
    errors: zhCNErrors
  }
} as const;

/**
 * 字串資源管理類
 */
export class StringResourceManager {
  private static readonly STORAGE_KEY = 'app_language';
  private static currentLanguage: SupportedLanguage = 'zh-TW';

  /**
   * 初始化語言設定
   */
  static async initialize(): Promise<SupportedLanguage> {
    try {
      const savedLanguage = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage as SupportedLanguage;
      } else {
        // 使用系統語言或預設語言
        this.currentLanguage = this.detectSystemLanguage();
      }
    } catch (error) {
      console.error('載入語言設定失敗:', error);
    }
    
    return this.currentLanguage;
  }

  /**
   * 設定當前語言
   */
  static async setLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isValidLanguage(language)) {
      throw new Error(`不支援的語言: ${language}`);
    }

    this.currentLanguage = language;
    
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, language);
    } catch (error) {
      console.error('儲存語言設定失敗:', error);
    }
  }

  /**
   * 獲取當前語言
   */
  static getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 檢測系統語言
   */
  private static detectSystemLanguage(): SupportedLanguage {
    const { Platform, NativeModules } = require('react-native');
    
    let systemLanguage = 'en';
    
    if (Platform.OS === 'ios') {
      systemLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                      'en';
    } else {
      systemLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
    }

    // 簡化語言代碼處理
    if (systemLanguage.startsWith('zh-TW') || systemLanguage.startsWith('zh-Hant')) {
      return 'zh-TW';
    } else if (systemLanguage.startsWith('zh-CN') || systemLanguage.startsWith('zh-Hans')) {
      return 'zh-CN';
    } else if (systemLanguage.startsWith('en')) {
      return 'en';
    }

    return 'zh-TW'; // 預設語言
  }

  /**
   * 驗證語言是否支援
   */
  private static isValidLanguage(language: string): boolean {
    return language in SUPPORTED_LANGUAGES;
  }
}
```

---

## 2. i18n 架構設計

### 2.1 翻譯函數實作

```typescript
/**
 * 翻譯工具類
 * 提供字串插值與複數形式支援
 */
export class TranslationUtils {
  /**
   * 獲取巢狀物件的值
   */
  static getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 字串插值處理
   */
  static interpolate(template: string, values: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }

  /**
   * 複數形式處理 (簡化版)
   */
  static pluralize(
    count: number,
    singular: string,
    plural: string,
    language: SupportedLanguage
  ): string {
    // 中文沒有複數形式
    if (language.startsWith('zh')) {
      return singular;
    }

    // 英文複數規則
    return count === 1 ? singular : plural;
  }

  /**
   * 日期格式化
   */
  static formatDate(date: Date, language: SupportedLanguage): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    try {
      return new Intl.DateTimeFormat(language, options).format(date);
    } catch (error) {
      // 回退到預設格式
      return date.toLocaleDateString();
    }
  }

  /**
   * 數字格式化
   */
  static formatNumber(number: number, language: SupportedLanguage): string {
    try {
      return new Intl.NumberFormat(language).format(number);
    } catch (error) {
      return number.toString();
    }
  }
}
```

### 2.2 翻譯 Hook 實作

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * 翻譯 Context 介面
 */
interface TranslationContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string, values?: Record<string, any>) => string;
  isLoading: boolean;
}

/**
 * 翻譯 Context
 */
const TranslationContext = createContext<TranslationContextType | null>(null);

/**
 * 翻譯 Provider
 */
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setCurrentLanguage] = useState<SupportedLanguage>('zh-TW');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初始化語言設定
   */
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await StringResourceManager.initialize();
        setCurrentLanguage(savedLanguage);
      } catch (error) {
        console.error('初始化語言失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  /**
   * 設定語言
   */
  const setLanguage = async (newLanguage: SupportedLanguage) => {
    try {
      await StringResourceManager.setLanguage(newLanguage);
      setCurrentLanguage(newLanguage);
    } catch (error) {
      console.error('設定語言失敗:', error);
      throw error;
    }
  };

  /**
   * 翻譯函數
   */
  const t = (key: string, values?: Record<string, any>): string => {
    try {
      // 分解 key (例如: "common.actions.save")
      const [namespace, ...pathParts] = key.split('.');
      const path = pathParts.join('.');

      // 獲取語言資源
      const resources = LANGUAGE_RESOURCES[language];
      const namespaceResource = resources[namespace as keyof typeof resources];

      if (!namespaceResource) {
        console.warn(`找不到命名空間: ${namespace}`);
        return key;
      }

      // 獲取翻譯字串
      const translation = TranslationUtils.getNestedValue(namespaceResource, path);

      if (!translation) {
        console.warn(`找不到翻譯: ${key}`);
        return key;
      }

      // 字串插值
      if (values) {
        return TranslationUtils.interpolate(translation, values);
      }

      return translation;
    } catch (error) {
      console.error('翻譯錯誤:', error);
      return key;
    }
  };

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage,
      t,
      isLoading
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

/**
 * 翻譯 Hook
 */
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

/**
 * 命名空間翻譯 Hook
 */
export const useNamespacedTranslation = (namespace: string) => {
  const { t, ...rest } = useTranslation();
  
  const namespacedT = (key: string, values?: Record<string, any>) => {
    return t(`${namespace}.${key}`, values);
  };

  return {
    ...rest,
    t: namespacedT
  };
};
```

---

## 3. 多語系實作與切換

### 3.1 語言選擇器組件

```typescript
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Button, List, Portal, RadioButton } from 'react-native-paper';

/**
 * 語言選擇器組件
 */
interface LanguageSelectorProps {
  visible: boolean;
  onDismiss: () => void;
  onLanguageSelect: (language: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onDismiss,
  onLanguageSelect
}) => {
  const { language: currentLanguage, t } = useTranslation();

  /**
   * 語言列表數據
   */
  const languageOptions = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    name: info.name,
    nativeName: info.nativeName
  }));

  /**
   * 語言選擇處理
   */
  const handleLanguageSelect = (selectedLanguage: SupportedLanguage) => {
    onLanguageSelect(selectedLanguage);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: 20,
          borderRadius: 8,
          padding: 20
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          {t('settings.selectLanguage')}
        </Text>
        
        <FlatList
          data={languageOptions}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleLanguageSelect(item.code)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12
              }}
            >
              <RadioButton
                value={item.code}
                status={currentLanguage === item.code ? 'checked' : 'unchecked'}
                onPress={() => handleLanguageSelect(item.code)}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16 }}>{item.nativeName}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Button mode="outlined" onPress={onDismiss} style={{ marginTop: 16 }}>
          {t('common.actions.cancel')}
        </Button>
      </Modal>
    </Portal>
  );
};

/**
 * 語言切換按鈕
 */
const LanguageSwitcher: React.FC = () => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  /**
   * 語言變更處理
   */
  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    try {
      await setLanguage(newLanguage);
      console.log('語言已切換至:', SUPPORTED_LANGUAGES[newLanguage].nativeName);
    } catch (error) {
      console.error('切換語言失敗:', error);
    }
  };

  return (
    <View>
      <List.Item
        title={t('settings.language')}
        description={SUPPORTED_LANGUAGES[language].nativeName}
        left={props => <List.Icon {...props} icon="translate" />}
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => setSelectorVisible(true)}
      />
      
      <LanguageSelector
        visible={selectorVisible}
        onDismiss={() => setSelectorVisible(false)}
        onLanguageSelect={handleLanguageChange}
      />
    </View>
  );
};
```

### 3.2 應用程式語言初始化

```typescript
/**
 * 應用程式啟動時的語言初始化
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

const App: React.FC = () => {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    /**
     * 初始化語言設定
     */
    const initializeApp = async () => {
      try {
        // 初始化語言資源
        await StringResourceManager.initialize();
        
        // 設定語言載入完成
        setIsLanguageLoaded(true);
      } catch (error) {
        console.error('應用程式初始化失敗:', error);
        // 即使失敗也要顯示應用程式
        setIsLanguageLoaded(true);
      }
    };

    initializeApp();
  }, []);

  /**
   * 載入中畫面
   */
  if (!isLanguageLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TranslationProvider>
      <PaperProvider>
        <MainNavigator />
      </PaperProvider>
    </TranslationProvider>
  );
};
```

---

## 4. 動態內容國際化

### 4.1 新聞內容翻譯

```typescript
/**
 * 新聞內容翻譯工具
 * 處理動態內容的多語系支援
 */
export class NewsContentTranslator {
  /**
   * 新聞分類翻譯
   */
  static translateCategory(category: string, t: (key: string) => string): string {
    const categoryKey = `news.categories.${category.toLowerCase()}`;
    const translated = t(categoryKey);
    
    // 如果找不到翻譯，返回原始值
    return translated === categoryKey ? category : translated;
  }

  /**
   * 發布時間格式化
   */
  static formatPublishTime(
    publishedAt: string, 
    language: SupportedLanguage,
    t: (key: string, values?: any) => string
  ): string {
    try {
      const publishDate = new Date(publishedAt);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));

      // 相對時間處理
      if (diffInHours < 1) {
        return t('news.time.justNow');
      } else if (diffInHours < 24) {
        return t('news.time.hoursAgo', { hours: diffInHours });
      } else if (diffInHours < 48) {
        return t('news.time.yesterday');
      } else {
        // 使用本地化日期格式
        const formattedDate = TranslationUtils.formatDate(publishDate, language);
        return t('news.article.publishedAt', { date: formattedDate });
      }
    } catch (error) {
      console.error('時間格式化錯誤:', error);
      return publishedAt;
    }
  }

  /**
   * 來源資訊格式化
   */
  static formatSource(
    sourceName: string,
    t: (key: string, values?: any) => string
  ): string {
    return t('news.article.source', { source: sourceName });
  }
}

/**
 * 國際化新聞卡片組件
 */
interface I18nNewsCardProps {
  article: Article;
}

const I18nNewsCard: React.FC<I18nNewsCardProps> = ({ article }) => {
  const { language } = useTranslation();
  const { t } = useNamespacedTranslation('news');

  /**
   * 格式化的發布時間
   */
  const formattedPublishTime = useMemo(() => {
    return NewsContentTranslator.formatPublishTime(
      article.publishedAt,
      language,
      t
    );
  }, [article.publishedAt, language, t]);

  /**
   * 格式化的來源資訊
   */
  const formattedSource = useMemo(() => {
    return NewsContentTranslator.formatSource(article.source.name, t);
  }, [article.source.name, t]);

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        {article.title}
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
        {article.description}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {formattedSource}
        </Text>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {formattedPublishTime}
        </Text>
      </View>
    </View>
  );
};
```

### 4.2 搜尋與過濾國際化

```typescript
/**
 * 國際化搜尋組件
 */
const I18nSearchScreen: React.FC = () => {
  const { t } = useNamespacedTranslation('news');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  /**
   * 新聞分類選項
   */
  const categoryOptions = useMemo(() => {
    const categories = ['general', 'business', 'technology', 'health', 'sports', 'entertainment'];
    
    return categories.map(category => ({
      value: category,
      label: NewsContentTranslator.translateCategory(category, (key) => t(key))
    }));
  }, [t]);

  return (
    <View style={{ padding: 16 }}>
      {/* 搜尋輸入框 */}
      <TextInput
        placeholder={t('search.placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}
      />

      {/* 分類選擇 */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        {t('categories.title')}
      </Text>
      
      <FlatList
        horizontal
        data={categoryOptions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item.value)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === item.value ? '#007AFF' : '#f0f0f0'
            }}
          >
            <Text style={{
              color: selectedCategory === item.value ? 'white' : 'black'
            }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
```

---

## 5. RTL 語言支援

### 5.1 RTL 語言檢測與設定

```typescript
import { I18nManager } from 'react-native';

/**
 * RTL 語言支援管理器
 */
export class RTLManager {
  /**
   * RTL 語言列表
   */
  private static readonly RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

  /**
   * 檢查語言是否為 RTL
   */
  static isRTLLanguage(language: string): boolean {
    return this.RTL_LANGUAGES.some(rtlLang => language.startsWith(rtlLang));
  }

  /**
   * 設定 RTL 模式
   */
  static async setRTLMode(language: SupportedLanguage): Promise<boolean> {
    const shouldBeRTL = this.isRTLLanguage(language);
    const isCurrentlyRTL = I18nManager.isRTL;

    if (shouldBeRTL !== isCurrentlyRTL) {
      try {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        
        // 需要重啟應用程式以生效
        return true;
      } catch (error) {
        console.error('設定 RTL 模式失敗:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * 獲取文字對齊方式
   */
  static getTextAlign(): 'left' | 'right' {
    return I18nManager.isRTL ? 'right' : 'left';
  }

  /**
   * 獲取 Flex 方向
   */
  static getFlexDirection(): 'row' | 'row-reverse' {
    return I18nManager.isRTL ? 'row-reverse' : 'row';
  }
}
```

### 5.2 RTL 適應組件

```typescript
import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';

/**
 * RTL 適應樣式 Hook
 */
const useRTLStyles = () => {
  return useMemo(() => {
    const isRTL = I18nManager.isRTL;
    
    return {
      container: {
        flexDirection: isRTL ? 'row-reverse' : 'row'
      },
      text: {
        textAlign: isRTL ? 'right' : 'left'
      },
      marginLeft: (value: number) => ({
        [isRTL ? 'marginRight' : 'marginLeft']: value
      }),
      marginRight: (value: number) => ({
        [isRTL ? 'marginLeft' : 'marginRight']: value
      }),
      paddingLeft: (value: number) => ({
        [isRTL ? 'paddingRight' : 'paddingLeft']: value
      }),
      paddingRight: (value: number) => ({
        [isRTL ? 'paddingLeft' : 'paddingRight']: value
      })
    };
  }, []);
};

/**
 * RTL 適應新聞卡片
 */
const RTLAdaptiveNewsCard: React.FC<{ article: Article }> = ({ article }) => {
  const rtlStyles = useRTLStyles();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, rtlStyles.container]}>
      {/* 圖片 */}
      <Image
        source={{ uri: article.urlToImage }}
        style={styles.image}
      />
      
      {/* 內容 */}
      <View style={[styles.content, rtlStyles.marginLeft(12)]}>
        <Text style={[styles.title, rtlStyles.text]}>
          {article.title}
        </Text>
        <Text style={[styles.description, rtlStyles.text]}>
          {article.description}
        </Text>
        
        {/* 元資訊 */}
        <View style={[styles.meta, rtlStyles.container]}>
          <Text style={[styles.source, rtlStyles.text]}>
            {article.source.name}
          </Text>
          <Text style={[styles.time, rtlStyles.text]}>
            {NewsContentTranslator.formatPublishTime(
              article.publishedAt,
              'zh-TW',
              t
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-start'
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 4
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  meta: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  source: {
    fontSize: 12,
    color: '#999'
  },
  time: {
    fontSize: 12,
    color: '#999'
  }
});
```

---

## 6. 實戰案例：NewsBrief 國際化

### 6.1 完整的國際化整合

```typescript
/**
 * NewsBrief 主應用程式的國際化整合
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

const NewsBriefApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 初始化字串資源
        await StringResourceManager.initialize();
        
        // 初始化 RTL 設定
        const currentLanguage = StringResourceManager.getCurrentLanguage();
        await RTLManager.setRTLMode(currentLanguage);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('應用程式初始化失敗:', error);
        setIsInitialized(true); // 即使失敗也要啟動應用程式
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <TranslationProvider>
        <PaperProvider>
          <StatusBar barStyle="dark-content" />
          <TabNavigator />
        </PaperProvider>
      </TranslationProvider>
    </SafeAreaProvider>
  );
};
```

### 6.2 國際化設定頁面

```typescript
/**
 * 設定頁面的國際化實作
 */
const SettingsScreen: React.FC = () => {
  const { t } = useNamespacedTranslation('settings');
  const { language, setLanguage } = useTranslation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  /**
   * 語言變更處理
   */
  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    try {
      // 設定新語言
      await setLanguage(newLanguage);
      
      // 檢查是否需要重啟應用程式（RTL 變更）
      const needsRestart = await RTLManager.setRTLMode(newLanguage);
      
      if (needsRestart) {
        // 顯示重啟提示
        Alert.alert(
          t('languageChanged.title'),
          t('languageChanged.message'),
          [
            {
              text: t('languageChanged.restart'),
              onPress: () => {
                // 重啟應用程式
                RNRestart.Restart();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('語言變更失敗:', error);
      Alert.alert(t('error.title'), t('error.languageChangeFailed'));
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* 語言設定 */}
      <List.Section title={t('sections.general')}>
        <List.Item
          title={t('language.title')}
          description={SUPPORTED_LANGUAGES[language].nativeName}
          left={props => <List.Icon {...props} icon="translate" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowLanguageSelector(true)}
        />
      </List.Section>

      {/* 其他設定 */}
      <List.Section title={t('sections.appearance')}>
        <List.Item
          title={t('theme.title')}
          description={t('theme.light')}
          left={props => <List.Icon {...props} icon="palette" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      {/* 語言選擇器 */}
      <LanguageSelector
        visible={showLanguageSelector}
        onDismiss={() => setShowLanguageSelector(false)}
        onLanguageSelect={handleLanguageChange}
      />
    </ScrollView>
  );
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **字串資源組織**
    - 按功能模組分組
    - 使用巢狀結構組織
    - 提供清晰的命名慣例

2. **翻譯品質**
    - 使用專業翻譯服務
    - 實作上下文相關的翻譯
    - 支援複數形式和變數插值

3. **用戶體驗**
    - 記住用戶的語言偏好
    - 提供流暢的語言切換
    - 支援 RTL 語言的完整體驗

### ❌ 常見陷阱

1. **硬編碼字串**

```typescript
// ❌ 避免：硬編碼文字
<Text>Save</Text>

// ✅ 建議：使用翻譯
<Text>{t('common.actions.save')}</Text>
```

2. **忽略 RTL 支援**

```typescript
// ❌ 避免：固定方向的樣式
style={{ marginLeft: 16 }}

// ✅ 建議：RTL 適應樣式
style={rtlStyles.marginLeft(16)}
```

---

## 🔗 相關教學

- [React Native 基礎與 TypeScript 整合](../01-react-native-typescript/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)
- [圖片資源管理與優化](../13-image-management/README.md)

---

## 📖 延伸閱讀

- [React Native I18n 官方文件](https://reactnative.dev/docs/accessibilityinfo)
- [Intl API 使用指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [RTL 語言支援指南](https://reactnative.dev/blog/2016/08/19/right-to-left-support-for-react-native-apps)