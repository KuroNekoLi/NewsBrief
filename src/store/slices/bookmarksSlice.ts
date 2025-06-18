import{createSlice, PayloadAction, createAsyncThunk}from '@reduxjs/toolkit';
import {loadBookmarks, saveBookmarks}from '../../services/storage';

// 定義狀態介面
interface BookmarksState {

items: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// 初始狀態
const initialState: BookmarksState = {
  items: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// 異步 Thunks
export const loadBookmarksAsync = createAsyncThunk(
  'bookmarks/loadBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const bookmarks = await loadBookmarks();
      return bookmarks;
    } catch (error) {
      return rejectWithValue('載入書籤失敗');
    }
  }
);

export const saveBookmarksAsync = createAsyncThunk(
  'bookmarks/saveBookmarks',
  async (bookmarks: string[], { rejectWithValue }) => {
    try {
      await saveBookmarks(bookmarks);
      return bookmarks;
    } catch (error) {
      return rejectWithValue('儲存書籤失敗');
    }
  }
);

// 書籤 Slice
const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    // 同步 actions
    addBookmark: (state, action: PayloadAction<string>) => {
      const articleId = action.payload;
      if (!state.items.includes(articleId)) {
        state.items.push(articleId);
        state.lastUpdated = Date.now();
      }
    },
    
    removeBookmark: (state, action: PayloadAction<string>) => {
      const articleId = action.payload;
      state.items = state.items.filter(id => id !== articleId);
      state.lastUpdated = Date.now();
    },
    
    clearAllBookmarks: (state) => {
      state.items = [];
      state.lastUpdated = Date.now();
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  // 異步 actions
  extraReducers: (builder) => {
    builder
      // 載入書籤
      .addCase(loadBookmarksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBookmarksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(loadBookmarksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // 儲存書籤
      .addCase(saveBookmarksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveBookmarksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(saveBookmarksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 導出 actions
export const { 
  addBookmark, 
  removeBookmark, 
  clearAllBookmarks, 
  clearError 
} = bookmarksSlice.actions;

// 導出 reducer
export default bookmarksSlice.reducer;