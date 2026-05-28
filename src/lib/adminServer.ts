import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/apiAuth';
import { AuditSeverity, UserRole } from '@/types/taxpayer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const ADMIN_CONFIG_ERROR =
  'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi. Tambahkan service role key di environment server agar admin panel dapat membaca data lintas user dengan aman.';

export function hasAdminServiceRole() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function createScopedServerClient(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminServerClient() {
  if (!hasAdminServiceRole()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getRequestMetadata(req?: NextRequest) {
  return {
    ip_address: req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    user_agent: req?.headers.get('user-agent') || null,
  };
}

function redactAuditDetails(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactAuditDetails);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (/password|token|secret|key|authorization|cookie|npwp|nik/i.test(key)) {
          return [key, '[REDACTED]'];
        }
        return [key, redactAuditDetails(entry)];
      })
    );
  }

  if (typeof value === 'string') {
    return value.slice(0, 500);
  }

  return value;
}

export function adminErrorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function logSecurityEvent(payload: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetTable?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
  severity?: AuditSeverity;
  req?: NextRequest;
}) {
  const client = createAdminServerClient();
  const metadata = getRequestMetadata(payload.req);

  if (!client) {
    console.warn('[security-event]', payload.action, {
      severity: payload.severity || 'warning',
      actorId: payload.actorId || null,
      actorEmail: payload.actorEmail || null,
      ...metadata,
    });
    return;
  }

  const { error } = await client.from('audit_logs').insert({
    actor_id: payload.actorId || null,
    actor_email: payload.actorEmail || null,
    action: payload.action,
    target_table: payload.targetTable || null,
    target_id: payload.targetId || null,
    details: redactAuditDetails(payload.details || {}) as Record<string, unknown>,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    severity: payload.severity || 'warning',
  });

  if (error) {
    console.warn('[security-event-failed]', payload.action, error.message);
  }
}

export async function requireAdmin(req: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: 'Konfigurasi Supabase publik belum lengkap.', status: 500 as const };
  }

  if (!getBearerToken(req.headers)) {
    await logSecurityEvent({
      action: 'ADMIN_AUTH_MISSING_BEARER',
      severity: 'warning',
      req,
    });
    return { error: 'Bearer token admin wajib dikirim.', status: 401 as const };
  }

  const scopedClient = createScopedServerClient(req);
  const { data: userData, error: userError } = await scopedClient.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    await logSecurityEvent({
      action: 'ADMIN_AUTH_INVALID_SESSION',
      severity: 'warning',
      details: { reason: userError?.message || 'missing user' },
      req,
    });
    return { error: 'Sesi admin tidak valid atau sudah kedaluwarsa.', status: 401 as const };
  }

  const { data: profile, error: profileError } = await scopedClient
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    await logSecurityEvent({
      actorId: user.id,
      actorEmail: user.email || null,
      action: profileError ? 'ADMIN_AUTH_PROFILE_LOOKUP_FAILED' : 'ADMIN_AUTH_FORBIDDEN_ROLE',
      severity: profileError ? 'error' : 'warning',
      details: {
        role: profile?.role || null,
        reason: profileError?.message || 'not admin',
      },
      req,
    });
    return { error: 'Akses ditolak. Endpoint ini hanya untuk admin.', status: 403 as const };
  }

  const adminClient = createAdminServerClient();
  if (!adminClient) {
    await logSecurityEvent({
      actorId: user.id,
      actorEmail: user.email || null,
      action: 'ADMIN_SERVICE_ROLE_MISSING',
      severity: 'critical',
      req,
    });
    return { error: ADMIN_CONFIG_ERROR, status: 503 as const };
  }

  return {
    adminClient,
    actor: {
      id: user.id,
      email: user.email || null,
      name: profile.full_name || null,
    },
  };
}

export function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') || 20), 1), 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export async function insertAuditLog(
  client: SupabaseClient,
  payload: {
    actorId?: string | null;
    actorEmail?: string | null;
    action: string;
    targetTable?: string | null;
    targetId?: string | null;
    details?: Record<string, unknown>;
    severity?: AuditSeverity;
    req?: NextRequest;
  }
) {
  const metadata = getRequestMetadata(payload.req);
  const { error } = await client.from('audit_logs').insert({
    actor_id: payload.actorId || null,
    actor_email: payload.actorEmail || null,
    action: payload.action,
    target_table: payload.targetTable || null,
    target_id: payload.targetId || null,
    details: redactAuditDetails(payload.details || {}) as Record<string, unknown>,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    severity: payload.severity || 'info',
  });

  if (error) {
    console.warn('[audit-log-failed]', payload.action, error.message);
  }
}

export function isValidRole(role: unknown): role is UserRole {
  return role === 'user' || role === 'admin';
}
