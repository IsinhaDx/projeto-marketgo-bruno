import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from './Card';
import { colors, spacing } from '@/theme';
import type { Store } from '@/types';
import { formatEta } from '@/utils/catalog';
import { formatMoney } from '@/utils/money';

export interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/store/${store.id}`)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={[styles.card, !store.is_open && styles.closedCard]}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{store.emoji}</Text>
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {store.name}
              </Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#EAB308" />
                <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.category}>{store.category}</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                {formatEta(store.eta_min, store.eta_max)} •{' '}
                {store.delivery_fee === 0
                  ? 'Entrega grátis'
                  : formatMoney(store.delivery_fee)}
              </Text>
            </View>
          </View>
        </View>

        {!store.is_open && (
          <View style={styles.closedBadge}>
            <Text style={styles.closedText}>Loja fechada</Text>
          </View>
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
    marginBottom: spacing.md,
  },
  closedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
  },
  category: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  detailsRow: {
    marginTop: spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: colors.muted,
  },
  closedBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
});