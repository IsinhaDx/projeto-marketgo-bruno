import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from './Card';
import { colors, radius, spacing } from '@/theme';
import type { Product } from '@/types';
import { formatMoney } from '@/utils/money';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  quantity?: number;
}

export function ProductCard({
  product,
  onAddToCart,
  quantity = 0,
}: ProductCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {product.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
        </View>

        {onAddToCart && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              quantity > 0 && styles.addedButton,
              pressed && styles.pressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            {quantity > 0 ? (
              <Text style={styles.badgeText}>{quantity}</Text>
            ) : (
              <Ionicons name="add" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedButton: {
    backgroundColor: colors.text,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});