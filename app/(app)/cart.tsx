// @ts-nocheck
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/context/CartContext';
import { colors, radius, spacing } from '@/theme';
import type { CartItem } from '@/types';
import { cartTotals, missingForMinimum } from '@/utils/cart';
import { formatMoney } from '@/utils/money';

export default function CartScreen() {
  const router = useRouter();
  const { cart, setQuantity, removeItem, clearCart } = useCart();

  const totals = cartTotals(cart);
  const missing = missingForMinimum(cart);
  const canProceed = cart.items.length > 0 && missing === null;

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Header showBack title="Carrinho" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtitle}>
            Adicione itens de uma loja para começar suas compras.
          </Text>
          <Button
            title="Ver lojas"
            onPress={() => router.replace('/(app)/(tabs)')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBack
        title="Carrinho"
        rightElement={
          <Pressable onPress={clearCart} hitSlop={8}>
            <Text style={styles.clearText}>Limpar</Text>
          </Pressable>
        }
      />

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{cart.storeName}</Text>
          </View>
        }
        renderItem={({ item }: { item: CartItem }) => (
          <Card style={styles.itemCard}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
            <QuantitySelector
              value={item.quantity}
              onChange={(q) =>
                q === 0 ? removeItem(item.productId) : setQuantity(item.productId, q)
              }
            />
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.summaryContainer}>
            {missing !== null && (
              <View style={styles.minOrderBanner}>
                <Ionicons name="alert-circle" size={18} color="#B45309" />
                <Text style={styles.minOrderText}>
                  Faltam {formatMoney(missing)} para atingir o pedido mínimo.
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(totals.subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>
                {totals.deliveryFee === 0
                  ? 'Grátis'
                  : formatMoney(totals.deliveryFee)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(totals.total)}</Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <Button
          title="Continuar para entrega"
          disabled={!canProceed}
          onPress={() => router.push('/checkout')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  clearText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
  listContent: {
    padding: spacing.md,
  },
  storeHeader: {
    marginBottom: spacing.sm,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemEmoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemPrice: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  minOrderText: {
    fontSize: 13,
    color: '#B45309',
    flex: 1,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});