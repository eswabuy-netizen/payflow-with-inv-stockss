import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
<<<<<<< HEAD
import { Wallet, ChartBar as BarChart3, History, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
=======
import { Wallet, ChartBar as BarChart3, History, User, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170

export default function TabLayout() {
  const { user, userProfile, loading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          borderTopWidth: 1,
<<<<<<< HEAD
          height: 60 + (insets.bottom || 0),
          paddingBottom: 8 + (insets.bottom || 0),
          paddingTop: 4,
=======
          height: 60 + (insets.bottom || 0),
          paddingBottom: 8 + (insets.bottom || 0),
          paddingTop: 4,
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ size, color }) => (
            <Wallet size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      {userProfile.role === 'merchant' && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => (
              <Shield size={size} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}