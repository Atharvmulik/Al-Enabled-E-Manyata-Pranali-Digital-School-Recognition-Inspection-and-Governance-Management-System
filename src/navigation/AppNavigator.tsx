import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Screens
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { InspectionsScreen } from '@/screens/inspections/InspectionsScreen';
import { InspectionDetailsScreen } from '@/screens/inspections/InspectionDetailsScreen';
import { DocumentVerificationScreen } from '@/screens/inspections/DocumentVerificationScreen';
import { InspectionModeScreen } from '@/screens/inspections/InspectionModeScreen';
import { EvidenceUploadScreen } from '@/screens/inspections/EvidenceUploadScreen';
import { FinalReportScreen } from '@/screens/inspections/FinalReportScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';

// Store
import { useAuthStore, useNotificationStore } from '@/store';

// Theme
import { Colors, Spacing, Typography, Shadows } from '@/theme';

// Types
import { RootStackParamList, MainTabParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Icon with Badge
const TabIcon: React.FC<{
  name: string;
  color: string;
  size: number;
  badgeCount?: number;
}> = ({ name, color, size, badgeCount }) => (
  <View>
    <Icon name={name} size={size} color={color} />
    {badgeCount !== undefined && badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </Text>
      </View>
    )}
  </View>
);

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const unreadCount = useNotificationStore(state => state.getUnreadCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Inspections"
        component={InspectionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-check" size={size} color={color} />
          ),
          tabBarLabel: 'Inspections',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name="bell"
              size={size}
              color={color}
              badgeCount={unreadCount}
            />
          ),
          tabBarLabel: 'Notifications',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="InspectionDetails"
              component={InspectionDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DocumentVerification"
              component={DocumentVerificationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InspectionMode"
              component={InspectionModeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EvidenceUpload"
              component={EvidenceUploadScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FinalReport"
              component={FinalReportScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.md,
    paddingTop: Spacing.sm,
    height: Platform.OS === 'ios' ? 90 : 72,
    ...Shadows.lg,
  },
  tabBarLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
});

export default AppNavigator;
