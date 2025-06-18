# 📱 React Native 跨平台開發策略

基於 NewsBrief 專案的 React Native 跨平台開發實戰指南

## 🎯 學習目標

- 掌握 React Native 跨平台開發核心概念
- 學會處理 iOS 與 Android 平台差異
- 理解平台特定代碼組織與管理策略
- 掌握跨平台 UI 適配與性能優化技巧

## 📚 目錄

1. [跨平台開發基礎](#1-跨平台開發基礎)
2. [平台特定代碼組織](#2-平台特定代碼組織)
3. [UI 適配與樣式差異處理](#3-ui-適配與樣式差異處理)
4. [平台特定 API 與功能](#4-平台特定-api-與功能)
5. [實戰案例：NewsBrief 跨平台架構](#5-實戰案例newsbrief-跨平台架構)

---

## 1. 跨平台開發基礎

### 1.1 React Native 跨平台原理

React Native 通過 JavaScript 橋接機制將 JavaScript 代碼轉換為原生 UI 組件，實現跨平台開發。

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  JavaScript     │     │  Bridge         │     │  Native         │
│  Thread         │ ──> │  (JSON)         │ ──> │  Thread         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       React                   Bridge                 Native UI
```

### 1.2 平台檢測

使用 `Platform` API 檢測當前運行平台。

```typescript
import { Platform } from 'react-native';

/**
 * 平台檢測示例
 * 來自 NewsBrief 專案的實際實作
 */
const platformSpecificCode = () => {
  // 檢測當前平台
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  // 根據平台返回不同值
  return {
    headerHeight: isIOS ? 44 : 56,
    statusBarStyle: isIOS ? 'default' : 'light-content',
    rippleEffect: isAndroid,
  };
};

// 平台版本檢測
const isIOS14OrLater = Platform.OS === 'ios' && parseInt(Platform.Version.toString(), 10) >= 14;
const isAndroid10OrLater = Platform.OS === 'android' && Platform.Version >= 29;
```

### 1.3 跨平台開發挑戰

1. **UI 一致性**：不同平台有不同的設計語言和 UI 規範
2. **平台特定功能**：某些功能僅在特定平台可用
3. **性能差異**：不同平台的性能特性不同
4. **原生模塊整合**：需要為每個平台編寫原生代碼
5. **測試複雜性**：需要在多個平台上進行測試

---

## 2. 平台特定代碼組織

### 2.1 Platform.select 方法

使用 `Platform.select` 根據平台返回不同的值。

```typescript
import { Platform, StyleSheet } from 'react-native';

/**
 * 使用 Platform.select 選擇平台特定值
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  text: {
    fontSize: 16,
    color: Platform.select({
      ios: '#007AFF',
      android: '#2196F3',
      default: '#000000',
    }),
  },
});

// 平台特定組件
const Button = Platform.select({
  ios: () => require('./IOSButton'),
  android: () => require('./AndroidButton'),
})();
```

### 2.2 平台特定文件擴展名

使用 `.ios.js` 和 `.android.js` 文件擴展名創建平台特定文件。

```
src/
├── components/
│   ├── Button.js          # 共享代碼
│   ├── Button.ios.js      # iOS 特定實現
│   ├── Button.android.js  # Android 特定實現
│   └── index.js           # 導出組件
```

```typescript
// index.js
// 無需明確導入平台特定文件，React Native 會自動選擇正確的文件
export { default as Button } from './Button';

// 使用方式
import { Button } from './components';
// 在 iOS 上會使用 Button.ios.js
// 在 Android 上會使用 Button.android.js
```

### 2.3 條件渲染

在組件內部使用條件渲染處理平台差異。

```typescript
import React from 'react';
import { View, Platform, Text } from 'react-native';

/**
 * 使用條件渲染處理平台差異
 */
const PlatformSpecificComponent = () => {
  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && (
        <Text style={styles.text}>iOS 特定內容</Text>
      )}
      
      {Platform.OS === 'android' && (
        <Text style={styles.text}>Android 特定內容</Text>
      )}
      
      <Text style={styles.text}>
        {Platform.select({
          ios: 'iOS 版本特定文本',
          android: 'Android 版本特定文本',
          default: '其他平台文本',
        })}
      </Text>
    </View>
  );
};
```

---

## 3. UI 適配與樣式差異處理

### 3.1 安全區域與缺口處理

使用 `SafeAreaView` 和 `SafeAreaContext` 處理不同設備的安全區域。

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 使用 SafeAreaView 處理安全區域
 */
const SafeScreen = ({ children }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

/**
 * 使用 useSafeAreaInsets 手動處理安全區域
 */
const CustomSafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
```

### 3.2 響應式佈局

創建適應不同屏幕尺寸和方向的響應式佈局。

```typescript
import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * 使用 Dimensions 獲取屏幕尺寸
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 判斷是否為平板
const isTablet = SCREEN_WIDTH >= 768;

/**
 * 使用 useWindowDimensions hook 響應屏幕變化
 */
const ResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          isLandscape ? styles.landscapeContent : styles.portraitContent,
          isTablet ? styles.tabletContent : styles.phoneContent,
        ]}
      >
        {/* 內容 */}
      </View>
    </View>
  );
};

/**
 * 監聽屏幕方向變化
 */
const OrientationAwareComponent = () => {
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    const onChange = ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    
    return () => subscription.remove();
  }, []);
  
  return (
    <View style={orientation === 'landscape' ? styles.landscape : styles.portrait}>
      {/* 內容 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  portraitContent: {
    flexDirection: 'column',
  },
  landscapeContent: {
    flexDirection: 'row',
  },
  phoneContent: {
    padding: 8,
  },
  tabletContent: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
  },
  portrait: {
    // 豎屏樣式
  },
  landscape: {
    // 橫屏樣式
  },
});
```

### 3.3 平台特定樣式調整

處理 iOS 和 Android 之間的樣式差異。

```typescript
import { StyleSheet, Platform } from 'react-native';

/**
 * 平台特定樣式調整
 */
const styles = StyleSheet.create({
  // 字體調整
  text: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 16,
  },
  
  // 陰影效果
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // 按鈕樣式
  button: {
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  },
  
  // 輸入框樣式
  input: {
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: Platform.OS === 'ios' ? '#ccc' : '#2196F3',
    padding: Platform.OS === 'ios' ? 12 : 8,
  },
});
```

---

## 4. 平台特定 API 與功能

### 4.1 處理平台特定 API

使用條件代碼處理僅在特定平台可用的 API。

```typescript
import { Platform, Linking, ToastAndroid } from 'react-native';

/**
 * 跨平台通知實現
 */
export const showNotification = (message: string) => {
  if (Platform.OS === 'android') {
    // Android 使用 Toast
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (Platform.OS === 'ios') {
    // iOS 可以使用 Alert 或第三方庫
    // 這裡使用簡單的 alert 作為示例
    alert(message);
  }
};

/**
 * 跨平台分享實現
 */
export const shareContent = async (title: string, message: string, url: string) => {
  try {
    if (Platform.OS === 'ios') {
      // iOS 特定分享邏輯
      await Linking.openURL(`messages://share?body=${encodeURIComponent(message)}`);
    } else if (Platform.OS === 'android') {
      // Android 特定分享邏輯
      const intentUrl = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.SUBJECT=${encodeURIComponent(title)};S.android.intent.extra.TEXT=${encodeURIComponent(message + ' ' + url)};end`;
      await Linking.openURL(intentUrl);
    }
  } catch (error) {
    console.error('無法分享內容', error);
  }
};
```

### 4.2 原生模塊整合

使用原生模塊實現平台特定功能。

```typescript
// 原生模塊示例 (JavaScript 接口)
import { NativeModules } from 'react-native';

const { BiometricAuth } = NativeModules;

/**
 * 生物識別認證模塊
 */
export const authenticateUser = async () => {
  try {
    // 檢查設備支持的生物識別類型
    const biometricType = await BiometricAuth.getSupportedBiometricType();
    
    if (!biometricType) {
      return { success: false, error: '設備不支持生物識別' };
    }
    
    // 執行認證
    const result = await BiometricAuth.authenticate('請驗證您的身份');
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 使用方式
const handleLogin = async () => {
  const { success, result, error } = await authenticateUser();
  
  if (success) {
    // 認證成功
    console.log('認證成功', result);
  } else {
    // 認證失敗
    console.log('認證失敗', error);
  }
};
```

### 4.3 第三方庫的平台差異

處理第三方庫在不同平台上的差異。

```typescript
import React from 'react';
import { Platform } from 'react-native';

/**
 * 處理第三方庫的平台差異
 */
// 根據平台導入不同的地圖庫
const MapView = Platform.select({
  ios: () => require('@react-native-mapbox-gl/maps').MapView,
  android: () => require('react-native-maps').default,
})();

// 使用統一接口封裝平台差異
const Map = (props) => {
  const { latitude, longitude, zoom, onRegionChange, children } = props;
  
  if (Platform.OS === 'ios') {
    // iOS 特定實現
    return (
      <MapView
        style={{ flex: 1 }}
        initialCenterCoordinate={{
          latitude,
          longitude,
        }}
        initialZoomLevel={zoom}
        onRegionDidChange={onRegionChange}
      >
        {children}
      </MapView>
    );
  } else {
    // Android 特定實現
    return (
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0922 / zoom,
          longitudeDelta: 0.0421 / zoom,
        }}
        onRegionChangeComplete={onRegionChange}
      >
        {children}
      </MapView>
    );
  }
};
```

---

## 5. 實戰案例：NewsBrief 跨平台架構

### 5.1 NewsBrief 跨平台策略

NewsBrief 專案採用以下跨平台開發策略：

1. **共享核心邏輯**：業務邏輯、狀態管理和數據獲取在平台間共享
2. **平台特定 UI 調整**：使用 Platform API 和條件渲染處理 UI 差異
3. **統一組件接口**：創建統一的組件接口，內部處理平台差異
4. **響應式設計**：適應不同屏幕尺寸和方向的響應式佈局

### 5.2 TabNavigator 跨平台實現

```typescript
import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

/**
 * 跨平台底部標籤導航器
 */
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          style={{
            backgroundColor: '#fff3c4',
            // 平台特定高度調整
            height: Platform.OS === 'ios' ? 84 : 64,
            // iOS 底部安全區域已由 insets 處理
            paddingBottom: Platform.OS === 'android' ? 8 : 0,
          }}
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
            let emoji: string;
            
            switch (route.name) {
              case 'Headlines':
                emoji = '📰';
                break;
              case 'Bookmarks':
                emoji = focused ? '✅' : '📋';
                break;
              case 'Search':
                emoji = '🔍';
                break;
              case 'Translate':
                emoji = '🌐';
                break;
              default:
                emoji = '●';
            }
            
            return (
              <Text 
                style={{ 
                  fontSize: 20, 
                  color: focused ? color : '#666',
                  // 平台特定調整
                  marginTop: Platform.OS === 'ios' ? 0 : 4,
                }}
              >
                {emoji}
              </Text>
            );
          }}
        />
      )}
    >
      {/* Tab screens */}
    </Tab.Navigator>
  );
};
```

### 5.3 跨平台樣式策略

```typescript
import { StyleSheet, Platform, Dimensions } from 'react-native';

/**
 * 跨平台樣式策略
 */
// 獲取屏幕尺寸
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// 定義平台特定常量
const PLATFORM = {
  BORDER_RADIUS: Platform.OS === 'ios' ? 8 : 4,
  FONT_REGULAR: Platform.OS === 'ios' ? 'System' : 'Roboto',
  FONT_BOLD: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  PRIMARY_COLOR: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  CARD_MARGIN: isTablet ? 16 : 8,
};

// 創建共享樣式
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: PLATFORM.BORDER_RADIUS,
    margin: PLATFORM.CARD_MARGIN,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  title: {
    fontFamily: PLATFORM.FONT_BOLD,
    fontSize: isTablet ? 20 : 18,
    marginBottom: 8,
  },
  
  text: {
    fontFamily: PLATFORM.FONT_REGULAR,
    fontSize: isTablet ? 16 : 14,
    color: '#333',
  },
  
  button: {
    backgroundColor: PLATFORM.PRIMARY_COLOR,
    borderRadius: PLATFORM.BORDER_RADIUS,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: 'white',
    fontFamily: PLATFORM.FONT_BOLD,
    fontSize: 16,
  },
});
```

### 5.4 跨平台開發經驗總結

1. **設計先行**：在開發前考慮平台差異，設計統一的接口和組件
2. **共享最大化**：盡可能共享代碼，只在必要時使用平台特定代碼
3. **抽象平台差異**：創建抽象層處理平台特定功能，提供統一接口
4. **響應式思維**：設計時考慮不同屏幕尺寸和方向
5. **持續測試**：在多個平台和設備上持續測試，及早發現問題

---

通過學習 NewsBrief 專案的跨平台開發策略，你將能夠在自己的 React Native 專案中實現更加一致和高效的跨平台體驗。