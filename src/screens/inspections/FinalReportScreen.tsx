import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { RiskCategory, RecommendationType } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

const riskCategories: { value: RiskCategory; label: string; color: string; description: string }[] = [
  { 
    value: 'low', 
    label: 'Low Risk', 
    color: Colors.success,
    description: 'School meets all standards with minor observations'
  },
  { 
    value: 'medium', 
    label: 'Medium Risk', 
    color: Colors.warning,
    description: 'Some areas need improvement within 3 months'
  },
  { 
    value: 'high', 
    label: 'High Risk', 
    color: '#F97316',
    description: 'Significant issues requiring immediate attention'
  },
  { 
    value: 'critical', 
    label: 'Critical Risk', 
    color: Colors.error,
    description: 'Severe violations, immediate action required'
  },
];

const recommendations: { value: RecommendationType; label: string; icon: string; color: string }[] = [
  { value: 'approve', label: 'Approve', icon: 'check-circle', color: Colors.success },
  { value: 'reject', label: 'Reject', icon: 'close-circle', color: Colors.error },
  { value: 're_inspection', label: 'Re-Inspection', icon: 'refresh', color: Colors.warning },
];

export const FinalReportScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FinalReport'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));
  const submitFinalReport = useInspectionStore(state => state.submitFinalReport);

  const [overallScore, setOverallScore] = useState(70);
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory>('low');
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationType>('approve');
  const [summary, setSummary] = useState('');
  const [weaknesses, setWeaknesses] = useState<string[]>(['']);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const handleAddField = (type: 'weakness') => {
    if (type === 'weakness') setWeaknesses([...weaknesses, '']);
  };

  const handleUpdateField = (type: 'weakness', index: number, value: string) => {
    if (type === 'weakness') {
      const updated = [...weaknesses];
      updated[index] = value;
      setWeaknesses(updated);
    }
  };

  const handleSubmit = async () => {
    if (!summary.trim()) {
      Alert.alert('Error', 'Please provide a summary');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    submitFinalReport(inspectionId, {
      overallScore,
      riskCategory: selectedRisk,
      recommendation: selectedRecommendation,
      summary,
      weaknesses: weaknesses.filter(w => w.trim()),
      submittedAt: new Date().toISOString(),
      submittedBy: 'Inspector Rajesh Kumar',
    });


    setIsSubmitting(false);
    setShowConfirmation(true);
  };

  const getScoreColor = () => {
    if (overallScore >= 80) return Colors.success;
    if (overallScore >= 60) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Final Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <Card style={styles.scoreCard}>
          <Text style={styles.sectionLabel}>Overall Score</Text>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
              {overallScore}
            </Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={overallScore}
            onValueChange={setOverallScore}
            minimumTrackTintColor={getScoreColor()}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={getScoreColor()}
          />
          <Text style={styles.scoreDescription}>
            {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Satisfactory' : 'Needs Improvement'}
          </Text>
        </Card>

        {/* Risk Category */}
        <Text style={styles.sectionLabel}>Risk Category</Text>
        <View style={styles.riskContainer}>
          {riskCategories.map(risk => (
            <TouchableOpacity
              key={risk.value}
              style={[
                styles.riskCard,
                selectedRisk === risk.value && { 
                  borderColor: risk.color,
                  backgroundColor: `${risk.color}15`,
                }
              ]}
              onPress={() => setSelectedRisk(risk.value)}
            >
              <View style={[styles.riskIndicator, { backgroundColor: risk.color }]} />
              <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
              <Text style={styles.riskDescription}>{risk.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendation */}
        <Text style={styles.sectionLabel}>Recommendation</Text>
        <View style={styles.recommendationContainer}>
          {recommendations.map(rec => (
            <TouchableOpacity
              key={rec.value}
              style={[
                styles.recommendationCard,
                selectedRecommendation === rec.value && { 
                  borderColor: rec.color,
                  backgroundColor: `${rec.color}15`,
                }
              ]}
              onPress={() => setSelectedRecommendation(rec.value)}
            >
              <Icon 
                name={rec.icon} 
                size={32} 
                color={selectedRecommendation === rec.value ? rec.color : Colors.textMuted} 
              />
              <Text style={[
                styles.recommendationLabel,
                selectedRecommendation === rec.value && { color: rec.color }
              ]}>
                {rec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <Text style={styles.sectionLabel}>Summary</Text>
        <TextInput
          style={styles.summaryInput}
          multiline
          numberOfLines={4}
          placeholder="Provide a comprehensive summary of the inspection findings..."
          value={summary}
          onChangeText={setSummary}
        />


        {/* Weaknesses */}
        <Text style={styles.sectionLabel}>Areas for Improvement</Text>
        {weaknesses.map((weakness, index) => (
          <View key={index} style={styles.listItemContainer}>
            <Icon name="alert-circle" size={20} color={Colors.warning} />
            <TextInput
              style={styles.listItemInput}
              placeholder="Add an area for improvement..."
              value={weakness}
              onChangeText={(value) => handleUpdateField('weakness', index, value)}
            />
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddField('weakness')}
        >
          <Icon name="plus" size={20} color={Colors.warning} />
          <Text style={styles.addButtonText}>Add Area</Text>
        </TouchableOpacity>


        {/* Submit Button */}
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={isSubmitting}
          size="large"
          style={styles.submitButton}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmation(false);
          navigation.navigate('Main', { screen: 'Inspections' });
        }}
      >
        <View style={styles.modalOverlay}>
          <AnimatedView style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={64} color={Colors.success} />
            </View>
            <Text style={styles.modalTitle}>Report Submitted!</Text>
            <Text style={styles.modalMessage}>
              Your inspection report has been submitted successfully.
            </Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>
                Score: <Text style={[styles.modalDetailValue, { color: getScoreColor() }]}>{overallScore}/100</Text>
              </Text>
              <Text style={styles.modalDetailText}>
                Risk: <Text style={{ color: riskCategories.find(r => r.value === selectedRisk)?.color }}>
                  {riskCategories.find(r => r.value === selectedRisk)?.label}
                </Text>
              </Text>
              <Text style={styles.modalDetailText}>
                Recommendation: <Text style={{ color: recommendations.find(r => r.value === selectedRecommendation)?.color }}>
                  {recommendations.find(r => r.value === selectedRecommendation)?.label}
                </Text>
              </Text>
            </View>
            <Button
              title="Done"
              onPress={() => {
                setShowConfirmation(false);
                navigation.navigate('Main', { screen: 'Inspections' });
              }}
              style={styles.modalButton}
            />
          </AnimatedView>
        </View>
      </Modal>
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
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  scoreCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  scoreValue: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
  },
  scoreMax: {
    fontSize: Typography.sizes.xl,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scoreDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  riskContainer: {
    gap: Spacing.md,
  },
  riskCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  riskIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  riskLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  riskDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  recommendationLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  summaryInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalDetails: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  modalDetailText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalDetailValue: {
    fontWeight: Typography.weights.semibold,
  },
  modalButton: {
    minWidth: 120,
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
  },
});

export default FinalReportScreen;
