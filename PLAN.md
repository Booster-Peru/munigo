# PLAN.md — Plan de Ejecucion MuniGo

> Plan operativo basado en specs.md v3.0.0 (57 pantallas Stitch analizadas el 2026-03-15).
> Todo trabajo de codigo debe iniciarse con este plan como referencia.

---

## Resumen ejecutivo

MuniGo pasa de ser un sistema de reportes ciudadanos a una **super-app de servicios municipales**. El rediseño implica:

- **Mantener:** Auth, navigation base, ProfileScreen (con cambios), design tokens corregidos
- **Rediseñar:** HomeScreen (hub de 6 modulos), navegacion principal
- **Crear:** 7 nuevos modulos (Transporte, Restaurantes, Tiendas, Mandados, Billetera, Mascotas, SOS)
- **Crear:** Driver App (perfil DRIVER dentro del mismo repo Expo)
- **Crear:** 7 nuevos microservicios (transport, wallet, catalog, orders, mandados, pets, sos)
- **Refactorizar:** web-admin a React SPA con roles y nuevas funcionalidades

---

## Fase 0 — Fundaciones (prerequisitos bloqueantes)

**Objetivo:** Reparar lo roto y establecer las bases del nuevo sistema.
**Duracion estimada:** 1-2 dias

### 0.1 Fix bug critico reports service
```
Archivo: backend/services/reports/server.js
Problema: require('../shared/auth') - archivo no existe
Fix: cambiar a require('../shared/jwt')
```

### 0.2 Actualizar design tokens
```
Archivo: src/config/theme.ts
Cambios:
- colors.primary: #135bec → #0f49bd
- colors.accent: agregar #facc15 (amarillo)
- colors.emergency: agregar #dc2626 (rojo SOS)
- typography.fontFamily: agregar Public Sans
```

### 0.3 Agregar roles DRIVER y OPERATOR a identity service
```
Archivo: backend/services/identity/server.js
Cambios:
- Agregar roles DRIVER y OPERATOR al enum de roles
- Endpoint POST /v1/auth/register acepta campo role (CITIZEN por defecto)
- Agregar seed de conductor de prueba: driver@munigo.pe
- Agregar seed de operador de prueba: operador@restaurante.pe
```

### 0.4 Crear microservicio wallet (schema + CRUD basico)
```
Nuevo archivo: backend/services/wallet/server.js (puerto 4006)
Tablas:
- wallets(user_id PK, balance DECIMAL, updated_at)
- wallet_transactions(id, user_id, type, amount, description, reference_id, created_at)
- withdrawal_requests(id, user_id, amount, bank_account, status, created_at)
Endpoints iniciales:
- GET /v1/wallet — obtener saldo y ultimos movimientos
- POST /v1/wallet/debit — debitar saldo (para pagos de servicios)
- POST /v1/wallet/credit — acreditar saldo (para recargas)
- GET /v1/wallet/transactions — historial de movimientos
```

### 0.5 Actualizar gateway con rutas nuevas
```
Archivo: backend/gateway/server.js
Agregar:
- /v1/wallet/* → wallet:4006
- /v1/transport/* → transport:4005
- /v1/catalog/* → catalog:4007
- /v1/orders/* → orders:4008
```

### 0.6 Actualizar docker-compose con nuevos servicios
```
Archivo: docker-compose.yml
Agregar servicios: wallet, transport, catalog, orders, mandados, pets, sos
```

**Entregables Fase 0:**
- [ ] Bug de reports resuelto y testeado
- [ ] Design tokens actualizados y aplicados
- [ ] Roles DRIVER y OPERATOR en identity
- [ ] Servicio wallet funcionando con endpoints basicos
- [ ] Gateway actualizado

---

## Fase 1 — Rediseño del Home y Navigation

**Objetivo:** Cambiar el punto de entrada de la app al nuevo hub de 6 modulos.
**Duracion estimada:** 2-3 dias

### 1.1 Nuevo AppNavigation con estructura completa
```
Archivo: src/navigation/AppNavigation.tsx
Cambios:
- RootStack: Auth (Welcome/Login/Register) → MainApp (por rol)
- MainApp condicional por rol JWT:
  - CITIZEN → CitizenTabs
  - DRIVER → DriverTabs
  - SUPERVISOR → MunicipalTabs (+ funcionalidades ciudadano)
```

### 1.2 CitizenTabs (Bottom Navigation ciudadano)
```
Archivo: src/navigation/CitizenNavigation.tsx
Tabs:
- Inicio (HomeScreen rediseñado)
- Servicios (ServicesMenuScreen — placeholder inicialmente)
- Comunidad (SOSScreen o CommunityScreen)
- Perfil (ProfileScreen)
```

### 1.3 HomeScreen rediseñado
```
Archivo: src/screens/HomeScreen.tsx (rediseño completo)
Elementos:
- Header con ubicacion actual + notificaciones
- Saludo personalizado "Hola, {nombre}"
- Search bar contextual
- Grid 2x3 de modulos: Transporte, Restaurantes, Tiendas, Mandados, Mascotas, Billetera
- Banner municipal (texto configurable)
- Card "Adopta un amigo"
- Boton SOS flotante o en grid
```

### 1.4 Nuevos componentes base
```
src/components/common/ModuleCard.tsx — icono + label para grid de modulos
src/components/common/BannerCard.tsx — banner municipal
src/components/common/SOSButton.tsx — boton de emergencia rojo
src/components/layout/ScreenHeader.tsx — header con ubicacion + notificaciones
```

**Entregables Fase 1:**
- [ ] Navigation reestructurada y funcionando por roles
- [ ] HomeScreen con 6 modulos, saludo, ubicacion, banner y SOS
- [ ] Componentes base del design system creados

---

## Fase 2 — Modulo Transporte (MVP productivo)

**Objetivo:** Primer modulo de servicio funcional end-to-end.
**Duracion estimada:** 5-7 dias

### 2.1 Backend: microservicio transport
```
Nuevo: backend/services/transport/server.js (puerto 4005)

Tablas:
- trips(id, citizen_id, driver_id, origin_lat, origin_lng, dest_lat, dest_lng,
         type, status, fare, payment_method, created_at, updated_at)
- driver_locations(driver_id PK, latitude, longitude, is_available, updated_at)

Endpoints:
- POST /v1/transport/request — ciudadano solicita viaje
- PATCH /v1/transport/{id}/accept — conductor acepta viaje
- PATCH /v1/transport/{id}/start — conductor inicia viaje
- PATCH /v1/transport/{id}/complete — conductor completa viaje
- PATCH /v1/transport/{id}/cancel — cancelar viaje
- GET /v1/transport/active — viaje activo del ciudadano
- GET /v1/transport/history — historial del ciudadano
- PUT /v1/transport/driver/location — actualizar ubicacion del conductor
- GET /v1/transport/driver/nearby — conductores disponibles cercanos
- WS /v1/transport/track/{tripId} — WebSocket de tracking en tiempo real
```

### 2.2 Frontend: flujo ciudadano
```
src/screens/transport/BookingScreen.tsx
- Mapa con marker de origen y destino (Google Maps o Mapbox)
- Cards de tipo: Standard S/5 | Premium S/8 con tiempo estimado
- Selector de pago: Efectivo | Billetera (muestra saldo disponible)
- Campo cupon opcional
- CTA "Solicitar Mototaxi"

src/screens/transport/TripConfirmationScreen.tsx
- Datos del conductor asignado (nombre, calificacion, placa)
- ETA estimado al punto de recogida
- Boton "Cancelar"

src/screens/transport/TripTrackingScreen.tsx
- Mapa con posicion del conductor en tiempo real (WebSocket)
- Estado del viaje (En camino / Viaje en curso)
- Informacion del conductor
- Boton "Llamar conductor"

src/screens/transport/TripSummaryScreen.tsx
- Destino, distancia, duracion, tarifa cobrada
- Metodo de pago utilizado
- Stars rating del conductor
- Boton "Ver historial"

src/screens/transport/TripHistoryScreen.tsx
- Lista de viajes pasados con fecha, destino, tarifa
```

### 2.3 Frontend: flujo conductor
```
src/screens/driver/DriverDashboardScreen.tsx
- Header: nombre + ID del conductor
- Toggle ACTIVAR/DESACTIVAR servicio (llama a endpoint location)
- Metricas: ganancias hoy, viajes hoy, calificacion
- Listado de ultimos viajes
- Notificacion de solicitud nueva de viaje (banner/modal)
- Bottom nav: Inicio | Pagos | Rutas | Perfil

src/screens/driver/TripRequestScreen.tsx (modal/sheet)
- Origen y destino de la solicitud
- Tarifa estimada
- Botones: Aceptar | Rechazar

src/navigation/DriverNavigation.tsx
- Bottom tabs para flujo del conductor
```

### 2.4 Servicios frontend
```
src/services/transportService.ts
- requestTrip(params)
- getActiveTrip()
- getTripHistory()
- subscribeToTracking(tripId, callback) — WebSocket

src/services/driverService.ts
- toggleAvailability(isAvailable, location)
- updateLocation(lat, lng)
- acceptTrip(tripId)
- completeTrip(tripId)
```

**Entregables Fase 2:**
- [ ] Microservicio transport con todos los endpoints + WebSocket
- [ ] BookingScreen con mapa, tipos de mototaxi y pago
- [ ] TripTrackingScreen con WebSocket en tiempo real
- [ ] DriverDashboardScreen con toggle de disponibilidad
- [ ] Flujo completo ciudadano → conductor funcionando

---

## Fase 3 — Modulo Restaurantes

**Objetivo:** Food delivery funcional end-to-end.
**Duracion estimada:** 5-7 dias

### 3.1 Backend: microservicio catalog
```
Nuevo: backend/services/catalog/server.js (puerto 4007)

Tablas:
- restaurants(id, name, category, description, photo_url, address, lat, lng,
               open_time, close_time, is_active, owner_user_id)
- menu_items(id, restaurant_id, name, description, price, photo_url, is_available, category)
- stores(id, name, category, description, photo_url, address, lat, lng, owner_user_id)
- products(id, store_id, name, description, price, photo_url, stock, category)
```

### 3.2 Backend: microservicio orders
```
Nuevo: backend/services/orders/server.js (puerto 4008)

Tablas:
- orders(id, user_id, source_type [RESTAURANT|STORE], source_id, items JSONB,
          total, payment_method, status, delivery_address, created_at, updated_at)
- order_items(id, order_id, item_id, quantity, unit_price)

Estados: PENDING → ACCEPTED → PREPARING → READY → DELIVERING → DELIVERED | CANCELLED
```

### 3.3 Frontend: flujo ciudadano
```
src/screens/food/RestaurantListScreen.tsx — listado con fotos y categorias
src/screens/food/RestaurantMenuScreen.tsx — carta con items y carrito inline
src/screens/food/OrderConfirmationScreen.tsx — resumen y confirmacion
src/screens/food/OrderTrackingScreen.tsx — estados con tiempo estimado
src/screens/food/OrderDeliveredScreen.tsx — confirmacion y rating
```

### 3.4 Frontend: panel operador restaurante
```
src/screens/operator/RestaurantPanelScreen.tsx
- Ver pedidos entrantes en tiempo real
- Aceptar / Rechazar pedido
- Marcar como "En preparacion", "Listo"
- Historial de pedidos del dia
- Boton de retiro de ganancias
```

**Entregables Fase 3:**
- [ ] Microservicios catalog + orders funcionando
- [ ] Flujo completo ciudadano food delivery
- [ ] Panel operador restaurante con gestion de pedidos

---

## Fase 4 — Tiendas + Mandados + Mascotas + SOS

**Objetivo:** Completar todos los modulos de servicios.
**Duracion estimada:** 5-7 dias

### 4.1 Tiendas SIAR Marketplace
```
Backend: endpoint tiendas en catalog service (ya creado en Fase 3)
Frontend:
- src/screens/shops/StoreListScreen.tsx
- src/screens/shops/StoreProductsScreen.tsx
- src/screens/shops/ShoppingCartScreen.tsx
- src/screens/shops/PurchaseConfirmationScreen.tsx
- src/screens/shops/PurchaseTrackingScreen.tsx
Reutilizar orders service con source_type: STORE
```

### 4.2 Mandados
```
Backend: backend/services/mandados/server.js (puerto 4009)
Tablas: mandado_requests(id, user_id, type, description, pickup_address, delivery_address,
                          fare, status, assignee_id, created_at, updated_at)
Frontend:
- src/screens/mandados/MandadosMenuScreen.tsx
- src/screens/mandados/MandadoRequestScreen.tsx
- src/screens/mandados/MandadoConfirmationScreen.tsx
- src/screens/mandados/MandadoTrackingScreen.tsx
- src/screens/mandados/MandadoSummaryScreen.tsx
```

### 4.3 Mascotas
```
Backend: backend/services/pets/server.js (puerto 4010)
Tablas: pets(id, name, species, breed, age_months, description, photos JSONB,
              status [AVAILABLE|RESERVED|ADOPTED], municipality_id, created_at)
Frontend:
- src/screens/pets/PetListScreen.tsx
- src/screens/pets/PetDetailScreen.tsx — foto, datos, boton solicitar adopcion
```

### 4.4 SOS
```
Backend: backend/services/sos/server.js (puerto 4011)
Tablas: sos_alerts(id, user_id, latitude, longitude, created_at, resolved_at)
Logica: notificar via notifications service al supervisor del municipio con coordenadas
Frontend:
- src/screens/sos/SOSScreen.tsx
  - Boton panico rojo grande
  - Contactos rapidos con tel:106, tel:116, tel:0800
  - Mapa con ubicacion GPS
  - Al activar: llama POST /v1/sos/alert
```

**Entregables Fase 4:**
- [ ] Tiendas SIAR funcionales (reutilizando catalog + orders)
- [ ] Modulo Mandados end-to-end
- [ ] Listado y adopcion de mascotas
- [ ] SOSScreen con boton panico + contactos de emergencia

---

## Fase 5 — Billetera completa + Panel Municipal

**Objetivo:** Billetera con recargas reales y panel municipal mobile.
**Duracion estimada:** 5-7 dias

### 5.1 Billetera completa
```
Frontend (wallet service ya existe desde Fase 0):
- src/screens/wallet/WalletScreen.tsx — saldo + historial + acciones
- src/screens/wallet/WalletRechargeScreen.tsx — seleccionar monto + metodo pago
- src/screens/wallet/WalletWithdrawScreen.tsx — monto + cuenta destino
- src/screens/wallet/WalletBankAccountScreen.tsx — vincular cuenta bancaria
- src/screens/wallet/WalletMonthlyReportScreen.tsx — movimientos del mes

Integraciones de pago:
- Yape QR (via API Yape Business)
- Plin (via API Plin)
- Tarjeta Visa/MC (via Culqi u otro PSP peruano)
```

### 5.2 Panel Municipal Mobile
```
Frontend:
- src/screens/municipal/PanelScreen.tsx
  - Cards con metricas en tiempo real (conductores, viajes, transacciones, comision)
  - Mapa con conductores activos geolocalizados
  - Estado de subsistemas
- src/screens/municipal/DriversListScreen.tsx
  - Lista de conductores registrados con estado
  - Botones: ver detalle, suspender, reactivar
- src/screens/municipal/DriverDetailScreen.tsx
  - Datos del conductor, documentacion, historial de viajes
- src/navigation/MunicipalNavigation.tsx
  - Tabs: Panel | Conductores | Viajes | Ajustes

Backend: nuevo endpoint GET /v1/transport/supervisor/stats
- Requiere rol SUPERVISOR
- Retorna: conductores activos, viajes del dia, transacciones, comision
```

### 5.3 Refactor web-admin
```
web-admin/ — refactor a React SPA (Vite + React)
Modulos:
- Login con roles (SUPERVISOR, ADMIN)
- Dashboard con metricas
- Mapa de conductores activos (Google Maps)
- Gestion de conductores (listar, suspender, reactivar)
- Gestion de reportes ciudadanos
- Reportes financieros
```

**Entregables Fase 5:**
- [ ] WalletScreen con saldo real, recarga y retiro
- [ ] Integracion con al menos un PSP peruano (Culqi o Yape)
- [ ] PanelScreen municipal mobile con metricas en tiempo real y mapa
- [ ] DriversListScreen con gestion completa
- [ ] web-admin refactorizado a React SPA

---

## Fase 6 — Hardening, Push Notifications, CI/CD

**Objetivo:** Preparar para produccion.
**Duracion estimada:** 3-5 dias

### 6.1 Push notifications reales
```
- Integrar FCM (Android) + APNs (iOS) en notifications service
- Notificaciones de: estado de viaje, pedido, billetera
- Almacenar device tokens en BD
- Eliminar push simulado, enviar notificaciones reales
```

### 6.2 Security hardening
```
- Rate limiting en gateway (100 req/min por IP)
- Validacion y sanitizacion de inputs en todos los endpoints
- HTTPS obligatorio en produccion
- Variables de entorno auditadas (no hay secrets en codigo)
- Implementar IDOR protection en todos los servicios
- Revisar y aplicar principio de minimo privilegio por rol
```

### 6.3 PostGIS para geo service
```
- Reemplazar distancia euclidiana por ST_Distance de PostGIS
- Queries de conductores cercanos via ST_DWithin
- Zonas geoespaciales reales de municipios peruanos
```

### 6.4 Observabilidad
```
- Health checks en todos los microservicios
- Logging estructurado (JSON) con nivel configurable
- Metricas basicas: latencia, errores, throughput por servicio
- Alertas por caida de servicios criticos
```

### 6.5 CI/CD
```
- GitHub Actions: lint + test en PR
- Build Docker images en push a main
- Deploy automatico a CapRover (ya tiene caprover-compose.yml)
- Environment: staging y production separados
```

**Entregables Fase 6:**
- [ ] Push notifications funcionando en dispositivos reales
- [ ] Rate limiting y validaciones en todos los endpoints
- [ ] PostGIS queries reales en geo service
- [ ] Logging estructurado en todos los servicios
- [ ] Pipeline CI/CD funcionando con deploy a staging

---

## Criterios de done por fase

| Fase | Done cuando...                                                         |
| ---- | ---------------------------------------------------------------------- |
| 0    | Bug corregido, tokens actualizados, wallet basico funcionando          |
| 1    | HomeScreen rediseñado con 6 modulos, navigation por roles activa       |
| 2    | Ciudadano puede pedir y trackear un mototaxi; conductor puede aceptarlo|
| 3    | Ciudadano puede ordenar comida y recibirla; restaurante la gestiona    |
| 4    | Tiendas, mandados, mascotas y SOS funcionando end-to-end               |
| 5    | Billetera con recarga real; panel municipal con mapa en tiempo real    |
| 6    | Push notifications reales; app en produccion en staging con CI/CD      |

---

## Dependencias criticas entre fases

```
Fase 0 → Fase 1 (necesita roles para navigation)
Fase 0 → Fase 2 (necesita wallet para pago de viajes)
Fase 1 → Fase 2 (HomeScreen debe existir antes de Transport)
Fase 2 → Fase 3 (patron viaje/tracking reutilizable para food)
Fase 3 → Fase 4 (catalog service ya existe para tiendas)
Fase 0 → Fase 5 (wallet backend desde Fase 0)
Fase 2 → Fase 5 (panel municipal necesita transport)
Todas → Fase 6 (hardening es ultimo paso)
```

---

## Archivos de referencia clave

| Archivo | Uso |
| ------- | --- |
| [specs.md](specs.md) | Especificacion funcional completa — fuente de verdad |
| [src/config/theme.ts](src/config/theme.ts) | Design tokens — actualizar en Fase 0 |
| [src/navigation/AppNavigation.tsx](src/navigation/AppNavigation.tsx) | Navigation raiz — refactorizar en Fase 1 |
| [backend/gateway/server.js](backend/gateway/server.js) | Gateway — agregar rutas en Fase 0 |
| [backend/services/identity/server.js](backend/services/identity/server.js) | Auth — agregar roles en Fase 0 |
| [docker-compose.yml](docker-compose.yml) | Infraestructura — agregar servicios nuevos en Fase 0 |

---

*PLAN.md actualizado el 2026-03-15 — Basado en specs.md v3.0.0*
