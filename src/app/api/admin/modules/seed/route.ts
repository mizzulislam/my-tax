import { NextRequest, NextResponse } from 'next/server';
import { TAX_LEARNING_MODULES } from '@/data/taxLearningModules';
import { insertAuditLog, requireAdmin } from '@/lib/adminServer';
import { toTaxModuleInsert } from '@/lib/taxModuleCms';
import { CmsTaxModuleInput } from '@/types/taxpayer';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rows = TAX_LEARNING_MODULES.map((module, index) => toTaxModuleInsert({
    slug: module.slug,
    title: module.title,
    shortTitle: module.shortTitle,
    description: module.description,
    difficulty: module.difficulty,
    category: module.category,
    status: module.status,
    quizScore: module.quizScore ?? null,
    estimatedMinutes: module.estimatedMinutes,
    icon: module.icon,
    intro: module.intro,
    learningGoals: module.learningGoals,
    coreConcept: module.coreConcept,
    keyPoints: module.keyPoints,
    analogyTitle: module.analogyTitle,
    analogy: module.analogy,
    relevanceTitle: module.relevanceTitle,
    relevance: module.relevance,
    practicalChecklist: module.practicalChecklist,
    nextSteps: module.nextSteps,
    caution: module.caution,
    isPublished: true,
    orderIndex: index + 1,
  } satisfies CmsTaxModuleInput));

  const { error } = await auth.adminClient
    .from('tax_learning_modules')
    .upsert(rows, { onConflict: 'slug' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertAuditLog(auth.adminClient, {
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    action: 'TAX_MODULE_SEED',
    targetTable: 'tax_learning_modules',
    severity: 'warning',
    details: { count: rows.length },
    req,
  });

  return NextResponse.json({ ok: true, count: rows.length });
}
