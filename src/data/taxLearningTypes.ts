export type TaxDifficulty = 'dasar' | 'menengah' | 'lanjut';
export type LearningStatus = 'belum' | 'sedang' | 'selesai';

export interface TaxLearningModule {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: TaxDifficulty;
  category: 'Hukum' | 'KUP' | 'Keuangan' | 'PPh' | 'PPN' | 'Dokumen' | 'Aset' | 'Strategi' | 'Sistem';
  status: LearningStatus;
  quizScore?: number;
  estimatedMinutes: number;
  icon: 'landmark' | 'calculator' | 'file' | 'scale' | 'briefcase' | 'building' | 'home' | 'spreadsheet';
  intro: string;
  learningGoals: string[];
  coreConcept: string;
  keyPoints: string[];
  analogyTitle: string;
  analogy: string;
  relevanceTitle: string;
  relevance: string;
  practicalChecklist: string[];
  nextSteps: string[];
  caution: string;
}