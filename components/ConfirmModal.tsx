import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, useColorScheme } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
}: ConfirmModalProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center px-6">
        <TouchableWithoutFeedback onPress={onCancel}>
          <View className="absolute inset-0 bg-black/60" />
        </TouchableWithoutFeedback>

        <View 
          className={`w-full max-w-[340px] rounded-[32px] p-6 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Text className={`text-xl font-black mb-3 text-center ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            {title}
          </Text>
          <Text className={`text-center mb-8 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {message}
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={onCancel}
              className={`flex-1 py-4 rounded-2xl items-center justify-center border ${isDark ? 'bg-transparent border-[#334155]' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                onCancel(); // Close modal immediately
                onConfirm(); // Trigger action
              }}
              className={`flex-1 py-4 rounded-2xl items-center justify-center ${isDestructive ? 'bg-red-500' : (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]')}`}
            >
              <Text className={`font-bold ${isDestructive ? 'text-white' : (isDark ? 'text-[#0f172a]' : 'text-white')}`}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
