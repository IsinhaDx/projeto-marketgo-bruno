// @ts-nocheck
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useProducts, useStore } from '@/hooks/useCatalog';
import { colors, radius, spacing } from '@/theme';
import type { Product } from '@/types';
import { formatEta, groupProducts } from '@/utils/catalog';
import { formatMoney } from '@/utils/money';

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cart, addToCart, replaceCart } = useCart();

  const { data: store, isLoading: loadingStore } = useStore(id);
  const { data: products, isLoading: loadingProducts } = useProducts(id);

  const sections = groupProducts(products ?? []);

  const handleAddToCart = (product: Product) => {
    if (!store) return;

    const result = addToCart(store, product, 1);

    if (result.conflict) {
      Alert.alert(
        'Substituir carrinho?',
        `Você já possui itens de outra loja no seu carrinho. Deseja esvaziar o carrinho atual e adicionar este item da loja ${store.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Substituir',
            style: 'destructive',
            onPress: () => replaceCart(store, product, 1),
          },
        ]
      );
    }
  };

  if (loadingStore || loadingProducts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.container}>
        <Header showBack title="Loja" />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Loja não encontrada.</Text>
        </View>
      </View>
    );
  }

  const isCurrentStoreCart = cart.storeId === store.id && cart.items.length > 0;
  const cartItemCount = isCurrentStoreCart
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <View style={styles.container}>
      <Header showBack title={store.name} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.storeHeader}>
            <Text style={styles.emoji}>{store.emoji}</Text>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.category}>{store.category}</Text>

            <View style={styles.infoBadgeRow}>
              <View style={styles.infoBadge}>
                <Ionicons name="star" size={14} color="#EAB308" />
                <Text style={styles.infoBadgeText}>{store.rating.toFixed(1)}</Text>
              </View>

              <Text style={styles.dot}>•</Text>

              <Text style={styles.infoText}>
                {formatEta(store.eta_min, store.eta_max)}
              </Text>

              <Text style={styles.dot}>•</Text>

              <Text style={styles.infoText}>
                {store.delivery_fee === 0
                  ? 'Entrega grátis'
                  : formatMoney(store.delivery_fee)}
              </Text>
            </View>

            {!store.is_open && (
              <View style={styles.closedBanner}>
                <Text style={styles.closedBannerText}>
                  Esta loja está fechada no momento.
                </Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const cartItem = cart.items.find((i) => i.productId === item.id);
          return (
            <ProductCard
              product={item}
              onAddToCart={store.is_open ? handleAddToCart : undefined}
              quantity={cartItem?.quantity}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {isCurrentStoreCart && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => router.push('/cart')}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
          <Text style={styles.cartBarTitle}>Ver carrinho</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  storeHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 52,
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  category: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  infoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 13,
    color: colors.muted,
  },
  dot: {
    color: colors.muted,
  },
  closedBanner: {
    marginTop: spacing.md,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  closedBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cartBar: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cartBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});