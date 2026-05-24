import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';   // already present, but unused

import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '@/navigation';
import { Card, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import api from '@/lib/api';

// Replace with your actual backend base URL (same as used in the app)
const AnimatedView = Animated.createAnimatedComponent(View);

const evidenceTags: { value: string; label: string; icon: string }[] = [
  { value: 'classroom', label: 'Classroom', icon: 'desk' },
  { value: 'lab', label: 'Laboratory', icon: 'flask' },
  { value: 'safety', label: 'Safety', icon: 'shield-check' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'office-building' },
  { value: 'staff', label: 'Staff', icon: 'account-group' },
  { value: 'sanitation', label: 'Sanitation', icon: 'water-check' },
  { value: 'other', label: 'Other', icon: 'image' },
];

interface EvidenceItem {
  id: string;
  type: string;
  url: string;
  tag: string;
  description: string;
  captured_at: string;
  captured_by: string;
  file_size: number;
}

interface EvidenceItemProps {
  evidence: EvidenceItem;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({ evidence, index, onPress, onDelete }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const tagConfig = evidenceTags.find(t => t.value === evidence.tag) || evidenceTags[6];

  return (
    <AnimatedView style={[styles.evidenceItem, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: evidence.url }} style={styles.evidenceImage} />
        <View style={styles.evidenceOverlay}>
          <View style={styles.tagBadge}>
            <Icon name={tagConfig.icon} size={12} color={Colors.textInverse} />
            <Text style={styles.tagText}>{tagConfig.label}</Text>
          </View>
        </View>
        {evidence.type === 'video' && (
          <View style={styles.videoIndicator}>
            <Icon name="play-circle" size={32} color={Colors.textInverse} />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Icon name="close-circle" size={24} color={Colors.error} />
      </TouchableOpacity>
    </AnimatedView>
  );
};

interface PreviewModalProps {
  visible: boolean;
  evidence: EvidenceItem | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ visible, evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalCloseArea} onPress={onClose} />
        <View style={styles.modalContent}>
          <Image source={{ uri: evidence.url }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTag}>{evidence.tag}</Text>
            <Text style={styles.previewDate}>
              {new Date(evidence.captured_at).toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Icon name="close" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface TagModalProps {
  visible: boolean;
  onSelect: (tag: string) => void;
  onClose: () => void;
}

const TagModal: React.FC<TagModalProps> = ({ visible, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.tagModalContent}>
          <Text style={styles.tagModalTitle}>Select Tag</Text>
          <View style={styles.tagGrid}>
            {evidenceTags.map(tag => (
              <TouchableOpacity
                key={tag.value}
                style={styles.tagOption}
                onPress={() => onSelect(tag.value)}
              >
                <View style={styles.tagIconContainer}>
                  <Icon name={tag.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.tagOptionText}>{tag.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Cancel" onPress={onClose} variant="ghost" />
        </View>
      </View>
    </Modal>
  );
};

export const EvidenceUploadScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EvidenceUpload'>>();
  const { inspectionId } = route.params;

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'photo' | 'video' | null>(null);
  const [pendingTag, setPendingTag] = useState<string | null>(null);

  const fetchEvidence = async () => {
    try {
      const response = await api.get(`/inspection/${inspectionId}/evidence`);
      setEvidenceList(response.data.evidence);
    } catch (error) {
      Alert.alert('Error', 'Failed to load evidence');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvidence();
    }, [inspectionId])
  );


  const uploadFile = async (
    uri: string,
    type: string,
    fileName: string
  ): Promise<string> => {
    const token = await AsyncStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', {
      uri,
      type,
      name: fileName,
    } as any);

    // ✅ Use API_BASE_URL, not the api object
    const uploadResponse = await axios.post(
      `${API_BASE_URL}/inspection/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return uploadResponse.data.url;
  };

  const submitEvidence = async (type: string, url: string, fileSize: number, tag: string) => {
    const payload = {
      type: type === 'photo' ? 'photo' : 'video',
      url,
      tag,
      description: '',
      captured_at: new Date().toISOString(),
      captured_by: 'Inspector',
      file_size: fileSize,
    };
    await api.post(`/inspection/${inspectionId}/evidence`, payload);
    await fetchEvidence();
  };

 const handleMediaPicked = async (
  result: ImagePicker.ImagePickerResult,
  mediaType: 'photo' | 'video'
) => {
  if (result.canceled || !result.assets || result.assets.length === 0) return;

  const asset = result.assets[0];
  const selectedTag = pendingTag; // store current tag safely

  if (!selectedTag) {
    Alert.alert('Error', 'Please select a tag first.');
    return;
  }

  setUploading(true);

  try {
    const mimeType = mediaType === 'photo' ? 'image/jpeg' : 'video/mp4';

    const uploadedUrl = await uploadFile(
      asset.uri,
      mimeType,
      asset.fileName || `file.${mediaType === 'photo' ? 'jpg' : 'mp4'}`
    );

    await submitEvidence(
      mediaType,
      uploadedUrl,
      asset.fileSize || 0,
      selectedTag
    );

    setPendingTag(null);
    setSelectedMediaType(null);
  } catch (error: any) {
    console.error(
      'Full upload error:',
      JSON.stringify({
        response: {
          data: error.response?.data,
          status: error.response?.status,
        },
      })
    );

    let message = 'Could not upload file.';

    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      message = Array.isArray(detail)
        ? detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('\n')
        : String(detail);
    } else if (error.request) {
      message = 'No response from server.';
    } else {
      message = error.message;
    }

    Alert.alert('Upload Failed', message);
  } finally {
    setUploading(false);
  }
};

  const pickMedia = async (mediaType: 'photo' | 'video', useCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes:
        mediaType === 'photo'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      allowsEditing: false,
    };

    let result: ImagePicker.ImagePickerResult;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets) {
      await handleMediaPicked(result, mediaType);
    }
  };

  const showSourcePicker = (mediaType: 'photo' | 'video') => {
    Alert.alert(
      `Select ${mediaType === 'photo' ? 'Photo' : 'Video'}`,
      `Choose source for ${mediaType}`,
      [
        { text: 'Camera', onPress: () => pickMedia(mediaType, true) },
        { text: 'Gallery', onPress: () => pickMedia(mediaType, false) },
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedMediaType(null) },
      ]
    );
  };

  const handleAddEvidence = (type: 'photo' | 'video') => {
    setSelectedMediaType(type);
    setTagModalVisible(true);
  };

  const handleTagSelect = (tag: string) => {
    setTagModalVisible(false);
    setPendingTag(tag);
    if (selectedMediaType) {
      showSourcePicker(selectedMediaType);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    Alert.alert(
      'Delete Evidence',
      'Are you sure you want to delete this evidence?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/inspection/${inspectionId}/evidence/${evidenceId}`);
              await fetchEvidence();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete evidence');
            }
          },
        },
      ]
    );
  };

  const handlePreview = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setPreviewVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Evidence</Text>
          <Text style={styles.headerSubtitle}>{evidenceList.length} items</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.uploadProgress}>
          <View style={styles.uploadProgressBar}>
            <View style={[styles.uploadProgressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.uploadProgressText}>Uploading...</Text>
        </View>
      )}

      {/* Evidence Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {evidenceList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="image-off" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Evidence Yet</Text>
            <Text style={styles.emptyText}>
              Capture photos or videos to document your inspection
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {evidenceList.map((evidence, index) => (
              <EvidenceItem
                key={evidence.id}
                evidence={evidence}
                index={index}
                onPress={() => handlePreview(evidence)}
                onDelete={() => handleDeleteEvidence(evidence.id)}
              />
            ))}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.photoButton]}
          onPress={() => handleAddEvidence('photo')}
          disabled={uploading}
        >
          <Icon name="camera" size={24} color={Colors.textInverse} />
          <Text style={styles.actionButtonText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.videoButton]}
          onPress={() => handleAddEvidence('video')}
          disabled={uploading}
        >
          <Icon name="video" size={24} color={Colors.textInverse} />
          <Text style={styles.actionButtonText}>Video</Text>
        </TouchableOpacity>
      </View>

      {/* Preview Modal */}
      <PreviewModal visible={previewVisible} evidence={selectedEvidence} onClose={() => setPreviewVisible(false)} />

      {/* Tag Selection Modal */}
      <TagModal visible={tagModalVisible} onSelect={handleTagSelect} onClose={() => setTagModalVisible(false)} />
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  uploadProgress: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  uploadProgressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  evidenceItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  evidenceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textInverse,
    marginLeft: 4,
    fontWeight: Typography.weights.medium,
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  bottomPadding: {
    height: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.sm,
  },
  photoButton: {
    backgroundColor: Colors.primary,
  },
  videoButton: {
    backgroundColor: Colors.secondary,
  },
  actionButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textInverse,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  previewInfo: {
    padding: Spacing.md,
  },
  previewTag: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  previewDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  modalCloseButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: Spacing.xs,
  },
  tagModalContent: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  tagModalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  tagOption: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  tagIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  tagOptionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default EvidenceUploadScreen;