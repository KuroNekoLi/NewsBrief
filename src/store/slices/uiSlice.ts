import{createSlice, PayloadAction}from '@reduxjs/toolkit';

// UI 狀態介面
interface UiState {

theme: 'light' | 'dark';
  isOffline: boolean;
  activeTab: string;
  notifications: Notification[];
  loading: {
    global: boolean;
    news: boolean;
    bookmarks: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

// 初始狀態
const initialState: UiState = {
  theme: 'light',
  isOffline: false,
  activeTab: 'Headlines',
  notifications: [],
  loading: {
    global: false,
    news: false,
    bookmarks: false,
  },
};

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.news = action.payload;
    },
    
    setBookmarksLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.bookmarks = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// 導出 actions
export const {
  setTheme,
  setOfflineStatus,
  setActiveTab,
  setGlobalLoading,
  setNewsLoading,
  setBookmarksLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
} = uiSlice.actions;

// 導出 reducer
export default uiSlice.reducer;