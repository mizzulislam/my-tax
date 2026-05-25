import { NextRequest, NextResponse } from 'next/server';
import { getPagination, insertAuditLog, requireAdmin } from '@/lib/adminServer';
import { AdminDocument } from '@/types/taxpayer';

type DocumentRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  category: string;
  tax_year: number | null;
  is_verified: boolean | null;
  created_at: string;
};

type ProfileOwnerRow = {
  id: string;
  full_name: string | null;
};

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize, from, to } = getPagination(req);
  const status = searchParams.get('status') || 'pending';

  let query = auth.adminClient
    .from('documents')
    .select('id, user_id, file_name, file_type, category, tax_year, is_verified, created_at', { count: 'exact' });

  if (status === 'pending') query = query.eq('is_verified', false);
  if (status === 'verified') query = query.eq('is_verified', true);

  const { data: documents, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (documents || []) as DocumentRow[];
  const ownerIds = Array.from(new Set(rows.map((doc) => doc.user_id)));
  const ownerById = new Map<string, string | null>();

  if (ownerIds.length > 0) {
    const { data: profiles } = await auth.adminClient
      .from('profiles')
      .select('id, full_name')
      .in('id', ownerIds);

    ((profiles || []) as ProfileOwnerRow[]).forEach((profile) => ownerById.set(profile.id, profile.full_name || null));
  }

  const items: AdminDocument[] = rows.map((doc) => ({
    id: doc.id,
    userId: doc.user_id,
    ownerName: ownerById.get(doc.user_id) || null,
    fileName: doc.file_name,
    fileType: doc.file_type,
    category: doc.category,
    taxYear: doc.tax_year ? Number(doc.tax_year) : null,
    isVerified: Boolean(doc.is_verified),
    createdAt: doc.created_at,
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

  let body: { documentId?: string; isVerified?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  if (!body.documentId || typeof body.isVerified !== 'boolean') {
    return NextResponse.json({ error: 'documentId dan isVerified wajib dikirim.' }, { status: 400 });
  }

  const { data, error } = await auth.adminClient
    .from('documents')
    .update({ is_verified: body.isVerified })
    .eq('id', body.documentId)
    .select('id, user_id, file_name, file_type, category, tax_year, is_verified, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: body.isVerified ? 'DOCUMENT_APPROVE' : 'DOCUMENT_REJECT',
    targetTable: 'documents',
    targetId: body.documentId,
    severity: 'info',
    details: {
      fileName: data.file_name,
      isVerified: body.isVerified,
      userId: data.user_id,
    },
    req,
  });

  return NextResponse.json({
    id: data.id,
    userId: data.user_id,
    ownerName: null,
    fileName: data.file_name,
    fileType: data.file_type,
    category: data.category,
    taxYear: data.tax_year ? Number(data.tax_year) : null,
    isVerified: Boolean(data.is_verified),
    createdAt: data.created_at,
  });
}
