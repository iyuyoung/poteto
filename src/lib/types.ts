export type Point = [number, number];
export type Stroke = Point[];

export interface PotatoPathData {
  strokes: Stroke[];
}

export interface PotatoDrawing {
  id: string;
  promptId: string;
  auditDate: string;
  pathData: PotatoPathData;
  isOfficialDecoy?: boolean;
  caption?: string;
  authorTag?: string;
  fooledCount?: number;
}

export interface Stage1Prompt {
  id: string;
  title: string;
  subtitle: string;
  targetCount: number;
  tagLabel: string;
}

export interface Stage2GameMeta {
  id: string;
  title: string;
  instruction: string;
  potatoStatus: string;
  potatoQuip: string;
  difficulty: 'gentle' | 'tricky' | 'absurd';
}

export interface Stage3Prompt {
  id: string;
  title: string;
  hint: string;
  badgeText: string;
}

export interface DailyAuditPayload {
  auditDate: string;
  auditNumber: number;
  seed: string;
  stage1Prompt: Stage1Prompt;
  stage2Game: Stage2GameMeta;
  stage3Prompt: Stage3Prompt;
  featuredDrawings: PotatoDrawing[];
  reserveDrawings: PotatoDrawing[];
  source: 'neon' | 'seed';
}

export interface YesterdayHookPayload {
  hasYesterday: boolean;
  auditDate?: string;
  fooledCount: number;
  promptTitle?: string;
  message?: string;
  drawing?: PotatoPathData;
}

export interface StageResult {
  stage: 1 | 2 | 3;
  passed: boolean;
  humanScore: number;
  potatoScore: number;
  summary: string;
}

export interface AuditSessionResult {
  auditDate: string;
  auditNumber: number;
  mode: 'daily' | 'endless';
  stages: [StageResult, StageResult, StageResult];
  humanPurity: number;
  potatoTotal: number;
  humanTotal: number;
  verdictTitle: string;
  verdictSubtitle: string;
  drawing: PotatoPathData;
  drawingPrompt: string;
  streak: number;
  completedAt: string;
}
