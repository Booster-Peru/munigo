export type DashboardParamList = {
  Main: undefined;
  Viajes: undefined;
  Comunidad: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  DriverDashboard: undefined;
  CreateReport: undefined;
  Booking: undefined;
  SOS: undefined;
  Wallet: undefined;
  Services: { type?: 'restaurantes' | 'tiendas' };
  TripConfirmation: { tripId: string };
  TripTracking: { tripId: string };
  TripSummary: { tripId: string };
  TripHistory: undefined;
  TripRequest: { tripId: string };
  // Food / Services
  RestaurantList: { category?: string } | undefined;
  RestaurantMenu: { restaurantId: string };
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  OrderDelivered: { orderId: string };
  // Stores
  StoreList: { category?: string } | undefined;
  StoreProducts: { storeId: string };
  // Mandados
  MandadosMenu: undefined;
  MandadoRequest: { type: 'COMPRAS' | 'TRAMITE' | 'MENSAJERIA' | 'OTRO' };
  MandadoConfirmation: { mandadoId: string };
  MandadoTracking: { mandadoId: string };
  MandadoSummary: { mandadoId: string };
  // Mascotas
  PetList: undefined;
  PetDetail: { petId: string };
  // Operator
  RestaurantPanel: undefined;
};
