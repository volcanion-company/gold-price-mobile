import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import type { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading = false,
}) => {
  const formatPrice = (price: number) => {
    if (Math.abs(price) >= 1000000000) {
      return (price / 1000000000).toFixed(2) + ' tỷ';
    }
    if (Math.abs(price) >= 1000000) {
      return (price / 1000000).toFixed(2) + 'M';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isBuy = item.type === 'buy';
    const totalValue = item.quantity * item.price;

    return (
      <View className="flex-row items-center py-3 border-b border-gray-100">
        {/* Icon */}
        <View 
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isBuy ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Ionicons 
            name={isBuy ? 'arrow-down' : 'arrow-up'} 
            size={18} 
            color={isBuy ? '#22c55e' : '#ef4444'} 
          />
        </View>

        {/* Details */}
        <View className="flex-1 ml-3">
          <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
            {item.productName}
          </Text>
          <Text className="text-xs text-gray-500">
            {item.quantity.toFixed(2)} lượng × {formatPrice(item.price)}
          </Text>
        </View>

        {/* Value & Date */}
        <View className="items-end">
          <Text className={`text-sm font-semibold ${isBuy ? 'text-green-600' : 'text-red-600'}`}>
            {isBuy ? '-' : '+'}{formatPrice(totalValue)}
          </Text>
          <Text className="text-xs text-gray-400">
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <Text className="text-gray-500">Đang tải...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="items-center justify-center py-10">
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${COLORS.primary}15` }}
        >
          <Ionicons name="swap-vertical-outline" size={32} color={COLORS.primary} />
        </View>
        <Text className="text-gray-500">Chưa có giao dịch nào</Text>
      </View>
    );
  }

  // Group transactions by month
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <View className="bg-white rounded-2xl mx-4 p-4">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Lịch sử giao dịch
      </Text>

      {Object.entries(groupedTransactions).map(([monthYear, txns]) => {
        const monthTotal = txns.reduce((sum, tx) => {
          const value = tx.quantity * tx.price;
          return tx.type === 'buy' ? sum - value : sum + value;
        }, 0);

        return (
          <View key={monthYear} className="mb-4">
            {/* Month Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-gray-600 capitalize">
                {monthYear}
              </Text>
              <Text className={`text-sm font-medium ${
                monthTotal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {monthTotal >= 0 ? '+' : ''}{formatPrice(monthTotal)}
              </Text>
            </View>

            {/* Transactions */}
            {txns.map((transaction, index) => (
              <View key={transaction.id || index}>
                {renderTransaction({ item: transaction })}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};
