import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';
import { AdminStats } from '@/types/taxpayer';

type TaxReportAmountRow = {
  tax_payable: number | string | null;
};

function startOfDayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function buildLastSixWeeks() {
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (5 - index) * 7);
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      label: `M-${6 - index}`,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  });
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const today = startOfDayIso();

  const [
    usersResult,
    transactionsResult,
    taxResult,
    pendingDocsResult,
    auditTodayResult,
    criticalAuditResult,
  ] = await Promise.all([
    auth.adminClient.from('profiles').select('id', { count: 'exact', head: true }),
    auth.adminClient.from('transactions').select('id', { count: 'exact', head: true }),
    auth.adminClient.from('tax_reports').select('tax_payable'),
    auth.adminClient.from('documents').select('id', { count: 'exact', head: true }).eq('is_verified', false),
    auth.adminClient.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', today),
    auth.adminClient.from('audit_logs').select('id', { count: 'exact', head: true }).in('severity', ['error', 'critical']),
  ]);

  const trend = await Promise.all(
    buildLastSixWeeks().map(async (week) => {
      const { count } = await auth.adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', week.start)
        .lte('created_at', week.end);

      return { label: week.label, count: count || 0 };
    })
  );

  const totalTaxPayable = ((taxResult.data || []) as TaxReportAmountRow[]).reduce(
    (sum, report) => sum + Number(report.tax_payable || 0),
    0
  );

  const hasCriticalError = Boolean(criticalAuditResult.error);
  const healthPenalty = Math.min((criticalAuditResult.count || 0) * 3, 25);

  const payload: AdminStats = {
    totalUsers: usersResult.count || 0,
    totalTransactions: transactionsResult.count || 0,
    totalTaxPayable,
    pendingDocuments: pendingDocsResult.count || 0,
    auditEventsToday: auditTodayResult.count || 0,
    criticalAuditEvents: criticalAuditResult.count || 0,
    systemHealth: hasCriticalError ? 90 : Math.max(75, 99 - healthPenalty),
    registrationTrend: trend,
  };

  return NextResponse.json(payload);
}
