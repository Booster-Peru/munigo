# PLAN.md — Plan de Ejecucion MuniGo

> Plan operativo basado en specs.md v3.1.0 (57 pantallas Stitch, decisiones confirmadas el 2026-03-15).
> Todo trabajo de codigo debe iniciarse con este plan como referencia.

---

## Resumen ejecutivo

MuniGo pasa de ser un sistema de reportes ciudadanos a una **super-app de servicios municipales**. El rediseño implica:

- **Mantener:** Auth, navigation base, ProfileScreen (con cambios), design tokens corregidos
- **Rediseñar:** HomeScreen (hub de 6 modulos), navegacion principal
- **Crear:** 5 nuevos modulos (Transporte, Servicios [Restaurantes+Tiendas+Mandados], Billetera, Mascotas, SOS)
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

### 0.4 Crear microservicio wallet (escrow)
```
COMPLETADO: backend/services/wallet/server.js (puerto 4006)
Tablas:
- wallets(user_id PK, balance DECIMAL, currency, updated_at)
- wallet_transactions(id, user_id, type, amount, balance_after, ...) — APPEND ONLY
- escrow_holds(id, payer_user_id, beneficiary_user_id, amount, platform_fee, net_amount, status)
Endpoints:
- GET /v1/wallet — saldo + ultimas transacciones
- POST /v1/wallet/credit — acreditar (recarga via Culqi)
- POST /v1/wallet/debit — debitar saldo
- POST /v1/wallet/escrow/hold — retener fondos para servicio
- POST /v1/wallet/escrow/release — liberar al partner post-servicio
- POST /v1/wallet/escrow/refund — reembolsar al ciudadano (cancelacion)
- GET /v1/wallet/transactions — historial paginado
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

**Entregables Fase 0:** ✅ COMPLETADA
- [x] Bug de reports resuelto (shared/auth → shared/jwt)
- [x] Design tokens actualizados (#0f49bd, #facc15, #dc2626, light mode)
- [x] Roles DRIVER, OPERATOR, SUPER_ADMIN en identity (seeds incluidos)
- [x] Servicio wallet con escrow completo (hold/release/refund) en puerto 4006
- [x] Gateway actualizado con rutas wallet/transport/catalog/orders

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
  - CITIZEN → CitizenTabs (Inicio, Servicios, [+], Billetera, Perfil)
  - DRIVER → DriverDashboard directo
  - SUPER_ADMIN → redirigir a web-admin
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

**Entregables Fase 1:** ✅ COMPLETADA
- [x] Navigation role-aware: CITIZEN → 4 tabs (Inicio/Viajes/Comunidad/Perfil), DRIVER → DriverDashboard
- [x] Pantallas creadas y alineadas a Stitch: BookingScreen, ServicesScreen (Restaurantes+Tiendas), SOSScreen, DriverDashboardScreen, WalletScreen
- [x] Tipos y auth sincronizados con backend (fullName, dni, roles correctos)
- [x] HomeScreen rediseñado con 6 modulos (Transporte, Restaurantes, Tiendas, Mandados, Mascotas, Billetera)
- [x] Componentes ModuleCard, BannerCard, SOSButton creados
- [x] ProfileScreen alineado a Stitch (Ionicons, Método de pago, Mi Actividad)
- [x] Todas las pantallas verificadas contra Stitch: structura idéntica, línea gráfica consistente
- [x] 0 errores TypeScript, 15/15 tests pasando

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
- Pago: Billetera MuniGo UNICO (sin efectivo — modelo escrow, muestra saldo disponible)
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

**Entregables Fase 2:** ✅ COMPLETADA
- [x] Microservicio transport (puerto 4005) con todos los endpoints + WebSocket tracking
- [x] BookingScreen conectada al API (requestTrip → TripConfirmation)
- [x] TripConfirmationScreen — estado buscando + cancelar
- [x] TripTrackingScreen — mapa placeholder + WebSocket + acción conductor
- [x] TripSummaryScreen — recap tarifa + rating de 5 estrellas
- [x] TripHistoryScreen — lista paginada de viajes con badges de estado
- [x] TripRequestScreen — modal conductor (aceptar / rechazar)
- [x] transportService.ts + driverService.ts — todas las llamadas al API
- [x] useAuth expone token; AppNavigation registra todas las rutas nuevas
- [x] docker-compose: servicio transport en puerto 4005
- [x] 0 errores TypeScript · 15/15 tests pasando

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

**Entregables Fase 3:** ✅ COMPLETADA
- [x] catalog/server.js (puerto 4007): restaurants, menu_items, stores, products + seed demo data
- [x] orders/server.js (puerto 4008): máquina de estados PENDING→DELIVERED, transiciones REST
- [x] catalogService.ts + ordersService.ts — todas las llamadas al API
- [x] RestaurantListScreen — lista con filtros de categoría conectada al catalog API
- [x] RestaurantMenuScreen — carta agrupada por categoría + carrito inline + CTA PEDIR
- [x] OrderConfirmationScreen — detalle del pedido confirmado + CTA seguir
- [x] OrderTrackingScreen — 6 pasos de progreso, polling cada 8s, cancelación
- [x] OrderDeliveredScreen — confirmación + rating 5 estrellas
- [x] RestaurantPanelScreen — panel operador con avance de estado en tiempo real
- [x] ServicesScreen navega a RestaurantMenu/StoreProducts por tipo
- [x] docker-compose: catalog (4007) + orders (4008)
- [x] 0 errores TypeScript · 15/15 tests pasando

---

## Fase 4 — Tiendas + Mandados + Mascotas + SOS ✅ COMPLETADA

**Completado:** 2026-03-16
**Objetivo:** Completar todos los modulos de servicios.

### 4.1 Tiendas (categoria dentro de modulo Servicios)
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
- [x] Tiendas funcionales (StoreListScreen + StoreProductsScreen con carrito inline, reutiliza catalog + orders)
- [x] Modulo Mandados end-to-end: backend/services/mandados/server.js (puerto 4009) + 5 pantallas + mandadosService.ts
- [x] Mascotas: backend/services/pets/server.js (puerto 4010) + PetListScreen (adopcion+perdidas) + PetDetailScreen + petsService.ts
- [x] SOS: backend/services/sos/server.js (puerto 4011) + SOSScreen conectado a POST /v1/sos/alert + sosService.ts
- [x] docker-compose actualizado con mandados/pets/sos (puertos 4009-4011)
- [x] navigation.ts actualizado con todas las rutas nuevas
- [x] HomeScreen: tiles Mandados y Mascotas activos (eliminado disabled/badge 'Pronto')
- [x] 0 errores TypeScript · 15/15 tests pasando

---

## Fase 5 — Billetera completa + Super Admin Panel + Onboarding de partners

**Objetivo:** Completar el ciclo de dinero (recargas y retiros reales) y dar a los operadores herramientas para gestionar su catalogo. El Super Admin Panel pasa a ser el centro de control del negocio.
**Duracion estimada:** 7-10 dias

### 5.1 Billetera completa (ciudadano)
```
Frontend (wallet service ya existe):
- WalletRechargeScreen — seleccionar monto + metodo de pago (PSP a definir)
- WalletWithdrawScreen — monto + cuenta bancaria destino (para conductores/operadores)
- WalletBankAccountScreen — vincular CCI/cuenta bancaria
- WalletMonthlyReportScreen — resumen del mes descargable

PSP: pendiente de decision. Candidatos: Yape Business, Plin, Izipay, Niubiz.
No asumir Culqi. Ver memory/project_payment_gateway.md
```

### 5.2 platform_config — tarifas configurables desde DB
```
CRITICO: Sacar del codigo todos los valores hardcodeados de tarifas y comisiones.

Backend: nuevo microservicio config (puerto 4012) O tabla en gateway
Tabla: platform_config(key, value, label, type, module, updated_by, updated_at)
Seed inicial: transport_fare_standard, transport_fare_premium,
              transport_commission_pct, food_commission_pct,
              shop_commission_pct, mandados_commission_pct,
              delivery_fee_fixed, mandados_fare_*

Endpoints:
- GET  /v1/admin/config        (SUPER_ADMIN)
- PATCH /v1/admin/config/:key  (SUPER_ADMIN)
- GET  /v1/config/public       (publico — fares para mostrar al ciudadano)

Cada microservicio (transport, orders, mandados, wallet) consulta esta tabla
en lugar de leer constantes del codigo.
```

### 5.3 Calculo de tarifa de transporte por zonas
```
Reemplazar tarifa fija hardcodeada por modelo de zonas configurables:

DB nueva:
- fare_zones(id, municipality_id, name, polygon GEOMETRY, color)
- zone_fares(from_zone_id, to_zone_id, fare, night_fare)

Backend transport:
- GET /v1/transport/estimate?from_lat=&from_lng=&to_lat=&to_lng=
  → retorna tarifa estimada antes de confirmar

Frontend:
- BookingScreen muestra tarifa estimada segun origen y destino seleccionados
- El ciudadano ve el precio ANTES de solicitar, como en Uber
```

### 5.4 Panel del operador — gestion de catalogo
```
CRITICO: Hoy los catalogos son seed hardcodeado. Los operadores necesitan
poder gestionar sus propios productos.

Backend catalog — nuevos endpoints:
- POST   /v1/catalog/restaurants/:id/menu      — agregar item
- PATCH  /v1/catalog/menu/:itemId              — actualizar item (precio, disponibilidad)
- DELETE /v1/catalog/menu/:itemId              — eliminar item
- POST   /v1/catalog/stores/:id/products       — agregar producto
- PATCH  /v1/catalog/products/:id              — actualizar producto
- DELETE /v1/catalog/products/:id              — eliminar producto
- GET    /v1/catalog/image-search?q=           — buscar imagen (proxy a Google/Unsplash)
- POST   /v1/catalog/upload-image              — subir foto desde camara

Frontend (nuevas pantallas):
- src/screens/operator/CatalogManagerScreen.tsx — lista de items con precio editable
- src/screens/operator/AddProductScreen.tsx — formulario nuevo producto + busqueda de imagen
```

### 5.5 Onboarding de partners
```
Flujo completo para que restaurantes y tiendas se registren solos:

DB nueva:
- partner_applications(id, applicant_id, business_name, type, ruc,
    address, lat, lng, schedule, logo_url, documents JSONB,
    status [PENDING|APPROVED|REJECTED], reviewed_by, reviewed_at)

Backend: endpoints de aplicacion en catalog service o nuevo service

Frontend:
- src/screens/operator/PartnerOnboardingScreen.tsx — formulario registro
- src/screens/operator/PartnerStatusScreen.tsx — estado de aprobacion

Super Admin Panel web:
- /admin/applications — lista de solicitudes pendientes con aprobar/rechazar
```

### 5.6 Super Admin Panel (web-admin refactor)
```
web-admin/ — refactor a React SPA completo (Vite + React)

Modulos:
- /admin/login — autenticacion SUPER_ADMIN
- /admin/dashboard — metricas tiempo real: conductores, viajes, transacciones, comision
- /admin/config — editar platform_config (tarifas, comisiones)
- /admin/drivers — lista conductores, estado, documentos, suspender/reactivar
- /admin/trips — historial viajes con filtros
- /admin/orders — historial pedidos (food + tiendas + mandados)
- /admin/transactions — movimientos escrow, comisiones acumuladas
- /admin/partners — comercios activos + solicitudes pendientes
- /admin/municipalities — municipios socios, sus poligonos y comisiones acumuladas

Backend: endpoint GET /v1/admin/stats (SUPER_ADMIN)
- Conductores activos hoy, viajes del dia, transacciones totales, comision acumulada
```

**Entregables Fase 5:**
- [ ] platform_config en DB — cero valores de negocio hardcodeados en codigo
- [ ] Estimacion de tarifa por zonas en BookingScreen
- [ ] Panel operador: CRUD de catalogo con busqueda de imagenes
- [ ] Onboarding de partners (formulario + aprobacion en admin)
- [ ] Billetera: recarga y retiro con PSP real
- [ ] web-admin refactorizado con todos los modulos de administracion
- [ ] 0 errores TypeScript · todos los tests pasando

---

## Fase 6 — Expansion geografica + Formalizacion SUNAT

**Objetivo:** Habilitar el modelo de una sola app para multiples municipios y cumplimiento tributario.
**Duracion estimada:** 7-10 dias

### 6.1 Tabla municipalities + asignacion geografica automatica
```
DB:
- municipalities(id, name, region, polygon GEOMETRY, commission_pct,
                 contract_status, contact_name, contact_email, activated_at)

Logica en gateway:
- Por cada transaccion completada: ST_Within(punto_gps, polygon)
  → asigna municipality_id automaticamente
- Si no hay municipio: municipality_id = 'unassigned' (MuniGo opera igual)

No hay subdominios ni apps separadas.
Una sola app para todo el Peru — el ciudadano ve lo que hay cerca de el.
```

### 6.2 Integracion SUNAT — comprobantes electronicos
```
CRITICO para formalizacion de mototaxistas.

Proveedor OSE/PSE a contratar (ejemplos: Nubefact, Facturalo.pe, EFACT)
Por cada trip completado:
- MuniGo emite boleta electronica a SUNAT
- Datos: servicio de transporte, monto, IGV, conductor, fecha
- El conductor recibe copia por WhatsApp/email (opcional en MVP)

Tabla: sunat_vouchers(id, trip_id, order_id, series, correlative,
                       xml_content, cdr_content, status, issued_at)

Endpoint interno: POST /v1/sunat/emit (llamado por transport al completar viaje)
```

### 6.3 Registro formal de conductores (KYC basico)
```
Para cumplir regulacion de transporte peruano:
- DNI verificado (foto frente + reverso)
- Licencia de conducir vigente (foto)
- Mototaxi con SOAT vigente (foto)
- Placa del vehiculo
- Numero de celular verificado (OTP SMS)

DB: driver_documents(driver_id, doc_type, photo_url, verified, verified_by, expires_at)

Frontend:
- src/screens/driver/DriverVerificationScreen.tsx — subida de documentos
Super Admin:
- /admin/drivers/:id — revisar y aprobar documentos
```

### 6.4 Retiro de ganancias para conductores y operadores
```
Flujo completo post-escrow:
- El escrow ya libera al balance del conductor (wallet service)
- Conductor ve su saldo en DriverDashboard
- Solicita retiro indicando CCI bancario
- SUPER_ADMIN procesa en batch diario desde panel
- Se registra en withdrawal_requests con estado PENDING → COMPLETED

MVP: procesamiento manual por el SUPER_ADMIN
Futuro: integracion con API bancaria para transferencias automaticas
```

**Entregables Fase 6:**
- [ ] Tabla municipalities con poligonos activos
- [ ] Asignacion automatica de municipality_id por GPS en cada transaccion
- [ ] Reporte por municipio en Super Admin Panel
- [ ] Emision de comprobantes electronicos SUNAT por viaje completado
- [ ] KYC basico de conductores (documentos + aprobacion)
- [ ] Flujo de retiro de ganancias para conductores y operadores

---

## Fase 7 — Hardening, Mapas reales, Push Notifications, CI/CD

**Objetivo:** Preparar para produccion real con usuarios reales.
**Duracion estimada:** 5-7 dias

### 7.1 Mapas reales
```
- Mapbox GL o Google Maps en BookingScreen y TripTrackingScreen
- Visualizacion del conductor moviendose en tiempo real
- Calculo de ruta y ETA real
- Mapa de conductores activos en Super Admin Panel
```

### 7.2 Push notifications reales
```
- FCM (Android) + APNs (iOS) en notifications service
- Device tokens almacenados en DB por usuario
- Notificaciones para: estado de viaje, estado de pedido, alerta SOS recibida,
  retiro procesado, nuevo pedido (para operador)
```

### 7.3 Security hardening
```
- Rate limiting en gateway (100 req/min por IP, 10 req/min por endpoint sensible)
- Validacion y sanitizacion de todos los inputs
- HTTPS obligatorio (Let's Encrypt en CapRover)
- Auditoria de variables de entorno — ningun secret en codigo
- IDOR protection en todos los servicios
- Principio de minimo privilegio por rol
```

### 7.4 PostGIS y geo real
```
- ST_Distance / ST_DWithin para conductores cercanos
- ST_Within para asignacion de municipality_id
- Indices espaciales en todos los campos GEOMETRY
```

### 7.5 Observabilidad y CI/CD
```
- Health checks /health en todos los microservicios
- Logging estructurado JSON con nivel configurable
- GitHub Actions: lint + test en cada PR
- Build Docker + deploy automatico a CapRover en push a main
- Environments: staging y production separados
```

**Entregables Fase 7:**
- [ ] Mapa real funcionando en Booking y Tracking
- [ ] Push notifications en dispositivos reales Android e iOS
- [ ] Rate limiting activo en gateway
- [ ] PostGIS queries en production
- [ ] Pipeline CI/CD completo con staging y production

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
