import { configureStore } from "@reduxjs/toolkit";
import { newsApi } from "./api/newsApi";
import bookmarksReducer from "./slices/bookmarksSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    bookmarks: bookmarksReducer,
    ui: uiReducer,
    [newsApi.reducerPath]: newsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(newsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
