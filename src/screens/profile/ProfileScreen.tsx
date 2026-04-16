import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { useAuthStore, useAppStore } from '@/store';
import { Card, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  color?: string;
  delay?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  color = Colors.primary,
  delay = 0,
}) => {
  const translateX = useSharedValue(-20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Card style={styles.menuItem}>
          <View style={[styles.menuIconContainer, { backgroundColor: `${color}20` }]}>
            <Icon name={icon} size={22} color={color} />
          </View>
          <Text style={styles.menuLabel}>{label}</Text>
          {value && <Text style={styles.menuValue}>{value}</Text>}
          {showArrow && (
            <Icon name="chevron-right" size={20} color={Colors.textMuted} />
          )}
        </Card>
      </TouchableOpacity>
    </AnimatedView>
  );
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerScale.value = withSpring(1, { damping: 12 });
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <AnimatedView style={[styles.headerContent, headerAnimatedStyle]}>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="account" size={48} color={Colors.textInverse} />
              </View>
            )}
            <TouchableOpacity style={styles.editImageButton}>
              <Icon name="camera" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.department}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Icon name="shield-check" size={14} color={Colors.accent} />
              <Text style={styles.badgeText}>{user?.badgeNumber}</Text>
            </View>
          </View>
        </AnimatedView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem
          icon="account-edit"
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          delay={0}
        />
        <MenuItem
          icon="email"
          label="Email"
          value={user?.email}
          showArrow={false}
          delay={50}
        />
        <MenuItem
          icon="phone"
          label="Phone"
          value={user?.phone}
          showArrow={false}
          delay={100}
        />



        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <MenuItem
          icon="lock-reset"
          label="Change Password"
          onPress={() => {}}
          delay={250}
        />


        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0 (Build 2024.1)</Text>

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
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: Spacing.lg,
    padding: Spacing.sm,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  userRole: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  badgeContainer: {
    marginTop: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  menuValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

export default ProfileScreen;
