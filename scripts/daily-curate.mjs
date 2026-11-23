#!/usr/bin/env node
/**
 * Poteto Layer-2 Daily Curation Cron Script
 *
 * Samples 30 pending UGC drawings from Neon, renders a 5x6 composite SVG/PNG grid,
 * optionally calls Gemini Flash (cost < $0.001/day) to filter out TTP/spam and pick
 * the 15 funniest compliant potatoes, then publishes tomorrow's `daily_pools` row.
 *
 * Usage:
 *   DATABASE_URL=... GEMINI_API_KEY=... node scripts/daily-curate.mjs
 */

import { neon } from '@neondatabase/serverless';
import sharp from 'sharp';

const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DATABASE_URL) {
  console.log('[curate] DATABASE_URL is not set. Exiting cleanly (seed pool mode active).');
  process.exit(0);
}

function strokeToPath(stroke) {
  if (!stroke?.length) return '';
  if (stroke.length === 1) return `M ${stroke[0][0]} ${stroke[0][1]} L ${stroke[0][0] + 0.1} ${stroke[0][1] + 0.1}`;
  if (stroke.length === 2) return `M ${stroke[0][0]} ${stroke[0][1]} L ${stroke[1][0]} ${stroke[1][1]}`;
  let d = `M ${stroke[0][0]} ${stroke[0][1]}`;
  for (let i = 1; i < stroke.length - 1; i++) {
    const mx = ((stroke[i][0] + stroke[i + 1][0]) / 2).toFixed(1);
    const my = ((stroke[i][1] + stroke[i + 1][1]) / 2).toFixed(1);
    d += ` Q ${stroke[i][0]} ${stroke[i][1]}, ${mx} ${my}`;
  }
  const last = stroke[stroke.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

function renderGridSvg(rows) {
  const cols = 6;
  const cell = 120;
  const rowsCount = Math.ceil(rows.length / cols);
  const w = cols * cell;
  const h = rowsCount * cell;

  const cells = rows
    .map((row, idx) => {
      const col = idx % cols;
      const r = Math.floor(idx / cols);
      const x = col * cell;
      const y = r * cell;
      const strokes = (row.path_data?.strokes || [])
        .map(
          (s) =>
            `<path d="${strokeToPath(s)}" fill="none" stroke="#1C1917" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`
        )
        .join('');
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="4" y="4" width="112" height="112" rx="10" fill="#FAF7F0" stroke="#D6CFC2" stroke-width="1.5" />
          <text x="12" y="20" font-family="monospace" font-size="12" font-weight="bold" fill="#78716C">#${idx + 1}</text>
          <g transform="translate(10, 14) scale(1.0)">${strokes}</g>
        </g>
      `;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="100%" height="100%" fill="#FFFFFF" />
    ${cells}
  </svg>`;
}

async function pickWithGemini(pngBuffer, totalCount) {
  if (!GEMINI_API_KEY) {
    return Array.from({ length: Math.min(15, totalCount) }, (_, i) => i + 1);
  }

  const base64 = pngBuffer.toString('base64');
  const prompt = `You are moderating a 5x6 grid of numbered hand-drawn potato doodles (#1 to #${totalCount}) for a family-friendly comedy game.
Reject any drawing that contains offensive symbols, genitalia, slurs, text, or non-potato spam.
From the clean drawings, select up to 15 of the funniest, most expressive potato doodles.
Return ONLY a JSON array of 1-based integers, e.g. [1, 3, 4, 7].`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/png', data: base64 } },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    console.warn('[curate] Gemini API returned', res.status, '— falling back to rule-passed subset.');
    return Array.from({ length: Math.min(15, totalCount) }, (_, i) => i + 1);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const match = text.match(/\[[\d,\s]+\]/);
  if (!match) return Array.from({ length: Math.min(15, totalCount) }, (_, i) => i + 1);
  return JSON.parse(match[0]).filter((n) => Number.isInteger(n) && n >= 1 && n <= totalCount);
}

async function main() {
  const sql = neon(DATABASE_URL);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const targetDate = tomorrow.toISOString().slice(0, 10);

  const candidates = await sql`
    SELECT id, path_data
    FROM potato_drawings
    WHERE status = 'pending' AND report_count < 3
    ORDER BY RANDOM()
    LIMIT 30
  `;

  if (candidates.length === 0) {
    console.log('[curate] No pending drawings found.');
    return;
  }

  const svg = renderGridSvg(candidates);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const chosenIndices = await pickWithGemini(pngBuffer, candidates.length);
  const chosenIds = chosenIndices.map((idx) => candidates[idx - 1]?.id).filter(Boolean);

  if (chosenIds.length > 0) {
    await sql`
      UPDATE potato_drawings
      SET status = 'approved'
      WHERE id = ANY(${chosenIds}::uuid[])
    `;
  }

  const epochMs = Date.UTC(2026, 9, 13);
  const [y, m, d] = targetDate.split('-').map(Number);
  const auditNumber = Math.max(1, Math.floor((Date.UTC(y, m - 1, d) - epochMs) / 86400000) + 1);

  const stage2Ids = [
    'stillness-5s', 'splitting-potatoes', 'dodging-button', 'dont-press-red',
    'reverse-slider', 'fake-loading', 'potato-blinking', 'gravity-checkbox',
    'tiny-target', 'typing-panic', 'liar-buttons', 'soundless-rhythm',
    'scroll-trap', 'drag-to-peel', 'spot-the-human', 'traffic-light-absurd',
  ];
  const stage3Ids = [
    'p-layoff', 'p-garlic', 'p-civil', 'p-gym', 'p-sleep',
    'p-love', 'p-rich', 'p-fries', 'p-zen', 'p-boss',
  ];

  await sql`
    INSERT INTO daily_pools (audit_date, seed, stage2_game_id, stage3_prompt_id, featured_drawing_ids)
    VALUES (
      ${targetDate},
      ${`poteto-${targetDate}`},
      ${stage2Ids[(auditNumber - 1) % stage2Ids.length]},
      ${stage3Ids[(auditNumber - 1) % stage3Ids.length]},
      ${chosenIds}::uuid[]
    )
    ON CONFLICT (audit_date)
    DO UPDATE SET featured_drawing_ids = EXCLUDED.featured_drawing_ids
  `;

  console.log(`[curate] Published ${chosenIds.length} approved drawings for ${targetDate}.`);
}

main().catch((err) => {
  console.error('[curate] Error:', err);
  process.exit(1);
});
