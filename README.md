# NewsBrief - 新聞速覽應用程式

一個使用 React Native 開發的功能完整新聞應用程式，提供科技新聞瀏覽、書籤管理、搜尋和翻譯功能。

## 主要功能

### ✅ 已實現功能

- **🗞️ 科技頭條新聞**
    - 即時科技新聞獲取
    - 支援下拉刷新
    - 離線快取機制
    - 新聞卡片設計

- **⭐ 書籤系統**
    - 一鍵收藏新聞
    - 書籤列表管理
    - 本地儲存持久化
    - 批量清除功能

- **🎨 UI/UX 設計**
    - Material You 設計風格
    - 深色/淺色主題
    - 響應式設計
    - 流暢動畫效果

### 🚧 開發中功能

- **🔍 新聞搜尋** - 即將推出
- **🌐 AI 翻譯** - 基於 OpenAI 的智能翻譯

## 技術架構

### 核心技術棧

- **框架**: React Native 0.80.0
- **語言**: TypeScript
- **UI 庫**: React Native Paper v5
- **導航**: React Navigation 7
- **狀態管理**:
    - Remote State: TanStack Query v5
    - Local State: React Context
- **儲存**: AsyncStorage
- **API**: News API

### 專案結構

```
src/
├── components/           # 可重用組件
│   ├── NewsCard.tsx     # 新聞卡片
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
├── screens/             # 頁面組件
│   ├── HeadlinesScreen.tsx
│   ├── BookmarksScreen.tsx
│   ├── SearchScreen.tsx
│   └── TranslateScreen.tsx
├── hooks/               # 自定義 Hook
│   ├── useNews.ts
│   └── useBookmarks.ts
├── context/             # React Context
│   └── BookmarkContext.tsx
├── services/            # API 服務
│   ├── newsApi.ts
│   └── storage.ts
├── types/               # TypeScript 型別
│   └── index.ts
└── navigation/          # 導航配置
    └── TabNavigator.tsx
```

## 開始使用

### 環境需求

- Node.js >= 18
- React Native CLI
- iOS 開發環境 (Xcode)
- Android 開發環境 (Android Studio)

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd NewsBrief
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **iOS 設置**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **啟動開發伺服器**
   ```bash
   npm start
   ```

5. **運行應用程式**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

### 環境配置

建立 `.env` 檔案：
```
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_api_key
```

## API 配置

### News API

- 提供者: NewsAPI.org
- 端點: `https://newsapi.org/v2/top-headlines`
- 類別: 科技 (technology)
- 語言: 中文 (zh)

### OpenAI API (未來功能)

- 用途: 新聞翻譯功能
- 模型: GPT-3.5/GPT-4

## 功能特色

### 新聞卡片組件

- 新聞標題和摘要
- 來源和作者資訊
- 發布時間顯示
- 一鍵書籤切換
- 外部連結開啟

### 書籤管理

- 即時同步狀態
- 本地儲存持久化
- 書籤數量顯示
- 批量管理功能

### 離線支援

- 新聞資料快取
- 離線瀏覽功能
- 智能快取策略
- 網路狀態檢測

### 效能最佳化

- FlatList 虛擬化
- React.memo 組件優化
- TanStack Query 快取
- 圖片懶載入

## 開發指南

### 程式碼規範

- TypeScript 嚴格模式
- ESLint + Prettier
- Clean Code 原則
- SOLID 設計原則

### 測試策略

- 單元測試 (Jest)
- 組件測試 (React Native Testing Library)
- Hook 測試
- API 模擬測試

### 部署配置

- iOS: Xcode 建置
- Android: Gradle 建置
- 應用程式圖示
- 啟動畫面

## 未來規劃

### Phase 1: 搜尋功能

- 關鍵字搜尋
- 搜尋歷史
- 進階篩選
- 智能建議

### Phase 2: 翻譯功能

- AI 智能翻譯
- 多語言支援
- 即時翻譯
- 翻譯品質優化

### Phase 3: 進階功能

- 推送通知
- 社交分享
- 個人化推薦
- 深色模式自動切換

## 貢献指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 建立 Pull Request

## 授權條款

MIT License

## 聯絡資訊

如有問題或建議，請提交 Issue 或聯絡開發團隊。
