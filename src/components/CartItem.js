// src/components/CartItem.js
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <View className="flex-row bg-white rounded-xl mx-4 my-2 p-3 shadow-sm elevation-2">
      
      <Image 
        source={{ uri: item.image }} 
        className="w-20 h-20 rounded-lg" 
        resizeMode="cover" 
      />
      
      <View className="flex-1 ml-3 justify-between">
        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-[#FF6347] font-semibold mt-1">
          Rp {item.price.toLocaleString('id-ID')}
        </Text>
        
        <View className="flex-row items-center mt-2">
          
          <TouchableOpacity 
            className="w-8 h-8 bg-[#FF6347] rounded-md justify-center items-center" 
            onPress={() => onDecrease(item.id)}
          >
            <Text className="text-white text-lg font-bold">-</Text>
          </TouchableOpacity>
          
          <Text className="text-base font-bold mx-3 text-center min-w-[20px]">
            {item.quantity}
          </Text>
          
          <TouchableOpacity 
            className="w-8 h-8 bg-[#FF6347] rounded-md justify-center items-center" 
            onPress={() => onIncrease(item.id)}
          >
            <Text className="text-white text-lg font-bold">+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="ml-auto px-3 py-1.5 bg-red-500 rounded-md" 
            onPress={() => onRemove(item.id)}
          >
            <Text className="text-white text-xs font-bold">Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default CartItem;