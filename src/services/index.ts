export { default as apiClient } from './api/client';
export { priceApi } from './api/priceApi';
export { authApi } from './api/authApi';
export { alertApi } from './api/alertApi';
export type { 
  Alert, 
  CreateAlertDto, 
  UpdateAlertDto, 
  AlertHistory 
} from './api/alertApi';
export { portfolioApi } from './api/portfolioApi';
export type { 
  Holding, 
  Transaction, 
  CreateHoldingDto, 
  UpdateHoldingDto, 
  AddTransactionDto, 
  PortfolioStats, 
  PortfolioSummary 
} from './api/portfolioApi';
export { priceSocket, type PriceChange } from './socket/priceSocket';
export { storageService, STORAGE_KEYS } from './storageService';
export { offlineCacheService, type OfflineAction, type CachedPriceData } from './offlineCacheService';
export { backgroundFetchService, registerBackgroundFetch, unregisterBackgroundFetch } from './backgroundFetch';
export { widgetService, widgetBridge, type WidgetData, type WidgetConfig } from './widget';
export { notificationService, type NotificationSettings, type LocalNotificationData } from './notificationService';
export { currencyService, type ExchangeRates } from './currencyService';
