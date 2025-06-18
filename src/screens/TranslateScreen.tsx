import React from 'react';
import { View, StyleSheet } from 'react-native';
import {Surface, Text, Card} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 翻譯頁面（開發中）
 */
export const TranslateScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderTitle}>新聞翻譯</Text>
      </View>
      
      <Surface style={styles.surface}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="displaySmall" style={styles.icon}>🌐</Text>
              <Text variant="headlineSmall" style={styles.title}>
                翻譯功能開發中
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                基於 OpenAI 的智能新聞翻譯功能即將上線！
              </Text>
              <Text variant="bodySmall" style={styles.features}>
                • AI 智能翻譯{'\n'}
                • 多語言支援{'\n'}
                • 即時翻譯{'\n'}
                • 翻譯品質優化{'\n'}
                • 專業術語處理
              </Text>
            </Card.Content>
          </Card>
        </View>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffde7',  // 黃色背景
  },
  customHeader: {
    backgroundColor: '#fffde7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  customHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d1b16',
    textAlign: 'left',
  },
  surface: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardContent: {
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    textAlign: 'center',
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  features: {
    textAlign: 'left',
    lineHeight: 24,
    opacity: 0.6,
  },
});
