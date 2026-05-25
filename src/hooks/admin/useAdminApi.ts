import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  AdminDocument,
  AdminStats,
  AdminUser,
  AuditLog,
  CmsTaxModule,
  CmsTaxModuleInput,
  PaginatedResult,
  UserRole,
} from '@/types/taxpayer';

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error('Sesi admin tidak ditemukan.');
  }

  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Permintaan admin gagal.');
  }

  return payload as T;
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin_stats'],
    queryFn: () => adminFetch('/api/admin/stats'),
  });
}

export function useAdminUsers(filters: { page: number; search?: string; role?: string }) {
  return useQuery<PaginatedResult<AdminUser>>({
    queryKey: ['admin_users', filters],
    queryFn: () => adminFetch(`/api/admin/users?${toQueryString({ ...filters, pageSize: 20 })}`),
  });
}

export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: string; role: UserRole }) =>
      adminFetch<AdminUser>('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    },
  });
}

export function useAuditLogs(filters: {
  page: number;
  search?: string;
  action?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<PaginatedResult<AuditLog>>({
    queryKey: ['admin_audit_logs', filters],
    queryFn: () => adminFetch(`/api/admin/audit?${toQueryString({ ...filters, pageSize: 20 })}`),
  });
}

export function useAdminDocuments(filters: { page: number; status?: string }) {
  return useQuery<PaginatedResult<AdminDocument>>({
    queryKey: ['admin_documents', filters],
    queryFn: () => adminFetch(`/api/admin/documents?${toQueryString({ ...filters, pageSize: 20 })}`),
  });
}

export function useVerifyAdminDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { documentId: string; isVerified: boolean }) =>
      adminFetch<AdminDocument>('/api/admin/documents', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    },
  });
}

export function useAdminModules() {
  return useQuery<{ items: CmsTaxModule[] }>({
    queryKey: ['admin_tax_modules'],
    queryFn: () => adminFetch('/api/admin/modules'),
  });
}

export function useSaveAdminModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CmsTaxModuleInput> & { id?: string }) =>
      adminFetch<CmsTaxModule>('/api/admin/modules', {
        method: payload.id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tax_modules'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });
}

export function useDeleteAdminModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<{ ok: true }>(`/api/admin/modules?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tax_modules'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });
}

export function useSeedAdminModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminFetch<{ ok: true; count: number }>('/api/admin/modules/seed', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tax_modules'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });
}
