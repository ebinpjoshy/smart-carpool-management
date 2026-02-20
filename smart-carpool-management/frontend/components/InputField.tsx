import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
};

export default function InputField({ value, onChangeText, placeholder }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6 }
});
