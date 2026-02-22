import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FinanceEntry, UserProfile, EntryType } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllFinanceEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<FinanceEntry[]>({
    queryKey: ['financeEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFinanceEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEntriesByDateRange() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { startDate: bigint; endDate: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getEntriesByDateRange(params.startDate, params.endDate);
    },
  });
}

export function useGetEntriesByType() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (entryType: EntryType) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getEntriesByType(entryType);
    },
  });
}

export function useAddOrUpdateFinanceEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      amount: number;
      date: bigint;
      category: string;
      entryType: EntryType;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      try {
        await actor.addFinanceEntry(
          params.id,
          params.amount,
          params.date,
          params.category,
          params.entryType,
          params.description
        );
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          await actor.updateFinanceEntry(
            params.id,
            params.amount,
            params.date,
            params.category,
            params.entryType,
            params.description
          );
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeEntries'] });
    },
  });
}

export function useDeleteFinanceEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteFinanceEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeEntries'] });
    },
  });
}
