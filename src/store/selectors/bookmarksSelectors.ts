import{createSelector}from'@reduxjs/toolkit';
import {RootState}from '../index';

// 基礎選擇器
export const selectBookmarksState = (state: RootState) => state.bookmarks;

// 記憶化選擇器
export const selectBookmarkItems = createSelector(

[selectBookmarksState],
  (bookmarks) => bookmarks.items
);

export const selectBookmarkCount = createSelector(

[selectBookmarkItems],
  (items) => items.length
);

export const selectIsBookmarked = createSelector(

[selectBookmarkItems, (state: RootState, articleId: string) => articleId],
  (items, articleId) => items.includes(articleId)
);

export const selectBookmarksLoading = createSelector(

[selectBookmarksState],
  (bookmarks) => bookmarks.isLoading
);

export const selectBookmarksError = createSelector(

[selectBookmarksState],
  (bookmarks) => bookmarks.error
);

export const selectBookmarksLastUpdated = createSelector(

[selectBookmarksState],
  (bookmarks) => bookmarks.lastUpdated
);