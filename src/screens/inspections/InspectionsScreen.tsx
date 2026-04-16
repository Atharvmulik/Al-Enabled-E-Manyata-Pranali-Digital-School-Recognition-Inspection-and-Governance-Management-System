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

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card, StatusBadge, Input, EmptyState } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { Inspection, InspectionStatus, PriorityLevel } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

const statusFilters: { label: string; value: InspectionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

const priorityFilters: { label: string; value: PriorityLevel | 'all' }[] = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const InspectionItem: React.FC<{ inspection: Inspection; index: number }> = ({
  inspection,
  index,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(index * 50, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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
    <AnimatedView style={animatedStyle}>
      <Card
        pressable
        onPress={() => navigation.navigate('InspectionDetails', { inspectionId: inspection.id })}
        style={styles.inspectionItem}
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
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.priorityText}>{inspection.priority.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.inspectionMeta}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.metaText}>
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="file-document" size={16} color={Colors.textMuted} />
            <Text style={styles.metaText}>
              {inspection.documents.filter(d => d.status === 'verified').length}/{inspection.documents.length} docs
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

export const InspectionsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { inspections, isLoading, fetchInspections } = useInspectionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInspections();
    setRefreshing(false);
  }, [fetchInspections]);

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch =
      inspection.school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || inspection.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || inspection.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const renderFilterChips = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Status</Text>
      <View style={styles.filterChips}>
        {statusFilters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              selectedStatus === filter.value && styles.filterChipActive
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Text style={[
              styles.filterChipText,
              selectedStatus === filter.value && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterLabel}>Priority</Text>
      <View style={styles.filterChips}>
        {priorityFilters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              selectedPriority === filter.value && styles.filterChipActive
            ]}
            onPress={() => setSelectedPriority(filter.value)}
          >
            <Text style={[
              styles.filterChipText,
              selectedPriority === filter.value && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspections</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon
            name={showFilters ? 'filter-variant-minus' : 'filter-variant'}
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color={Colors.textMuted} />
          <Input
            placeholder="Search schools, cities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && renderFilterChips()}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredInspections.length} inspection{filteredInspections.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Inspections List */}
      <FlatList
        data={filteredInspections}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <InspectionItem inspection={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="clipboard-search"
              title="No Inspections Found"
              message="Try adjusting your filters or search query"
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
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
  filterButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    marginLeft: Spacing.sm,
  },
  filterSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.medium,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  inspectionItem: {
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
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  inspectionMeta: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  metaText: {
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
});

export default InspectionsScreen;
