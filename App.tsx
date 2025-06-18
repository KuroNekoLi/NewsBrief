import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { TabNavigator } from './src/navigation/TabNavigator';

// 建立 React Query 客戶端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5分鐘
      gcTime: 30 * 60 * 1000, // 30分鐘
    },
  },
});

// 自訂主題配色 - 黃色主題
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ff9800',           // 鮮明的橙黃色
    onPrimary: '#ffffff',
    primaryContainer: '#fff3c4',   // 淺黃色容器
    onPrimaryContainer: '#1c1600',
    secondary: '#f57c00',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffe0b3',
    onSecondaryContainer: '#1c1600',
    tertiary: '#ff6f00',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffcc80',
    onTertiaryContainer: '#1c1600',
    // 重要：表面和背景色改為明顯的黃色調
    surface: '#fff8e1',           // 明顯的淺黃色表面
    onSurface: '#1d1b16',
    surfaceVariant: '#fff3c4',    // 更黃的變體
    onSurfaceVariant: '#4e4538',
    background: '#fffde7',        // 明顯的黃色背景
    onBackground: '#1d1b16',
    // 添加所有相關的表面色
    surfaceContainer: '#fff3c4',          // 容器表面
    surfaceContainerLow: '#fff8e1',       // 低層容器
    surfaceContainerLowest: '#ffffff',    // 最低層容器
    surfaceContainerHigh: '#ffecb3',      // 高層容器
    surfaceContainerHighest: '#ffe0a5',   // 最高層容器
    // 其他顏色
    error: '#d32f2f',
    onError: '#ffffff',
    errorContainer: '#ffcdd2',
    onErrorContainer: '#410002',
    outline: '#bfa760',          // 黃色調邊框
    outlineVariant: '#e6d392',   // 黃色調邊框變體
    scrim: '#000000',
    // 確保卡片顏色 - 使用白色系讓卡片突出
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',         // 卡片背景色 - 純白色
      level2: '#fafafa',         // 稍微灰一點的白色
      level3: '#f5f5f5',
      level4: '#eeeeee',
      level5: '#e0e0e0',
    },
  },
};

/**
 * NewsBrief 主應用程式組件
 */
function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background}
                translucent={false}
              />
              <TabNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
