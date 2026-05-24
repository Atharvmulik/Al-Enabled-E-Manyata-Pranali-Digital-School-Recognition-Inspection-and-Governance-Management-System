import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
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
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '@/navigation';
import { Card, StatusBadge, Shimmer } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/theme';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

// Count-up animation component
const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 1000 
}) => {
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
const InspectionCard: React.FC<{ inspection: any; index: number }> = ({
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
              {inspection.school_name}
            </Text>
            <Text style={styles.schoolLocation}>
              {inspection.district}, {inspection.state}
            </Text>
          </View>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
        </View>

        <View style={styles.inspectionDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.detailText}>
              Due: {new Date(inspection.due_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="file-document" size={16} color={Colors.textMuted} />
            <Text style={styles.detailText}>
              {inspection.verified_documents} / {inspection.total_documents} docs verified
            </Text>
          </View>
        </View>

        <View style={styles.inspectionFooter}>
          <StatusBadge status={inspection.status} />
          {inspection.is_overdue && (
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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard...');
      const response = await api.get('/inspection/dashboard');
      console.log('Dashboard response:', response.data);
      setDashboardData(response.data);
      setError('');
    } catch (err: any) {
      console.log('Dashboard error:', err);
      console.log('Dashboard error response:', err?.response?.data);
      console.log('Dashboard error status:', err?.response?.status);
      const message = err?.response?.data?.detail || 'Failed to load dashboard';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, []);

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

  if (loading && !dashboardData) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
          <View style={styles.headerContent}>
            <Shimmer width="60%" height={24} borderRadius={4} style={{ marginBottom: 8 }} />
            <Shimmer width="40%" height={20} borderRadius={4} />
          </View>
        </LinearGradient>
        <View style={styles.content}>
          <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={{ margin: Spacing.lg }} />
          <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }} />
        </View>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Unable to load dashboard</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inspector = dashboardData?.inspector || {};
  const stats = dashboardData?.stats || { total: 0, pending: 0, completed: 0, overdue: 0, high_priority: 0, unread_notifications: 0 };
  const recentInspections = dashboardData?.recent_inspections || [];

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
              <Text style={styles.userName}>{inspector.name?.split(' ')[0] || 'Inspector'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Main', { screen: 'Notifications' })}
            >
              <Icon name="bell" size={24} color={Colors.textInverse} />
              {stats.unread_notifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {stats.unread_notifications > 9 ? '9+' : stats.unread_notifications}
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
        {(stats.overdue > 0 || stats.high_priority > 0) && (
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
            {stats.high_priority > 0 && (
              <TouchableOpacity style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: Colors.warningLight }]}>
                  <Icon name="flag" size={24} color={Colors.warning} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>High Priority</Text>
                  <Text style={styles.alertCount}>{stats.high_priority} flagged inspections</Text>
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

          {loading ? (
            <View style={styles.shimmerContainer}>
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
              <Shimmer width="100%" height={120} borderRadius={BorderRadius.lg} style={styles.shimmerItem} />
            </View>
          ) : recentInspections.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="clipboard-check-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Active Inspections</Text>
              <Text style={styles.emptyText}>You're all caught up!</Text>
            </Card>
          ) : (
            recentInspections.map((inspection: any, index: number) => (
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.medium,
  },
});

export default DashboardScreen;