import { NextResponse } from 'next/server';
import { createAdminServerClient } from '@/lib/adminServer';
import { mapTaxModuleRow, TAX_MODULE_CMS_SELECT } from '@/lib/taxModuleCms';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = createAdminServerClient();
  if (!client) {
    return NextResponse.json({ items: [], source: 'fallback' });
  }

  const { data, error } = await client
    .from('tax_learning_modules')
    .select(TAX_MODULE_CMS_SELECT)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ items: [], source: 'fallback', error: error.message });
  }

  return NextResponse.json({
    items: (data || []).map((row) => mapTaxModuleRow(row as Parameters<typeof mapTaxModuleRow>[0])),
    source: 'cms',
  });
}
