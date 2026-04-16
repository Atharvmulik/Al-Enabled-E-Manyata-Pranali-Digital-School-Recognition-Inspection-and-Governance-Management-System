import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/theme';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

export const InspectionModeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InspectionMode'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));
  const updateInspectionStatus = useInspectionStore(state => state.updateInspectionStatus);

  // Auto-activate session on mount
  useEffect(() => {
    if (inspection && inspection.status !== 'in_progress') {
      updateInspectionStatus(inspectionId, 'in_progress');
    }
  }, [inspectionId]);

  // Pulsing animation for "Live" indicator
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);


  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Inspection not found</Text>
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
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
            <Icon name="chevron-left" size={28} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Evaluation Hub</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Indicator */}
        <View style={styles.liveContainer}>
          <AnimatedView style={[styles.liveDot, pulseStyle]} />
          <Text style={styles.liveText}>LIVE EVIDENCE SESSION</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>Capture Evidence</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.actionCard}
              onPress={() => navigation.navigate('EvidenceUpload', { inspectionId })}
            >
              <LinearGradient
                colors={['#E0F2FE', '#BAE6FD']}
                style={styles.actionCardGradient}
              >
                <View style={styles.actionIconWrapper}>
                  <Icon name="camera-plus" size={32} color={Colors.info} />
                </View>
                <Text style={styles.actionCardLabel}>Take Photo</Text>
                <Text style={styles.actionCardSub}>High-res capture</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.actionCard}
              onPress={() => navigation.navigate('EvidenceUpload', { inspectionId })}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={styles.actionCardGradient}
              >
                <View style={styles.actionIconWrapper}>
                  <Icon name="video-plus" size={32} color={Colors.warning} />
                </View>
                <Text style={styles.actionCardLabel}>Record Video</Text>
                <Text style={styles.actionCardSub}>UHD Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recently Captured */}
        <View style={styles.evidenceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Recently Captured</Text>
            <Text style={styles.evidenceCount}>{inspection.evidence.length} Items</Text>
          </View>
          
          {inspection.evidence.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evidenceList}
            >
              {inspection.evidence.map((item, index) => (
                <AnimatedView 
                  key={item.id} 
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.evidenceCard}
                >
                  <Image source={{ uri: item.url }} style={styles.evidenceImage} />
                  <View style={styles.evidenceTag}>
                    <Icon 
                      name={item.type === 'photo' ? 'camera' : 'video'} 
                      size={12} 
                      color={Colors.textInverse} 
                    />
                  </View>
                </AnimatedView>
              ))}
            </ScrollView>
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="image-off-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No evidence captured yet</Text>
              <Text style={styles.emptySub}>Tap Take Photo or Record Video above</Text>
            </Card>
          )}
        </View>

        {/* Helper Card */}
        <Card style={styles.helperCard}>
          <View style={styles.helperIcon}>
            <Icon name="information-variant" size={24} color={Colors.primary} />
          </View>
          <View style={styles.helperContent}>
            <Text style={styles.helperTitle}>Inspector Guidelines</Text>
            <Text style={styles.helperText}>
              Ensure all physical infrastructure and safety measures are clearly visible in the evidence.
            </Text>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* School Name Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Evaluation for</Text>
        <Text style={styles.footerSchool} numberOfLines={1}>
          {inspection.school.name}
        </Text>
      </View>
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
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  scrollContent: {
    flex: 1,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: Spacing.sm,
  },
  liveText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  actionsSection: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  actionCardGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  actionCardLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  actionCardSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  evidenceSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  evidenceCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  evidenceList: {
    paddingRight: Spacing.lg,
  },
  evidenceCard: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  evidenceTag: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 4,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  helperCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 0,
    ...Shadows.sm,
  },
  helperIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  helperContent: {
    flex: 1,
  },
  helperTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    ...Shadows.lg,
  },
  footerLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  footerSchool: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginTop: Spacing.md,
  },
});

export default InspectionModeScreen;
