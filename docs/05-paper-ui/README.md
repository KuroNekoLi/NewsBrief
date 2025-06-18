# 🎨 React Native Paper UI 組件庫

基於 NewsBrief 專案的 React Native Paper 企業級 UI 實戰

## 🎯 學習目標

- 掌握 React Native Paper Material You 設計系統
- 學會 Card、Button、Surface、IconButton 等核心組件使用
- 理解主題系統與顏色配置
- 實作跨平台 UI 一致性處理

## 📚 目錄

1. [Material You 設計系統實作](#1-material-you-設計系統實作)
2. [核心組件使用指南](#2-核心組件使用指南)
3. [主題系統與顏色配置](#3-主題系統與顏色配置)
4. [跨平台 UI 一致性處理](#4-跨平台-ui-一致性處理)
5. [自定義組件與擴展](#5-自定義組件與擴展)
6. [實戰案例：NewsBrief UI 架構](#6-實戰案例newsbrief-ui-架構)

---

## 1. Material You 設計系統實作

### 1.1 React Native Paper 簡介

```typescript
/**
 * React Native Paper 核心特性
 */
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Material Design 3 優勢
 * - 現代化設計語言
 * - 動態顏色系統
 * - 無障礙優先設計
 * - 跨平台一致性
 */

/**
 * NewsBrief 主題配置
 */
const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F9A825',      // 主色調：亮黃色
    onPrimary: '#000000',    // 主色調上的文字
    primaryContainer: '#FFF59D',  // 主色調容器
    onPrimaryContainer: '#1F1F1F', // 容器上的文字
    secondary: '#FFB74D',    // 次要色
    tertiary: '#81C784',     // 第三色
    surface: '#FFFFFF',      // 表面色
    background: '#FAFAFA'    // 背景色
  }
};
```

### 1.2 應用程式主題設定

```typescript
/**
 * NewsBrief App 主題配置
 * App.tsx
 */
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  /**
   * 動態主題選擇
   */
  const theme = React.useMemo(() => {
    const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: '#F9A825',
        onPrimary: isDarkMode ? '#FFFFFF' : '#000000',
        primaryContainer: isDarkMode ? '#F57F17' : '#FFF59D',
        onPrimaryContainer: isDarkMode ? '#FFFFFF' : '#1F1F1F',
        surface: isDarkMode ? '#121212' : '#FFFFFF',
        background: isDarkMode ? '#000000' : '#FAFAFA',
        // 新聞應用特色配色
        surfaceVariant: isDarkMode ? '#2C2C2C' : '#F5F5F5',
        outline: isDarkMode ? '#737373' : '#BDBDBD'
      }
    };
  }, [isDarkMode]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};
```

---

## 2. 核心組件使用指南

### 2.1 Card 組件深度應用

```typescript
/**
 * NewsBrief 新聞卡片組件
 * 基於 React Native Paper Card
 */
import React from 'react';
import { Card, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { View, Image, StyleSheet } from 'react-native';

interface NewsCardProps {
  article: Article;
  onPress: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  onBookmarkToggle,
  isBookmarked
}) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      {/* 圖片區域 */}
      {article.urlToImage && (
        <Card.Cover 
          source={{ uri: article.urlToImage }}
          style={styles.cardCover}
        />
      )}
      
      {/* 內容區域 */}
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Chip 
            icon="newspaper" 
            mode="outlined"
            compact
            style={styles.sourceChip}
          >
            {article.source.name}
          </Chip>
          
          <IconButton
            icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            iconColor={isBookmarked ? '#F9A825' : '#757575'}
            size={20}
            onPress={onBookmarkToggle}
          />
        </View>
        
        <Title numberOfLines={2} style={styles.title}>
          {article.title}
        </Title>
        
        <Paragraph numberOfLines={3} style={styles.description}>
          {article.description}
        </Paragraph>
      </Card.Content>
      
      {/* 動作區域 */}
      <Card.Actions style={styles.cardActions}>
        <Chip 
          icon="clock-outline"
          mode="outlined"
          compact
          style={styles.timeChip}
        >
          {formatTimeAgo(article.publishedAt)}
        </Chip>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
    borderRadius: 12
  },
  cardCover: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  cardContent: {
    paddingTop: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sourceChip: {
    flex: 1,
    marginRight: 8
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  timeChip: {
    alignSelf: 'flex-start'
  }
});
```

### 2.2 Button 組件變體應用

```typescript
/**
 * Button 組件在不同場景的應用
 */
import React from 'react';
import { Button, FAB, SegmentedButtons } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

const ButtonShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('general');

  /**
   * 新聞分類按鈕組
   */
  const categoryButtons = [
    { value: 'general', label: '一般', icon: 'newspaper' },
    { value: 'business', label: '商業', icon: 'briefcase' },
    { value: 'technology', label: '科技', icon: 'laptop' },
    { value: 'health', label: '健康', icon: 'heart-pulse' },
    { value: 'sports', label: '體育', icon: 'football' }
  ];

  return (
    <View style={styles.container}>
      {/* 分段按鈕 - 分類選擇 */}
      <SegmentedButtons
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        buttons={categoryButtons}
        style={styles.segmentedButtons}
      />

      {/* 主要動作按鈕 */}
      <View style={styles.buttonRow}>
        <Button 
          mode="contained"
          icon="refresh"
          onPress={() => console.log('重新整理')}
          style={styles.primaryButton}
        >
          重新整理
        </Button>
        
        <Button 
          mode="outlined"
          icon="magnify"
          onPress={() => console.log('搜尋')}
          style={styles.secondaryButton}
        >
          搜尋新聞
        </Button>
      </View>

      {/* 文字按鈕 */}
      <View style={styles.textButtonRow}>
        <Button 
          mode="text"
          onPress={() => console.log('顯示更多')}
        >
          顯示更多
        </Button>
        
        <Button 
          mode="text"
          icon="settings"
          onPress={() => console.log('設定')}
        >
          設定
        </Button>
      </View>

      {/* 浮動動作按鈕 */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('新增')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  segmentedButtons: {
    marginBottom: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  primaryButton: {
    flex: 1,
    marginRight: 8
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 8
  },
  textButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  }
});
```

### 2.3 Surface 與 Layout 組件

```typescript
/**
 * Surface 組件用於創建層次結構
 */
import React from 'react';
import { Surface, Divider, List } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 主要設定區域 */}
      <Surface style={styles.settingsSection} elevation={2}>
        <List.Section>
          <List.Subheader>帳戶設定</List.Subheader>
          
          <List.Item
            title="個人資料"
            description="管理您的個人資訊"
            left={props => <List.Icon {...props} icon="account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('個人資料')}
          />
          
          <Divider />
          
          <List.Item
            title="通知設定"
            description="設定推播通知偏好"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('通知設定')}
          />
        </List.Section>
      </Surface>

      {/* 應用程式設定 */}
      <Surface style={styles.settingsSection} elevation={2}>
        <List.Section>
          <List.Subheader>應用程式</List.Subheader>
          
          <List.Item
            title="主題"
            description="淺色模式"
            left={props => <List.Icon {...props} icon="palette" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('主題設定')}
          />
          
          <Divider />
          
          <List.Item
            title="語言"
            description="繁體中文"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('語言設定')}
          />
        </List.Section>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  settingsSection: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white'
  }
});
```

---

## 3. 主題系統與顏色配置

### 3.1 動態主題系統

```typescript
/**
 * 主題管理系統
 * src/theme/ThemeProvider.tsx
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  theme: typeof MD3LightTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * 自定義主題配置
 */
const createCustomTheme = (isDark: boolean) => {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      // NewsBrief 品牌色彩
      primary: '#F9A825',
      onPrimary: isDark ? '#000000' : '#FFFFFF',
      primaryContainer: isDark ? '#F57F17' : '#FFF59D',
      onPrimaryContainer: isDark ? '#000000' : '#1F1F1F',
      
      // 次要色彩
      secondary: '#FFB74D',
      onSecondary: isDark ? '#000000' : '#FFFFFF',
      secondaryContainer: isDark ? '#FF8F00' : '#FFE0B2',
      onSecondaryContainer: isDark ? '#000000' : '#1F1F1F',
      
      // 表面色彩
      surface: isDark ? '#121212' : '#FFFFFF',
      onSurface: isDark ? '#FFFFFF' : '#000000',
      surfaceVariant: isDark ? '#2C2C2C' : '#F5F5F5',
      onSurfaceVariant: isDark ? '#E0E0E0' : '#424242',
      
      // 背景色彩
      background: isDark ? '#000000' : '#FAFAFA',
      onBackground: isDark ? '#FFFFFF' : '#000000',
      
      // 邊框和分隔線
      outline: isDark ? '#737373' : '#BDBDBD',
      outlineVariant: isDark ? '#424242' : '#E0E0E0',
      
      // 新聞應用特定色彩
      newsCardBackground: isDark ? '#1E1E1E' : '#FFFFFF',
      newsCardBorder: isDark ? '#2C2C2C' : '#E0E0E0',
      bookmarkActive: '#F9A825',
      bookmarkInactive: isDark ? '#757575' : '#BDBDBD'
    }
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  /**
   * 載入儲存的主題偏好
   */
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('載入主題設定失敗:', error);
      }
    };

    loadThemeMode();
  }, []);

  /**
   * 設定主題模式
   */
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('儲存主題設定失敗:', error);
    }
  };

  /**
   * 計算實際的深色模式狀態
   */
  const isDarkMode = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  /**
   * 生成主題
   */
  const theme = React.useMemo(() => {
    return createCustomTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{
      themeMode,
      isDarkMode,
      theme,
      setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 3.2 主題配置組件

```typescript
/**
 * 主題設定頁面
 */
import React from 'react';
import { List, RadioButton, Surface } from 'react-native-paper';

const ThemeSettingsScreen: React.FC = () => {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();

  const themeOptions = [
    { value: 'light', label: '淺色模式', icon: 'weather-sunny' },
    { value: 'dark', label: '深色模式', icon: 'weather-night' },
    { value: 'system', label: '跟隨系統', icon: 'cellphone' }
  ];

  return (
    <Surface style={{ flex: 1 }}>
      <List.Section>
        <List.Subheader>主題選擇</List.Subheader>
        
        {themeOptions.map((option) => (
          <List.Item
            key={option.value}
            title={option.label}
            left={props => <List.Icon {...props} icon={option.icon} />}
            right={() => (
              <RadioButton
                value={option.value}
                status={themeMode === option.value ? 'checked' : 'unchecked'}
                onPress={() => setThemeMode(option.value as ThemeMode)}
              />
            )}
            onPress={() => setThemeMode(option.value as ThemeMode)}
          />
        ))}
      </List.Section>

      {/* 預覽區域 */}
      <List.Section>
        <List.Subheader>預覽</List.Subheader>
        <Surface style={styles.previewCard} elevation={2}>
          <Text style={styles.previewText}>
            目前使用{isDarkMode ? '深色' : '淺色'}主題
          </Text>
        </Surface>
      </List.Section>
    </Surface>
  );
};
```

---

## 4. 跨平台 UI 一致性處理

### 4.1 平台特定組件適配

```typescript
/**
 * 跨平台組件適配
 */
import React from 'react';
import { Platform } from 'react-native';
import { Appbar, Surface } from 'react-native-paper';

const PlatformAwareHeader: React.FC<{
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}> = ({ title, onBack, actions }) => {
  return (
    <Appbar.Header
      elevated={Platform.OS === 'android'}
      statusBarHeight={Platform.OS === 'ios' ? 44 : 0}
    >
      {onBack && (
        <Appbar.BackAction 
          onPress={onBack}
          icon={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
        />
      )}
      
      <Appbar.Content 
        title={title}
        titleStyle={{
          fontSize: Platform.OS === 'ios' ? 17 : 20,
          fontWeight: Platform.OS === 'ios' ? '600' : '500'
        }}
      />
      
      {actions}
    </Appbar.Header>
  );
};

/**
 * 平台特定卡片樣式
 */
const PlatformCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardStyle = Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderRadius: 12
    },
    android: {
      elevation: 4,
      borderRadius: 8
    }
  });

  return (
    <Surface style={[styles.baseCard, cardStyle]}>
      {children}
    </Surface>
  );
};
```

### 4.2 響應式布局處理

```typescript
/**
 * 響應式布局組件
 */
import React from 'react';
import { useWindowDimensions } from 'react-native';

const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width > 768;
  const isLandscape = width > height;

  const layoutStyles = React.useMemo(() => ({
    container: {
      flexDirection: isTablet && isLandscape ? 'row' : 'column',
      padding: isTablet ? 24 : 16
    },
    sidebar: {
      width: isTablet && isLandscape ? 300 : '100%',
      marginBottom: isTablet && isLandscape ? 0 : 16,
      marginRight: isTablet && isLandscape ? 16 : 0
    },
    main: {
      flex: 1
    }
  }), [isTablet, isLandscape]);

  return (
    <View style={layoutStyles.container}>
      {children}
    </View>
  );
};

/**
 * 新聞列表響應式布局
 */
const ResponsiveNewsList: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const { width } = useWindowDimensions();
  
  const numColumns = React.useMemo(() => {
    if (width > 1024) return 3;  // 大螢幕
    if (width > 768) return 2;   // 平板
    return 1;                    // 手機
  }, [width]);

  const itemWidth = React.useMemo(() => {
    const padding = 16;
    const spacing = 8;
    return (width - padding * 2 - spacing * (numColumns - 1)) / numColumns;
  }, [width, numColumns]);

  return (
    <FlatList
      data={articles}
      numColumns={numColumns}
      key={numColumns} // 強制重新渲染當 columns 改變
      renderItem={({ item }) => (
        <View style={{ width: itemWidth, margin: 4 }}>
          <NewsCard article={item} />
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};
```

---

## 5. 自定義組件與擴展

### 5.1 擴展 Paper 組件

```typescript
/**
 * 自定義新聞卡片組件
 * 擴展 React Native Paper Card
 */
import React from 'react';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { Animated, PanGestureHandler, State } from 'react-native-reanimated';

interface EnhancedNewsCardProps {
  article: Article;
  onPress: () => void;
  onSwipeLeft?: () => void;  // 左滑書籤
  onSwipeRight?: () => void; // 右滑分享
}

const EnhancedNewsCard: React.FC<EnhancedNewsCardProps> = ({
  article,
  onPress,
  onSwipeLeft,
  onSwipeRight
}) => {
  const theme = useTheme();
  const translateX = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

  /**
   * 手勢處理
   */
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > 100 && onSwipeRight) {
        onSwipeRight();
      } else if (translationX < -100 && onSwipeLeft) {
        onSwipeLeft();
      }
      
      // 重置位置
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true
      }).start();
    }
  };

  /**
   * 按壓動畫
   */
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={{
          transform: [{ translateX }, { scale }]
        }}
      >
        <Card
          style={[
            styles.enhancedCard,
            { backgroundColor: theme.colors.newsCardBackground }
          ]}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Card.Cover 
            source={{ uri: article.urlToImage }}
            style={styles.cardCover}
          />
          
          <Card.Content>
            <Title numberOfLines={2}>
              {article.title}
            </Title>
            <Paragraph numberOfLines={3}>
              {article.description}
            </Paragraph>
          </Card.Content>
          
          {/* 滑動提示 */}
          <View style={styles.swipeHints}>
            <View style={[styles.swipeHint, styles.leftHint]}>
              <Text style={styles.hintText}>書籤</Text>
            </View>
            <View style={[styles.swipeHint, styles.rightHint]}>
              <Text style={styles.hintText}>分享</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    </PanGestureHandler>
  );
};
```

### 5.2 主題感知組件

```typescript
/**
 * 主題感知的自定義組件
 */
import React from 'react';
import { useTheme } from 'react-native-paper';

const ThemeAwareStatusBar: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
    />
  );
};

/**
 * 動態色彩指示器
 */
const LoadingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Surface 
      style={[
        styles.loadingContainer,
        { backgroundColor: theme.colors.surface }
      ]}
      elevation={4}
    >
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary}
      />
      <Text style={[
        styles.loadingText,
        { color: theme.colors.onSurface }
      ]}>
        載入中...
      </Text>
    </Surface>
  );
};
```

---

## 6. 實戰案例：NewsBrief UI 架構

### 6.1 完整的 UI 組件系統

```typescript
/**
 * NewsBrief UI 組件庫
 * src/components/ui/index.ts
 */

// 基礎組件
export { default as NewsCard } from './NewsCard';
export { default as CategorySelector } from './CategorySelector';
export { default as SearchBar } from './SearchBar';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';

// 佈局組件
export { default as AppHeader } from './AppHeader';
export { default as TabBarCustom } from './TabBarCustom';
export { default as SafeAreaWrapper } from './SafeAreaWrapper';

// 主題組件
export { ThemeProvider, useTheme } from '../theme/ThemeProvider';

/**
 * 統一的組件介面
 */
interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  style?: any;
}

export interface NewsCardProps extends BaseComponentProps {
  article: Article;
  onPress: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export interface CategorySelectorProps extends BaseComponentProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  horizontal?: boolean;
}
```

### 6.2 主應用程式 UI 整合

```typescript
/**
 * NewsBrief 主應用程式
 * 完整的 UI 架構整合
 */
const NewsBriefApp: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <ThemeAwareStatusBar />
        
        <NavigationContainer
          theme={{
            dark: isDarkMode,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.onSurface,
              border: theme.colors.outline,
              notification: theme.colors.secondary
            }
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

/**
 * 頭條新聞頁面完整實作
 */
const HeadlinesScreen: React.FC = () => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  return (
    <SafeAreaWrapper>
      <AppHeader 
        title="新聞頭條"
        showSearch
        onSearchPress={() => navigation.navigate('Search')}
      />
      
      <CategorySelector
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        horizontal
        style={{ marginVertical: 8 }}
      />
      
      <NewsList 
        category={selectedCategory}
        cardVariant="default"
      />
    </SafeAreaWrapper>
  );
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **主題系統**
    - 使用 PaperProvider 包裝整個應用
    - 實作動態主題切換
    - 遵循 Material Design 規範

2. **組件使用**
    - 優先使用 Paper 內建組件
    - 適當自定義以符合品牌需求
    - 保持跨平台一致性

3. **無障礙設計**
    - 添加適當的 accessibility 屬性
    - 確保色彩對比度符合標準
    - 支援螢幕閱讀器

### ❌ 常見陷阱

1. **主題不一致**

```typescript
// ❌ 避免：硬編碼顏色
<Text style={{ color: '#F9A825' }}>

// ✅ 建議：使用主題色彩
<Text style={{ color: theme.colors.primary }}>
```

2. **忽略平台差異**

```typescript
// ❌ 避免：統一處理所有平台
elevation: 4

// ✅ 建議：平台特定處理
...Platform.select({
  android: { elevation: 4 },
  ios: { shadowOffset: { width: 0, height: 2 } }
})
```

---

## 🔗 相關教學

- [React Native 基礎與 TypeScript 整合](../01-react-native-typescript/README.md)
- [React Navigation 7 導航系統](../06-navigation/README.md)
- [跨平台開發與樣式處理](../11-cross-platform/README.md)

---

## 📖 延伸閱讀

- [React Native Paper 官方文件](https://callstack.github.io/react-native-paper/)
- [Material Design 3 指南](https://m3.material.io/)
- [無障礙設計最佳實踐](https://reactnative.dev/docs/accessibility)