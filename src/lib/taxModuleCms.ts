import { CmsTaxModule, CmsTaxModuleInput } from '@/types/taxpayer';

export const TAX_MODULE_CMS_SELECT = `
  id,
  slug,
  title,
  short_title,
  description,
  difficulty,
  category,
  status,
  quiz_score,
  estimated_minutes,
  icon,
  intro,
  learning_goals,
  core_concept,
  key_points,
  analogy_title,
  analogy,
  relevance_title,
  relevance,
  practical_checklist,
  next_steps,
  caution,
  is_published,
  order_index,
  created_at,
  updated_at
`;

type TaxModuleRow = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  status: string | null;
  quiz_score: number | null;
  estimated_minutes: number | null;
  icon: string | null;
  intro: string | null;
  learning_goals: string[] | null;
  core_concept: string | null;
  key_points: string[] | null;
  analogy_title: string | null;
  analogy: string | null;
  relevance_title: string | null;
  relevance: string | null;
  practical_checklist: string[] | null;
  next_steps: string[] | null;
  caution: string | null;
  is_published: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function normalizeDifficulty(value: string | null): CmsTaxModule['difficulty'] {
  if (value === 'menengah' || value === 'lanjut') return value;
  return 'dasar';
}

function normalizeStatus(value: string | null): CmsTaxModule['status'] {
  if (value === 'sedang' || value === 'selesai') return value;
  return 'belum';
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

export function mapTaxModuleRow(row: TaxModuleRow): CmsTaxModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title || row.title,
    description: row.description || '',
    difficulty: normalizeDifficulty(row.difficulty),
    category: row.category || 'PPh',
    status: normalizeStatus(row.status),
    quizScore: row.quiz_score,
    estimatedMinutes: Number(row.estimated_minutes || 10),
    icon: row.icon || 'file',
    intro: row.intro || '',
    learningGoals: normalizeArray(row.learning_goals),
    coreConcept: row.core_concept || '',
    keyPoints: normalizeArray(row.key_points),
    analogyTitle: row.analogy_title || 'Analogi',
    analogy: row.analogy || '',
    relevanceTitle: row.relevance_title || 'Relevansi Praktis',
    relevance: row.relevance || '',
    practicalChecklist: normalizeArray(row.practical_checklist),
    nextSteps: normalizeArray(row.next_steps),
    caution: row.caution || '',
    isPublished: Boolean(row.is_published),
    orderIndex: Number(row.order_index || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTaxModuleInsert(input: CmsTaxModuleInput) {
  return {
    slug: input.slug,
    title: input.title,
    short_title: input.shortTitle,
    description: input.description,
    difficulty: input.difficulty,
    category: input.category,
    status: input.status,
    quiz_score: input.quizScore,
    estimated_minutes: input.estimatedMinutes,
    icon: input.icon,
    intro: input.intro,
    learning_goals: input.learningGoals,
    core_concept: input.coreConcept,
    key_points: input.keyPoints,
    analogy_title: input.analogyTitle,
    analogy: input.analogy,
    relevance_title: input.relevanceTitle,
    relevance: input.relevance,
    practical_checklist: input.practicalChecklist,
    next_steps: input.nextSteps,
    caution: input.caution,
    is_published: input.isPublished,
    order_index: input.orderIndex,
  };
}

export function toTaxModuleUpdate(input: Partial<CmsTaxModuleInput>) {
  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.title !== undefined) payload.title = input.title;
  if (input.shortTitle !== undefined) payload.short_title = input.shortTitle;
  if (input.description !== undefined) payload.description = input.description;
  if (input.difficulty !== undefined) payload.difficulty = input.difficulty;
  if (input.category !== undefined) payload.category = input.category;
  if (input.status !== undefined) payload.status = input.status;
  if (input.quizScore !== undefined) payload.quiz_score = input.quizScore;
  if (input.estimatedMinutes !== undefined) payload.estimated_minutes = input.estimatedMinutes;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.intro !== undefined) payload.intro = input.intro;
  if (input.learningGoals !== undefined) payload.learning_goals = input.learningGoals;
  if (input.coreConcept !== undefined) payload.core_concept = input.coreConcept;
  if (input.keyPoints !== undefined) payload.key_points = input.keyPoints;
  if (input.analogyTitle !== undefined) payload.analogy_title = input.analogyTitle;
  if (input.analogy !== undefined) payload.analogy = input.analogy;
  if (input.relevanceTitle !== undefined) payload.relevance_title = input.relevanceTitle;
  if (input.relevance !== undefined) payload.relevance = input.relevance;
  if (input.practicalChecklist !== undefined) payload.practical_checklist = input.practicalChecklist;
  if (input.nextSteps !== undefined) payload.next_steps = input.nextSteps;
  if (input.caution !== undefined) payload.caution = input.caution;
  if (input.isPublished !== undefined) payload.is_published = input.isPublished;
  if (input.orderIndex !== undefined) payload.order_index = input.orderIndex;
  payload.updated_at = new Date().toISOString();
  return payload;
}
