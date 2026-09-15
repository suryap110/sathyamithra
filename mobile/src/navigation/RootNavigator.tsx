import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { SchemeDiscoveryScreen } from '../screens/SchemeDiscoveryScreen';
import { SavedSchemesScreen } from '../screens/SavedSchemesScreen';
import { ApplicationTrackerScreen } from '../screens/ApplicationTrackerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SchemeDetailScreen } from '../screens/SchemeDetailScreen';
import { DocumentVaultScreen } from '../screens/DocumentVaultScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'DiscoverTab') icon = '🔍';
          else if (route.name === 'SavedTab') icon = '❤️';
          else if (route.name === 'TrackerTab') icon = '📋';
          else if (route.name === 'ProfileTab') icon = '👤';
          return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="DiscoverTab" component={SchemeDiscoveryScreen} options={{ title: 'Schemes' }} />
      <Tab.Screen name="SavedTab" component={SavedSchemesScreen} options={{ title: 'Saved' }} />
      <Tab.Screen name="TrackerTab" component={ApplicationTrackerScreen} options={{ title: 'Applications' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
      <Stack.Screen name="DocumentVault" component={DocumentVaultScreen} options={{ title: 'Document Vault' }} />
      <Stack.Screen name="Family" component={FamilyScreen} options={{ title: 'Family Mode' }} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ title: 'Sathyamithra AI' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings & Elder Mode' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
}
