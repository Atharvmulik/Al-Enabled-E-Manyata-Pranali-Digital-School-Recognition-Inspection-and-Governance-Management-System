import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { RootStackParamList } from '@/navigation';
import { useNotificationStore } from '@/store';
import { Card, EmptyState, Badge } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { Notification, NotificationType } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

const notificationTypeConfig: Record<NotificationType, { icon: string; color: string }> = {
  assignment: { icon: 'clipboard-check', color: Colors.primary },
  reminder: { icon: 'clock-alert', color: Colors.warning },
  alert: { icon: 'alert-circle', color: Colors.error },
  update: { icon: 'information', color: Colors.info },
  system: { icon: 'cog', color: Colors.textMuted },
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  index,
  onPress,
  onDelete,
}) => {
  const translateX = useSharedValue(30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * 50, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const config = notificationTypeConfig[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  const renderRightActions = () => (
    <TouchableOpacity 
      style={styles.deleteAction}
      onPress={onDelete}
    >
      <Icon name="delete" size={24} color={Colors.textInverse} />
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <AnimatedView style={animatedStyle}>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <Card style={
            !notification.isRead 
              ? { ...styles.notificationCard, ...styles.unreadCard }
              : styles.notificationCard
          }>
            <View style={styles.notificationContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
                <Icon name={config.icon} size={24} color={config.color} />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Swipeable>
    </AnimatedView>
  );
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}


export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);


  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.relatedType === 'inspection' && notification.relatedId) {
      navigation.navigate('InspectionDetails', { inspectionId: notification.relatedId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <NotificationItem
            notification={item}
            index={index}
            onPress={() => handleNotificationPress(item)}
            onDelete={() => deleteNotification(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="bell-off"
              title="No Notifications"
              message="You're all caught up! Check back later for updates."
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  markAllRead: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  notificationCard: {
    marginBottom: Spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: Typography.weights.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  notificationMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Spacing.xs,
  },
  timeAgo: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  deleteActionText: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
});

export default NotificationsScreen;
