import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
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
import api from '@/lib/api';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card, Button, StatusBadge } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { Document, DocumentStatus } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

const documentTypeLabels: Record<string, string> = {
  registration: 'Registration Certificate',
  license: 'Operating License',
  insurance: 'Insurance Policy',
  safety_certificate: 'Safety Certificate',
  staff_qualification: 'Staff Qualifications',
  other: 'Other Document',
};

interface DocumentCardProps {
  document: Document;
  index: number;
  onVerify: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, index, onVerify }) => {
  const translateX = useSharedValue(-30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const getStatusColor = () => {
    switch (document.status) {
      case 'verified': return Colors.success;
      case 'rejected': return Colors.error;
      case 'needs_clarification': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  return (
    <AnimatedView style={animatedStyle}>
      <Card style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Icon
              name={document.fileType === 'pdf' ? 'file-pdf-box' : 'file-image'}
              size={32}
              color={Colors.primary}
            />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>
              {document.name}
            </Text>
            <Text style={styles.documentType}>
              {documentTypeLabels[document.type] || document.type}
            </Text>
            <Text style={styles.documentSize}>
              {(document.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Icon
              name={
                document.status === 'verified' ? 'check' :
                  document.status === 'rejected' ? 'close' :
                    document.status === 'needs_clarification' ? 'help' : 'clock'
              }
              size={16}
              color={Colors.textInverse}
            />
          </View>
        </View>

        {document.remarks && (
          <View style={styles.remarksContainer}>
            <Icon name="comment-text" size={16} color={Colors.textMuted} />
            <Text style={styles.remarksText}>{document.remarks}</Text>
          </View>
        )}

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              try {
                const url = document.url || document.file_url;

                if (!url) {
                  Alert.alert('Error', 'Document URL not found');
                  return;
                }

                const supported = await Linking.canOpenURL(url);

                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert('Error', 'Cannot open this document');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to open document');
              }
            }}
          >
            <Icon name="eye" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onVerify(document)}
          >
            <Icon name="check-circle" size={20} color={Colors.success} />
            <Text style={styles.actionText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </AnimatedView>
  );
};

// Verification Modal
interface VerificationModalProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onSubmit: (status: DocumentStatus, remarks: string) => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  document,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>('verified');
  const [remarks, setRemarks] = useState('');

  if (!document) return null;

  const handleSubmit = () => {
    onSubmit(selectedStatus, remarks);
    setRemarks('');
    setSelectedStatus('verified');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Verify Document</Text>
          <Text style={styles.modalSubtitle}>{document.name}</Text>

          <Text style={styles.modalLabel}>Status</Text>
          <View style={styles.statusOptions}>
            {(['verified', 'rejected', 'needs_clarification'] as DocumentStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus === status && styles.statusOptionActive
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Icon
                  name={
                    status === 'verified' ? 'check-circle' :
                      status === 'rejected' ? 'close-circle' : 'help-circle'
                  }
                  size={20}
                  color={
                    status === 'verified' ? Colors.success :
                      status === 'rejected' ? Colors.error : Colors.warning
                  }
                />
                <Text style={[
                  styles.statusOptionText,
                  selectedStatus === status && styles.statusOptionTextActive
                ]}>
                  {status === 'needs_clarification' ? 'Needs Info' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalLabel}>Remarks (Optional)</Text>
          <TextInput
            style={styles.remarksInput}
            multiline
            numberOfLines={3}
            placeholder="Add any remarks..."
            value={remarks}
            onChangeText={setRemarks}
          />

          <View style={styles.modalActions}>
            <Button title="Cancel" onPress={onClose} variant="ghost" />
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const DocumentVerificationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DocumentVerification'>>();
  const { inspectionId } = route.params;



  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/inspection/${inspectionId}/documents`);
      setDocuments(res.data.documents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleVerify = (document: Document) => {
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const handleSubmitVerification = async (status: string, remarks: string) => {
    if (!selectedDocument) return;
    try {
      await api.patch(`/inspection/${inspectionId}/documents/${selectedDocument.id}`, { status, remarks });
      await fetchDocuments(); // refresh
      setModalVisible(false);
      Alert.alert('Success', 'Document status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update document');
    }
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading documents...</Text>
      </View>
    );
  }

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const progress = (verifiedCount / documents.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedView style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {verifiedCount} of {documents.length} verified
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
        </View>
      </AnimatedView>

      {/* Documents List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Documents</Text>

        {documents.map((document, index) => (
          <DocumentCard
            key={document.id}
            document={document}
            index={index}
            onVerify={handleVerify}
          />
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Verification Modal */}
      <VerificationModal
        visible={modalVisible}
        document={selectedDocument}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitVerification}
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
    backgroundColor: Colors.surface,
    paddingTop: 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressInfo: {
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
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  documentCard: {
    marginBottom: Spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  documentName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  documentType: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  documentSize: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  remarksText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  documentActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
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
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statusOptions: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  statusOptionActive: {
    backgroundColor: Colors.infoLight,
  },
  statusOptionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  statusOptionTextActive: {
    fontWeight: Typography.weights.semibold,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

export default DocumentVerificationScreen;