import { NextRequest, NextResponse } from 'next/server';
import { getPagination, insertAuditLog, isValidRole, requireAdmin } from '@/lib/adminServer';
import { AdminUser } from '@/types/taxpayer';

type ProfileRow = {
  id: string;
  full_name: string | null;
  npwp: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function normalizeSearchTerm(value: string) {
  return value.replace(/[%,()]/g, '').slice(0, 80);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize, from, to } = getPagination(req);
  const search = normalizeSearchTerm(searchParams.get('search')?.trim() || '');
  const role = searchParams.get('role')?.trim() || '';

  let query = auth.adminClient
    .from('profiles')
    .select('id, full_name, npwp, role, created_at, updated_at', { count: 'exact' });

  if (role && isValidRole(role)) {
    query = query.eq('role', role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,npwp.ilike.%${search}%`);
  }

  const { data: profiles, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (profiles || []).map((profile) => profile.id);
  const emailById = new Map<string, string | null>();

  if (ids.length > 0) {
    const { data: authUsers } = await auth.adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    authUsers.users
      .filter((user) => ids.includes(user.id))
      .forEach((user) => emailById.set(user.id, user.email || null));
  }

  const items: AdminUser[] = ((profiles || []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    email: emailById.get(profile.id) || null,
    fullName: profile.full_name || null,
    npwp: profile.npwp || null,
    role: isValidRole(profile.role) ? profile.role : 'user',
    createdAt: profile.created_at || null,
    updatedAt: profile.updated_at || null,
  }));

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: count || 0,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { userId?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  if (!body.userId || !isValidRole(body.role)) {
    return NextResponse.json({ error: 'userId dan role valid wajib dikirim.' }, { status: 400 });
  }

  const { data: before } = await auth.adminClient
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', body.userId)
    .maybeSingle();

  const { data, error } = await auth.adminClient
    .from('profiles')
    .update({ role: body.role })
    .eq('id', body.userId)
    .select('id, full_name, npwp, role, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: 'ROLE_CHANGE',
    targetTable: 'profiles',
    targetId: body.userId,
    severity: body.role === 'admin' ? 'warning' : 'info',
    details: {
      before: { role: before?.role || null, full_name: before?.full_name || null },
      after: { role: body.role, full_name: data.full_name || null },
    },
    req,
  });

  return NextResponse.json({
    id: data.id,
    email: null,
    fullName: data.full_name || null,
    npwp: data.npwp || null,
    role: data.role,
    createdAt: data.created_at || null,
    updatedAt: data.updated_at || null,
  });
}
