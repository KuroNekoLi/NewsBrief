# 🛡️ 錯誤處理與應用程式品質

> 本文件將帶你從零開始理解 **NewsBrief** 專案中「錯誤處理（Error Handling）」的整體設計思路，並提供完整的程式碼範例與最佳實踐，協助初學者快速上手。

---

## 目錄

1. 為何錯誤處理如此重要？
2. React 層級的錯誤攔截 – `Error Boundary`
3. 資料請求錯誤 – **RTK Query** 與網路異常
4. 全域例外 & 原生崩潰日誌
5. 表單與使用者輸入驗證
6. 即時偵測網路狀態 – `@react-native-community/netinfo`
7. 日誌、追蹤與第三方監控平台
8. 常見踩坑與 FAQ
9. 深入閱讀

---

## 1️⃣ 為何錯誤處理如此重要？

- **使用者體驗**：沒有任何東西比「白畫面 + App Crash」更能秒殺使用者的耐心。
- **資料正確性**：當網路請求失敗或輸入錯誤時，我們需要保障使用者不會看到錯誤或過期資料。
- **除錯效率**：良好的錯誤日誌與監控能大幅降低找 bug 的時間成本。

> 🎯 **目標**：在不影響效能的前提下，為整個應用程式建立可觀測（Observable）、易維護的錯誤處理管線。

---

## 2️⃣ React 層級的錯誤攔截 – `ErrorBoundary`

React 16 之後引入了 **Error Boundary** 機制，只要 UI 樹中的任何子樹拋出例外，都會被最近的 Error Boundary 捕捉，避免整棵樹被卸載。

本專案的 `src/components/ErrorBoundary.tsx` 實作如下（節錄重點）：

```tsx
import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {hasError: false};

  // 當子組件拋錯時更新 UI
  public static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  // 可收集錯誤資訊，上報到 Sentry / Firebase Crashlytics...
  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.log('[ErrorBoundary] 捕捉錯誤', error, info);
    // TODO: sendToSentry(error, info);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>糟糕！發生未預期錯誤 🙈</Text>
          <Text style={styles.subtitle}>請重新啟動 App 或稍後再試。</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 8},
  subtitle: {fontSize: 14, color: '#666'},
});
```

### 如何使用？

在 `App.tsx` 最外層包裹：

```tsx
return (
  <Provider store={store}>
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <NavigationContainer>{/* ... */}</NavigationContainer>
      </PaperProvider>
    </ErrorBoundary>
  </Provider>
);
```

這樣即使任何子組件出現未捕捉例外，也不會導致整個應用閃退。

---

## 3️⃣ 資料請求錯誤 – RTK Query 與網路異常

RTK Query 內建強大的錯誤狀態管理。以下示範 `useGetHeadlinesQuery` 的典型模式：

```tsx
const {
  data,
  error,
  isError,
  isLoading,
  refetch,
} = useGetHeadlinesQuery();

if (isLoading) return <LoadingSpinner />;

if (isError) {
  const errMsg =
    (error as any)?.error || '無法取得最新新聞，請檢查網路連線';
  return (
    <ErrorView message={errMsg} onRetry={refetch} />
  );
}
```

### 建立共用 `ErrorView`

```tsx
interface Props {
  message: string;
  onRetry(): void;
}

export const ErrorView: React.FC<Props> = ({message, onRetry}) => (
  <View style={styles.wrapper}>
    <Text style={styles.text}>{message}</Text>
    <Button mode="contained" onPress={onRetry}>
      重新載入
    </Button>
  </View>
);
```

> ✅ **最佳實踐**：
>
> 1. 在 `createApi` 時設定 `baseQuery` 的 `prepareHeaders` 與 `timeout`，確保連線逾時能返回可辨識的錯誤物件。
> 2. 使用 `onError` middleware 統一攔截非授權（401）、伺服器錯誤（5xx）等狀態碼。

---

## 4️⃣ 全域例外 & 原生崩潰日誌

除了 React 層級的錯誤，你還需要攔截 **JS 執行期未捕捉例外** 與 **原生端崩潰**。

```ts
import {setJSExceptionHandler, setNativeExceptionHandler} from 'react-native-exception-handler';

setJSExceptionHandler((error, isFatal) => {
  // 將錯誤資訊上報
  console.log('JS Error:', error);
}, true);

setNativeExceptionHandler((errorString) => {
  console.log('Native Crash:', errorString);
  // 可決定是否讓 App 閃退或自動重啟
});
```

> 若你使用 **Sentry** 或 **Firebase Crashlytics**，上述兩種錯誤都能自動收集並上報。

---

## 5️⃣ 表單與使用者輸入驗證

當表單欄位錯誤時，立即提示可避免後端請求；可使用 `yup` + `react-hook-form`：

```ts
const schema = yup.object({
  email: yup.string().email('Email 格式錯誤').required('必填'),
  password: yup.string().min(8, '至少 8 字元'),
});

const {control, handleSubmit, formState: {errors}} = useForm({resolver: yupResolver(schema)});
```

錯誤訊息顯示：

```tsx
<Text style={styles.error}>{errors.email?.message}</Text>
```

---

## 6️⃣ 即時偵測網路狀態 – `@react-native-community/netinfo`

```ts
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});
```

可於 `Redux` 中維護 `isConnected`，在關鍵畫面（如提交表單）阻止用戶操作並顯示離線提示。

---

## 7️⃣ 日誌、追蹤與第三方監控平台

| 需求              | 推薦方案                     | 備註                    |
|-----------------|--------------------------|-----------------------|
| JS/Native Crash | **Sentry**               | 支援 Source Map 上傳與版本追蹤 |
| 效能監控            | **Firebase Performance** | API latency、啟動時間      |
| 使用者行為           | **Amplitude / Mixpanel** | 分析轉換率                 |

> ✨ **TIP**：將錯誤 `fingerprint` 結合版本號，可快速判斷是否為新 bug。

---

## 8️⃣ 常見踩坑與 FAQ

1. **ErrorBoundary 不捕捉 async/await 例外？**
    - `ErrorBoundary` 僅攔截 render 期間，若要捕捉 `useEffect` 內的例外，請在 callback 內自行 `try/catch`。
2. **App 在 Release 模式下無錯誤訊息？**
    - React Native 釋出版會關閉紅色錯誤畫面，務必串接 Crash 收集平台。
3. **Android Only: NetworkOnMainThreadException？**
    - 確認所有網路請求皆透過 `fetch` / 原生 okhttp 執行於背景執行緒。

---

## 9️⃣ 深入閱讀

- [React Error Boundaries 官方文件](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Redux Toolkit Query – Error Handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling)
- [React Native Exception Handler](https://github.com/a7ul/react-native-exception-handler)
- [Sentry for React Native](https://docs.sentry.io/platforms/react-native/)

> 透過本章，你應理解如何在 **NewsBrief** 內部實作可維護、可觀測且符合企業級標準的錯誤處理機制。如果遇到未涵蓋的狀況，歡迎提
> Issue 與我們討論！
