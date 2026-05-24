import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { RootStackParamList } from '@/navigation';
import { Input, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/theme';
import api from '@/lib/api';
import { saveAuthData, AuthUser } from '@/lib/authStorage';
import { useAuthStore } from '@/store';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const AnimatedView = Animated.createAnimatedComponent(View);

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withTiming(0, { duration: 600 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleLogin = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { role, access_token, token_type, user_id, email, full_name } = response.data;

      // Only allow inspector role
      if (role !== 'inspector') {
        Alert.alert('Access Denied', 'Only inspection officers can log in to this app.');
        setSubmitting(false);
        return;
      }

      // 1. Save auth data to AsyncStorage (for persistence across restarts)
      const authUser: AuthUser = {
        user_id,
        email,
        full_name,
        role,
        access_token,
        token_type,
      };
      await saveAuthData(authUser);

      // 2. Update Zustand store so AppNavigator's conditional re-renders
      //    immediately and switches from Auth stack → Main stack.
      //    No need to call navigation.replace — the navigator handles it.
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 8);
      useAuthStore.setState({
        isAuthenticated: true,
        isHydrated: true,
        token: access_token,
        sessionExpiry: sessionExpiry.toISOString(),
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../../assets/animations/success.json')}
          style={styles.lottie}
          autoPlay
          loop={false}
        />
        <Text style={styles.successText}>Login Successful!</Text>
        <Text style={styles.successSubtext}>Welcome back, Inspector</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AnimatedView style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <Icon name="shield-check" size={60} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </AnimatedView>

          {/* Login Form */}
          <AnimatedView style={[styles.formContainer, formAnimatedStyle]}>
            <View style={styles.formCard}>
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }) => (
                  <View>
                    <Input
                      label="Email Address"
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="email-outline"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={errors.email}
                      touched={touched.email}
                    />

                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      secureTextEntry
                      icon="lock-outline"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={errors.password}
                      touched={touched.password}
                    />

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsRow}>
                      <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                      >
                        <View style={[
                          styles.checkbox,
                          rememberMe && styles.checkboxChecked
                        ]}>
                          {rememberMe && (
                            <Icon name="check" size={14} color={Colors.textInverse} />
                          )}
                        </View>
                        <Text style={styles.rememberMeText}>Remember Me</Text>
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <Button
                      title="Sign In"
                      onPress={handleSubmit}
                      loading={isSubmitting}
                      variant="primary"
                      size="large"
                      style={styles.loginButton}
                    />
                  </View>
                )}
              </Formik>
            </View>
          </AnimatedView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ministry of Education, Government of India
            </Text>
            <View style={styles.secureBadge}>
              <Icon name="shield-lock" size={14} color={Colors.accent} />
              <Text style={styles.secureText}>Secure Government Portal</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberMeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  forgotPassword: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  loginButton: {
    marginBottom: Spacing.md,
  },
  demoContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  demoText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  demoCredentials: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.sm,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  secureText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginTop: Spacing.lg,
  },
  successSubtext: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});

export default LoginScreen;