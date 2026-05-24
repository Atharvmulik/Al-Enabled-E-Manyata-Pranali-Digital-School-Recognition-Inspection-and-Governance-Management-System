import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '@/navigation';
import { useAuthStore } from '@/store';
import { Input, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import api from '@/lib/api';

const editProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [initialValues, setInitialValues] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/inspection/user');
        const data = response.data;
        setInitialValues({
          name: data.name,
          phone: data.mobile_number,
          email: data.email,
        });
        setProfileImage(data.profile_image || null);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.detail || 'Failed to load profile');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      try {
        const uploadRes = await api.request('/inspection/user/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newImageUrl = uploadRes.data.image_url;
        setProfileImage(newImageUrl);
        Alert.alert('Success', 'Profile photo updated. Save changes to keep it.');
      } catch (error: any) {
        Alert.alert('Upload Failed', error.response?.data?.detail || 'Could not upload image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (values: { name: string; phone: string; email: string }) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        mobile_number: values.phone,
        profile_image: profileImage || '',
      };
      await api.request('/inspection/user', {
        method: 'PUT',
        body: payload,
      });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Update Failed', error.response?.data?.detail || 'Could not update profile');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="account" size={48} color={Colors.textMuted} />
              </View>
            )}
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={handleImageUpload}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Icon name="camera" size={20} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.changeImageText}>Change Photo</Text>
        </View>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={editProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                icon="account"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={errors.name}
                touched={touched.name}
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                touched={touched.email}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                icon="phone"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={errors.phone}
                touched={touched.phone}
              />

              {/* Read-only fields – we don't have badge_number/department from initialValues, but we can fetch them again or pass from parent */}
              {/* For simplicity we'll skip displaying them here or fetch separately. You can extend as needed */}
              {/* If you want to display them, you'd need to fetch them again or pass from ProfileScreen */}
              <Button
                title="Save Changes"
                onPress={handleSubmit}
                loading={isSubmitting}
                size="large"
                style={styles.saveButton}
              />
            </View>
          )}
        </Formik>

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  changeImageText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginTop: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  form: {
    padding: Spacing.lg,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

export default EditProfileScreen;