// @ts-nocheck
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { PAYMENT_METHODS } from '@/constants/catalog';
import { useCart } from '@/context/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import {
  CheckoutFormData,
  makeCheckoutSchema,
} from '@/schemas/checkout';
import { colors, radius, spacing } from '@/theme';
import type { PaymentMethod } from '@/types';
import { cartTotals } from '@/utils/cart';
import { friendlyError } from '@/utils/errors';
import { formatMoney, parseMoney } from '@/utils/money';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  const [loading, setLoading] = useState(false);

  const totals = cartTotals(cart);
  const checkoutSchema = makeCheckoutSchema(totals.total);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: '',
      number: '',
      neighborhood: '',
      complement: '',
      payment: 'pix',
      changeFor: '',
    },
  });

  const selectedPayment = watch('payment');

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart.storeId) return;

    try {
      setLoading(true);

      const changeForNum =
        data.payment === 'cash' && data.changeFor.trim() !== ''
          ? parseMoney(data.changeFor)
          : null;

      const orderId = await createOrderMutation.mutateAsync({
        storeId: cart.storeId,
        items: cart.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        payment: data.payment,
        changeFor: changeForNum,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        complement: data.complement,
      });

      clearCart();
      router.replace(`/order/${orderId}`);
    } catch (error) {
      Alert.alert('Erro ao realizar pedido', friendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header showBack title="Finalizar Pedido" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>

          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Rua / Avenida"
                placeholder="Ex: Rua das Flores"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.street?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Número"
                    placeholder="123"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.number?.message}
                  />
                )}
              />
            </View>

            <View style={styles.flex2}>
              <Controller
                control={control}
                name="neighborhood"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Bairro"
                    placeholder="Centro"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.neighborhood?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="complement"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Complemento (opcional)"
                placeholder="Apto 101, Bloco B"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.complement?.message}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPayment === method.value;
            return (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.paymentOption,
                  isSelected && styles.paymentOptionSelected,
                ]}
                onPress={() => setValue('payment', method.value as PaymentMethod)}
                activeOpacity={0.8}
              >
                <View style={styles.radio}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                  <Text style={styles.paymentHint}>{method.hint}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {selectedPayment === 'cash' && (
            <View style={styles.cashContainer}>
              <Controller
                control={control}
                name="changeFor"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Troco para quanto?"
                    placeholder={`Mínimo ${formatMoney(totals.total)}`}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.changeFor?.message}
                  />
                )}
              />
            </View>
          )}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumo</Text>
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
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Confirmar Pedido • ${formatMoney(totals.total)}`}
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  paymentHint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  cashContainer: {
    marginTop: spacing.xs,
  },
  summarySection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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