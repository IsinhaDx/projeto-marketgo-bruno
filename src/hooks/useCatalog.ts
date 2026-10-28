import { useQuery } from '@tanstack/react-query';
import {
  getProduct,
  getStore,
  listProducts,
  listStores,
} from '@/services/stores';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: listStores,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => getStore(id),
    enabled: Boolean(id),
  });
}

export function useProducts(storeId: string) {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
    enabled: Boolean(storeId),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
}