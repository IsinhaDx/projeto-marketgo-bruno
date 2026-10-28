import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  advanceOrder,
  cancelOrder,
  createOrder,
  getOrder,
  listOrders,
} from '@/services/orders';
import type { CreateOrderInput } from '@/types';
import { isActive } from '@/utils/orders';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && isActive(data.status) ? 5000 : false;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useAdvanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advanceOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}