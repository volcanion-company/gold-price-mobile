import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WidgetSize = 'small' | 'medium' | 'large';

interface WidgetState {
  selectedCodes: string[];
  widgetSize: WidgetSize;
  showChange: boolean;
  showLastUpdate: boolean;
  
  // Actions
  setSelectedCodes: (codes: string[]) => void;
  setWidgetSize: (size: WidgetSize) => void;
  setShowChange: (show: boolean) => void;
  setShowLastUpdate: (show: boolean) => void;
  addCode: (code: string) => void;
  removeCode: (code: string) => void;
  reset: () => void;
}

const initialState = {
  selectedCodes: ['SJL1L10', 'DOJINHTV'],
  widgetSize: 'medium' as WidgetSize,
  showChange: true,
  showLastUpdate: true,
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedCodes: (codes) => set({ selectedCodes: codes }),
      
      setWidgetSize: (size) => set({ widgetSize: size }),
      
      setShowChange: (show) => set({ showChange: show }),
      
      setShowLastUpdate: (show) => set({ showLastUpdate: show }),

      addCode: (code) =>
        set((state) => ({
          selectedCodes: [...state.selectedCodes, code],
        })),

      removeCode: (code) =>
        set((state) => ({
          selectedCodes: state.selectedCodes.filter((c) => c !== code),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
