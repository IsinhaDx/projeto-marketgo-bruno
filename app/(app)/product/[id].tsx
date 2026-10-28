// @ts-nocheck
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/context/CartContext';
import { useProduct, useStore } from '@/hooks/useCatalog';
import { colors, radius, spacing } from '@/theme';
import { formatMoney } from '@/utils/money';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cart, addToCart, replaceCart, setQuantity } = useCart();

  const { data: product, isLoading: loadingProduct } = useProduct(id);
  const { data: store, isLoading: loadingStore } = useStore(
    product?.store_id ?? ''
  );

  const cartItem = cart.items.find((i) => i.productId === id);
  const [quantity, setQuantityState] = useState(cartItem?.quantity ?? 1);

  if (loadingProduct || loadingStore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product || !store) {
    return (
      <View style={styles.container}>
        <Header showBack title="Produto" />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Produto não encontrado.</Text>
        </View>
      </View>
    );
  }

  const isAlreadyInCart = Boolean(cartItem);
  const totalPrice = product.price * quantity;

  const handleSave = () => {
    if (isAlreadyInCart) {
      setQuantity(product.id, quantity);
      router.back();
      return;
    }

    const result = addToCart(store, product, quantity);

    if (result.conflict) {
      Alert.alert(
        'Substituir carrinho?',
        `Você já possui itens de outra loja no seu carrinho. Deseja esvaziar o carrinho atual e adicionar este item da loja ${store.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Substituir',
            style: 'destructive',
            onPress: () => {
              replaceCart(store, product, quantity);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Header showBack title={store.name} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.emoji}>{product.emoji}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
        </View>

        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}

        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantidade</Text>
          <QuantitySelector value={quantity} onChange={setQuantityState} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            quantity === 0
              ? 'Remover do carrinho'
              : `${isAlreadyInCart ? 'Atualizar' : 'Adicionar'} • ${formatMoney(
                  totalPrice
                )}`
          }
          variant={quantity === 0 ? 'danger' : 'primary'}
          onPress={handleSave}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.muted,
  },
  scrollContent: {
    padding: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.sm,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});