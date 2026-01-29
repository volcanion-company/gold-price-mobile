import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../../utils/constants';
import { GoldPrice } from '../../types';

type PriceUpdateCallback = (prices: GoldPrice[]) => void;
type PriceChangeCallback = (changes: PriceChange[]) => void;

export interface PriceChange {
  code: string;
  name: string;
  buy: number;
  sell: number;
  changeBuy: number;
  changeSell: number;
}

class PriceSocketService {
  private socket: Socket | null = null;
  private callbacks: Set<PriceUpdateCallback> = new Set();
  private changeCallbacks: Set<PriceChangeCallback> = new Set();
  private subscribedCodes: string[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      // Re-subscribe to codes if any
      if (this.subscribedCodes.length > 0) {
        this.socket?.emit('subscribe:gold', this.subscribedCodes);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`WebSocket reconnection attempt ${attempt}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('WebSocket failed to reconnect');
    });

    // Nhận giá hiện tại khi kết nối
    this.socket.on('prices:current', (data: { success: boolean; data: GoldPrice[]; timestamp: string }) => {
      console.log('Received current prices:', data.data?.length, 'prices');
      if (data.success && data.data) {
        const prices = this.transformPrices(data.data);
        this.callbacks.forEach(callback => callback(prices));
      }
    });

    // Nhận cập nhật giá mới (broadcast tới tất cả clients)
    this.socket.on('prices:updated', (data: { success: boolean; changes: PriceChange[]; allPrices: GoldPrice[]; timestamp: string }) => {
      console.log('Received price update:', data.allPrices?.length, 'prices');
      if (data.success) {
        if (data.allPrices) {
          const prices = this.transformPrices(data.allPrices);
          this.callbacks.forEach(callback => callback(prices));
        }
        if (data.changes) {
          this.changeCallbacks.forEach(callback => callback(data.changes));
        }
      }
    });

    // Nhận thông báo thay đổi giá cho loại vàng đã subscribe
    this.socket.on('price:changed', (data: { success: boolean; data: PriceChange; timestamp: string }) => {
      console.log('Received price change for:', data.data?.code);
      if (data.success && data.data) {
        this.changeCallbacks.forEach(callback => callback([data.data]));
      }
    });

    // Xử lý lỗi từ server
    this.socket.on('prices:error', (data: { message: string }) => {
      console.error('Price socket error:', data.message);
    });
  }

  /**
   * Transform API prices to ensure buyPrice/sellPrice are populated
   */
  private transformPrices(prices: any[]): GoldPrice[] {
    return prices.map(price => ({
      ...price,
      buyPrice: price.buyPrice ?? price.buy ?? 0,
      sellPrice: price.sellPrice ?? price.sell ?? 0,
      buy: price.buy ?? price.buyPrice ?? 0,
      sell: price.sell ?? price.sellPrice ?? 0,
    }));
  }

  disconnect(): void {
    if (this.socket) {
      if (this.subscribedCodes.length > 0) {
        this.socket.emit('unsubscribe:gold', this.subscribedCodes);
      }
      this.socket.disconnect();
      this.socket = null;
      this.subscribedCodes = [];
    }
  }

  /**
   * Subscribe to price updates
   */
  subscribe(callback: PriceUpdateCallback): () => void {
    this.callbacks.add(callback);
    
    // Connect if not already connected
    if (!this.socket?.connected) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      
      // Disconnect if no more subscribers
      if (this.callbacks.size === 0 && this.changeCallbacks.size === 0) {
        this.disconnect();
      }
    };
  }

  /**
   * Subscribe to price change notifications
   */
  subscribeToChanges(callback: PriceChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    
    if (!this.socket?.connected) {
      this.connect();
    }

    return () => {
      this.changeCallbacks.delete(callback);
      
      if (this.callbacks.size === 0 && this.changeCallbacks.size === 0) {
        this.disconnect();
      }
    };
  }

  /**
   * Subscribe to specific gold codes
   */
  subscribeToGoldCodes(codes: string[]): void {
    this.subscribedCodes = [...new Set([...this.subscribedCodes, ...codes])];
    
    if (this.socket?.connected) {
      this.socket.emit('subscribe:gold', codes);
    }
  }

  /**
   * Unsubscribe from specific gold codes
   */
  unsubscribeFromGoldCodes(codes: string[]): void {
    this.subscribedCodes = this.subscribedCodes.filter(c => !codes.includes(c));
    
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:gold', codes);
    }
  }

  /**
   * Request current prices from server
   */
  refreshPrices(): void {
    if (this.socket?.connected) {
      this.socket.emit('get:prices');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSubscribedCodes(): string[] {
    return [...this.subscribedCodes];
  }
}

export const priceSocket = new PriceSocketService();
