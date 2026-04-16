import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '@/navigation';
import { useAuthStore, useInspectionStore, useNotificationStore } from '@/store';
import { Card, StatusBadge, Shimmer } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { Inspection } from '@/types';

const { width } = Dimensions.get('window');

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

// Count-up animation component
const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 1000 
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    text: Math.round(animatedValue.value).toString(),
  }));

  // For simplicity, using regular text with animation
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.round(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <Text style={styles.statValue}>{displayValue}</Text>;
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  gradient: readonly [string, string, ...string[]];
  delay?: number;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  gradient,
  delay = 0,
  onPress,
}) => {
  const enterScale = useSharedValue(0.8);
  const pressScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    enterScale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enterScale.value * pressScale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <AnimatedView style={[styles.statCard, animatedStyle]}>
        <LinearGradient
          colors={gradient}
          style={styles.statGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.statIconContainer, { backgroundColor: color }]}>
            <Icon name={icon} size={24} color={Colors.textInverse} />
          </View>
          <AnimatedNumber value={value} />
          <Text style={styles.statTitle}>{title}</Text>
        </LinearGradient>
      </AnimatedView>
    </TouchableOpacity>
  );
};

// Inspection Card Component
const InspectionCard: React.FC<{ inspection: Inspection; index: number }> = ({
  inspection,
  index,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const translateX = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const getPriorityColor = () => {
    switch (inspection.priority) {
      case 'urgent': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.info;
      case 'low': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  return (
    <AnimatedView style={[animatedStyle]}>
      <Card
        pressable
        onPress={() => navigation.navigate('InspectionDetails', { inspectionId: inspection.id })}
        style={styles.inspectionCard}
      >
        <View style={styles.inspectionHeader}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName} numberOfLines={1}>
              {inspection.school.name}
            </Text>
            <Text style={styles.schoolLocation}>
              {inspection.school.city}, {inspection.school.state}
            </Text>
          </View>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
        </View>

        <View style={styles.inspectionDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.detailText}>
              Due: {new Date(inspection.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="file-document" size={16} color={Colors.textMuted} />
            <Text style={styles.detailText}>
              {inspection.documents.filter(d => d.status === 'verified').length} / {inspection.documents.length} docs verified
            </Text>
          </View>
        </View>

        <View style={styles.inspectionFooter}>
          <StatusBadge status={inspection.status} />
          {inspection.isOverdue && (
            <View style={styles.overdueBadge}>
              <Icon name="alert-circle" size={12} color={Colors.error} />
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          )}
        </View>
      </Card>
    </AnimatedView>
  );
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useAuthStore(state => state.user);
  const { inspections, isLoading, fetchInspections, getStatistics } = useInspectionStore();
  const unreadCount = useNotificationStore(state => state.getUnreadCount());
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const stats = getStatistics();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInspections();
    setRefreshing(false);
  }, [fetchInspections]);

  const filteredInspections = inspections
    .filter(i => 
      i.status !== 'completed' && 
      i.status !== 'approved' && 
      i.status !== 'rejected'
    )
    .slice(0, 5);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 12 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <AnimatedView style={[styles.headerContent, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Inspector'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Main', { screen: 'Notifications' })}
            >
              <Icon name="bell" size={24} color={Colors.textInverse} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Secure Session Badge */}
          <View style={styles.secureSession}>
            <Icon name="shield-check" size={14} color={Colors.accent} />
            <Text style={styles.secureSessionText}>Secure Session Active</Text>
          </View>
        </AnimatedView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total"
              value={stats.total}
              icon="clipboard-list"
              color={Colors.primary}
              gradient={[Colors.primary, Colors.primaryDark]}
              delay={0}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="clock-outline"
              color={Colors.warning}
              gradient={[Colors.warning, '#D97706']}
              delay={100}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon="check-circle"
              color={Colors.success}
              gradient={[Colors.success, '#059669']}
              delay={200}
            />
          </View>
        </View>

        {/* Alerts Section */}
        {(stats.overdue > 0 || stats.highPriority > 0) && (
          <View style={styles.alertsContainer}>
            {stats.overdue > 0 && (
              <TouchableOpacity style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: Colors.errorLight }]}>
                  <Icon name="alert-circle" size={24} color={Colors.error} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Overdue Inspections</Text>
                  <Text style={styles.alertCount}>{stats.overdue} require immediate attention</Text>
                </View>
                <Icon name="chevron-right" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
            {stats.highPriority > 0 && (
              <TouchableOpacity style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: Colors.warningLight }]}>
                  <Icon name="flag" size={24} color={Colors.warning} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>High Priority</Text>
                  <Text style={styles.alertCount}>{stats.highPriority} flagged inspections</Text>
                </View>
                <Icon name="chevron-right" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Inspections */}
        <View style={styles.inspectionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Inspections</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Inspections' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.shimmerContainer}>
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
            </View>
          ) : filteredInspections.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="clipboard-check-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Active Inspections</Text>
              <Text style={styles.emptyText}>You're all caught up!</Text>
            </Card>
          ) : (
            filteredInspections.map((inspection, index) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                index={index}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginTop: Spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  notificationBadgeText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  secureSession: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  secureSessionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  statGradient: {
    padding: Spacing.md,
    minHeight: 120,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  alertsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  alertTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  alertCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inspectionsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  inspectionCard: {
    marginBottom: Spacing.md,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  schoolInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  schoolName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  schoolLocation: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inspectionDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  inspectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  overdueText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginLeft: 4,
    fontWeight: Typography.weights.medium,
  },
  shimmerContainer: {
    gap: Spacing.md,
  },
  shimmerItem: {
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

import { Shadows } from '@/theme';

export default DashboardScreen;
