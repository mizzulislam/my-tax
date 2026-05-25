import { NextRequest, NextResponse } from 'next/server';
import { getPagination, requireAdmin } from '@/lib/adminServer';
import { AuditLog, AuditSeverity } from '@/types/taxpayer';

type AuditLogRow = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  severity: AuditSeverity | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize, from, to } = getPagination(req);
  const action = searchParams.get('action')?.trim() || '';
  const severity = searchParams.get('severity')?.trim() || '';
  const search = searchParams.get('search')?.trim() || '';
  const startDate = searchParams.get('startDate')?.trim() || '';
  const endDate = searchParams.get('endDate')?.trim() || '';

  let query = auth.adminClient
    .from('audit_logs')
    .select('*', { count: 'exact' });

  if (action) query = query.eq('action', action);
  if (severity) query = query.eq('severity', severity);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
  if (search) query = query.or(`actor_email.ilike.%${search}%,target_table.ilike.%${search}%,action.ilike.%${search}%`);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: AuditLog[] = ((data || []) as AuditLogRow[]).map((log) => ({
    id: log.id,
    actorId: log.actor_id || null,
    actorEmail: log.actor_email || null,
    action: log.action,
    targetTable: log.target_table || null,
    targetId: log.target_id || null,
    details: log.details || {},
    ipAddress: log.ip_address || null,
    userAgent: log.user_agent || null,
    severity: log.severity || 'info',
    createdAt: log.created_at,
  }));

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: count || 0,
  });
}
