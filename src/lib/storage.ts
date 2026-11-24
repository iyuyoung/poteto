import type { AuditSessionResult, PotatoPathData } from './types';
import { getYesterdayUtcDateString } from './prng';

const KEY_CLIENT_ID = 'poteto_client_id_v1';
const KEY_STREAK = 'poteto_streak_v2_en';
const KEY_LAST_DATE = 'poteto_last_audit_date_v2_en';
const KEY_DAILY_RESULT_PREFIX = 'poteto_daily_result_v2_en_';
const KEY_YESTERDAY_DRAWING_PREFIX = 'poteto_drawing_v2_en_';
const KEY_REMINDER = 'poteto_reminder_enabled_v1';

export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return 'ssr-anon';
  let id = localStorage.getItem(KEY_CLIENT_ID);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY_CLIENT_ID, id);
  }
  return id;
}

export function getSavedDailyResult(auditDate: string): AuditSessionResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${KEY_DAILY_RESULT_PREFIX}${auditDate}`);
    return raw ? (JSON.parse(raw) as AuditSessionResult) : null;
  } catch {
    return null;
  }
}

export function saveDailyResult(result: AuditSessionResult): number {
  if (typeof window === 'undefined') return 1;
  const lastDate = localStorage.getItem(KEY_LAST_DATE);
  const currentStreak = Number(localStorage.getItem(KEY_STREAK) || '0');
  const yesterday = getYesterdayUtcDateString();

  let nextStreak = currentStreak;
  if (lastDate === result.auditDate) {
    nextStreak = Math.max(1, currentStreak);
  } else if (lastDate === yesterday) {
    nextStreak = currentStreak + 1;
  } else {
    nextStreak = 1;
  }

  const enriched: AuditSessionResult = { ...result, streak: nextStreak };
  localStorage.setItem(KEY_STREAK, String(nextStreak));
  localStorage.setItem(KEY_LAST_DATE, result.auditDate);
  localStorage.setItem(`${KEY_DAILY_RESULT_PREFIX}${result.auditDate}`, JSON.stringify(enriched));
  localStorage.setItem(
    `${KEY_YESTERDAY_DRAWING_PREFIX}${result.auditDate}`,
    JSON.stringify({ drawing: result.drawing, prompt: result.drawingPrompt })
  );
  return nextStreak;
}

export function getCurrentStreak(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(KEY_STREAK) || '0');
}

export function getLocalYesterdayDrawing(): { drawing: PotatoPathData; prompt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const yesterday = getYesterdayUtcDateString();
    const raw = localStorage.getItem(`${KEY_YESTERDAY_DRAWING_PREFIX}${yesterday}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isReminderEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_REMINDER) === '1';
}

export function setReminderEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_REMINDER, enabled ? '1' : '0');
}
