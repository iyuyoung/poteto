/**
 * Deterministic PRNG seeded by UTC date string (e.g. "2026-11-24")
 * Guarantees every human on Earth faces the exact same daily potato audit.
 */

const EPOCH_UTC_MS = Date.UTC(2026, 9, 13); // 2026-10-13 -> Audit #001 (so 2026-11-24 is #043)

export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRng(seedStr: string): () => number {
  return mulberry32(hashString(seedStr));
}

export function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function getUtcDateString(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayUtcDateString(date: Date = new Date()): string {
  const prev = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getUtcDateString(prev);
}

export function getAuditNumber(utcDateStr: string): number {
  const [y, m, d] = utcDateStr.split('-').map(Number);
  const currentMs = Date.UTC(y, m - 1, d);
  const diffDays = Math.floor((currentMs - EPOCH_UTC_MS) / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays + 1);
}

export function formatAuditNumber(num: number): string {
  return String(num).padStart(3, '0');
}

export function getMsUntilNextUtcMidnight(now: Date = new Date()): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(0, next - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
