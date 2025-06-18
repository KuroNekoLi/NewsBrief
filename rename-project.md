# 專案重命名修復指南

## 已完成的修復

✅ **App.json** - 已更新為 "NewsBrief"
✅ **package.json** - 已更新為 "NewsBrief"  
✅ **iOS AppDelegate.swift** - 模組名稱已更新為 "NewsBrief"
✅ **iOS Info.plist** - CFBundleDisplayName 已更新為 "NewsBrief"
✅ **Android strings.xml** - app_name 已更新為 "NewsBrief"

## 需要手動完成的步驟

### 1. 重新命名 iOS 目錄結構

```bash
# 停止所有運行中的程序
pkill -f "react-native"
pkill -f "Metro"

# 重新命名 iOS 目錄
cd ios
mv HappyApp NewsBrief
mv HappyApp.xcodeproj NewsBrief.xcodeproj
mv HappyApp.xcworkspace NewsBrief.xcworkspace

# 更新 Xcode 專案檔案中的引用
# 這需要在 Xcode 中手動完成或使用 sed 腳本
```

### 2. 更新 Android 套件名稱

```bash
# 重新命名 Android 套件目錄
cd android/app/src/main/java
mv com/happyapp com/newsbrief

# 更新所有 .kt 檔案中的套件名稱
find . -name "*.kt" -exec sed -i '' 's/com.happyapp/com.newsbrief/g' {} +
```

### 3. 更新 Podfile

```ruby
# ios/Podfile
target 'NewsBrief' do
  # ... 其他配置
end
```

### 4. 清理並重新建置

```bash
# 清理所有快取
npx react-native start --reset-cache
cd ios && rm -rf build && cd ..
cd android && ./gradlew clean && cd ..

# 重新安裝 Pods
cd ios && pod install && cd ..

# 重新建置
npx react-native run-ios
npx react-native run-android
```

## 簡化解決方案

由於完整的重命名涉及許多原生檔案和配置，最簡單的方法是：

### 選項 1: 在現有基礎上運行

1. 保持 iOS/Android 的原生名稱為 HappyApp
2. 只更新顯示名稱和 JavaScript 模組名稱
3. 應用程式仍然可以正常運行，只是內部結構仍使用舊名稱

### 選項 2: 重新初始化專案

1. 建立新的 React Native 專案名為 NewsBrief
2. 複製所有 src/ 目錄內容到新專案
3. 複製 package.json 的依賴配置
4. 重新安裝依賴套件

## 當前狀態

應用程式已經修復了主要的註冊問題，現在應該能夠正常啟動。核心功能都已實作完成：

- ✅ 新聞 API 整合
- ✅ 書籤功能
- ✅ 導航系統
- ✅ UI 組件
- ✅ 狀態管理

建議繼續使用當前的設置，因為功能已經完整實作。如果需要完全重命名，可以在功能驗證完成後再進行。