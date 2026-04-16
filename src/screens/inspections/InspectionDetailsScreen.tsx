import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { useInspectionStore } from '@/store';
import { Card, StatusBadge, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  delay?: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color = Colors.primary,
  delay = 0,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color={Colors.textInverse} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </TouchableOpacity>
    </AnimatedView>
  );
};

interface ExpandableSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const height = useSharedValue(defaultExpanded ? 1 : 0);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const toggleExpand = () => {
    height.value = withTiming(expanded ? 0 : 1, { duration: 300 });
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 300 });
    setExpanded(!expanded);
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    transform: [{ scaleY: height.value }],
    height: height.value === 0 ? 0 : 'auto',
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Card style={styles.sectionCard}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpand}>
        <View style={styles.sectionTitleContainer}>
          <Icon name={icon} size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={iconStyle}>
          <Icon name="chevron-down" size={24} color={Colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.sectionContent, contentStyle]}>
        {children}
      </Animated.View>
    </Card>
  );
};

export const InspectionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InspectionDetails'>>();
  const { inspectionId } = route.params;

  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));

  const headerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    contentTranslateY.value = withSpring(0, { damping: 12 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Inspection not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <AnimatedView style={[styles.headerContent, headerAnimatedStyle]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.textInverse} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {inspection.school.name}
            </Text>
            <View style={styles.headerMeta}>
              <StatusBadge status={inspection.status} />
              <Text style={styles.inspectionId}>{inspection.id}</Text>
            </View>
          </View>
        </AnimatedView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedView style={[contentAnimatedStyle]}>
          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <ActionButton
                icon="file-document-check"
                label="Documents"
                onPress={() => navigation.navigate('DocumentVerification', { inspectionId })}
                color={Colors.info}
                delay={0}
              />
              <ActionButton
                icon="play-circle"
                label="Start"
                onPress={() => navigation.navigate('InspectionMode', { inspectionId })}
                color={Colors.success}
                delay={100}
              />
              <ActionButton
                icon="file-send"
                label="Report"
                onPress={() => navigation.navigate('FinalReport', { inspectionId })}
                color={Colors.accentDark}
                delay={200}
              />
            </View>
          </View>

          {/* School Information */}
          <ExpandableSection title="School Information" icon="school" defaultExpanded={true}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Principal</Text>
                <Text style={styles.infoValue}>{inspection.school.principalName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>School Type</Text>
                <Text style={styles.infoValue}>{inspection.school.schoolType}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Students</Text>
                <Text style={styles.infoValue}>{inspection.school.totalStudents}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Established</Text>
                <Text style={styles.infoValue}>{inspection.school.establishedYear}</Text>
              </View>
            </View>
            <View style={styles.addressContainer}>
              <Icon name="map-marker" size={20} color={Colors.primary} />
              <Text style={styles.addressText}>
                {inspection.school.address}, {inspection.school.city}, {inspection.school.state} - {inspection.school.zipCode}
              </Text>
            </View>
          </ExpandableSection>

          {/* Contact Information */}
          <ExpandableSection title="Contact Information" icon="phone" defaultExpanded={false}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${inspection.school.phone}`)}
            >
              <Icon name="phone" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{inspection.school.phone}</Text>
              <Icon name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`mailto:${inspection.school.email}`)}
            >
              <Icon name="email" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{inspection.school.email}</Text>
              <Icon name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </ExpandableSection>




          <View style={styles.bottomPadding} />
        </AnimatedView>
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.md,
    marginTop: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectionId: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: Spacing.md,
  },
  content: {
    flex: 1,
  },
  actionsContainer: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
    marginBottom: Spacing.md,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    padding: Spacing.md,
    paddingTop: 0,
    overflow: 'hidden',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  infoItem: {
    width: '50%',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addressText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginLeft: Spacing.sm,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactText: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  verifyButton: {
    alignSelf: 'flex-start',
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
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
});

export default InspectionDetailsScreen;
