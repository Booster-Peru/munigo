import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardNavigation from './DashboardNavigation';
import CreateReportScreen from '../screens/CreateReportScreen';
import BookingScreen from '../screens/transport/BookingScreen';
import TripConfirmationScreen from '../screens/transport/TripConfirmationScreen';
import TripTrackingScreen from '../screens/transport/TripTrackingScreen';
import TripSummaryScreen from '../screens/transport/TripSummaryScreen';
import TripHistoryScreen from '../screens/transport/TripHistoryScreen';
import SOSScreen from '../screens/sos/SOSScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import TripRequestScreen from '../screens/driver/TripRequestScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import RestaurantListScreen from '../screens/food/RestaurantListScreen';
import RestaurantMenuScreen from '../screens/food/RestaurantMenuScreen';
import OrderConfirmationScreen from '../screens/food/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/food/OrderTrackingScreen';
import OrderDeliveredScreen from '../screens/food/OrderDeliveredScreen';
import RestaurantPanelScreen from '../screens/operator/RestaurantPanelScreen';
import StoreListScreen from '../screens/shops/StoreListScreen';
import StoreProductsScreen from '../screens/shops/StoreProductsScreen';
import MandadosMenuScreen from '../screens/mandados/MandadosMenuScreen';
import MandadoRequestScreen from '../screens/mandados/MandadoRequestScreen';
import MandadoConfirmationScreen from '../screens/mandados/MandadoConfirmationScreen';
import MandadoTrackingScreen from '../screens/mandados/MandadoTrackingScreen';
import MandadoSummaryScreen from '../screens/mandados/MandadoSummaryScreen';
import PetListScreen from '../screens/pets/PetListScreen';
import PetDetailScreen from '../screens/pets/PetDetailScreen';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../config/theme';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!user) return 'Welcome';
    if (user.role === 'DRIVER') return 'DriverDashboard';
    return 'Dashboard';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardNavigation} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
        <Stack.Screen
          name="CreateReport"
          component={CreateReportScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="TripConfirmation" component={TripConfirmationScreen} />
        <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
        <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
        <Stack.Screen
          name="TripRequest"
          component={TripRequestScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="SOS" component={SOSScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        {/* Food / Delivery */}
        <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
        <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderDelivered" component={OrderDeliveredScreen} />
        {/* Stores */}
        <Stack.Screen name="StoreList" component={StoreListScreen} />
        <Stack.Screen name="StoreProducts" component={StoreProductsScreen} />
        {/* Mandados */}
        <Stack.Screen name="MandadosMenu" component={MandadosMenuScreen} />
        <Stack.Screen name="MandadoRequest" component={MandadoRequestScreen} />
        <Stack.Screen name="MandadoConfirmation" component={MandadoConfirmationScreen} />
        <Stack.Screen name="MandadoTracking" component={MandadoTrackingScreen} />
        <Stack.Screen name="MandadoSummary" component={MandadoSummaryScreen} />
        {/* Mascotas */}
        <Stack.Screen name="PetList" component={PetListScreen} />
        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
        {/* Operator */}
        <Stack.Screen name="RestaurantPanel" component={RestaurantPanelScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
