import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import type { Attachment, AttachmentType, CreateAttachmentInput } from "@/types/attachment.types";
import { toast } from "sonner";

/**
 * Hook to fetch all attachments for the current business
 * Optionally filter by type
 */
export function useAttachments(type?: AttachmentType) {
  return useQuery({
    queryKey: QUERY_KEYS.ATTACHMENTS.LIST(type),
    queryFn: async () => {
      const params = type ? { type } : undefined;
      const response = await apiClient.get<Attachment[]>(API_ROUTES.ATTACHMENTS.GET_ALL, {
        params,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single attachment by ID
 */
export function useAttachment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ATTACHMENTS.DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<Attachment>(API_ROUTES.ATTACHMENTS.GET_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new attachment (business upload)
 * Note: File should already be uploaded to Supabase Storage
 * This just saves the metadata to the backend
 */
export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAttachmentInput) => {
      const response = await apiClient.post<Attachment>(API_ROUTES.ATTACHMENTS.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTACHMENTS.ALL });
      toast.success("Attachment uploaded successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to delete an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<Attachment>(API_ROUTES.ATTACHMENTS.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTACHMENTS.ALL });
      toast.success("Attachment deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Filter attachments by cashier ID
 */
export function filterAttachmentsByCashier(
  attachments: Attachment[] | undefined,
  cashierId: string
): Attachment[] {
  if (!attachments) return [];
  return attachments.filter((attachment) => attachment.cashierId === cashierId);
}

/**
 * Group attachments by type
 */
export function groupAttachmentsByType(
  attachments: Attachment[]
): Record<AttachmentType, Attachment[]> {
  return attachments.reduce(
    (acc, attachment) => {
      if (!acc[attachment.type]) {
        acc[attachment.type] = [];
      }
      acc[attachment.type].push(attachment);
      return acc;
    },
    {} as Record<AttachmentType, Attachment[]>
  );
}
