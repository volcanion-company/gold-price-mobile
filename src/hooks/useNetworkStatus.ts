import { useCallback, useState, useRef, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  details: any;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    isWifi: false,
    details: null,
  });
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const updateNetworkState = useCallback((state: NetInfoState) => {
    setNetworkState({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      details: state.details,
    });
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Failed to check network status:', error);
      return false;
    }
  }, [updateNetworkState]);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network state changes
    unsubscribeRef.current = NetInfo.addEventListener(updateNetworkState);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [checkConnection, updateNetworkState]);

  return {
    ...networkState,
    checkConnection,
  };
};
