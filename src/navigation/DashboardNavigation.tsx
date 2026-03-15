import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Home, FileText, User, Plus } from 'lucide-react-native';
import { theme } from '../config/theme';
import { DashboardParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator<DashboardParamList>();

const CustomTabBarButton = (props: BottomTabBarButtonProps) => (
  <TouchableOpacity style={styles.plusButtonContainer} onPress={props.onPress} activeOpacity={0.8}>
    <View style={styles.plusButton}>
      <Plus color="#FFF" size={32} />
    </View>
  </TouchableOpacity>
);

const DashboardNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Main"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      {/* Hidden button in tab bar that triggers navigation to CreateReport */}
      <Tab.Screen
        name="CreatePlaceholder"
        component={View}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (
              navigation as unknown as CompositeNavigationProp<
                BottomTabNavigationProp<DashboardParamList>,
                StackNavigationProp<RootStackParamList>
              >
            ).navigate('CreateReport');
          },
        })}
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  plusButtonContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardNavigation;
