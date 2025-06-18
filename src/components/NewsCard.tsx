import React from 'react';
import { View, StyleSheet, Linking, Alert, Text as RNText } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';
import { NewsCardProps } from '../types';

/**
 * 新聞卡片組件
 */
export const NewsCard: React.FC<NewsCardProps> = React.memo(({
  article,
  isBookmarked,
  onBookmarkToggle,
  onPress,
}) => {
  /**
   * 處理點擊卡片，開啟外部瀏覽器
   */
  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      try {
        // 檢查 URL 是否存在
        if (!article.url || article.url.trim() === '') {
          Alert.alert('提示', '此新聞沒有提供連結');
          return;
        }

        // 確保 URL 格式正確
        let url = article.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        console.log('嘗試開啟連結:', url);

        // 檢查是否可以開啟
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // 如果無法開啟，嘗試直接開啟原始 URL
          console.log('嘗試開啟原始連結:', article.url);
          await Linking.openURL(article.url);
        }
      } catch (error) {
        console.error('開啟連結失敗:', error);
        Alert.alert(
          '提示', 
          '無法開啟此連結，請檢查網路連線或稍後重試',
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '複製連結', 
              onPress: () => {
                // 這裡可以加入複製到剪貼簿的功能
                console.log('連結已記錄:', article.url);
              }
            }
          ]
        );
      }
    }
  };

  /**
   * 處理書籤切換
   */
  const handleBookmarkToggle = () => {
    onBookmarkToggle(article.id);
  };

  /**
   * 格式化發布時間
   */
  const formatPublishTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小時前`;
    } else {
      return '剛剛';
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      {article.urlToImage && (
        <Card.Cover source={{ uri: article.urlToImage }} style={styles.image} />
      )}
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          <IconButton
            icon={() => (
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isBookmarked ? '#ff9800' : '#ccc',
                backgroundColor: isBookmarked ? '#ff9800' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {isBookmarked && (
                  <RNText style={{ 
                    fontSize: 14, 
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}>
                    ✓
                  </RNText>
                )}
              </View>
            )}
            size={24}
            onPress={handleBookmarkToggle}
            style={styles.bookmarkButton}
          />
        </View>
        
        {article.description && (
          <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
            {article.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.sourceInfo}>
            <Chip 
              compact 
              style={styles.sourceChip}
              textStyle={{ color: '#1c1600' }}
              mode="outlined"
            >
              {article.source.name}
            </Chip>
            {article.author && (
              <Text variant="bodySmall" style={styles.author}>
                {article.author}
              </Text>
            )}
          </View>
          <Text variant="bodySmall" style={styles.time}>
            {formatPublishTime(article.publishedAt)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
});

NewsCard.displayName = 'NewsCard';

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    borderRadius: 12,
    // 確保 iOS 也有陰影效果
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  bookmarkButton: {
    margin: 0,
    padding: 4,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
    marginRight: 8,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  author: {
    opacity: 0.7,
  },
  time: {
    opacity: 0.7,
    textAlign: 'right',
  },
});