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
