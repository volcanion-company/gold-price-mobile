import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../utils/constants';
import type { GoldPrice } from '../types';

interface PriceChange {
  code: string;
  name: string;
  buy: number;
  sell: number;
  changeBuy: number;
  changeSell: number;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onPricesUpdate?: (prices: GoldPrice[]) => void;
  onPriceChange?: (changes: PriceChange[]) => void;
  goldCodes?: string[];
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  lastMessage: any;
}

/**
 * Transform API prices to ensure buyPrice/sellPrice are populated
 */
function transformPrices(prices: any[]): GoldPrice[] {
  return prices.map(price => ({
    ...price,
    buyPrice: price.buyPrice ?? price.buy ?? 0,
    sellPrice: price.sellPrice ?? price.sell ?? 0,
    buy: price.buy ?? price.buyPrice ?? 0,
    sell: price.sell ?? price.sellPrice ?? 0,
  }));
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 10,
    reconnectDelay = 1000,
    onPricesUpdate,
    onPriceChange,
    goldCodes = [],
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const reconnectCountRef = useRef(0);
  const subscribedCodesRef = useRef<string[]>([]);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
  });

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: reconnectAttempts,
        reconnectionDelay: reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        reconnectCountRef.current = 0;
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        // Re-subscribe to codes if any
        if (subscribedCodesRef.current.length > 0) {
          socket.emit('subscribe:gold', subscribedCodesRef.current);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error as Error,
        }));
      });

      socket.on('reconnect_attempt', (attempt) => {
        console.log(`WebSocket reconnection attempt ${attempt}`);
      });

      socket.on('reconnect_failed', () => {
        console.log('WebSocket failed to reconnect');
      });

      // Nhận giá hiện tại khi kết nối
      socket.on('prices:current', (data: { success: boolean; data: GoldPrice[]; timestamp: string }) => {
        console.log('Received current prices:', data.data?.length, 'prices');
        if (data.success && data.data) {
          const prices = transformPrices(data.data);
          onPricesUpdate?.(prices);
          setState(prev => ({ ...prev, lastMessage: data }));
        }
      });

      // Nhận cập nhật giá mới (broadcast tới tất cả clients)
      socket.on('prices:updated', (data: { success: boolean; changes: PriceChange[]; allPrices: GoldPrice[]; timestamp: string }) => {
        console.log('Received price update:', data.allPrices?.length, 'prices');
        if (data.success) {
          if (data.allPrices) {
            const prices = transformPrices(data.allPrices);
            onPricesUpdate?.(prices);
            setState(prev => ({ ...prev, lastMessage: data }));
          }
          if (data.changes) {
            onPriceChange?.(data.changes);
          }
        }
      });

      // Nhận thông báo thay đổi giá cho loại vàng đã subscribe
      socket.on('price:changed', (data: { success: boolean; data: PriceChange; timestamp: string }) => {
        console.log('Received price change for:', data.data?.code);
        if (data.success && data.data) {
          onPriceChange?.([data.data]);
        }
      });

      // Xử lý lỗi từ server
      socket.on('prices:error', (data: { message: string }) => {
        console.error('Price socket error:', data.message);
        setState(prev => ({ ...prev, error: new Error(data.message) }));
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error as Error,
      }));
    }
  }, [reconnectAttempts, reconnectDelay, onPricesUpdate, onPriceChange]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Unsubscribe from gold codes before disconnecting
      if (subscribedCodesRef.current.length > 0) {
        socketRef.current.emit('unsubscribe:gold', subscribedCodesRef.current);
        subscribedCodesRef.current = [];
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
    }
  }, []);

  /**
   * Subscribe to specific gold codes
   */
  const subscribeToGoldCodes = useCallback((codes: string[]) => {
    subscribedCodesRef.current = [...new Set([...subscribedCodesRef.current, ...codes])];
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:gold', codes);
    }
  }, []);

  /**
   * Unsubscribe from specific gold codes
   */
  const unsubscribeFromGoldCodes = useCallback((codes: string[]) => {
    subscribedCodesRef.current = subscribedCodesRef.current.filter(c => !codes.includes(c));
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe:gold', codes);
    }
  }, []);

  /**
   * Request current prices from server
   */
  const refreshPrices = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get:prices');
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Auto connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Subscribe to gold codes when provided
  useEffect(() => {
    if (goldCodes.length > 0 && socketRef.current?.connected) {
      subscribeToGoldCodes(goldCodes);
    }
  }, [goldCodes, subscribeToGoldCodes]);

  return {
    ...state,
    connect,
    disconnect,
    subscribeToGoldCodes,
    unsubscribeFromGoldCodes,
    refreshPrices,
    emit,
    socket: socketRef.current,
  };
};
