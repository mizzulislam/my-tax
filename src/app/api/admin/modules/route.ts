import { NextRequest, NextResponse } from 'next/server';
import { insertAuditLog, requireAdmin } from '@/lib/adminServer';
import {
  mapTaxModuleRow,
  TAX_MODULE_CMS_SELECT,
  toTaxModuleInsert,
  toTaxModuleUpdate,
} from '@/lib/taxModuleCms';
import { CmsTaxModuleInput } from '@/types/taxpayer';

type ModulePayload = Partial<CmsTaxModuleInput> & { id?: string };

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeInput(body: ModulePayload): CmsTaxModuleInput {
  const title = String(body.title || '').trim();
  const slug = String(body.slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    slug,
    title,
    shortTitle: String(body.shortTitle || title).trim(),
    description: String(body.description || '').trim(),
    difficulty: body.difficulty === 'menengah' || body.difficulty === 'lanjut' ? body.difficulty : 'dasar',
    category: String(body.category || 'PPh').trim(),
    status: body.status === 'sedang' || body.status === 'selesai' ? body.status : 'belum',
    quizScore: typeof body.quizScore === 'number' ? body.quizScore : null,
    estimatedMinutes: Math.max(Number(body.estimatedMinutes || 10), 1),
    icon: String(body.icon || 'file').trim(),
    intro: String(body.intro || '').trim(),
    learningGoals: normalizeStringArray(body.learningGoals),
    coreConcept: String(body.coreConcept || '').trim(),
    keyPoints: normalizeStringArray(body.keyPoints),
    analogyTitle: String(body.analogyTitle || 'Analogi').trim(),
    analogy: String(body.analogy || '').trim(),
    relevanceTitle: String(body.relevanceTitle || 'Relevansi Praktis').trim(),
    relevance: String(body.relevance || '').trim(),
    practicalChecklist: normalizeStringArray(body.practicalChecklist),
    nextSteps: normalizeStringArray(body.nextSteps),
    caution: String(body.caution || '').trim(),
    isPublished: Boolean(body.isPublished),
    orderIndex: Number(body.orderIndex || 0),
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.adminClient
    .from('tax_learning_modules')
    .select(TAX_MODULE_CMS_SELECT)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: (data || []).map((row) => mapTaxModuleRow(row as Parameters<typeof mapTaxModuleRow>[0])),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ModulePayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const input = normalizeInput(body);
  if (!input.slug || !input.title) {
    return NextResponse.json({ error: 'Slug dan judul modul wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await auth.adminClient
    .from('tax_learning_modules')
    .insert(toTaxModuleInsert(input))
    .select(TAX_MODULE_CMS_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: 'TAX_MODULE_CREATE',
    targetTable: 'tax_learning_modules',
    targetId: data.id,
    severity: input.isPublished ? 'warning' : 'info',
    details: { slug: input.slug, title: input.title, isPublished: input.isPublished },
    req,
  });

  return NextResponse.json(mapTaxModuleRow(data as Parameters<typeof mapTaxModuleRow>[0]));
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ModulePayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'ID modul wajib dikirim.' }, { status: 400 });
  }

  const input = normalizeInput(body);
  if (!input.slug || !input.title) {
    return NextResponse.json({ error: 'Slug dan judul modul wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await auth.adminClient
    .from('tax_learning_modules')
    .update(toTaxModuleUpdate(input))
    .eq('id', body.id)
    .select(TAX_MODULE_CMS_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: 'TAX_MODULE_UPDATE',
    targetTable: 'tax_learning_modules',
    targetId: body.id,
    severity: input.isPublished ? 'warning' : 'info',
    details: { slug: input.slug, title: input.title, isPublished: input.isPublished },
    req,
  });

  return NextResponse.json(mapTaxModuleRow(data as Parameters<typeof mapTaxModuleRow>[0]));
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID modul wajib dikirim.' }, { status: 400 });
  }

  const { data: before } = await auth.adminClient
    .from('tax_learning_modules')
    .select('id, slug, title, is_published')
    .eq('id', id)
    .maybeSingle();

  const { error } = await auth.adminClient
    .from('tax_learning_modules')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: 'TAX_MODULE_DELETE',
    targetTable: 'tax_learning_modules',
    targetId: id,
    severity: 'warning',
    details: before || { id },
    req,
  });

  return NextResponse.json({ ok: true });
}
