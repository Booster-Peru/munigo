# MuniGo

**Super-app de servicios municipales para el Perú**

MuniGo conecta a los ciudadanos con los servicios de su comunidad local: mototaxi, delivery de restaurantes y tiendas, mandados, adopción de mascotas, SOS y reportes de incidencias — todo con pago digital integrado mediante una billetera interna.

El modelo está diseñado para operar en cualquier ciudad del Perú desde una sola aplicación. Los municipios socios promueven la plataforma y reciben un porcentaje de las comisiones generadas en su territorio.

---

## Módulos

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Transporte** | Solicitud de mototaxi, tracking en tiempo real, historial de viajes | ✅ Implementado |
| **Restaurantes** | Listado, menú con carrito, pedido y seguimiento de entrega | ✅ Implementado |
| **Tiendas** | Marketplace local, catálogo de productos, carrito y delivery | ✅ Implementado |
| **Mandados** | Encargos personalizados (compras, trámites, mensajería) | ✅ Implementado |
| **Mascotas** | Adopción municipal y reporte de mascotas perdidas | ✅ Implementado |
| **SOS** | Alerta de pánico con GPS a policía y serenazgo | ✅ Implementado |
| **Billetera** | Saldo digital, historial de movimientos, escrow por servicio | ✅ Implementado |
| **Driver App** | Panel del conductor: activar servicio, aceptar viajes, métricas | ✅ Implementado |
| **Panel Operador** | Gestión de pedidos en tiempo real para restaurantes | ✅ Implementado |

---

## Stack tecnológico

### Mobile (ciudadano + conductor)
- **React Native** con **Expo SDK 51**
- **TypeScript** estricto — 0 errores
- **React Navigation** v6 (Stack + Bottom Tabs)
- `@expo/vector-icons` (Ionicons)
- `react-native-safe-area-context`

### Backend (microservicios)
- **Node.js** puro — sin frameworks (HTTP nativo)
- **PostgreSQL 16** con extensión PostGIS
- **Redis** para caché y sesiones
- **NATS JetStream** para mensajería asíncrona
- **WebSockets** (`ws`) para tracking en tiempo real

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| gateway | 8080 | Proxy y enrutamiento central |
| identity | 4001 | Autenticación JWT, roles |
| reports | 4002 | Reportes ciudadanos |
| geo | 4003 | Geolocalización |
| notifications | 4004 | Push y alertas |
| transport | 4005 | Viajes, matching, WebSocket |
| wallet | 4006 | Billetera, escrow, transacciones |
| catalog | 4007 | Restaurantes, tiendas, menús |
| orders | 4008 | Pedidos food y tiendas |
| mandados | 4009 | Encargos y seguimiento |
| pets | 4010 | Adopciones y mascotas perdidas |
| sos | 4011 | Alertas de emergencia |

### Web Admin
- HTML + CSS + JavaScript vanilla (en refactor a React SPA)
- Panel exclusivo para rol `SUPER_ADMIN`

### Infraestructura
- **Docker Compose** para desarrollo local
- **CapRover** para producción (`caprover-compose.yml`)
- **GitHub Actions** para CI

---

## Requisitos previos

- Node.js >= 20
- Docker y Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- (Opcional) Expo Go en tu dispositivo o emulador Android/iOS

---

## Inicio rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/Booster-Peru/munigo.git
cd munigo
```

### 2. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores locales
```

Variables requeridas:

```env
DATABASE_URL=postgresql://munigo:munigo@localhost:5432/munigo
JWT_SECRET=change_this_secret_in_production
PLATFORM_FEE_PERCENT=10
```

### 3. Levantar el backend

```bash
docker compose up -d
```

Esto inicia PostgreSQL, Redis, NATS y los 12 microservicios. La primera vez puede tomar 2-3 minutos mientras se crean las tablas.

Verificar que todo esté arriba:

```bash
docker compose ps
curl http://localhost:8080/health
```

### 4. Instalar dependencias del app móvil

```bash
npm install
```

### 5. Correr la app

```bash
npx expo start
```

Escanea el QR con Expo Go (Android/iOS) o presiona `a` para Android, `i` para iOS.

---

## Estructura del proyecto

```
munigo/
├── src/
│   ├── screens/
│   │   ├── transport/       # Booking, TripTracking, TripSummary, TripHistory
│   │   ├── food/            # RestaurantList, RestaurantMenu, OrderTracking, OrderDelivered
│   │   ├── shops/           # StoreList, StoreProducts (con carrito inline)
│   │   ├── mandados/        # MandadosMenu, MandadoRequest, MandadoTracking, MandadoSummary
│   │   ├── pets/            # PetList, PetDetail
│   │   ├── sos/             # SOSScreen
│   │   ├── driver/          # DriverDashboard, TripRequest
│   │   ├── operator/        # RestaurantPanel
│   │   ├── wallet/          # WalletScreen
│   │   └── services/        # ServicesScreen (restaurantes y tiendas)
│   ├── services/            # Capa de API: transportService, ordersService, etc.
│   ├── navigation/          # AppNavigation, DashboardNavigation
│   ├── hooks/               # useAuth
│   ├── components/          # Button, ModuleCard, BannerCard, StatBadge
│   ├── config/              # theme.ts, api.ts
│   └── types/               # navigation.ts, auth.ts, index.ts
├── backend/
│   ├── gateway/             # Proxy central (puerto 8080)
│   ├── shared/              # db.js, jwt.js
│   └── services/
│       ├── identity/        # Auth + roles (4001)
│       ├── transport/       # Viajes + WebSocket (4005)
│       ├── wallet/          # Billetera + escrow (4006)
│       ├── catalog/         # Restaurantes + tiendas (4007)
│       ├── orders/          # Pedidos (4008)
│       ├── mandados/        # Encargos (4009)
│       ├── pets/            # Mascotas (4010)
│       └── sos/             # Emergencias (4011)
├── web-admin/               # Panel SUPER_ADMIN (en refactor)
├── docker-compose.yml
├── caprover-compose.yml
└── specs.md                 # Especificación funcional completa (fuente de verdad)
```

---

## Roles de usuario

| Rol | Acceso | Pantalla inicial |
|-----|--------|------------------|
| `CITIZEN` | App ciudadano completa | HomeScreen |
| `DRIVER` | Panel del conductor | DriverDashboard |
| `OPERATOR` | Panel de restaurante/tienda | RestaurantPanel |
| `SUPER_ADMIN` | Web admin + todo | web-admin |

Usuarios de prueba (se crean con el seed del identity service):

```
ciudadano@munigo.pe   / password123   → CITIZEN
driver@munigo.pe      / password123   → DRIVER
operador@munigo.pe    / password123   → OPERATOR
admin@munigo.pe       / password123   → SUPER_ADMIN
```

---

## Modelo de negocio

MuniGo opera como plataforma intermediaria con modelo de ingresos híbrido:

- **Comisión por transacción**: 15% en transporte, 12% en food/tiendas, 20% en mandados
- **Suscripción mensual de comercios**: restaurantes y tiendas pagan por aparecer listados
- **Licencia municipal**: los municipios socios pagan una licencia anual y reciben un % de las comisiones generadas en su territorio

Todo el flujo de dinero pasa por el microservicio `wallet` mediante un sistema de escrow. Nunca hay transferencia directa entre ciudadano y partner. La tabla `wallet_transactions` es **append-only** (audit trail inmutable).

El sistema está diseñado para contribuir a la **formalización tributaria** de los mototaxistas ante SUNAT, con emisión de comprobantes electrónicos por cada viaje completado.

---

## Pagos

Todos los pagos son digitales a través de la Billetera MuniGo. **No existe opción de pago en efectivo**.

La integración con PSP (pasarela de pago peruana) está pendiente de definición. Candidatos: Yape Business, Izipay, Niubiz.

---

## Tests

```bash
# Correr todos los tests
npm test

# Con cobertura
npm run test:coverage
```

**Estado actual:** 15/15 tests pasando · 0 errores TypeScript

```bash
# Verificar tipos
npx tsc --noEmit
```

---

## Documentación

- [`specs.md`](specs.md) — Especificación funcional completa (57 pantallas Stitch, requerimientos, modelo de negocio, arquitectura)
- [`PLAN.md`](PLAN.md) — Plan de ejecución por fases (Fases 1-7)
- [`TECH-STACK.md`](TECH-STACK.md) — Decisiones de arquitectura técnica
- [`AGENTS.md`](AGENTS.md) — Protocolo para agentes de IA que trabajen en este repo

---

## Contribuir

1. Leer `specs.md` y `PLAN.md` antes de cualquier cambio
2. La rama principal es `main`. Los PRs van a `main` desde `feature/*`
3. Los microservicios backend usan Node.js nativo (sin Express ni Fastify)
4. El app móvil usa TypeScript estricto — 0 errores antes de hacer commit
5. Correr `npm test` antes de cada PR

---

## Licencia

Propietario — Antigravity © 2026. Todos los derechos reservados.
