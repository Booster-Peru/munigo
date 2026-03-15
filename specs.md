# specs.md — Especificacion Funcional MuniGo

> Documento maestro basado en los diseños de Stitch (57 pantallas) y el estado real del repositorio.
> Todo cambio en alcance o arquitectura debe reflejarse aqui primero.

---

## 1. Metadatos

| Campo                | Valor                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| GUID                 | `e9f2ae00-c96e-47ac-b12f-abce0570163a`                                |
| Version              | `3.0.0`                                                               |
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
| Panel Municipal       | Mobile (mismo repo, perfil rol SUPERVISOR) | Por construir |
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
| Restaurantes | 13               | Ciudadano + Operador  | No existe              |
| Tiendas SIAR | 7                | Ciudadano + Operador  | No existe              |
| Mandados     | 5                | Ciudadano             | No existe              |
| Billetera    | 8                | Ciudadano             | No existe              |
| Mascotas     | 2                | Ciudadano             | No existe              |
| SOS          | 1                | Ciudadano             | No existe              |
| Perfil       | 1                | Ciudadano             | Parcial — ampliar      |
| Driver App   | 7                | Conductor             | No existe              |
| Panel Municipal | 1             | Supervisor            | Parcial (web-admin)    |

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

### 5.3 Bottom Navigation — Panel Municipal

```
[ Panel ] [ Conductores ] [ Viajes ] [ Ajustes ]
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
- Metodo de pago: Efectivo o Billetera MuniGo
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

### 6.11 Panel Municipal (Supervisor)

**Pantalla Stitch:** `Panel Municipal Control MuniGo` (465531281) — pantalla MOBILE

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
- FR-MUN-006: Panel accesible via mobile (mismo repo Expo, rol SUPERVISOR)

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
| SUPERVISOR | Supervisor municipal — panel de control         |
| ADMIN      | Administrador del sistema                       |

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
3. **web-admin** no tiene auth por roles — agregar autorizacion SUPERVISOR

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
  Given el supervisor tiene rol SUPERVISOR
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

*specs.md v3.0.0 — Actualizado el 2026-03-15 por Claude Opus 4.6*
*Basado en analisis de 57 pantallas del proyecto Stitch `9904501399194749579` (MuniGO)*
