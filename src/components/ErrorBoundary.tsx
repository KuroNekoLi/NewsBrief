import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

/**
 * 擴展的錯誤類型，支援多種API錯誤格式
 */
export type ExtendedError = Error | {
  status?: number | string; // 允許狀態為數字或字符串
  data?: unknown;
  message?: string;
  code?: string;
  error?: string;  // 新增 RTK Query 可能返回的 error 字段
} | null;

interface ErrorBoundaryProps {
  children: React.ReactNode;
  error?: ExtendedError;
  retry?: () => void;
}

/**
 * 錯誤邊界組件
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  error, 
  retry 
}) => {
  if (error) {
    // 從不同類型的錯誤中提取錯誤訊息
    let errorMessage = '載入資料時發生未知錯誤';

    // 類型守衛：檢查是否為標準 Error 物件
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    // 類型守衛：檢查是否為 API 錯誤物件（如 FetchBaseQueryError）
    else if (typeof error === 'object') {
      // 處理有 message 屬性的錯誤
      if ('message' in error && error.message) {
        errorMessage = error.message;
      }
      // 處理有 data 屬性的 API 錯誤
      else if ('data' in error && error.data !== undefined) {
        if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
          errorMessage = String(error.data.message);
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        }
      }
      // 處理有狀態碼的 API 錯誤
      if (errorMessage === '載入資料時發生未知錯誤' && ('status' in error || 'code' in error)) {
        errorMessage = `錯誤狀態: ${('status' in error ? error.status : '') || ('code' in error ? error.code : '') || '未知'}`;
      }
    }

    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              發生錯誤
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {errorMessage}
            </Text>
            {retry && (
              <Button 
                mode="contained" 
                onPress={retry}
                style={styles.button}
              >
                重試
              </Button>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});