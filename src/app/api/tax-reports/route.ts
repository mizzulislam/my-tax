import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createScopedServerClient, logSecurityEvent } from '@/lib/adminServer';
import { ApiAuthError, requireBearerToken } from '@/lib/apiAuth';
import { calculateServerTax, createTaxReportSchema } from '@/lib/taxReportServer';

export async function POST(req: NextRequest) {
  try {
    requireBearerToken(req.headers);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      await logSecurityEvent({
        action: 'TAX_REPORT_AUTH_MISSING_BEARER',
        severity: 'warning',
        req,
      });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const supabase = createScopedServerClient(req);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    await logSecurityEvent({
      action: 'TAX_REPORT_AUTH_INVALID_SESSION',
      severity: 'warning',
      details: { reason: userError?.message || 'missing user' },
      req,
    });
    return NextResponse.json({ error: 'Sesi aktif tidak ditemukan. Silakan login kembali.' }, { status: 401 });
  }

  let parsed: z.infer<typeof createTaxReportSchema>;
  try {
    const body = await req.json();
    const result = createTaxReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Data laporan pajak tidak valid.' },
        { status: 400 }
      );
    }

    parsed = result.data;
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const taxPayable = calculateServerTax(parsed);

  if (!Number.isFinite(taxPayable) || taxPayable < 0) {
    return NextResponse.json({ error: 'Perhitungan pajak server tidak valid.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('tax_reports')
    .insert({
      user_id: user.id,
      tax_year: parsed.taxYear,
      tax_period: parsed.taxPeriod,
      gross_income: parsed.grossIncome,
      tax_payable: taxPayable,
      status: parsed.status,
    })
    .select('id, tax_year, tax_period, gross_income, tax_payable, status, created_at')
    .single();

  if (error) {
    await logSecurityEvent({
      actorId: user.id,
      actorEmail: user.email || null,
      action: 'TAX_REPORT_CREATE_FAILED',
      targetTable: 'tax_reports',
      severity: 'error',
      details: { taxYear: parsed.taxYear, taxPeriod: parsed.taxPeriod, reason: error.message },
      req,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logSecurityEvent({
    actorId: user.id,
    actorEmail: user.email || null,
    action: 'TAX_REPORT_CREATE',
    targetTable: 'tax_reports',
    targetId: data.id,
    severity: parsed.status === 'submitted' ? 'warning' : 'info',
    details: {
      taxYear: parsed.taxYear,
      taxPeriod: parsed.taxPeriod,
      status: parsed.status,
      grossIncome: parsed.grossIncome,
      taxPayable,
    },
    req,
  });

  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  try {
    requireBearerToken(req.headers);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const supabaseScoped = createScopedServerClient(req);
  const { data: userData, error: userError } = await supabaseScoped.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ error: 'Sesi aktif tidak ditemukan.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID laporan tidak diberikan.' }, { status: 400 });
  }

  // We use the admin client to bypass RLS since the DELETE policy might be missing
  const { createAdminServerClient } = await import('@/lib/adminServer');
  const adminClient = createAdminServerClient();
  
  if (!adminClient) {
    return NextResponse.json({ error: 'Konfigurasi server bermasalah.' }, { status: 500 });
  }

  // Check if report exists and log ownership
  const { data: existingReport } = await adminClient
    .from('tax_reports')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existingReport) {
    return NextResponse.json({ error: 'Laporan tidak ditemukan di database.' }, { status: 404 });
  }

  if (existingReport.user_id !== user.id) {
    console.error(`User ID mismatch: report.user_id = ${existingReport.user_id}, session.user.id = ${user.id}`);
    return NextResponse.json({ error: 'Akses ditolak. Anda tidak berhak menghapus laporan ini.' }, { status: 403 });
  }

  const { error, count } = await adminClient
    .from('tax_reports')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    console.error(`Gagal menghapus: Laporan dengan ID ${id} dan user ${user.id} tidak ditemukan.`);
    return NextResponse.json({ error: 'Laporan tidak ditemukan atau Anda tidak memiliki akses.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
