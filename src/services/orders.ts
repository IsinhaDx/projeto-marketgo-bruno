import { supabase } from '@/lib/supabase';
import type { CreateOrderInput, Order, OrderItem, OrderStatus } from '@/types';

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_order', {
    p_store_id: input.storeId,
    p_items: input.items,
    p_payment: input.payment,
    p_change_for: input.changeFor,
    p_street: input.street,
    p_number: input.number,
    p_neighborhood: input.neighborhood,
    p_complement: input.complement,
  });

  if (error) throw error;
  return data as string;
}

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrder(id: string): Promise<Order> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('name');

  if (itemsError) throw itemsError;

  return {
    ...(order as Order),
    items: (items ?? []) as OrderItem[],
  };
}

export async function advanceOrder(id: string): Promise<OrderStatus> {
  const { data, error } = await supabase.rpc('advance_order', {
    p_order_id: id,
  });

  if (error) throw error;
  return data as OrderStatus;
}

export async function cancelOrder(id: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_order', {
    p_order_id: id,
  });

  if (error) throw error;
}