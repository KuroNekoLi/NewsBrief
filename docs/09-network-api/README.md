# 🌐 網路請求與 API 整合實戰

基於 NewsBrief 專案的網路請求與 API 整合企業級實戰

## 🎯 學習目標

- 掌握 Fetch API 最佳實踐與錯誤處理
- 學會 News API 串接與認證機制
- 實作網路狀態檢測與離線處理
- 理解請求攔截與響應處理

## 📚 目錄

1. [Fetch API 基礎概念](#1-fetch-api-基礎概念)
2. [News API 串接實戰](#2-news-api-串接實戰)
3. [網路狀態檢測](#3-網路狀態檢測)
4. [請求攔截與認證](#4-請求攔截與認證)
5. [錯誤處理與重試機制](#5-錯誤處理與重試機制)
6. [實戰案例：NewsBrief API 管理器](#6-實戰案例newsbrief-api-管理器)

---

## 1. Fetch API 基礎概念

### 1.1 現代網路請求模式

```typescript
/**
 * 基礎 HTTP 客戶端
 * 封裝原生 fetch API 提供企業級功能
 */
export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: {
    baseURL: string;
    defaultHeaders?: Record<string, string>;
    timeout?: number;
  }) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.defaultHeaders || {};
    this.timeout = config.timeout || 10000;
  }

  /**
   * 執行 HTTP 請求
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const requestOptions = this.buildRequestOptions(options);

    try {
      const response = await this.fetchWithTimeout(url, requestOptions);
      return await this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET 請求
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? this.addQueryParams(endpoint, params) : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST 請求
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 建構完整 URL
   */
  private buildURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * 建構請求選項
   */
  private buildRequestOptions(options: RequestInit): RequestInit {
    return {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };
  }

  /**
   * 帶超時的 fetch
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 處理響應
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || '請求失敗',
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  /**
   * 錯誤處理
   */
  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new ApiError(408, '請求超時', error);
    }

    if (!navigator.onLine) {
      return new ApiError(0, '網路連接失敗', error);
    }

    return new ApiError(500, '未知錯誤', error);
  }

  /**
   * 添加查詢參數
   */
  private addQueryParams(endpoint: string, params: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.pathname + url.search;
  }
}
```