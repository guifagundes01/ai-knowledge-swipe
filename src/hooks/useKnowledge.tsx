import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getKnowledgeService, queryKeys } from "@/services";
import type { ExpertiseLevel, SwipeAction } from "@/services";

/** All data access goes through the services layer — never fetch directly in a component. */

export function useProfile() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => service.getProfile() });
}

export function useTopics() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.topics, queryFn: () => service.getTopics() });
}

export function useFeed() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.feed, queryFn: () => service.getFeed(20) });
}

export function useSaved() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.saved, queryFn: () => service.getSaved() });
}

export function useMustLearn() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.mustLearn, queryFn: () => service.getMustLearn() });
}

export function useActivity() {
  const service = getKnowledgeService();
  return useQuery({ queryKey: queryKeys.activity, queryFn: () => service.getActivity(15) });
}

function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => {
    for (const key of Object.values(queryKeys)) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  };
}

export function useOnboarding() {
  const service = getKnowledgeService();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: { topics: string[]; level: ExpertiseLevel }) =>
      service.completeOnboarding(input),
    onSuccess: invalidate,
  });
}

export function useSwipe() {
  const service = getKnowledgeService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; action: SwipeAction }) =>
      service.swipe(input.itemId, input.action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved });
      queryClient.invalidateQueries({ queryKey: queryKeys.mustLearn });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
  });
}

export function useMarkConsumed() {
  const service = getKnowledgeService();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (itemId: string) => service.markConsumed(itemId),
    onSuccess: invalidate,
  });
}

export function useResetProfile() {
  const service = getKnowledgeService();
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: () => service.reset(), onSuccess: invalidate });
}
