# Gold Price Mobile - Architecture

## Tổng quan

Gold Price Mobile là ứng dụng React Native được xây dựng với Expo SDK 54, sử dụng kiến trúc modular với phân tách rõ ràng giữa các layer.

## Tech Stack

### Core Framework
- **React Native 0.81.5** - Framework mobile cross-platform
- **Expo SDK 54** - Development platform & managed workflow
- **TypeScript 5.9** - Type-safe JavaScript

### Navigation
- **Expo Router 6.x** - File-based routing system
- Tab navigation với 5 màn hình chính
- Stack navigation cho các màn hình chi tiết

### Styling
- **NativeWind 4.x** - TailwindCSS cho React Native
- **TailwindCSS 3.3.2** - Utility-first CSS framework
- Custom color palette với gold theme

### State Management
- **Zustand 5.x** - Lightweight state management
- **@tanstack/react-query 5.x** - Server state & caching
- **AsyncStorage** - Persistent local storage

### Real-time Communication
- **Socket.IO Client 4.x** - WebSocket cho giá real-time

### UI Components
- **@shopify/flash-list** - High-performance list rendering
- **react-native-gifted-charts** - Price charts
- **react-native-reanimated** - Smooth animations
- **expo-blur** - Blur effects
- **expo-linear-gradient** - Gradient backgrounds
- **expo-haptics** - Haptic feedback

### Utilities
- **axios** - HTTP client
- **date-fns** - Date manipulation
- **numeral** - Number formatting

## Cấu trúc thư mục

```
gold-price-mobile/
├── app/                      # Expo Router - File-based routing
│   ├── _layout.tsx           # Root layout với providers
│   ├── (tabs)/               # Tab Navigator
│   │   ├── _layout.tsx       # Tab bar configuration
│   │   ├── index.tsx         # Home - Bảng giá chính
│   │   ├── compare.tsx       # So sánh giá
│   │   ├── charts.tsx        # Biểu đồ lịch sử
│   │   ├── alerts.tsx        # Cảnh báo giá
│   │   └── portfolio.tsx     # Danh mục đầu tư
│   ├── price/
│   │   └── [code].tsx        # Chi tiết giá theo mã
│   ├── settings/
│   │   ├── index.tsx         # Cài đặt chung
│   │   └── widget.tsx        # Cấu hình widget
│   └── auth/
│       ├── login.tsx         # Đăng nhập
│       └── register.tsx      # Đăng ký
│
├── src/
│   ├── components/           # UI Components
│   │   ├── common/           # Shared components
│   │   │   ├── PriceCard.tsx
│   │   │   ├── PriceRow.tsx
│   │   │   ├── PriceChange.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorDisplay.tsx
│   │   ├── home/             # Home screen components
│   │   │   ├── SJCPriceCard.tsx
│   │   │   └── WorldGoldCard.tsx
│   │   └── index.ts          # Barrel exports
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── usePrices.ts      # Price data fetching
│   │   ├── useAuth.ts        # Authentication
│   │   └── index.ts
│   │
│   ├── services/             # External services
│   │   ├── api/
│   │   │   ├── client.ts     # Axios instance
│   │   │   ├── priceApi.ts   # Price endpoints
│   │   │   └── authApi.ts    # Auth endpoints
│   │   ├── socket/
│   │   │   └── priceSocket.ts # WebSocket connection
│   │   └── index.ts
│   │
│   ├── stores/               # Zustand stores
│   │   ├── priceStore.ts     # Price state
│   │   ├── authStore.ts      # Auth state
│   │   ├── settingsStore.ts  # App settings
│   │   ├── widgetStore.ts    # Widget config
│   │   └── index.ts
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── price.ts          # Price types
│   │   ├── user.ts           # User types
│   │   ├── api.ts            # API response types
│   │   ├── widget.ts         # Widget types
│   │   └── index.ts
│   │
│   └── utils/                # Utility functions
│       ├── constants.ts      # App constants
│       ├── formatters.ts     # Number/date formatting
│       ├── helpers.ts        # Helper functions
│       └── index.ts
│
├── assets/                   # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json                  # Expo configuration
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler config
├── tailwind.config.js        # TailwindCSS config
├── tsconfig.json             # TypeScript config
└── package.json
```

## Architecture Patterns

### 1. Feature-based Organization

Mỗi feature được tổ chức theo domain:
- **Screens** trong `app/` (file-based routing)
- **Components** tái sử dụng trong `src/components/`
- **Business logic** trong `src/hooks/` và `src/stores/`

### 2. State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Zustand   │    │React Query  │    │   Local     │    │
│   │   Stores    │    │   Cache     │    │   State     │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                  │                  │             │
│   Global State       Server State       Component State    │
│   (Settings,        (Price Data,        (Form inputs,      │
│    Auth, UI)         API Cache)          UI toggles)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Backend    │────▶│   Services   │────▶│    Hooks     │
│   API/WS     │     │  (API/Socket)│     │ (usePrices)  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Components  │◀────│    Stores    │◀────│ React Query  │
│   (UI)       │     │  (Zustand)   │     │   (Cache)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 4. Real-time Updates

```
┌─────────────────────────────────────────────────────────────┐
│                    WebSocket Flow                           │
│                                                             │
│   Server ──ws──▶ priceSocket.ts ──▶ priceStore ──▶ UI      │
│                                                             │
│   • Connect on app start                                    │
│   • Subscribe to price channels                             │
│   • Auto-reconnect on disconnect                            │
│   • Update store on new data                                │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Expo Router cho Navigation
- File-based routing đơn giản hóa navigation structure
- Deep linking tự động
- Type-safe routing với TypeScript

### 2. NativeWind cho Styling
- Familiar TailwindCSS syntax
- Consistent design system
- Easy theming với CSS variables

### 3. Zustand thay vì Redux
- Minimal boilerplate
- Simple API
- Built-in persistence support
- Excellent TypeScript support

### 4. React Query cho Server State
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

### 5. Socket.IO cho Real-time
- Reliable WebSocket wrapper
- Auto-reconnection
- Event-based architecture
- Fallback to polling

## Performance Optimizations

### 1. List Rendering
- FlashList cho large lists (hiệu suất gấp 10x FlatList)
- Proper key extraction
- Optimized item layouts

### 2. Re-render Prevention
- Zustand selectors để tránh unnecessary re-renders
- React.memo cho expensive components
- useMemo/useCallback cho computed values

### 3. Image Optimization
- Lazy loading
- Cached images
- Proper sizing

### 4. Bundle Size
- Tree shaking với Metro
- Dynamic imports cho large features
- Minimal dependencies

## Security Considerations

### 1. Secure Storage
- expo-secure-store cho tokens
- Encrypted storage cho sensitive data

### 2. API Security
- HTTPS only
- JWT authentication
- Token refresh mechanism

### 3. Input Validation
- Client-side validation
- Sanitization trước khi gửi API

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                          │
│                                                             │
│                      ┌───────┐                              │
│                     /   E2E   \                             │
│                    /  (Detox)  \                            │
│                   ├─────────────┤                           │
│                  /  Integration  \                          │
│                 /   (Jest + RTL)  \                         │
│                ├───────────────────┤                        │
│               /      Unit Tests     \                       │
│              /    (Jest + Vitest)    \                      │
│             └─────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Future Considerations

### Widget Support
- iOS WidgetKit integration
- Android Glance widgets
- Background refresh

### Offline Support
- Local database (SQLite/WatermelonDB)
- Offline-first architecture
- Sync when online

### Push Notifications
- Price alerts
- Portfolio updates
- Market news

## Related Documentation

- [README.md](./README.md) - Getting started
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [Backend Architecture](../gold-price-backend/ARCHITECTURE.md) - API documentation
