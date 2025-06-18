# 🧭 React Navigation 7 導航系統

基於 NewsBrief 專案的 React Navigation 7 企業級導航實戰

## 🎯 學習目標

- 掌握 React Navigation 7 現代導航架構
- 學會 Bottom Tab Navigator 配置與自定義
- 理解導航狀態管理與參數傳遞
- 實作深度連結與導航最佳實踐

## 📚 目錄

1. [React Navigation 7 核心概念](#1-react-navigation-7-核心概念)
2. [Bottom Tab Navigator 配置](#2-bottom-tab-navigator-配置)
3. [導航狀態管理與參數傳遞](#3-導航狀態管理與參數傳遞)
4. [自定義 Tab Bar 實作](#4-自定義-tab-bar-實作)
5. [深度連結與導航最佳實踐](#5-深度連結與導航最佳實踐)
6. [實戰案例：NewsBrief 導航架構](#6-實戰案例newsbrief-導航架構)

---

## 1. React Navigation 7 核心概念

### 1.1 導航架構概覽

```typescript
/**
 * React Navigation 7 核心組件
 */
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/**
 * NewsBrief 導航架構
 * - NavigationContainer: 根容器
 * - BottomTabNavigator: 主要導航
 * - StackNavigator: 頁面堆疊
 */

interface RootTabParamList {
  Headlines: undefined;
  Search: undefined;
  Bookmarks: undefined;
  Translate: undefined;
}

interface RootStackParamList {
  MainTabs: undefined;
  ArticleDetail: { articleUrl: string };
  Settings: undefined;
}

/**
 * 導航類型安全
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
```

### 1.2 基本導航設置

```typescript
/**
 * 基礎導航配置
 * src/navigation/index.tsx
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import TabNavigator from './TabNavigator';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  /**
   * 導航主題配置
   */
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.secondary
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600'
          }
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={({ route }) => ({
            title: '文章詳情',
            headerBackTitle: '返回'
          })}
        />
        
        <Stack.Screen 
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            presentation: 'modal'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
```

---

## 2. Bottom Tab Navigator 配置

### 2.1 基本 Tab Navigator

```typescript
/**
 * Bottom Tab Navigator 配置
 * src/navigation/TabNavigator.tsx
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

import HeadlinesScreen from '../screens/HeadlinesScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import TranslateScreen from '../screens/TranslateScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            return options.tabBarLabel as string || route.name;
          }}
        />
      )}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Headlines"
        component={HeadlinesScreen}
        options={{
          tabBarLabel: '頭條',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="newspaper" 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '搜尋',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="magnify" 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: '收藏',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="bookmark" 
              size={size} 
              color={color} 
            />
          ),
          tabBarBadge: bookmarkCount > 0 ? bookmarkCount : undefined
        }}
      />
      
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          tabBarLabel: '翻譯',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="translate" 
              size={size} 
              color={color} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};
```

### 2.2 動態 Tab 配置

```typescript
/**
 * 動態 Tab 配置與條件渲染
 */
import React from 'react';
import { useAppSelector } from '../store/hooks';

const DynamicTabNavigator: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const bookmarkCount = useAppSelector(state => state.bookmarks.items.length);

  /**
   * 基礎 Tab 配置
   */
  const baseTabs = [
    {
      name: 'Headlines' as const,
      component: HeadlinesScreen,
      label: '頭條',
      icon: 'newspaper'
    },
    {
      name: 'Search' as const,
      component: SearchScreen,
      label: '搜尋',
      icon: 'magnify'
    }
  ];

  /**
   * 條件性 Tab
   */
  const conditionalTabs = [
    // 收藏 Tab - 總是顯示
    {
      name: 'Bookmarks' as const,
      component: BookmarksScreen,
      label: '收藏',
      icon: 'bookmark',
      badge: bookmarkCount > 0 ? bookmarkCount : undefined
    },
    
    // 翻譯 Tab - 登入用戶才顯示
    ...(user ? [{
      name: 'Translate' as const,
      component: TranslateScreen,
      label: '翻譯',
      icon: 'translate'
    }] : [])
  ];

  const allTabs = [...baseTabs, ...conditionalTabs];

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {allTabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={size} 
                color={color} 
              />
            ),
            tabBarBadge: tab.badge
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
```

---

## 3. 導航狀態管理與參數傳遞

### 3.1 類型安全的導航

```typescript
/**
 * 類型安全的導航 Hooks
 * src/hooks/useNavigation.ts
 */
import { useNavigation, useRoute } from '@react-navigation/native';
import type { 
  NativeStackNavigationProp,
  NativeStackScreenProps 
} from '@react-navigation/native-stack';
import type { 
  BottomTabNavigationProp,
  BottomTabScreenProps 
} from '@react-navigation/bottom-tabs';

/**
 * 類型安全的 Stack 導航 Hook
 */
export const useStackNavigation = () => {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};

/**
 * 類型安全的 Tab 導航 Hook
 */
export const useTabNavigation = () => {
  return useNavigation<BottomTabNavigationProp<RootTabParamList>>();
};

/**
 * 新聞相關導航 Hook
 */
export const useNewsNavigation = () => {
  const stackNavigation = useStackNavigation();
  const tabNavigation = useTabNavigation();

  const navigateToArticle = useCallback((articleUrl: string) => {
    stackNavigation.navigate('ArticleDetail', { articleUrl });
  }, [stackNavigation]);

  const navigateToSearch = useCallback((query?: string) => {
    tabNavigation.navigate('Search', { query });
  }, [tabNavigation]);

  const navigateToBookmarks = useCallback(() => {
    tabNavigation.navigate('Bookmarks');
  }, [tabNavigation]);

  const navigateToSettings = useCallback(() => {
    stackNavigation.navigate('Settings');
  }, [stackNavigation]);

  return {
    navigateToArticle,
    navigateToSearch,
    navigateToBookmarks,
    navigateToSettings
  };
};
```

### 3.2 參數傳遞與接收

```typescript
/**
 * 參數傳遞實例
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * 文章詳情頁面 - 接收參數
 */
type ArticleDetailProps = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;

const ArticleDetailScreen: React.FC<ArticleDetailProps> = ({ route, navigation }) => {
  const { articleUrl } = route.params;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 載入文章詳情
   */
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(articleUrl);
        const articleData = await response.json();
        setArticle(articleData);
        
        // 動態設定標題
        navigation.setOptions({
          title: articleData.title.substring(0, 30) + '...'
        });
      } catch (error) {
        console.error('載入文章失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleUrl, navigation]);

  /**
   * 分享功能
   */
  const handleShare = useCallback(async () => {
    if (article) {
      try {
        await Share.share({
          message: `${article.title}\n\n${articleUrl}`
        });
      } catch (error) {
        console.error('分享失敗:', error);
      }
    }
  }, [article, articleUrl]);

  /**
   * 設定導航按鈕
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="share"
          size={24}
          onPress={handleShare}
          disabled={!article}
        />
      )
    });
  }, [navigation, handleShare, article]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return <ErrorMessage message="無法載入文章" />;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <ArticleContent article={article} />
    </ScrollView>
  );
};

/**
 * 搜尋頁面 - 接收可選參數
 */
type SearchScreenProps = BottomTabScreenProps<RootTabParamList, 'Search'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ route }) => {
  const { query: initialQuery } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜尋新聞..."
      />
      <SearchResults query={searchQuery} />
    </View>
  );
};
```

### 3.3 導航狀態監聽

```typescript
/**
 * 導航狀態監聽與分析
 */
import { useNavigationState } from '@react-navigation/native';
import analytics from '@react-native-firebase/analytics';

/**
 * 導航分析 Hook
 */
export const useNavigationAnalytics = () => {
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    if (navigationState) {
      const currentRouteName = getCurrentRouteName(navigationState);
      
      // 記錄頁面瀏覽
      analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName
      });

      // 本地狀態記錄
      console.log('當前頁面:', currentRouteName);
    }
  }, [navigationState]);
};

/**
 * 導航歷史追蹤
 */
export const useNavigationHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    if (navigationState) {
      const currentRoute = getCurrentRouteName(navigationState);
      
      setHistory(prev => {
        // 避免重複記錄相同頁面
        if (prev[prev.length - 1] === currentRoute) {
          return prev;
        }
        
        // 限制歷史記錄長度
        const newHistory = [...prev, currentRoute];
        return newHistory.slice(-10);
      });
    }
  }, [navigationState]);

  return history;
};

/**
 * 獲取當前路由名稱
 */
const getCurrentRouteName = (state: any): string => {
  if (!state || typeof state.index !== 'number') {
    return 'Unknown';
  }

  const route = state.routes[state.index];
  
  if (route.state) {
    return getCurrentRouteName(route.state);
  }
  
  return route.name;
};
```

---

## 4. 自定義 Tab Bar 實作

### 4.1 完全自定義 Tab Bar

```typescript
/**
 * 自定義 Tab Bar 組件
 * src/components/CustomTabBar.tsx
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Text, Badge, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const animatedValues = React.useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  /**
   * Tab 按壓動畫
   */
  const animateTab = (index: number) => {
    animatedValues.forEach((value, i) => {
      Animated.timing(value, {
        toValue: i === index ? 1 : 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    });
  };

  React.useEffect(() => {
    animateTab(state.index);
  }, [state.index]);

  return (
    <View 
      style={[
        styles.tabBar,
        { 
          backgroundColor: theme.colors.surface,
          paddingBottom: insets.bottom,
          borderTopColor: theme.colors.outline
        }
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const icon = options.tabBarIcon;
        const badge = options.tabBarBadge;
        
        const isFocused = state.index === index;

        /**
         * Tab 按壓處理
         */
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        /**
         * 長按處理
         */
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const animatedValue = animatedValues[index];
        const scale = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1]
        });

        const translateY = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2]
        });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Animated.View
              style={[
                styles.tabContent,
                {
                  transform: [{ scale }, { translateY }]
                }
              ]}
            >
              {/* 圖標 */}
              <View style={styles.iconContainer}>
                {icon && icon({
                  focused: isFocused,
                  color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  size: 24
                })}
                
                {/* 徽章 */}
                {badge && (
                  <Badge
                    visible={!!badge}
                    size={16}
                    style={styles.badge}
                  >
                    {badge}
                  </Badge>
                )}
              </View>
              
              {/* 標籤 */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: isFocused ? '600' : '400'
                  }
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
              
              {/* 活躍指示器 */}
              {isFocused && (
                <Animated.View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    borderRadius: 1.5
  }
});

export default CustomTabBar;
```

### 4.2 可滑動 Tab Bar

```typescript
/**
 * 可滑動的 Tab Bar（適用於多個 Tab）
 */
import React from 'react';
import { ScrollView, View } from 'react-native';

interface ScrollableTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const ScrollableTabBar: React.FC<ScrollableTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<number[]>([]);

  /**
   * 自動滾動到活躍 Tab
   */
  useEffect(() => {
    if (scrollViewRef.current && tabLayouts.length > 0) {
      const activeTabLayout = tabLayouts[state.index];
      if (activeTabLayout) {
        scrollViewRef.current.scrollTo({
          x: activeTabLayout - 50, // 留一些邊距
          animated: true
        });
      }
    }
  }, [state.index, tabLayouts]);

  /**
   * 測量 Tab 位置
   */
  const onTabLayout = (index: number, event: any) => {
    const { x } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = x;
      return newLayouts;
    });
  };

  return (
    <View style={styles.scrollableTabBar}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {state.routes.map((route: any, index: number) => (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.scrollableTab,
              state.index === index && styles.activeScrollableTab
            ]}
            onLayout={(event) => onTabLayout(index, event)}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text>{descriptors[route.key].options.tabBarLabel || route.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

---

## 5. 深度連結與導航最佳實踐

### 5.1 深度連結配置

```typescript
/**
 * 深度連結配置
 * App.tsx
 */
import { Linking } from 'react-native';

const App: React.FC = () => {
  const linking = {
    prefixes: ['newsbrief://', 'https://newsbrief.app'],
    config: {
      screens: {
        MainTabs: {
          screens: {
            Headlines: 'headlines',
            Search: {
              path: 'search/:query?',
              parse: {
                query: (query: string) => decodeURIComponent(query)
              }
            },
            Bookmarks: 'bookmarks',
            Translate: 'translate'
          }
        },
        ArticleDetail: {
          path: 'article/:articleUrl',
          parse: {
            articleUrl: (url: string) => decodeURIComponent(url)
          }
        },
        Settings: 'settings'
      }
    }
  };

  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
};

/**
 * 深度連結處理 Hook
 */
export const useDeepLinkHandler = () => {
  const navigation = useStackNavigation();

  useEffect(() => {
    /**
     * 處理初始 URL
     */
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    /**
     * 監聽 URL 變化
     */
    const handleURL = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', handleURL);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * 深度連結處理邏輯
   */
  const handleDeepLink = (url: string) => {
    console.log('處理深度連結:', url);
    
    // 自定義處理邏輯
    if (url.includes('/article/')) {
      const articleUrl = extractArticleUrl(url);
      if (articleUrl) {
        navigation.navigate('ArticleDetail', { articleUrl });
      }
    } else if (url.includes('/search/')) {
      const query = extractSearchQuery(url);
      navigation.navigate('MainTabs', { 
        screen: 'Search',
        params: { query }
      });
    }
  };
};
```

### 5.2 導航性能優化

```typescript
/**
 * 導航性能優化策略
 */
import { useFocusEffect } from '@react-navigation/native';

/**
 * 延遲載入畫面組件
 */
const LazyScreen: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // 畫面獲得焦點時才載入內容
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  if (!isLoaded) {
    return <ScreenPlaceholder />;
  }

  return <ActualScreenContent />;
};

/**
 * 預載入關鍵畫面
 */
export const useScreenPreloader = () => {
  const navigation = useStackNavigation();

  const preloadScreens = useCallback(() => {
    // 預載入常用畫面的關鍵資源
    Promise.all([
      import('../screens/ArticleDetailScreen'),
      import('../screens/SearchScreen')
    ]);
  }, []);

  useEffect(() => {
    // 應用啟動後預載入
    const timer = setTimeout(preloadScreens, 2000);
    return () => clearTimeout(timer);
  }, [preloadScreens]);
};

/**
 * 智能路由快取
 */
const StackNavigatorWithCache: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        // 啟用畫面快取
        freezeOnBlur: true,
        // 懶載入畫面
        lazy: true,
        // 動畫優化
        animationTypeForReplace: 'push',
        animation: 'slide_from_right'
      }}
    >
      {/* 畫面定義 */}
    </Stack.Navigator>
  );
};
```

---

## 6. 實戰案例：NewsBrief 導航架構

### 6.1 完整導航系統

```typescript
/**
 * NewsBrief 完整導航架構
 * src/navigation/AppNavigator.tsx
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import { useTheme } from '../hooks/useTheme';
import { useDeepLinkHandler } from '../hooks/useDeepLinkHandler';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
  // 處理深度連結
  useDeepLinkHandler();

  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.secondary
    }
  };

  return (
    <NavigationContainer 
      theme={navigationTheme}
      linking={{
        prefixes: ['newsbrief://', 'https://newsbrief.app'],
        config: {
          screens: {
            MainTabs: {
              screens: {
                Headlines: 'headlines',
                Search: 'search',
                Bookmarks: 'bookmarks',
                Translate: 'translate'
              }
            },
            ArticleDetail: 'article/:articleUrl',
            Settings: 'settings',
            SearchResult: 'search-result/:query'
          }
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600'
          },
          contentStyle: {
            backgroundColor: theme.colors.background
          }
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={({ route }) => ({
            title: '文章詳情',
            headerBackTitle: '返回',
            presentation: 'card'
          })}
        />
        
        <Stack.Screen 
          name="SearchResult"
          component={SearchResultScreen}
          options={({ route }) => ({
            title: `搜尋: ${route.params.query}`,
            headerBackTitle: '返回'
          })}
        />
        
        <Stack.Screen 
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            presentation: 'modal',
            headerRight: () => (
              <Button onPress={() => navigation.goBack()}>
                完成
              </Button>
            )
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6.2 實際使用案例

```typescript
/**
 * Headlines Screen 導航整合
 */
const HeadlinesScreen: React.FC = () => {
  const { navigateToArticle, navigateToSearch } = useNewsNavigation();
  const { articles, loading } = useNews('general');

  /**
   * 文章點擊處理
   */
  const handleArticlePress = useCallback((article: Article) => {
    // 記錄分析事件
    analytics().logEvent('article_view', {
      article_title: article.title,
      article_source: article.source.name
    });
    
    navigateToArticle(article.url);
  }, [navigateToArticle]);

  /**
   * 搜尋按鈕處理
   */
  const handleSearchPress = useCallback(() => {
    navigateToSearch();
  }, [navigateToSearch]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader 
        title="新聞頭條"
        rightAction={
          <IconButton
            icon="magnify"
            onPress={handleSearchPress}
          />
        }
      />
      
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => handleArticlePress(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} />
        }
      />
    </SafeAreaView>
  );
};

/**
 * Tab 切換與狀態保持
 */
const useTabState = () => {
  const [tabStates, setTabStates] = useState<Record<string, any>>({});
  
  const saveTabState = useCallback((routeName: string, state: any) => {
    setTabStates(prev => ({
      ...prev,
      [routeName]: state
    }));
  }, []);
  
  const getTabState = useCallback((routeName: string) => {
    return tabStates[routeName];
  }, [tabStates]);
  
  return { saveTabState, getTabState };
};
```

---

## 🚀 最佳實踐總結

### ✅ 建議做法

1. **類型安全**
    - 定義完整的導航參數類型
    - 使用類型安全的導航 Hooks
    - 嚴格的路由參數驗證

2. **性能優化**
    - 延遲載入非關鍵畫面
    - 使用畫面快取機制
    - 預載入常用資源

3. **用戶體驗**
    - 流暢的轉場動畫
    - 合適的導航層次結構
    - 智能的返回行為

### ❌ 常見陷阱

1. **導航參數類型錯誤**

```typescript
// ❌ 避免：未定義的參數類型
navigation.navigate('ArticleDetail', { id: 123 });

// ✅ 建議：明確的參數類型
navigation.navigate('ArticleDetail', { articleUrl: 'https://...' });
```

2. **過深的導航層次**

```typescript
// ❌ 避免：過深的嵌套導航
<Stack.Navigator>
  <Tab.Navigator>
    <Stack.Navigator> // 避免過深嵌套
```

---

## 🔗 相關教學

- [React Native Paper UI 組件庫](../05-paper-ui/README.md)
- [組件設計模式與優化](../10-component-patterns/README.md)
- [錯誤處理與應用程式品質](../12-error-handling/README.md)

---

## 📖 延伸閱讀

- [React Navigation 官方文件](https://reactnavigation.org/)
- [深度連結最佳實踐](https://reactnavigation.org/docs/deep-linking/)
- [導航性能優化](https://reactnavigation.org/docs/performance/)