import type { Point, PotatoPathData, Stroke } from './types';

/**
 * Ramer-Douglas-Peucker simplification for lightweight normalized (0..100) potato strokes.
 * Keeps each hand-drawn stroke to ~12-30 key points (300-600 bytes total JSON).
 */
function perpendicularDistance(pt: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const magSq = dx * dx + dy * dy;
  if (magSq === 0) {
    return Math.hypot(pt[0] - lineStart[0], pt[1] - lineStart[1]);
  }
  const num = Math.abs(dy * pt[0] - dx * pt[1] + lineEnd[0] * lineStart[1] - lineEnd[1] * lineStart[0]);
  return num / Math.sqrt(magSq);
}

export function rdpSimplify(points: Stroke, epsilon = 1.8): Stroke {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, index + 1), epsilon);
    const right = rdpSimplify(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[end]];
}

export function normalizeStroke(rawPoints: Array<{ x: number; y: number }>, width: number, height: number): Stroke {
  if (!width || !height || rawPoints.length === 0) return [];

  const normalized: Stroke = rawPoints.map((p) => [
    Math.max(0, Math.min(100, Math.round((p.x / width) * 100))),
    Math.max(0, Math.min(100, Math.round((p.y / height) * 100))),
  ]);

  // Deduplicate consecutive identical integer points
  const deduped: Stroke = [normalized[0]];
  for (let i = 1; i < normalized.length; i++) {
    const prev = deduped[deduped.length - 1];
    if (normalized[i][0] !== prev[0] || normalized[i][1] !== prev[1]) {
      deduped.push(normalized[i]);
    }
  }

  if (deduped.length <= 2) return deduped;

  // Adaptive epsilon so each stroke stays between ~8 and 30 points
  let epsilon = 1.6;
  let simplified = rdpSimplify(deduped, epsilon);
  while (simplified.length > 30 && epsilon < 8) {
    epsilon += 0.6;
    simplified = rdpSimplify(deduped, epsilon);
  }
  return simplified;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  closureDistance?: number;
  aspectRatio?: number;
}

/**
 * Layer 1 Anti-Abuse / Anti-TTP Validation (shared between client & server):
 * 1. 1 to 4 strokes max (1 outline + up to 3 face details: eyes + mouth/sprout)
 * 2. Stroke 1 must be roughly closed (start-to-end distance < 32 in 0..100 coordinates)
 * 3. Stroke 1 bounding box must have reasonable potato size (>= 18x18) and aspect ratio between 0.45 and 2.2
 */
export function validatePotatoDrawing(data: PotatoPathData): ValidationResult {
  if (!data || !Array.isArray(data.strokes) || data.strokes.length === 0) {
    return { valid: false, reason: 'Draw a potato outline first, then add a face.' };
  }
  if (data.strokes.length > 4) {
    return { valid: false, reason: 'Max 4 strokes allowed (1 outline + up to 3 face strokes).' };
  }

  for (const stroke of data.strokes) {
    if (!Array.isArray(stroke) || stroke.length === 0 || stroke.length > 45) {
      return { valid: false, reason: 'Invalid stroke data. Please redraw.' };
    }
    for (const pt of stroke) {
      if (
        !Array.isArray(pt) ||
        pt.length !== 2 ||
        typeof pt[0] !== 'number' ||
        typeof pt[1] !== 'number' ||
        pt[0] < 0 ||
        pt[0] > 100 ||
        pt[1] < 0 ||
        pt[1] > 100
      ) {
        return { valid: false, reason: 'Coordinates out of canvas bounds.' };
      }
    }
  }

  const outline = data.strokes[0];
  if (outline.length < 4) {
    return { valid: false, reason: 'Stroke 1 is way too short—draw a full potato silhouette.' };
  }

  let minX = 100;
  let maxX = 0;
  let minY = 100;
  let maxY = 0;
  for (const [x, y] of outline) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  if (bboxW < 18 || bboxH < 18) {
    return { valid: false, reason: 'Too tiny! Draw a bigger potato so the auditor can see it.' };
  }

  const aspectRatio = bboxW / bboxH;
  if (aspectRatio < 0.45 || aspectRatio > 2.2) {
    return {
      valid: false,
      reason: 'Way too skinny (that\'s a French fry). Keep aspect ratio between 0.45 and 2.2.',
      aspectRatio,
    };
  }

  const start = outline[0];
  const end = outline[outline.length - 1];
  const closureDistance = Math.hypot(end[0] - start[0], end[1] - start[1]);
  if (closureDistance > 32) {
    return {
      valid: false,
      reason: 'Close the loop on Stroke 1! Your starch is leaking out.',
      closureDistance,
      aspectRatio,
    };
  }

  return { valid: true, closureDistance, aspectRatio };
}

/**
 * Convert normalized 0..100 stroke points to a smooth quadratic Bézier SVG path.
 */
export function strokeToSvgPath(stroke: Stroke): string {
  if (!stroke || stroke.length === 0) return '';
  if (stroke.length === 1) {
    const [x, y] = stroke[0];
    return `M ${x} ${y} L ${x + 0.1} ${y + 0.1}`;
  }
  if (stroke.length === 2) {
    return `M ${stroke[0][0]} ${stroke[0][1]} L ${stroke[1][0]} ${stroke[1][1]}`;
  }

  let d = `M ${stroke[0][0]} ${stroke[0][1]}`;
  for (let i = 1; i < stroke.length - 1; i++) {
    const midX = ((stroke[i][0] + stroke[i + 1][0]) / 2).toFixed(1);
    const midY = ((stroke[i][1] + stroke[i + 1][1]) / 2).toFixed(1);
    d += ` Q ${stroke[i][0]} ${stroke[i][1]}, ${midX} ${midY}`;
  }
  const last = stroke[stroke.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

export function estimateJsonBytes(data: PotatoPathData): number {
  return new TextEncoder().encode(JSON.stringify(data)).length;
}
