import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { InspectionStatus, PriorityLevel, DocumentStatus } from '@/types';

interface StatusBadgeProps {
  status: InspectionStatus | PriorityLevel | DocumentStatus | string;
  type?: 'status' | 'priority' | 'document';
  showIcon?: boolean;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: string; label: string }> = {
  // Inspection Statuses
  pending: { color: Colors.warning, bgColor: Colors.warningLight, icon: 'clock-outline', label: 'Pending' },
  assigned: { color: Colors.info, bgColor: Colors.infoLight, icon: 'account-check', label: 'Assigned' },
  document_verification: { color: Colors.primary, bgColor: Colors.infoLight, icon: 'file-check', label: 'Doc Verification' },
  in_progress: { color: Colors.primary, bgColor: Colors.infoLight, icon: 'progress-clock', label: 'In Progress' },
  completed: { color: Colors.success, bgColor: Colors.successLight, icon: 'check-circle', label: 'Completed' },
  approved: { color: Colors.success, bgColor: Colors.successLight, icon: 'certificate', label: 'Approved' },
  rejected: { color: Colors.error, bgColor: Colors.errorLight, icon: 'close-circle', label: 'Rejected' },
  re_inspection_required: { color: Colors.warning, bgColor: Colors.warningLight, icon: 'refresh', label: 'Re-Inspection' },
  
  // Priority Levels
  low: { color: Colors.success, bgColor: Colors.successLight, icon: 'arrow-down', label: 'Low' },
  medium: { color: Colors.info, bgColor: Colors.infoLight, icon: 'minus', label: 'Medium' },
  high: { color: Colors.warning, bgColor: Colors.warningLight, icon: 'arrow-up', label: 'High' },
  urgent: { color: Colors.error, bgColor: Colors.errorLight, icon: 'alert', label: 'Urgent' },
  
  // Document Statuses
  verified: { color: Colors.success, bgColor: Colors.successLight, icon: 'check', label: 'Verified' },
  needs_clarification: { color: Colors.warning, bgColor: Colors.warningLight, icon: 'help-circle', label: 'Needs Info' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'status',
  showIcon = true 
}) => {
  const config = statusConfig[status] || { 
    color: Colors.textMuted, 
    bgColor: Colors.borderLight, 
    icon: 'information', 
    label: status 
  };

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      {showIcon && (
        <Icon 
          name={config.icon} 
          size={12} 
          color={config.color} 
          style={styles.icon} 
        />
      )}
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
