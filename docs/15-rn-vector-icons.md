# React Native Vector Icons 使用指南

> 說明如何在 NewsBrief 專案中安裝並於 iOS／Android 平台正確顯示向量圖示，並附常見問題排查。

---

## 1. 套件安裝

```bash
# 使用 npm
npm install react-native-vector-icons --save

# 或 yarn
# yarn add react-native-vector-icons
```

React Native ≥0.60 已內建 *Autolinking*，安裝後會自動連結原生模組；若使用較舊版本請參考官方文件進行 `react-native link`。

---

## 2. iOS 設定

1. **執行 Pod 安裝**（必要）
   ```bash
   cd ios && pod install --repo-update && cd ..
   ```

2. **Info.plist 新增字型檔**
   在 `ios/NewsBrief/Info.plist` 中的 `UIAppFonts` （或 `UIAppFonts` 新增）陣列加入所需字型，範例：
   ```xml
   <key>UIAppFonts</key>
   <array>
       <string>MaterialCommunityIcons.ttf</string>
   </array>
   ```
   CocoaPods 安裝腳本會自動複製字型檔至 Xcode 專案，無須手動拖曳。

3. **重新建置**
   在 Xcode 或透過指令啟動 iOS 模擬器：
   ```bash
   npx react-native run-ios
   ```

---

## 3. Android 設定

1. **匯入字型自動複製腳本**

   在 `android/app/build.gradle` `dependencies { .. }` 區塊 **之後**，加入下列指令：

   ```gradle
   apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
   ```

   這行腳本會在每次 `gradle assemble*` 時，自動將 `node_modules/react-native-vector-icons/Fonts/*.ttf` 複製到
   `android/app/src/main/assets/fonts/`，省去手動維護。

2. **重新建置 APK／執行專案**
   ```bash
   npx react-native run-android
   ```

---

## 4. 基本使用範例

以下示範在 React Navigation *Bottom Tabs* 使用 MaterialCommunityIcons：

```tsx
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ... 於 createBottomTabNavigator 中：
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarIcon: ({color, size}) => (
      <MaterialCommunityIcons name="home" color={color} size={size} />
    ),
  }}
/>
```

- `name` 參數可至 [MaterialCommunityIcons 圖庫](https://materialdesignicons.com/) 搜尋。
- 建議以原生 `vector` 圖示取代靜態 png，減少 APK 體積並支援高 DPI 裝置。

---

## 5. 常見問題 (FAQ)

| 問題 | 可能原因 | 解決方案 |
|------|----------|----------|
| Android 看不到圖示（顯示方塊或問號） | `fonts.gradle` 未匯入 / 字型目錄遺失 | 確認 `build.gradle` 已加 `apply from`，並重新 clean/rebuild |
| iOS 首次安裝閃退 | 未執行 `pod install` 或字型名稱拼錯 | 重新執行 `pod install`，確認 `UIAppFonts` 內容與字型檔一致 |
| Hot Reload 後圖示消失 | 捆包器快取 | 執行 `npx react-native start --reset-cache` |

---

## 6. 參考文件

- github.com/oblador/react-native-vector-icons
- React Navigation 官方文件：`tabBarIcon` 參數

---

_最後更新時間：2025-06-18_