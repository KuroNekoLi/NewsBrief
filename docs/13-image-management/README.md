# 🖼️ 圖片資源管理與優化

基於 NewsBrief 專案的 React Native 圖片資源企業級管理實戰

## 🎯 學習目標

- 掌握 React Native 圖片加載與優化策略
- 學會本地圖片資源組織與管理
- 理解網路圖片快取與性能優化
- 掌握圖片格式選擇與壓縮技巧

## 📚 目錄

1. [圖片加載基礎與類型](#1-圖片加載基礎與類型)
2. [本地圖片資源管理](#2-本地圖片資源管理)
3. [網路圖片優化策略](#3-網路圖片優化策略)
4. [圖片快取與性能優化](#4-圖片快取與性能優化)
5. [響應式圖片處理](#5-響應式圖片處理)
6. [實戰案例：NewsBrief 圖片架構](#6-實戰案例newsbrief-圖片架構)

---

## 1. 圖片加載基礎與類型

### 1.1 React Native 圖片來源類型

```typescript
import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

/**
 * 圖片來源類型示例
 * 來自 NewsBrief 新聞卡片實作
 */
const ImageSourceExamples: React.FC = () => {
  // 1. 本地圖片 - 編譯時打包
  const localImage = require('./assets/images/news-placeholder.png');
  
  // 2. 網路圖片 - 動態加載
  const networkImage = { uri: 'https://example.com/image.jpg' };
  
  // 3. 帶參數的網路圖片
  const networkImageWithParams = {
    uri: 'https://example.com/image.jpg',
    headers: {
      'User-Agent': 'NewsBrief/1.0'
    },
    cache: 'force-cache' as const
  };
  
  // 4. Base64 圖片
  const base64Image = {
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  };

  return (
    <>
      <Image source={localImage} style={{ width: 100, height: 100 }} />
      <Image source={networkImage} style={{ width: 100, height: 100 }} />
      <Image source={networkImageWithParams} style={{ width: 100, height: 100 }} />
      <Image source={base64Image} style={{ width: 100, height: 100 }} />
    </>
  );
};
```

### 1.2 圖片加載狀態處理

```typescript
import React, { useState } from 'react';
import { Image, View, Text, ActivityIndicator } from 'react-native';

/**
 * 帶加載狀態的圖片組件
 * 增強用戶體驗
 */
interface SmartImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: any;
}

const SmartImage: React.FC<SmartImageProps> = ({ 
  source, 
  style, 
  placeholder 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * 圖片加載完成處理
   */
  const handleLoadEnd = () => {
    setLoading(false);
  };

  /**
   * 圖片加載錯誤處理
   */
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={style}>
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" />
        </View>
      )}
      
      {error ? (
        <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
          <Text>圖片載入失敗</Text>
        </View>
      ) : (
        <Image
          source={source}
          style={style}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          defaultSource={placeholder}
        />
      )}
    </View>
  );
};
```

---

## 2. 本地圖片資源管理

### 2.1 圖片資源組織結構

```
assets/
├── images/
│   ├── icons/              # 圖標
│   │   ├── bookmark.png
│   │   ├── bookmark@2x.png
│   │   ├── bookmark@3x.png
│   │   ├── search.png
│   │   ├── search@2x.png
│   │   └── search@3x.png
│   ├── placeholders/       # 佔位圖
│   │   ├── news-placeholder.png
│   │   ├── news-placeholder@2x.png
│   │   └── news-placeholder@3x.png
│   ├── backgrounds/        # 背景圖
│   │   └── splash.png
│   └── logos/             # 標誌
│       ├── app-logo.png
│       ├── app-logo@2x.png
│       └── app-logo@3x.png
```

### 2.2 圖片資源管理器

```typescript
/**
 * 圖片資源管理器
 * 統一管理本地圖片資源
 */
export const ImageAssets = {
  icons: {
    bookmark: require('./assets/images/icons/bookmark.png'),
    bookmarkFilled: require('./assets/images/icons/bookmark-filled.png'),
    search: require('./assets/images/icons/search.png'),
    home: require('./assets/images/icons/home.png'),
    settings: require('./assets/images/icons/settings.png'),
  },
  placeholders: {
    news: require('./assets/images/placeholders/news-placeholder.png'),
    avatar: require('./assets/images/placeholders/avatar-placeholder.png'),
  },
  backgrounds: {
    splash: require('./assets/images/backgrounds/splash.png'),
  },
  logos: {
    app: require('./assets/images/logos/app-logo.png'),
  }
} as const;

/**
 * 類型安全的圖片資源使用
 */
type ImageAssetKey = keyof typeof ImageAssets;
type IconKey = keyof typeof ImageAssets.icons;

/**
 * 圖片資源 Hook
 */
export const useImageAsset = (category: ImageAssetKey, key: string) => {
  return ImageAssets[category][key as any];
};

/**
 * 使用示例
 */
const NewsCard: React.FC = () => {
  const bookmarkIcon = ImageAssets.icons.bookmark;
  const newsPlaceholder = ImageAssets.placeholders.news;

  return (
    <View>
      <Image source={newsPlaceholder} style={{ width: 300, height: 200 }} />
      <Image source={bookmarkIcon} style={{ width: 24, height: 24 }} />
    </View>
  );
};
```

### 2.3 多密度螢幕支援

```typescript
import { PixelRatio, Dimensions } from 'react-native';

/**
 * 螢幕密度管理器
 * 處理不同解析度的圖片選擇
 */
export class ScreenDensityManager {
  /**
   * 獲取當前螢幕密度
   */
  static getPixelRatio(): number {
    return PixelRatio.get();
  }

  /**
   * 獲取螢幕尺寸
   */
  static getScreenDimensions() {
    return Dimensions.get('window');
  }

  /**
   * 根據螢幕密度選擇合適的圖片
   */
  static selectImageByDensity(baseName: string, extension: string = 'png') {
    const ratio = this.getPixelRatio();
    
    if (ratio >= 3) {
      return require(`./assets/images/${baseName}@3x.${extension}`);
    } else if (ratio >= 2) {
      return require(`./assets/images/${baseName}@2x.${extension}`);
    } else {
      return require(`./assets/images/${baseName}.${extension}`);
    }
  }

  /**
   * 計算最佳圖片尺寸
   */
  static getOptimalImageSize(baseWidth: number, baseHeight: number) {
    const ratio = this.getPixelRatio();
    return {
      width: baseWidth * ratio,
      height: baseHeight * ratio
    };
  }
}

/**
 * 智能圖片組件 - 自動選擇最佳密度
 */
interface AdaptiveImageProps {
  baseName: string;
  style: any;
  extension?: string;
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({ 
  baseName, 
  style, 
  extension = 'png' 
}) => {
  const imageSource = ScreenDensityManager.selectImageByDensity(baseName, extension);

  return <Image source={imageSource} style={style} />;
};
```

---

## 3. 網路圖片優化策略

### 3.1 圖片 URL 處理與參數化

```typescript
/**
 * 圖片 URL 處理器
 * 用於新聞圖片的動態處理
 */
export class ImageUrlProcessor {
  /**
   * 處理新聞 API 圖片 URL
   */
  static processNewsImageUrl(originalUrl: string | null): string {
    if (!originalUrl) {
      return '';
    }

    // 移除無效的圖片 URL
    if (originalUrl.includes('removed.png')) {
      return '';
    }

    return originalUrl;
  }

  /**
   * 生成縮圖 URL
   */
  static generateThumbnailUrl(originalUrl: string, width: number, height: number): string {
    if (!originalUrl) return '';

    // 示例：使用圖片處理服務
    const baseUrl = 'https://images.weserv.nl/';
    const params = new URLSearchParams({
      url: originalUrl,
      w: width.toString(),
      h: height.toString(),
      fit: 'cover',
      a: 'attention'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * 圖片品質優化
   */
  static optimizeImageQuality(url: string, quality: number = 80): string {
    if (!url || url.startsWith('data:')) return url;

    const params = new URLSearchParams({
      url,
      q: quality.toString(),
      output: 'webp'
    });

    return `https://images.weserv.nl/?${params.toString()}`;
  }

  /**
   * 檢查圖片 URL 有效性
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const invalidKeywords = ['removed', 'placeholder', 'default'];
    
    const hasValidExtension = validExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    const hasInvalidKeyword = invalidKeywords.some(keyword => 
      url.toLowerCase().includes(keyword)
    );

    return hasValidExtension && !hasInvalidKeyword;
  }
}
```

### 3.2 進度式圖片加載

```typescript
import React, { useState, useRef } from 'react';
import { Image, View, Animated } from 'react-native';

/**
 * 進度式圖片加載組件
 * 提供更好的用戶體驗
 */
interface ProgressiveImageProps {
  source: { uri: string };
  placeholder: any;
  style: any;
  thumbnailSource?: { uri: string };
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  placeholder,
  style,
  thumbnailSource
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;

  /**
   * 縮圖加載完成
   */
  const onThumbnailLoad = () => {
    setThumbnailLoaded(true);
    Animated.timing(thumbnailOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  /**
   * 主圖加載完成
   */
  const onImageLoad = () => {
    setImageLoaded(true);
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={style}>
      {/* 佔位圖 */}
      <Image source={placeholder} style={style} />
      
      {/* 縮圖 (模糊版本) */}
      {thumbnailSource && (
        <Animated.Image
          source={thumbnailSource}
          style={[
            style,
            {
              position: 'absolute',
              opacity: thumbnailOpacity,
            }
          ]}
          onLoad={onThumbnailLoad}
          blurRadius={1}
        />
      )}
      
      {/* 主圖 */}
      <Animated.Image
        source={source}
        style={[
          style,
          {
            position: 'absolute',
            opacity: imageOpacity,
          }
        ]}
        onLoad={onImageLoad}
      />
    </View>
  );
};
```

---

## 4. 圖片快取與性能優化

### 4.1 React Native 內建快取機制

```typescript
import { Platform } from 'react-native';

/**
 * 圖片快取管理器
 * 利用 React Native 內建快取機制
 */
export class ImageCacheManager {
  /**
   * 預加載圖片
   */
  static async preloadImages(urls: string[]): Promise<void> {
    const validUrls = urls.filter(url => ImageUrlProcessor.isValidImageUrl(url));
    
    try {
      await Promise.all(
        validUrls.map(url => 
          Image.prefetch(url)
        )
      );
      console.log(`成功預載入 ${validUrls.length} 張圖片`);
    } catch (error) {
      console.error('圖片預載入失敗:', error);
    }
  }

  /**
   * 獲取快取圖片大小 (僅 iOS)
   */
  static async getCacheSize(): Promise<number> {
    if (Platform.OS === 'ios') {
      try {
        return await Image.queryCache();
      } catch (error) {
        console.error('獲取快取大小失敗:', error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * 清除圖片快取
   */
  static async clearCache(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Image.clearDiskCache();
        await Image.clearMemoryCache();
      }
      console.log('圖片快取已清除');
    } catch (error) {
      console.error('清除快取失敗:', error);
    }
  }
}
```

### 4.2 新聞圖片預載入策略

```typescript
import React, { useEffect } from 'react';

/**
 * 新聞圖片預載入 Hook
 * 基於 NewsBrief 實際需求
 */
export const useNewsImagePreloader = (articles: Article[]) => {
  useEffect(() => {
    /**
     * 提取有效的圖片 URL
     */
    const extractImageUrls = (articles: Article[]): string[] => {
      return articles
        .map(article => article.urlToImage)
        .filter((url): url is string => 
          url !== null && ImageUrlProcessor.isValidImageUrl(url)
        )
        .slice(0, 10); // 限制預載入數量
    };

    /**
     * 預載入圖片
     */
    const preloadImages = async () => {
      const imageUrls = extractImageUrls(articles);
      
      if (imageUrls.length > 0) {
        await ImageCacheManager.preloadImages(imageUrls);
      }
    };

    // 延遲預載入，避免影響初始渲染
    const timer = setTimeout(() => {
      preloadImages();
    }, 1000);

    return () => clearTimeout(timer);
  }, [articles]);
};

/**
 * 在 Headlines Screen 中使用
 */
const HeadlinesScreen: React.FC = () => {
  const { articles } = useNews('general');
  
  // 預載入新聞圖片
  useNewsImagePreloader(articles);

  return (
    // 組件 JSX...
  );
};
```

### 4.3 記憶體管理最佳化

```typescript
import React, { useMemo } from 'react';

/**
 * 圖片記憶體優化組件
 * 針對大量圖片的場景
 */
interface OptimizedImageProps {
  source: { uri: string };
  style: any;
  viewableArea?: boolean; // 是否在可視區域
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  viewableArea = true
}) => {
  /**
   * 記憶化圖片屬性
   */
  const imageProps = useMemo(() => ({
    source,
    style,
    // 在可視區域外時使用較低解析度
    resizeMode: 'cover' as const,
    // 移除不在可視區域的圖片以節省記憶體
    fadeDuration: viewableArea ? 300 : 0,
  }), [source, style, viewableArea]);

  // 不在可視區域時不渲染圖片
  if (!viewableArea) {
    return <View style={style} />;
  }

  return <Image {...imageProps} />;
};

/**
 * FlatList 中的圖片優化
 */
const OptimizedNewsList: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());

  /**
   * 可見性變化處理
   */
  const onViewableItemsChanged = useCallback(({ viewableItems: items }) => {
    const viewableSet = new Set(
      items.map(item => item.item.url)
    );
    setViewableItems(viewableSet);
  }, []);

  const renderItem = useCallback(({ item: article }) => {
    const isViewable = viewableItems.has(article.url);
    
    return (
      <View>
        <OptimizedImage
          source={{ uri: article.urlToImage }}
          style={{ width: '100%', height: 200 }}
          viewableArea={isViewable}
        />
      </View>
    );
  }, [viewableItems]);

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50
      }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
    />
  );
};
```

---

## 5. 響應式圖片處理

### 5.1 設備適配圖片尺寸

```typescript
import { Dimensions, PixelRatio } from 'react-native';

/**
 * 響應式圖片尺寸計算器
 */
export class ResponsiveImageCalculator {
  private static screenData = Dimensions.get('window');

  /**
   * 獲取螢幕尺寸資訊
   */
  static getScreenInfo() {
    return {
      width: this.screenData.width,
      height: this.screenData.height,
      pixelRatio: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale()
    };
  }

  /**
   * 計算新聞卡片圖片尺寸
   */
  static calculateNewsCardImageSize() {
    const screenWidth = this.screenData.width;
    const padding = 16; // 左右邊距
    const cardMargin = 8; // 卡片邊距
    
    const imageWidth = screenWidth - (padding * 2) - (cardMargin * 2);
    const imageHeight = imageWidth * 0.6; // 16:10 比例
    
    return {
      width: imageWidth,
      height: imageHeight
    };
  }

  /**
   * 計算列表縮圖尺寸
   */
  static calculateThumbnailSize() {
    const screenWidth = this.screenData.width;
    const isTablet = screenWidth > 768;
    
    if (isTablet) {
      return { width: 120, height: 90 };
    } else {
      return { width: 80, height: 60 };
    }
  }

  /**
   * 計算全螢幕圖片尺寸
   */
  static calculateFullScreenImageSize() {
    return {
      width: this.screenData.width,
      height: this.screenData.height * 0.4 // 佔螢幕高度的 40%
    };
  }
}

/**
 * 響應式新聞圖片組件
 */
const ResponsiveNewsImage: React.FC<{
  source: { uri: string };
  type: 'card' | 'thumbnail' | 'fullscreen';
}> = ({ source, type }) => {
  const imageSize = useMemo(() => {
    switch (type) {
      case 'card':
        return ResponsiveImageCalculator.calculateNewsCardImageSize();
      case 'thumbnail':
        return ResponsiveImageCalculator.calculateThumbnailSize();
      case 'fullscreen':
        return ResponsiveImageCalculator.calculateFullScreenImageSize();
      default:
        return { width: 100, height: 100 };
    }
  }, [type]);

  return (
    <Image
      source={source}
      style={imageSize}
      resizeMode="cover"
    />
  );
};
```

### 5.2 方向變化處理

```typescript
import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

/**
 * 處理設備方向變化的圖片組件
 */
const OrientationAwareImage: React.FC<{
  source: { uri: string };
}> = ({ source }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  /**
   * 根據方向計算圖片尺寸
   */
  const calculateImageSize = useMemo(() => {
    const isLandscape = dimensions.width > dimensions.height;
    const baseWidth = dimensions.width - 32; // 減去邊距
    
    if (isLandscape) {
      return {
        width: baseWidth * 0.6, // 橫向時佔用較少寬度
        height: baseWidth * 0.6 * 0.6
      };
    } else {
      return {
        width: baseWidth,
        height: baseWidth * 0.6
      };
    }
  }, [dimensions]);

  return (
    <Image
      source={source}
      style={calculateImageSize}
      resizeMode="cover"
    />
  );
};
```

---

## 6. 實戰案例：NewsBrief 圖片架構

### 6.1 新聞卡片圖片組件

```typescript
/**
 * NewsBrief 新聞卡片圖片組件
 * 整合所有圖片優化技術
 */
import React, { useState, useMemo } from 'react';
import { Image, View, Text } from 'react-native';
import { Surface } from 'react-native-paper';

interface NewsImageProps {
  imageUrl: string | null;
  title: string;
  style?: any;
}

const NewsImage: React.FC<NewsImageProps> = ({ 
  imageUrl, 
  title, 
  style 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  /**
   * 處理圖片 URL
   */
  const processedImageUrl = useMemo(() => {
    if (!imageUrl || !ImageUrlProcessor.isValidImageUrl(imageUrl)) {
      return null;
    }

    // 獲取最佳化的圖片尺寸
    const { width, height } = ResponsiveImageCalculator.calculateNewsCardImageSize();
    
    // 生成優化的圖片 URL
    return ImageUrlProcessor.generateThumbnailUrl(imageUrl, width, height);
  }, [imageUrl]);

  /**
   * 圖片加載錯誤處理
   */
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  /**
   * 圖片加載完成處理
   */
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  /**
   * 渲染佔位圖
   */
  const renderPlaceholder = () => (
    <Surface style={[style, { 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f0f0f0' 
    }]}>
      <Text style={{ color: '#666', fontSize: 12 }}>
        {imageError ? '圖片載入失敗' : '載入中...'}
      </Text>
    </Surface>
  );

  // 無有效圖片時顯示佔位圖
  if (!processedImageUrl || imageError) {
    return renderPlaceholder();
  }

  return (
    <View style={style}>
      {imageLoading && renderPlaceholder()}
      <Image
        source={{ uri: processedImageUrl }}
        style={[style, imageLoading && { position: 'absolute' }]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="cover"
      />
    </View>
  );
};
```

### 6.2 圖片管理 Context

```typescript
/**
 * 圖片管理 Context
 * 全域圖片設定與快取管理
 */
import React, { createContext, useContext, useReducer } from 'react';

interface ImageState {
  cacheEnabled: boolean;
  imageQuality: number;
  preloadEnabled: boolean;
  maxCacheSize: number;
}

type ImageAction = 
  | { type: 'SET_CACHE_ENABLED'; payload: boolean }
  | { type: 'SET_IMAGE_QUALITY'; payload: number }
  | { type: 'SET_PRELOAD_ENABLED'; payload: boolean }
  | { type: 'CLEAR_CACHE' };

const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'SET_CACHE_ENABLED':
      return { ...state, cacheEnabled: action.payload };
    case 'SET_IMAGE_QUALITY':
      return { ...state, imageQuality: action.payload };
    case 'SET_PRELOAD_ENABLED':
      return { ...state, preloadEnabled: action.payload };
    case 'CLEAR_CACHE':
      ImageCacheManager.clearCache();
      return state;
    default:
      return state;
  }
};

const ImageContext = createContext<{
  state: ImageState;
  dispatch: React.Dispatch<ImageAction>;
} | null>(null);

/**
 * 圖片管理 Provider
 */
export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(imageReducer, {
    cacheEnabled: true,
    imageQuality: 80,
    preloadEnabled: true,
    maxCacheSize: 100 * 1024 * 1024 // 100MB
  });

  return (
    <ImageContext.Provider value={{ state, dispatch }}>
      {children}
    </ImageContext.Provider>
  );
};

/**
 * 圖片設定 Hook
 */
export const useImageSettings = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageSettings must be used within ImageProvider');
  }
  return context;
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **圖片資源組織**
    - 使用統一的資源管理器
    - 提供多密度版本 (@1x, @2x, @3x)
    - 合理的目錄結構分類

2. **性能優化**
    - 實作圖片預載入機制
    - 使用適當的圖片尺寸和品質
    - 利用快取機制減少網路請求

3. **用戶體驗**
    - 提供加載狀態指示
    - 實作錯誤處理和重試機制
    - 使用進度式加載

### ❌ 常見陷阱

1. **過大的圖片尺寸**

```typescript
// ❌ 避免：加載原始大小圖片
<Image source={{ uri: 'https://example.com/huge-image.jpg' }} />

// ✅ 建議：使用適當尺寸
<Image source={{ 
  uri: ImageUrlProcessor.generateThumbnailUrl(url, 300, 200) 
}} />
```

2. **缺少錯誤處理**

```typescript
// ❌ 避免：無錯誤處理
<Image source={{ uri: imageUrl }} />

// ✅ 建議：完整的錯誤處理
<Image 
  source={{ uri: imageUrl }}
  onError={handleError}
  defaultSource={placeholder}
/>
```

---

## 🔗 相關教學

- [React Native 基礎與 TypeScript 整合](../01-react-native-typescript/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)
- [跨平台開發與樣式處理](../11-cross-platform/README.md)

---

## 📖 延伸閱讀

- [React Native Image 官方文件](https://reactnative.dev/docs/image)
- [圖片優化最佳實踐](https://reactnative.dev/docs/images)
- [FastImage 第三方庫](https://github.com/DylanVann/react-native-fast-image)