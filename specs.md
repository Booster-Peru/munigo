# specs.md — Especificacion Funcional MuniGo

> Documento maestro basado en los diseños de Stitch (57 pantallas) y el estado real del repositorio.
> Todo cambio en alcance o arquitectura debe reflejarse aqui primero.

---

## 1. Metadatos

| Campo                | Valor                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| GUID                 | `e9f2ae00-c96e-47ac-b12f-abce0570163a`                                |
| Version              | `3.1.0`                                                               |
| Fecha de creacion    | `2024-05-24`                                                          |
| Ultima actualizacion | `2026-03-15`                                                          |
| Owner                | `Antigravity`                                                         |
| Estado               | `Redesign in Progress`                                                |
| Alcance              | `Super-app municipal mobile (ciudadano + conductor) + Panel Web`      |
| Stitch Project ID    | `9904501399194749579`                                                 |
| Stitch Screens       | `57 pantallas diseñadas`                                              |

---

## 2. Contexto y vision del producto

MuniGo es una **super-app de servicios municipales** para comunidades del Peru. No es solo un sistema de reportes: es el hub digital que conecta al ciudadano con todos los servicios que su municipio y su comunidad local pueden ofrecerle.

El contexto de diseno esta centrado en **Canoas de Punta Sal, Tumbes**, pero la arquitectura debe escalar a cualquier municipio del pais.

### Propuesta de valor

**Para el ciudadano:** Un solo lugar para pedir mototaxi, ordenar comida, comprar en tiendas locales, hacer mandados, adoptar mascotas, activar SOS y reportar incidencias — todo con pago digital integrado.

**Para el conductor/partner:** Panel para activar servicio, ver viajes, gestionar ganancias y cumplir requisitos municipales.

**Para el operador municipal:** Supervision en tiempo real de conductores activos, viajes del dia, transacciones y estado del sistema.

---

## 3. Arquitectura de la aplicacion

### 3.1 Productos

| Producto              | Tipo            | Estado          |
| --------------------- | --------------- | --------------- |
| App Ciudadano         | Mobile React Native/Expo | In progress (rediseño) |
| App Driver Partner    | Mobile React Native/Expo | Por construir   |
| Super Admin Panel     | Web React SPA (web-admin), rol SUPER_ADMIN | Refactor pendiente |
| Web Admin             | React SPA       | Refactor pendiente |
| Backend API           | Microservicios Node.js | In progress     |

### 3.2 Sistema de diseno (desde Stitch)

| Token            | Valor        |
| ---------------- | ------------ |
| Color primario   | `#0f49bd`    |
| Color acento     | `#facc15`    |
| Color emergencia | `#dc2626`    |
| Fuente           | Public Sans  |
| Roundness        | 8px          |
| Modo             | Light (dark opcional) |

---

## 4. Modulos funcionales (basado en 57 pantallas de Stitch)

### 4.1 Mapa de modulos

| Modulo       | Pantallas Stitch | Usuarios              | Estado codigo actual   |
| ------------ | ---------------- | --------------------- | ---------------------- |
| Home         | 2                | Ciudadano             | Parcial — rediseñar    |
| Transporte   | 9                | Ciudadano             | No existe              |
| Servicios    | 25               | Ciudadano + Operador  | No existe (Restaurantes + Tiendas + Mandados como categorias) |
| Billetera    | 8                | Ciudadano             | No existe              |
| Mascotas     | 2                | Ciudadano             | No existe              |
| SOS          | 1                | Ciudadano             | No existe              |
| Perfil       | 1                | Ciudadano             | Parcial — ampliar      |
| Driver App   | 7                | Conductor             | No existe              |
| Super Admin     | 1             | SUPER_ADMIN           | Parcial (web-admin)    |

---

## 5. Navegacion principal

### 5.1 Bottom Navigation — App Ciudadano

```
[ Inicio ] [ Servicios ] [ Comunidad ] [ Perfil ]
```

Donde:
- **Inicio** — Hub principal con todos los modulos
- **Servicios** — Transporte, Restaurantes, Tiendas, Mandados
- **Comunidad** — SOS, Mascotas, Reportes de incidencias
- **Perfil** — Cuenta, Billetera, Historial

### 5.2 Bottom Navigation — Driver Partner

```
[ Inicio ] [ Pagos ] [ Rutas ] [ Perfil ]
```

### 5.3 Web Admin — Super Admin Panel

```
Acceso web: /web-admin — autenticacion con rol SUPER_ADMIN
Secciones: Panel | Conductores | Viajes | Transacciones | Ajustes
```

---

## 6. Descripcion funcional por modulo

### 6.1 Home — Pantalla principal ciudadano

**Pantallas Stitch:** `MuniGo Home Screen Official` (0aa38bea), `MuniGo Home Screen` (f1c02877)

**Elementos UI:**
- Header: logo MuniGo, ubicacion actual ("Canoas de Punta Sal"), campana de notificaciones
- Saludo personalizado: "Hola, Vanessa"
- Barra de busqueda: "¿Que necesitas hoy en Canoas?"
- 6 iconos de modulos: Transporte, Restaurantes, Tiendas, Mandados, Mascotas, Billetera
- Banner informativo del municipio (ej: "Nuevos horarios de recoleccion")
- Card "Adopta un amigo" — enlace rapido a mascotas
- Boton de panico / SOS visible
- Bottom navigation

**Requerimientos:**
- FR-HOME-001: Detectar y mostrar ubicacion del usuario al cargar
- FR-HOME-002: Mostrar modulos de servicio disponibles segun municipio activo
- FR-HOME-003: Mostrar banners de comunicados municipales configurables
- FR-HOME-004: Acceso rapido al SOS desde home

**Gap vs codigo actual:** HomeScreen.tsx tiene hero image + stats de reportes + FAB. Debe ser completamente rediseñado.

---

### 6.2 Modulo Transporte (Mototaxi)

**Pantallas Stitch:** 9 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Mototaxi Transport Booking | 667d662f | Solicitud: mapa, tipos, tarifa, pago |
| MuniGo Trip Confirmation | 32b72ddf | Confirmacion previa al viaje |
| Confirmacion de Viaje MuniGo | 598ad4f8 | Variante de confirmacion |
| MuniGo Active Trip Tracking | d7c8686f | Tracking en vivo del conductor |
| MuniGo Viaje en Curso Tracking | 8b3419ee | Variante de tracking |
| Detalle de viaje MuniGo | 15637bae | Detalle durante viaje |
| Detalle de viaje Completo MuniGo | a4873ca9 | Detalle expandido |
| MuniGo Viaje Finalizado Resumen | 5c144018 | Resumen al completar |
| Historial de viajes MuniGo | 2056d7c2 | Lista de viajes pasados |

**Flujo ciudadano:**
```
Home → Transporte → Booking (origen/destino + tipo + pago) →
Confirmacion → Tracking en vivo → Resumen final → Calificacion
```

**Elementos UI clave (Booking Screen):**
- Mapa con origen y destino
- Opcion Standard: S/ 5.00, "Economico • 3 min de espera"
- Opcion Premium: S/ 8.00, "Extra espacio • 5 min de espera"
- Metodo de pago: Billetera MuniGo (UNICO — sin efectivo, plataforma escrow)
- Campo de cupon de descuento
- CTA: "Solicitar Mototaxi"

**Requerimientos:**
- FR-TRANS-001: Seleccion de punto de origen y destino con mapa
- FR-TRANS-002: Mostrar tipo de mototaxi disponible con tarifa y tiempo estimado
- FR-TRANS-003: Seleccionar metodo de pago (efectivo o billetera)
- FR-TRANS-004: Tracking en tiempo real del conductor asignado via WebSocket
- FR-TRANS-005: Historial de viajes con detalle (distancia, tarifa, hora, conductor)
- FR-TRANS-006: Calificacion del conductor al finalizar el viaje

**Gap vs codigo actual:** Modulo completamente inexistente. Requiere servicio transport en backend + WebSockets + integracion de mapas.

---

### 6.3 Modulo Restaurantes (Food Delivery)

**Pantallas Stitch:** 13 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Restaurantes en Cancas MuniGo | 1dee6916 | Listado con categorias |
| Menu del Restaurante MuniGo | ed221a34 | Carta con items y precios |
| Detalle de Pedido Restaurante MuniGo | 6e30f273 | Resumen del pedido |
| Confirmacion de pedido MuniGo Food | 4ba21c24 | Confirmacion checkout |
| Pedido en Preparacion Restaurante MuniGo | 4faf7f9f | Estado: preparando |
| Pedido Listo para Repartidor MuniGo | c8427bcd | Estado: listo |
| Seguimiento de Pedido MuniGo Food | 9e74a80b | Tracking de entrega |
| Pedido Entregado Restaurante MuniGo | bcb312dc | Confirmacion entrega (ciudadano) |
| Pedido Entregado MuniGo Food | 7aa3e71c | Confirmacion entrega (variante) |
| Cancelar Pedido MuniGo Food V2 | 6faef740 | Flujo de cancelacion |
| Panel de Restaurante MuniGo | 52cef1f8 | Dashboard operador restaurante |
| Retiro Procesado Restaurante MuniGo | 350f6893 | Confirmacion de retiro |
| Retirar Saldo Restaurante MuniGo | 07f6329c | Retiro de ganancias del operador |

**Flujo ciudadano:**
```
Home → Restaurantes → Menu → Carrito → Confirmacion →
Estado (Preparando → Listo → En camino) → Entregado
```

**Flujo operador restaurante:**
```
Panel → Pedidos entrantes → Aceptar/Preparar → Marcar listo →
Gestionar retiro de ganancias a cuenta bancaria
```

**Requerimientos:**
- FR-FOOD-001: Listado de restaurantes disponibles con fotos, categorias y horarios
- FR-FOOD-002: Menu con items, precios, fotos y disponibilidad por horario
- FR-FOOD-003: Carrito de compras con modificacion de cantidades y subtotales
- FR-FOOD-004: Seguimiento del estado del pedido en tiempo real (4 estados)
- FR-FOOD-005: Panel del operador para ver y gestionar pedidos entrantes
- FR-FOOD-006: Retiro de ganancias del restaurante a cuenta bancaria vinculada
- FR-FOOD-007: Calificacion del restaurante al recibir el pedido

**Gap vs codigo actual:** Modulo completamente inexistente.

---

### 6.4 Modulo Tiendas / SIAR Marketplace

**Pantallas Stitch:** 7 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Tiendas en Cancas MuniGo Marketplace | b48203df | Listado de tiendas |
| Productos de la Tienda MuniGo SIAR | d08b93cc | Catalogo de productos |
| Carrito de Compras MuniGo | 02b05c07 | Carrito general |
| Carrito de Tienda MuniGo SIAR | 634c9e2f | Carrito especifico tienda |
| Confirmar Compra Tienda MuniGo SIAR | f584309f | Checkout |
| Seguimiento de Compra MuniGo SIAR | ee22d1b8 | Tracking de entrega |
| Compra Entregada Tienda MuniGo SIAR | f69acdbf | Confirmacion entrega |

**Flujo:**
```
Home → Tiendas → Seleccionar tienda → Catalogo → Agregar al carrito →
Checkout → Tracking → Entregado
```

**Requerimientos:**
- FR-SHOP-001: Listado de tiendas locales categorizadas
- FR-SHOP-002: Catalogo de productos con fotos, precio y disponibilidad
- FR-SHOP-003: Carrito con calculo de total, modificacion de cantidades
- FR-SHOP-004: Checkout con confirmacion de direccion de entrega y metodo de pago
- FR-SHOP-005: Seguimiento del estado de entrega

**Gap vs codigo actual:** Modulo completamente inexistente.

---

### 6.5 Modulo Mandados (Te hago un favor)

**Pantallas Stitch:** 5 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Te Hago Un Favor MuniGo Mandados | 9a881bb4 | Tipos de mandado disponibles |
| Solicitar Favor Mandado MuniGo | 3437b638 | Formulario de solicitud |
| Confirmar Favor Mandado MuniGo Detallado | dd7439f4 | Confirmacion detallada con precio |
| Favor en Curso MuniGo Tracking | fb569c6a | Seguimiento en tiempo real |
| Favor Completado MuniGo Resumen | 82ec46ba | Resumen y calificacion |

**Flujo:**
```
Home → Mandados → Tipo → Detalle solicitud → Cotizacion → Confirmar →
Tracking → Completado + Calificacion
```

**Requerimientos:**
- FR-MAND-001: Menu de tipos de mandado (compras, tramites, envios, etc.)
- FR-MAND-002: Formulario de solicitud con descripcion e instrucciones
- FR-MAND-003: Cotizacion del servicio antes de confirmar
- FR-MAND-004: Tracking del mandadero asignado en tiempo real
- FR-MAND-005: Confirmacion de completado y calificacion del servicio

**Gap vs codigo actual:** Modulo completamente inexistente.

---

### 6.6 Modulo Billetera Digital

**Pantallas Stitch:** 8 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Mi Billetera MuniGo | 0beec487 | Vista principal de saldo |
| Mi Billetera MuniGo (variante) | 746c8a0e | Variante de saldo |
| Mi Billetera MuniGo Detallada | c22c3f97 | Vista expandida con historial |
| Recargar saldo MuniGo | a9e05335 | Flujo de recarga |
| Retirar saldo MuniGo Detallado | c7e185c9 | Flujo de retiro |
| Retiro Exitoso MuniGo | 75f386be | Confirmacion de retiro |
| Mi Cuenta Bancaria MuniGo | c99726b7 | Gestion de cuenta bancaria |
| Reporte Mensual Financiero MuniGo | b9e219bb | Reporte del mes |

**Elementos UI clave:**
- Saldo disponible: "S/ 125.40" (Juan Perez Mendoza)
- Acciones principales: Recarga | Retiro bancario
- Metodo de pago vinculado: Visa terminada en 1234 (09/26)
- Historial de movimientos: "Pago Mototaxi -S/4.50", "Recarga MuniGo +S/20.00"
- Historial de retiros: 02/03/2026 S/100.00, 28/02/2026 S/80.00

**Requerimientos:**
- FR-WALL-001: Ver saldo disponible en soles peruanos con actualizacion en tiempo real
- FR-WALL-002: Recargar saldo via Yape, Plin o tarjeta bancaria
- FR-WALL-003: Historial de transacciones con tipo, monto, fecha y estado
- FR-WALL-004: Vincular cuenta bancaria para retiros (numero de cuenta, CCI)
- FR-WALL-005: Solicitar retiro a cuenta bancaria — procesado en 24-48h
- FR-WALL-006: Reporte mensual descargable de movimientos
- FR-WALL-007: Saldo se descuenta automaticamente al pagar servicios MuniGo

**Gap vs codigo actual:** Modulo completamente inexistente. Requiere nuevo microservicio `wallet` en backend.

---

### 6.7 Modulo Mascotas (Pet Adoption)

**Pantallas Stitch:** 2 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| MuniGo Pet Adoption List | add2fbd0 | Listado de mascotas en adopcion |
| Pet Adoption Detail Screen | dbce4dcb | Detalle de mascota |

**Requerimientos:**
- FR-PETS-001: Listado de mascotas disponibles para adopcion con foto, nombre y edad
- FR-PETS-002: Detalle de mascota con foto, edad, raza, descripcion y estado de vacunacion
- FR-PETS-003: Formulario de solicitud de adopcion con datos del adoptante

**Gap vs codigo actual:** Modulo completamente inexistente.

---

### 6.8 Modulo SOS / Centro de Emergencias

**Pantalla Stitch:** `SOS and Emergency Center` (8f52474d)

**Elementos UI:**
- Boton principal rojo: "Pressing the button below will alert local police and serenazgo to your current location"
- Contactos rapidos:
  - Medical & Ambulance: Posta de Salud Regional (tel: 106)
  - Fire Department: Compania de Bomberos (tel: 116)
  - Municipal Support: Citizen Helpline (tel: 0800)
- Mapa con ubicacion GPS activa del usuario
- Estado GPS: Activo / "Punta Sal Beachfront, Canoas"
- Bottom nav con SOS como tab permanente

**Requerimientos:**
- FR-SOS-001: Boton de panico que envia alerta con coordenadas GPS a policia y serenazgo del municipio
- FR-SOS-002: Marcacion directa a numeros de emergencia (106, 116, 0800)
- FR-SOS-003: Mapa mostrando ubicacion actual del usuario
- FR-SOS-004: Acceso al SOS desde cualquier pantalla (tab permanente en navigation)
- FR-SOS-005: Funcionar en modo degradado sin internet (solo marcacion directa)

**Gap vs codigo actual:** Modulo completamente inexistente. La alerta geolocalizada requiere nuevo endpoint en backend.

---

### 6.9 Perfil de Usuario

**Pantalla Stitch:** `MuniGo User Profile Screen` (ae0abfd4)

**Elementos UI:**
- Nombre: "Vanessa Malaga", Telefono: "+51 987 654 321"
- Metodo de pago vinculado: Visa terminada en 1234 (09/26)
- Menu navegable:
  - Historial de viajes
  - Mis pedidos
  - Mis adopciones
  - Soporte y Ayuda
  - Terminos y condiciones
  - Cerrar sesion
- Version app: MuniGo v2.4.0
- Bottom nav: Inicio | Servicios | Reportes | Perfil

**Requerimientos:**
- FR-PROF-001: Ver y editar datos personales (nombre, telefono, foto de perfil)
- FR-PROF-002: Gestion de metodos de pago vinculados (tarjetas, cuentas)
- FR-PROF-003: Acceso a historial de viajes, pedidos de comida/tiendas, adopciones
- FR-PROF-004: Centro de soporte y ayuda in-app
- FR-PROF-005: Acceso rapido a Billetera desde perfil

**Gap vs codigo actual:** ProfileScreen.tsx existe con menu basico. Necesita incorporar historiales de todos los servicios y acceso a billetera.

---

### 6.10 Driver Partner App

**Pantallas Stitch:** 7 pantallas

| Pantalla | Screen ID | Descripcion |
| -------- | --------- | ----------- |
| Driver Partner Dashboard MuniGo | 37622ebe | Panel principal del conductor |
| Driver Partner Panel | f423e61f | Variante del panel |
| Conductores Registrados MuniGo | 11607bb0 | Lista para admin/supervisor |
| Suspender Conductor MuniGo | 13ba99f2 | Accion de suspension |
| Conductor Suspendido MuniGo Confirmacion | 063427de | Confirmacion de suspension |
| Detalle Administrativo Conductor MuniGo | 94e65580 | Vista admin del conductor |
| Detalle Conductor Municipal MuniGo | d1f5e556 | Vista municipal del conductor |

**UI del Dashboard del conductor:**
- Nombre: Carlos Mendoza (ID: 45293)
- CTA principal: "ACTIVAR SERVICIO" (toggle de disponibilidad)
- Ganancias del dia: S/ 85.50 (+15.2% vs ayer)
- Viajes completados: 12
- Calificacion: 4.9 estrellas
- Ultimos viajes: Plaza de Armas, Hotel Punta Sal, Rest. El Velero (con hora, distancia, tarifa)
- Recordatorio Municipal: "carnet de circulacion vigente"
- Bottom nav: Inicio | Pagos | Rutas | Perfil

**Requerimientos:**
- FR-DRIV-001: Toggle de disponibilidad para recibir solicitudes de viaje
- FR-DRIV-002: Dashboard de metricas diarias (ganancias, viajes completados, calificacion)
- FR-DRIV-003: Recepcion y aceptacion de solicitudes de viaje en tiempo real
- FR-DRIV-004: Navegacion GPS de punto A a punto B
- FR-DRIV-005: Historial de pagos y solicitud de retiro de ganancias
- FR-DRIV-006: Visualizacion de requisitos municipales vigentes (documentacion)
- FR-DRIV-007: Perfil del conductor con calificacion acumulada

**Implementacion:** Perfil separado dentro del mismo repo Expo, condicionado por rol DRIVER en JWT.

**Gap vs codigo actual:** Completamente inexistente.

---

### 6.11 Super Admin Panel

**Pantalla Stitch:** `Panel Municipal Control MuniGo` (465531281) — web-admin React SPA

**Elementos UI:**
- Metricas en cards:
  - Conductores activos hoy: 28 (+4%)
  - Viajes realizados hoy: 146 (+12%)
  - Transacciones digitales: S/ 3,450
  - Comision acumulada: S/ 345
- Mapa "Vivo" con iconos de conductores geolocalizados en Canoas de Punta Sal
- Estado del sistema: Operativo ACTIVO | Pagos digitales ACTIVO
- Ultima actualizacion: Hoy 08:45 am
- Bottom nav: Panel | Conductores | Viajes | Ajustes

**Requerimientos:**
- FR-MUN-001: Metricas en tiempo real de actividad del sistema (conductores, viajes, transacciones)
- FR-MUN-002: Mapa con posiciones geolocalizadas de conductores activos
- FR-MUN-003: Estado en tiempo real de subsistemas (transporte, pagos, notificaciones)
- FR-MUN-004: Gestion de conductores: listar, ver detalle, suspender, reactivar
- FR-MUN-005: Historial de viajes con filtros por fecha, conductor y estado
- FR-MUN-006: Panel accesible via web-admin (React SPA), rol SUPER_ADMIN requerido

**Gap vs codigo actual:** web-admin actual tiene gestion basica de reportes. Requiere refactor completo + expansion a transporte y conductores.

---

## 7. Arquitectura tecnica objetivo

### 7.1 Estructura de navegacion — App Citizen

```
RootStack
├── Auth (Stack)
│   ├── WelcomeScreen
│   ├── LoginScreen
│   └── RegisterScreen
└── MainApp (BottomTabs: Inicio | Servicios | Comunidad | Perfil)
    ├── Inicio
    │   └── HomeScreen
    ├── Servicios (Stack)
    │   ├── ServicesMenuScreen
    │   ├── Transport (Stack)
    │   │   ├── BookingScreen
    │   │   ├── TripConfirmationScreen
    │   │   ├── TripTrackingScreen
    │   │   ├── TripSummaryScreen
    │   │   └── TripHistoryScreen
    │   ├── Food (Stack)
    │   │   ├── RestaurantListScreen
    │   │   ├── RestaurantMenuScreen
    │   │   ├── OrderCartScreen
    │   │   ├── OrderConfirmationScreen
    │   │   ├── OrderTrackingScreen
    │   │   └── OrderDeliveredScreen
    │   ├── Shops (Stack)
    │   │   ├── StoreListScreen
    │   │   ├── StoreProductsScreen
    │   │   ├── ShoppingCartScreen
    │   │   ├── PurchaseConfirmationScreen
    │   │   └── PurchaseTrackingScreen
    │   └── Mandados (Stack)
    │       ├── MandadosMenuScreen
    │       ├── MandadoRequestScreen
    │       ├── MandadoConfirmationScreen
    │       ├── MandadoTrackingScreen
    │       └── MandadoSummaryScreen
    ├── Comunidad (Stack)
    │   ├── SOSScreen
    │   └── Mascotas (Stack)
    │       ├── PetListScreen
    │       └── PetDetailScreen
    └── Perfil (Stack)
        ├── ProfileScreen
        └── Wallet (Stack)
            ├── WalletScreen
            ├── WalletRechargeScreen
            ├── WalletWithdrawScreen
            └── WalletBankAccountScreen
```

### 7.2 Estructura de navegacion — Driver App

Activada cuando el JWT contiene `role: DRIVER`:
```
DriverApp (BottomTabs: Inicio | Pagos | Rutas | Perfil)
├── DriverDashboardScreen
├── DriverPaymentsScreen
├── DriverRoutesScreen
└── DriverProfileScreen
```

### 7.3 Microservicios backend — estado objetivo

| Servicio       | Puerto | Estado actual           | Cambios necesarios                    |
| -------------- | ------ | ----------------------- | ------------------------------------- |
| gateway        | 8080   | Funcional               | Agregar rutas nuevos servicios        |
| identity       | 4001   | Funcional               | Agregar roles DRIVER, OPERATOR        |
| reports        | 4002   | Bug: shared/auth        | Fix bug; ampliar modulo Comunidad     |
| geo            | 4003   | Funcional basico        | Mejorar con PostGIS real              |
| notifications  | 4004   | Funcional               | Integrar FCM para push real           |
| **transport**  | 4005   | Por crear               | Viajes, matching, estados, WebSocket  |
| **wallet**     | 4006   | Por crear               | Saldos, recargas, retiros, historial  |
| **catalog**    | 4007   | Por crear               | Restaurantes, tiendas, productos      |
| **orders**     | 4008   | Por crear               | Pedidos food + tiendas, estados       |
| **mandados**   | 4009   | Por crear               | Solicitudes y tracking de favores     |
| **pets**       | 4010   | Por crear               | Adopciones municipales                |
| **sos**        | 4011   | Por crear               | Alertas de emergencia geolocalizada   |

### 7.4 Roles de usuario

| Rol        | Descripcion                                     |
| ---------- | ----------------------------------------------- |
| CITIZEN    | Ciudadano general — consume todos los servicios |
| DRIVER     | Conductor partner — provee transporte           |
| OPERATOR   | Operador de restaurante o tienda local          |
| SUPER_ADMIN | Administrador total del sistema — acceso web-admin completo |

### 7.5 Modelo de pagos y anti-fraude

**Regla fundamental:** TODOS los pagos son digitales. No existe opcion de efectivo en ninguna pantalla.

**PSP:** Culqi (Peru) — unico gateway de tarjetas de credito/debito.

**Modelo Escrow:**
```
Ciudadano paga (debita billetera)
       ↓
Plataforma retiene en ESCROW
       ↓
Servicio completado y confirmado
       ↓
Plataforma libera al partner (monto - comision)
```

**Regla anti-fraude:** NUNCA hay transferencia directa cliente ↔ partner. Todo flujo de dinero pasa por el microservicio wallet con audit trail inmutable (tabla `wallet_transactions` es APPEND ONLY — nunca se borra).

**Comision plataforma:** 10% por defecto (configurable via `PLATFORM_FEE_PERCENT`).

**Tablas wallet:**
- `wallets(user_id, balance, currency)` — saldo por usuario
- `wallet_transactions(id, user_id, type, amount, balance_after, ...)` — audit trail
- `escrow_holds(id, payer_id, beneficiary_id, amount, platform_fee, net_amount, status)` — retenciones

**Estados escrow:** `HELD` → `RELEASED` (servicio completado) | `REFUNDED` (cancelacion)

---

## 8. Estado del codigo actual vs. diseños Stitch

### 8.1 Pantallas existentes a rediseñar

| Archivo actual          | Cambio necesario segun Stitch                       | Prioridad |
| ----------------------- | --------------------------------------------------- | --------- |
| `HomeScreen.tsx`        | Rediseño completo: 6 modulos + banner + SOS rapido  | P0        |
| `ProfileScreen.tsx`     | Agregar historial viajes/pedidos/adopciones + wallet| P1        |
| `ReportsScreen.tsx`     | Renombrar + integrar en modulo Comunidad            | P2        |
| `CreateReportScreen.tsx`| Integrar en Comunidad rediseñado                    | P2        |

### 8.2 Pantallas existentes que se mantienen con ajustes menores

| Archivo actual          | Estado                                              |
| ----------------------- | --------------------------------------------------- |
| `WelcomeScreen.tsx`     | Mantener con nuevo branding (#0f49bd, Public Sans)  |
| `LoginScreen.tsx`       | Mantener — agregar opcion "¿Eres conductor?"        |
| `RegisterScreen.tsx`    | Mantener — agregar campo rol al registrarse         |

### 8.3 Bugs a resolver antes de comenzar nuevas features

1. **reports/server.js** require `shared/auth` que no existe — usar `shared/jwt`
2. **theme.ts** color primario es `#135bec` — actualizar a `#0f49bd` segun Stitch
3. **web-admin** no tiene auth por roles — agregar autorizacion SUPER_ADMIN

---

## 9. Criterios de aceptacion

```gherkin
Scenario: Ciudadano abre la app y ve el home rediseñado
  Given el ciudadano esta autenticado
  When abre la app
  Then ve el home con 6 iconos de modulos
  And su ubicacion aparece como "Canoas de Punta Sal"
  And hay un banner municipal activo

Scenario: Ciudadano solicita mototaxi
  Given el ciudadano esta en la pantalla de booking
  When selecciona Standard (S/5.00) y pago por Billetera
  And presiona "Solicitar Mototaxi"
  Then se asigna un conductor disponible
  And el mapa muestra la posicion del conductor en tiempo real via WebSocket

Scenario: Ciudadano recarga su billetera
  Given el ciudadano tiene saldo S/ 20.00
  When recarga S/ 50.00
  Then el saldo se actualiza a S/ 70.00
  And aparece el movimiento "+S/50.00 Recarga" en el historial

Scenario: Ciudadano activa SOS
  Given el ciudadano presiona el boton de panico
  Then se envia alerta con GPS a policia y serenazgo del municipio
  And se muestra "Alerta enviada — Ayuda en camino"

Scenario: Conductor activa su disponibilidad
  Given el conductor tiene rol DRIVER
  When presiona "ACTIVAR SERVICIO" en su dashboard
  Then su estado cambia a disponible
  And empieza a recibir solicitudes de viaje cercanas

Scenario: Supervisor revisa actividad del dia
  Given el supervisor tiene rol SUPER_ADMIN
  When abre el Panel Municipal
  Then ve en tiempo real: conductores activos, viajes del dia, transacciones
  And puede ver el mapa con posiciones de conductores activos
```

---

## 10. Requerimientos no funcionales

| NFR             | Objetivo                                                      |
| --------------- | ------------------------------------------------------------- |
| Latencia        | p95 < 300ms en lecturas; WebSocket tracking < 500ms           |
| Disponibilidad  | > 99.9% en servicios criticos (transport, SOS, wallet)        |
| Seguridad       | JWT 15min + refresh rotation; TLS 1.2+; rate limiting activo  |
| Escalabilidad   | 5,000 req/min; arquitectura multi-municipio lista             |
| Offline         | SOS y llamadas directas funcionan sin conexion a internet     |
| Maps            | Google Maps o Mapbox para booking y tracking                  |
| Pagos           | Integracion Yape / Plin / Visa / MC para recargas de billetera|
| Push            | FCM (Android) + APNs (iOS) para estados de pedidos y viajes   |
| Cobertura tests | >= 80% en servicios criticos                                  |

---

## 11. Backlog priorizado

### P0 — Fundaciones (prerequisitos de todo lo demas)

1. **Fix bug reports service** — `shared/auth` → `shared/jwt`
2. **Actualizar design tokens** — color primario a `#0f49bd`, Public Sans en theme.ts
3. **Rediseñar HomeScreen** — nuevo hub con 6 modulos segun diseño Stitch
4. **Agregar roles DRIVER y OPERATOR** a identity service + seeds
5. **Crear microservicio wallet** — saldo, recargas, movimientos, retiros

### P1 — Modulo Transporte (primer modulo productivo completo)

6. **Crear microservicio transport** — viajes, matching, estados, WebSocket
7. **BookingScreen** — mapa, tipos de mototaxi, metodo de pago
8. **TripTrackingScreen** — seguimiento en tiempo real con WebSocket
9. **DriverDashboardScreen** — toggle disponibilidad + metricas diarias
10. **Driver flow completo** — aceptar viaje, navegar, completar, cobrar

### P2 — Modulo Restaurantes

11. **Crear microservicio catalog** — restaurantes, menus, disponibilidad
12. **Crear microservicio orders** — pedidos, estados, notificaciones push
13. **Flujo ciudadano completo** — listado → menu → carrito → tracking → entregado
14. **Panel operador restaurante** — pedidos entrantes y retiros

### P3 — Tiendas + Mandados + Mascotas + SOS

15. **SIAR Marketplace** — tiendas locales, catalogo, carrito, checkout, tracking
16. **Modulo Mandados** — solicitudes, cotizacion, tracking
17. **Modulo Mascotas** — listado, detalle, solicitud adopcion
18. **SOSScreen** — boton panico + contactos rapidos + mapa GPS

### P4 — Panel Municipal + Finanzas + Web Admin

19. **Panel Municipal Mobile** — metricas en tiempo real, mapa conductores, gestion
20. **Refactor web-admin** — React SPA con autorizacion por roles
21. **Reportes financieros** — conductores, operadores de restaurantes/tiendas
22. **Billetera completa** — recargas reales (Yape/Plin), retiros, reporte mensual

---

## 12. Trazabilidad diseño Stitch → codigo objetivo

| Pantalla Stitch                        | Screen ID Stitch                   | Archivo codigo objetivo                          |
| -------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| MuniGo Home Screen Official            | 0aa38beab7be47f3b41e5f132bc6a9e5   | `src/screens/HomeScreen.tsx` (rediseñar)         |
| Mototaxi Transport Booking             | 667d662ff78a479590710c4af1282932   | `src/screens/transport/BookingScreen.tsx`        |
| MuniGo Active Trip Tracking            | d7c8686f01ef4e1aa7d1a201c86db791   | `src/screens/transport/TrackingScreen.tsx`       |
| MuniGo Viaje Finalizado Resumen        | 5c144018d9cf42fd975f2593c2da0612   | `src/screens/transport/TripSummaryScreen.tsx`    |
| Historial de viajes MuniGo             | 2056d7c2f22843a6b2a095e6fd5619d5   | `src/screens/transport/TripHistoryScreen.tsx`    |
| Restaurantes en Cancas MuniGo          | 1dee691630d4417a948a7160ab864330   | `src/screens/food/RestaurantListScreen.tsx`      |
| Menu del Restaurante MuniGo            | ed221a344b9b4155885c513d9efcfd4b   | `src/screens/food/RestaurantMenuScreen.tsx`      |
| Seguimiento de Pedido MuniGo Food      | 9e74a80b979645349622fbb75b7ff239   | `src/screens/food/OrderTrackingScreen.tsx`       |
| Tiendas en Cancas MuniGo Marketplace   | b48203df5bd44e1c90d55b9434a188e8   | `src/screens/shops/StoreListScreen.tsx`          |
| Carrito de Compras MuniGo              | 02b05c07fb9e41aea0e4381f2b91a516   | `src/screens/shops/ShoppingCartScreen.tsx`       |
| Te Hago Un Favor MuniGo Mandados       | 9a881bb4b32542fdab6a9b0622177750   | `src/screens/mandados/MandadosMenuScreen.tsx`    |
| Favor en Curso MuniGo Tracking         | fb569c6a060b47049eec4d7b78b3d31e   | `src/screens/mandados/MandadoTrackingScreen.tsx` |
| Mi Billetera MuniGo                    | 0beec487f79e446692ba5bffee0c766b   | `src/screens/wallet/WalletScreen.tsx`            |
| Recargar saldo MuniGo                  | a9e05335155141ae9b0a265e6136bb50   | `src/screens/wallet/WalletRechargeScreen.tsx`    |
| Retirar saldo MuniGo Detallado         | c7e185c9be0f4114a8c0f0dc107c62b6   | `src/screens/wallet/WalletWithdrawScreen.tsx`    |
| SOS and Emergency Center               | 8f52474d4b184f7da927fd8c5e657b32   | `src/screens/sos/SOSScreen.tsx`                  |
| MuniGo Pet Adoption List               | add2fbd0d9134a5585c1617b5b781688   | `src/screens/pets/PetListScreen.tsx`             |
| Pet Adoption Detail Screen             | dbce4dcbf37a428688a5567944cdefb8   | `src/screens/pets/PetDetailScreen.tsx`           |
| MuniGo User Profile Screen             | ae0abfd428a44c27ac115c305df23919   | `src/screens/ProfileScreen.tsx` (ampliar)        |
| Driver Partner Dashboard MuniGo        | 37622ebe320b40e08bd930c3994798be   | `src/screens/driver/DriverDashboardScreen.tsx`   |
| Panel Municipal Control MuniGo         | 465531281c324764aa8df56cb6ae711f   | `src/screens/municipal/PanelScreen.tsx`          |

---

---

## 13. Modelo de negocio y monetizacion

> Esta seccion es FUENTE DE VERDAD para cualquier agente que construya logica de comisiones, onboarding de partners o configuracion de tarifas.

### 13.0 Estrategia go-to-market — modelo hibrido (DECISION CONFIRMADA)

MuniGo no vende exclusivamente a municipios ni opera exclusivamente directo. El modelo es **hibrido**:

```
NIVEL 1 — Municipalidad (cliente institucional):
  - Paga licencia anual por territorio exclusivo (~S/ 3,600-18,000/año segun tier)
  - Recibe app con su branding: "MuniGo Canoas de Punta Sal"
  - INCENTIVO: Recibe X% de las comisiones generadas en su territorio
  - SU ROL: Promover la app a ciudadanos, mototaxistas y comercios locales
  - Ciclo de venta: directo con alcalde / gerente municipal

NIVEL 2 — Partners (conductores, comercios, mandaderos):
  - Se registran en la plataforma (onboarding digital)
  - Pagan suscripcion mensual (comercios) o no pagan nada por registro (conductores)
  - MuniGo toma comision de cada transaccion completada

NIVEL 3 — Ciudadanos:
  - Uso gratuito de la app
  - Solo pagan los servicios que consumen via Billetera MuniGo

RESULTADO: La Municipalidad tiene incentivo economico para promover —
a mas viajes y pedidos en su territorio, mas ingresos recibe.
```

**Tiers de licencia municipal:**

| Tier       | Conductores | Comercios | Ciudadanos | Precio anual | % comision municipio |
|------------|-------------|-----------|------------|--------------|----------------------|
| Basico     | hasta 30    | hasta 10  | ilimitado  | S/ 3,600     | 2% de comisiones     |
| Pro        | hasta 150   | hasta 50  | ilimitado  | S/ 10,800    | 3% de comisiones     |
| Enterprise | ilimitado   | ilimitado | ilimitado  | S/ 18,000+   | 5% de comisiones     |

### 13.1 Flujos de ingreso de la plataforma

MuniGo opera como intermediario entre ciudadanos y tres tipos de partners: **conductores**, **comercios** (restaurantes y tiendas) y **mandaderos**.

```
RESUMEN DE INGRESOS:
  1. Licencia anual por municipio (SaaS territorial)
  2. Comision por viaje (transporte mototaxi)
  3. Comision por orden (food delivery + tiendas + mandados)
  4. Suscripcion mensual de comercios (restaurantes y tiendas)
```

### 13.2 Estructura de comisiones por modulo

#### Transporte (Mototaxi)

| Concepto             | Valor        | Configurable         |
|----------------------|--------------|----------------------|
| Tarifa standard      | S/ 5.00      | Si — tabla `fares`   |
| Tarifa premium       | S/ 8.00      | Si — tabla `fares`   |
| Comision plataforma  | 15%          | Si — `platform_config` |
| Conductor recibe     | 85%          | Derivado automaticamente |
| Metodo de pago       | Solo Billetera MuniGo | No hay efectivo |

**Flujo del dinero:**
```
Ciudadano paga S/ 5.00 (debita billetera)
       ↓
Escrow retiene S/ 5.00
       ↓
Viaje completado y confirmado
       ↓
Plataforma retiene S/ 0.75 (15%)
Conductor recibe S/ 4.25 (85%) — liberado del escrow
```

#### Food Delivery (Restaurantes)

| Concepto                 | Valor         | Configurable          |
|--------------------------|---------------|-----------------------|
| Suscripcion mensual      | S/ 150/mes    | Si — por segmento     |
| Comision por orden       | 12% del subtotal | Si — `platform_config` |
| Delivery fee al ciudadano| S/ 3.00       | Si — por tienda       |
| Delivery fee va a        | Repartidor (100%) | No |
| Restaurante recibe       | Subtotal - 12% | Derivado              |

**Ejemplo:**
```
Orden: 2x Ceviche (S/ 18) + envío S/ 3 = ciudadano paga S/ 21
MuniGo cobra: 12% de S/ 18 = S/ 2.16
Repartidor recibe: S/ 3.00
Restaurante recibe: S/ 15.84
```

#### Tiendas / SIAR Marketplace

Mismo modelo que restaurantes. `source_type: STORE` en el microservicio orders.

#### Mandados (Te hago un favor)

| Concepto             | Valor       | Configurable          |
|----------------------|-------------|-----------------------|
| Tarifa COMPRAS       | S/ 8.00     | Si — tabla `fares`    |
| Tarifa TRAMITE       | S/ 10.00    | Si — tabla `fares`    |
| Tarifa MENSAJERIA    | S/ 6.00     | Si — tabla `fares`    |
| Tarifa OTRO          | S/ 8.00     | Si — tabla `fares`    |
| Comision plataforma  | 20%         | Si — `platform_config` |
| Mandadero recibe     | 80%         | Derivado              |

#### Licencia por municipio

Ver tabla en seccion 13.0. El precio incluye branding personalizado y % de comisiones del territorio.

### 13.2b Modelo de formalizacion de mototaxistas — SUNAT (DECISION CONFIRMADA)

Este es el diferenciador estrategico mas importante de MuniGo frente a cualquier competidor informal.

**El problema que resuelve:**
- Los mototaxistas en Peru operan en informalidad total
- SUNAT pierde recaudacion de impuestos sobre el movimiento de dinero del sector
- Los mototaxistas no tienen acceso a credito formal, seguro de salud ni jubilacion

**El modelo MuniGo:**
```
1. Mototaxista se registra en MuniGo como "conductor partner"
2. MuniGo actua como OPERADOR FORMAL ante SUNAT
3. Cada viaje genera un COMPROBANTE ELECTRONICO SUNAT (boleta electronica)
   emitido por MuniGo (con su RUC)
4. MuniGo retiene y paga:
   - IGV (18%) sobre los servicios de la plataforma (la comision de MuniGo)
   - Renta de cuarta categoria del conductor (si aplica segun monto)
5. El conductor recibe recibo por honorarios electronico o planilla
6. La Municipalidad puede reportar a SUNAT la formalizacion del sector
```

**IMPORTANTE — Entidad reguladora:**
> La entidad recaudadora de impuestos en Peru es **SUNAT**
> (Superintendencia Nacional de Aduanas y de Administracion Tributaria).
> Nunca referirse como "ZUNAT" en documentacion o comunicaciones.

**Implicaciones tecnicas:**
- MuniGo necesita integracion con la **API de Facturacion Electronica de SUNAT** (OSE/PSE)
- Cada `trip` completado genera un comprobante electronico con:
  - RUC de MuniGo como emisor
  - DNI del ciudadano como receptor (opcional — puede ser boleta sin cliente)
  - Detalle: "Servicio de transporte en mototaxi"
  - Monto, IGV, fecha
- Los conductores deben tener DNI verificado en el sistema
- MuniGo debe inscribirse en SUNAT con el regimen tributario apropiado

**Marco legal aplicable:**
- Ley N° 27181 — Ley General de Transporte y Transito Terrestre
- Decreto Supremo N° 017-2009-MTC — Reglamento Nacional de Administracion de Transporte
- Reglamentos municipales de mototaxis (cada municipio regula localmente)
- Resolucion de Superintendencia N° 097-2012/SUNAT (comprobantes electronicos)
- Marco de plataformas digitales de transporte (en evolucion en Peru, verificar vigencia)

> **CRITICO:** Antes de lanzar en cualquier municipio, validar con un abogado especializado
> en transporte y tributario peruano que el modelo cumple con la normativa vigente.

---

### 13.2c Calculo de tarifa de mototaxi

Las mototaxis en Peru tienen tradicion de tarifa fija por zona, no por km como Uber.
El modelo recomendado combina ambos enfoques para ser justo y configurable.

**Modelo de calculo (a implementar):**

```
OPCION A — Zonas (MVP, recomendado para lanzamiento):
  El Super Admin define zonas geograficas (poligonos)
  Cada par de zonas tiene una tarifa:
    Zona Centro → Zona Centro: S/ 5.00
    Zona Centro → Zona Playa: S/ 8.00
    Zona Centro → Fuera del Distrito: S/ 12.00
  El ciudadano ve el precio exacto antes de confirmar

OPCION B — Distancia + base (para expansion):
  Tarifa base: S/ 3.00 (primeros 500m incluidos)
  + S/ 0.80 por km adicional
  Minimo cobro: S/ 5.00
  Nocturno (10pm - 5am): +20% recargo
  El sistema calcula con coordenadas GPS del origen y destino estimado

OPCION C — Tiempo + distancia (como Uber — para mercados mas grandes):
  No recomendado para MVP en zonas rurales/semiurbanas peruanas
  Las conexiones GPS pueden ser inestables
```

**Implementacion recomendada:**
- En `platform_config` se define el modelo activo (`fare_model: ZONES | DISTANCE | HYBRID`)
- Para modelo ZONES: tabla `fare_zones(id, municipality_id, name, polygon GEOMETRY, color)`
  y tabla `zone_fares(from_zone_id, to_zone_id, fare, night_fare)`
- El endpoint `/v1/transport/estimate` recibe origen+destino y devuelve tarifa estimada
- La tarifa estimada se muestra en BookingScreen ANTES de confirmar

**DB necesaria (no implementada):**
```sql
fare_zones(
  id UUID PRIMARY KEY,
  municipality_id TEXT NOT NULL,
  name TEXT NOT NULL,
  polygon GEOMETRY(POLYGON, 4326),  -- requiere PostGIS
  created_at TIMESTAMPTZ DEFAULT now()
)

zone_fares(
  from_zone_id UUID REFERENCES fare_zones(id),
  to_zone_id   UUID REFERENCES fare_zones(id),
  fare         NUMERIC(8,2) NOT NULL,
  night_fare   NUMERIC(8,2),
  PRIMARY KEY (from_zone_id, to_zone_id)
)
```

---

### 13.3 Onboarding de partners (flujo de registro de comercios)

Hoy este flujo NO EXISTE en el codigo. Es un gap critico para Fase 5.

**Flujo esperado:**
```
1. Operador descarga app o va a web-admin
2. Selecciona "Registrar mi negocio"
3. Completa formulario:
   - Nombre del negocio
   - Tipo (RESTAURANTE | TIENDA | OTRO)
   - RUC (numero de identificacion fiscal peruano)
   - Direccion y coordenadas GPS
   - Horario de atencion
   - Foto del local / logo
4. Sube documentos: RUC, licencia municipal de funcionamiento
5. Elige plan de suscripcion
6. SUPER_ADMIN revisa y aprueba (flujo de moderacion)
7. Al aprobar: se crea entry en `restaurants` o `stores`, se activa cuenta OPERATOR
8. Operador puede empezar a cargar su catalogo
```

**Entidades de DB necesarias (no implementadas):**
```sql
partner_applications(
  id, applicant_id, business_name, type, ruc,
  address, lat, lng, schedule, logo_url,
  documents JSONB, status [PENDING|APPROVED|REJECTED],
  reviewed_by, reviewed_at, created_at
)

partner_subscriptions(
  id, partner_id, tier, monthly_fee,
  billing_cycle_start, billing_cycle_end,
  status [ACTIVE|PAST_DUE|CANCELLED], created_at
)
```

### 13.4 Gestion de catalogo por el operador

Hoy el catalogo esta hardcodeado como seed en `catalog/server.js`. En produccion, los operadores deben poder gestionar su catalogo desde la app o panel web.

**Funcionalidades del panel de operador (Fase 5-6):**

1. **Agregar producto manual:**
   - Nombre, precio, categoria, descripcion
   - Foto: desde camara del telefono O desde URL externa

2. **Busqueda de imagen en internet:**
   - El operador escribe el nombre del producto
   - El sistema llama a Google Custom Search Image API (o similar)
   - Se muestran 6-8 opciones de imagen para elegir
   - El operador selecciona una, la plataforma la descarga y la almacena en S3/Cloudinary
   - NOTA: La implementacion del buscador de imagenes es opcional en MVP; en MVP el operador puede subir foto desde camara

3. **Editar precios en masa:**
   - Lista de todos los productos con precio editable inline
   - CTA "Guardar cambios" al final

4. **Activar/desactivar productos:**
   - Toggle de disponibilidad por producto (sin eliminarlo)

5. **Ver estadisticas basicas:**
   - Productos mas pedidos
   - Ingreso del dia/semana/mes
   - Pedidos pendientes (ya implementado en RestaurantPanelScreen)

**Endpoints necesarios en catalog service (no implementados):**
```
POST   /v1/catalog/restaurants/:id/menu     — agregar item al menu
PATCH  /v1/catalog/menu/:itemId             — actualizar item
DELETE /v1/catalog/menu/:itemId             — eliminar item
POST   /v1/catalog/stores/:id/products      — agregar producto
PATCH  /v1/catalog/products/:id             — actualizar producto
DELETE /v1/catalog/products/:id             — eliminar producto
GET    /v1/catalog/image-search?q=          — buscar imagen (proxy a Google)
```

### 13.4b Modelo de expansion geografica — UNA sola app para todo el Peru (DECISION CONFIRMADA)

**Decision clave:** MuniGo es UNA SOLA aplicacion con UN SOLO brand para todo el Peru.
NO se crean instancias separadas por municipio. NO hay "MuniGo Piura" ni "MuniGo Cancas" como apps distintas.

**Modelo correcto — analogia Uber/Rappi:**
```
El ciudadano descarga "MuniGo" desde App Store o Play Store
→ La app detecta su ubicacion GPS
→ Muestra los mototaxistas, restaurantes, tiendas y mandaderos
  disponibles CERCA DE EL en este momento
→ Si no hay servicios en su zona: "Proximamente en tu ciudad"
→ Mismo UX en Lima, Piura, Tumbes o cualquier distrito del Peru
```

**Rol del municipio en este modelo:**
- El municipio NO tiene una app propia ni un subdominio propio
- El municipio ES UN SOCIO que promueve MuniGo a sus ciudadanos
- A cambio, recibe un % de las comisiones generadas en su territorio (identificado por GPS)
- El municipio puede ver un reporte de actividad en su zona desde el Super Admin Panel
- No hay personalización de branding por municipio en la app del ciudadano

**Como funciona el municipality_id en la arquitectura:**
```
municipality_id NO es un separador de tenants.
municipality_id es METADATA GEOGRAFICA que se asigna automaticamente
basado en las coordenadas GPS de la transaccion.

Ejemplos de uso:
  trip.municipality_id = 'cancas-punta-sal'   ← asignado por donde ocurrio el viaje
  order.municipality_id = 'cancas-punta-sal'  ← asignado por ubicacion del restaurante

Esto sirve para:
  - Calcular el % de comision que le corresponde al municipio socio
  - Generar reportes de actividad por zona para el Super Admin
  - Reportar formalizacion a SUNAT por zona geografica

NO sirve para:
  - Filtrar datos entre usuarios (un ciudadano de Lima puede pedir en Piura si viaja)
  - Separar instancias de la app
  - Cambiar el branding o la experiencia del usuario
```

**DB: tabla municipalities (solo para reportes y acuerdos comerciales):**
```sql
municipalities(
  id          TEXT PRIMARY KEY,      -- 'cancas-punta-sal'
  name        TEXT NOT NULL,          -- 'Canoas de Punta Sal'
  region      TEXT,                   -- 'Tumbes'
  polygon     GEOMETRY(POLYGON,4326), -- limites geograficos del distrito
  commission_pct NUMERIC(4,2),        -- % de comisiones que recibe
  contract_status TEXT,               -- ACTIVE | PROSPECT | INACTIVE
  contact_name TEXT,
  contact_email TEXT,
  activated_at TIMESTAMPTZ
)
```

**Como MuniGo determina a que municipio pertenece una transaccion:**
```
ST_Within(punto_gps, municipalities.polygon)
→ Si el punto cae dentro del poligono del municipio, se le asigna ese municipality_id
→ Si no cae en ningun municipio registrado: municipality_id = 'unassigned'
   (zona sin acuerdo comercial — MuniGo opera igual, solo no hay % para municipio)
```

**Expansion a nuevas ciudades:**
```
1. Municipio firma acuerdo comercial → se inserta en tabla municipalities
2. MuniGo habilita su poligono geografico
3. Conductores y comercios de esa zona pueden registrarse
4. Los ciudadanos ya ven servicios disponibles cerca de ellos automaticamente
5. No hay deploy nuevo, no hay nueva app, no hay configuracion especial
```

---

### 13.5 Configuracion de tarifas y comisiones (Super Admin)

Hoy las tarifas y comisiones estan hardcodeadas en:
- `transport/server.js`: `FARES = { standard: 5, premium: 8 }`
- `mandados/server.js`: `FARES = { COMPRAS: 8, TRAMITE: 10, ... }`
- `wallet/server.js`: `PLATFORM_FEE_PERCENT` (env var)
- `orders/server.js`: `DELIVERY_FEE = 3.00` (constante)

**Objetivo:** Todo lo anterior debe vivir en una tabla `platform_config` y ser editable desde el Super Admin Panel sin necesidad de redeploy.

**Tabla necesaria:**
```sql
platform_config(
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,          -- descripcion legible
  type  TEXT,          -- NUMBER | PERCENT | BOOLEAN | TEXT
  module TEXT,         -- TRANSPORT | FOOD | MANDADOS | PLATFORM
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Seed inicial:
INSERT INTO platform_config VALUES
  ('transport_fare_standard', '5.00', 'Tarifa standard mototaxi', 'NUMBER', 'TRANSPORT', ...),
  ('transport_fare_premium',  '8.00', 'Tarifa premium mototaxi',  'NUMBER', 'TRANSPORT', ...),
  ('transport_commission_pct','15',   'Comision transporte (%)',   'PERCENT','TRANSPORT', ...),
  ('food_commission_pct',     '12',   'Comision restaurantes (%)', 'PERCENT','FOOD',      ...),
  ('shop_commission_pct',     '12',   'Comision tiendas (%)',      'PERCENT','FOOD',      ...),
  ('mandados_commission_pct', '20',   'Comision mandados (%)',     'PERCENT','MANDADOS',  ...),
  ('delivery_fee_fixed',      '3.00', 'Costo fijo de delivery',    'NUMBER', 'PLATFORM',  ...),
  ('mandados_fare_compras',   '8.00', 'Tarifa mandado compras',    'NUMBER', 'MANDADOS',  ...),
  ('mandados_fare_tramite',  '10.00', 'Tarifa mandado tramite',    'NUMBER', 'MANDADOS',  ...),
  ('mandados_fare_mensajeria','6.00', 'Tarifa mandado mensajeria', 'NUMBER', 'MANDADOS',  ...);
```

**Endpoints necesarios (nuevo microservicio `config` o en gateway):**
```
GET    /v1/admin/config          — listar toda la configuracion (SUPER_ADMIN)
PATCH  /v1/admin/config/:key     — actualizar un valor (SUPER_ADMIN)
GET    /v1/config/public         — configuracion publica (fares para mostrar al ciudadano)
```

### 13.6 Retiro de ganancias por partners y conductores

El ciclo de pago hacia conductores y operadores no esta implementado.

**Flujo esperado:**
```
1. Escrow libera monto neto al balance del partner en `wallets`
   (ya implementado en wallet/server.js: POST /v1/wallet/escrow/release)

2. Partner ve su saldo en panel y solicita retiro:
   - Ingresa numero de cuenta bancaria o CCI
   - Solicita retiro de X soles

3. Se crea registro en `withdrawal_requests`:
   withdrawal_requests(id, user_id, amount, account_number, cci,
                       bank, status [PENDING|PROCESSING|COMPLETED|FAILED],
                       processed_at, external_tx_id)

4. SUPER_ADMIN procesa manualmente o via batch diario:
   - Transfiere via banca electronica (Interbank, BCP, etc.)
   - Actualiza estado a COMPLETED con ID de transferencia

5. Partner recibe notificacion push: "Tu retiro de S/ X.XX fue procesado"
```

> En MVP (Fase 5): el proceso de retiro es MANUAL — el SUPER_ADMIN lo hace desde el panel.
> En produccion real: integracion con API bancaria para transferencias automaticas.

---

## 14. Estado del codigo a 2026-03-16

### 14.1 Microservicios — estado real

| Servicio     | Puerto | Estado real     | Notas                                        |
|--------------|--------|-----------------|----------------------------------------------|
| gateway      | 8080   | ✅ Funcional    | Rutas: identity, reports, geo, notifications, wallet, transport, catalog, orders |
| identity     | 4001   | ✅ Funcional    | Roles: CITIZEN, DRIVER, OPERATOR, SUPER_ADMIN |
| reports      | 4002   | ✅ Funcional    | Bug shared/auth corregido                    |
| geo          | 4003   | ✅ Funcional    | Basico — sin PostGIS real                    |
| notifications| 4004   | ✅ Funcional    | Sin push FCM real                            |
| transport    | 4005   | ✅ Implementado | REST + WebSocket; fares hardcodeadas         |
| wallet       | 4006   | ✅ Implementado | Escrow completo; recarga/retiro sin PSP real |
| catalog      | 4007   | ✅ Implementado | Seed incluido; sin CRUD de operador          |
| orders       | 4008   | ✅ Implementado | RESTAURANT + STORE; delivery fee hardcodeado |
| mandados     | 4009   | ✅ Implementado | Fares hardcodeadas en codigo                 |
| pets         | 4010   | ✅ Implementado | Adopcion + mascotas perdidas                 |
| sos          | 4011   | ✅ Implementado | Alerta + attend/resolve                      |

### 14.2 Pantallas frontend — estado real

| Modulo      | Pantallas implementadas                                                  | Gap principal                           |
|-------------|--------------------------------------------------------------------------|-----------------------------------------|
| Auth        | Welcome, Login, Register                                                 | Opcion "soy conductor" en register      |
| Home        | HomeScreen (6 modulos activos)                                           | Deteccion GPS real                      |
| Transporte  | Booking, TripConfirmation, TripTracking, TripSummary, TripHistory        | Mapa real (Mapbox/Google)               |
| Driver      | DriverDashboard, TripRequest                                             | Pagos tab, Rutas tab                    |
| Food        | RestaurantList, RestaurantMenu, OrderConfirmation, OrderTracking, OrderDelivered | Calificacion real al backend |
| Tiendas     | StoreList, StoreProducts (con carrito inline)                            | Panel de gestión del operador           |
| Mandados    | MandadosMenu, MandadoRequest, MandadoConfirmation, MandadoTracking, MandadoSummary | Tracking en tiempo real        |
| Mascotas    | PetList (adopcion + perdidas), PetDetail                                 | Foto upload real                        |
| SOS         | SOSScreen (conectado a API)                                              | GPS real, mapa en pantalla              |
| Billetera   | WalletScreen                                                             | Recarga real (PSP), retiro, historial   |
| Operador    | RestaurantPanelScreen                                                    | Panel tienda, gestion catalogo          |
| Perfil      | ProfileScreen                                                            | Historiales cruzados, edicion de datos  |

### 14.3 Gaps criticos para produccion (prioridad)

1. **`platform_config` table** — tarifas y comisiones en DB, no en codigo
2. **Onboarding de partners** — flujo de registro y aprobacion de comercios
3. **Panel de gestion de catalogo** — operadores cargan sus propios productos
4. **PSP real** — integracion Yape/Plin/Culqi para recargar billetera (pasarela pendiente de definir)
5. **Retiros** — flujo de retiro de ganancias para conductores y operadores
6. **Mapas reales** — Mapbox o Google Maps en BookingScreen y TripTrackingScreen
7. **Push notifications reales** — FCM para estados de pedidos y viajes
8. **Image search para productos** — API de busqueda de imagenes para operadores

---

*specs.md v4.0.0 — Actualizado el 2026-03-16*
*Secciones 13-14 nuevas: Modelo de negocio + monetizacion + estado real del codigo*
