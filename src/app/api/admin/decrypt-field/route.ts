import { NextRequest, NextResponse } from 'next/server';
import { insertAuditLog, requireAdmin } from '@/lib/adminServer';

const DISABLED_MESSAGE =
  'Fitur lihat data lengkap admin sementara dinonaktifkan sampai consent pengguna dan audit trail siap.';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const fieldType = typeof body.fieldType === 'string' ? body.fieldType : 'unknown';
    const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : null;

    await insertAuditLog(auth.adminClient, {
      actorId: auth.actor.id,
      actorEmail: auth.actor.email,
      action: 'SENSITIVE_FIELD_REVEAL_DISABLED',
      targetTable: 'profiles',
      targetId: targetUserId,
      severity: 'warning',
      details: { fieldType },
      req: request,
    });

    return NextResponse.json({ error: DISABLED_MESSAGE }, { status: 423 });

  } catch (error: unknown) {
    console.error('Sensitive field reveal audit error:', error);
    return NextResponse.json({ error: DISABLED_MESSAGE }, { status: 423 });
  }
}
