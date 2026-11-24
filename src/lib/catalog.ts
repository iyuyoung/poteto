import type { PotatoDrawing, Stage1Prompt, Stage2GameMeta, Stage3Prompt } from './types';

/**
 * Stage 1 Prompts: UGC / Visual Identification (Daily rotating prompts)
 */
export const STAGE1_PROMPTS: Stage1Prompt[] = [
  {
    id: 's1-resign',
    title: 'Select 3 potatoes that definitely hate their 9-to-5',
    subtitle: 'Look closely at the dead-inside eyes (watch out for 1 fake rock)',
    targetCount: 3,
    tagLabel: 'Burnout Check',
  },
  {
    id: 's1-kiwi',
    title: 'Select 3 potatoes trying way too hard to pass as kiwis',
    subtitle: 'High-stakes produce counter-intelligence. Trust nobody.',
    targetCount: 3,
    tagLabel: 'Species Fraud',
  },
  {
    id: 's1-innocent',
    title: 'Select 3 potatoes one minor inconvenience away from crying',
    subtitle: 'Use basic human empathy (assuming you still have some)',
    targetCount: 3,
    tagLabel: 'Vibe Check',
  },
  {
    id: 's1-monday',
    title: 'Select 3 potatoes running on iced coffee and pure delusion',
    subtitle: 'Control Potato (Spud #01) wakes up naturally at 6 AM with zero anxiety',
    targetCount: 3,
    tagLabel: 'Monday Audit',
  },
  {
    id: 's1-secret',
    title: 'Select 3 potatoes that clearly committed tax fraud',
    subtitle: 'They might be sprouting, or they might have an offshore LLC',
    targetCount: 3,
    tagLabel: 'Suspicion Scan',
  },
  {
    id: 's1-philosopher',
    title: 'Select 3 potatoes overthinking a text from 2019',
    subtitle: '"I think, therefore I am... still a root vegetable"',
    targetCount: 3,
    tagLabel: 'Overthinking Test',
  },
  {
    id: 's1-rich',
    title: 'Select 3 potatoes pretending they read the Terms of Service',
    subtitle: 'Spot the liars before Spud #01 judges your intuition',
    targetCount: 3,
    tagLabel: 'Honesty Audit',
  },
];

/**
 * Stage 2 Micro-Games Pool (16 distinct counter-intuitive games; zero repeats for 16 days)
 */
export const STAGE2_GAMES: Stage2GameMeta[] = [
  {
    id: 'dodging-button',
    title: 'Commitment Issues Button',
    instruction: 'Click "I\'m Human" to verify. Fair warning: it has severe trust issues.',
    potatoStatus: 'Watching with zero emotion',
    potatoQuip: 'Spud #01 has never chased a button in its life.',
    difficulty: 'tricky',
  },
  {
    id: 'stillness-5s',
    title: 'Touch Nothing Challenge',
    instruction: 'Do not move your mouse or touch the screen for 5 seconds. Potatoes are undefeated here.',
    potatoStatus: 'Still as a statue · 0px drift',
    potatoQuip: 'Spud #01 has been completely motionless for 14 days straight.',
    difficulty: 'tricky',
  },
  {
    id: 'splitting-potatoes',
    title: 'Potato Mitosis Exam',
    instruction: 'Count how many REAL potatoes are on screen before you click—careful, they multiply.',
    potatoStatus: 'Undergoing mitosis',
    potatoQuip: 'Spud #01 does not count. It simply reproduces.',
    difficulty: 'absurd',
  },
  {
    id: 'dont-press-red',
    title: 'Impulse Control Check',
    instruction: 'Do NOT press the absurdly tempting red button before the 5-second timer hits zero.',
    potatoStatus: 'No hands · 100% disciplined',
    potatoQuip: 'Having zero fingers is an unfair advantage here.',
    difficulty: 'gentle',
  },
  {
    id: 'potato-blinking',
    title: 'Staring Contest',
    instruction: 'Hold the button to lock eyes with Spud #01. Release the instant it blinks—not a second early.',
    potatoStatus: 'Locked in',
    potatoQuip: 'Biologically it lacks eyelids, yet here we are.',
    difficulty: 'tricky',
  },
  {
    id: 'reverse-slider',
    title: 'Cursed Calibration',
    instruction: 'Land the slider between 48% and 52%. Small catch: we wired the track backwards.',
    potatoStatus: 'Steady at 50.0% starch',
    potatoQuip: 'Spud #01 maintains an effortless 50% vibe.',
    difficulty: 'tricky',
  },
  {
    id: 'gravity-checkbox',
    title: 'Gravity Check',
    instruction: 'The CAPTCHA checkbox fell off the form! Catch and click it mid-bounce.',
    potatoStatus: 'Firmly grounded',
    potatoQuip: 'Spud #01 respects Isaac Newton.',
    difficulty: 'absurd',
  },
  {
    id: 'tiny-target',
    title: 'De-Sprout Speedrun',
    instruction: 'Click the green sprout 3 times before it achieves sentience. It teleports.',
    potatoStatus: 'Aggressively sprouting',
    potatoQuip: 'Spud #01 doubts your hand-eye coordination.',
    difficulty: 'tricky',
  },
  {
    id: 'fake-loading',
    title: '99% Patience Test',
    instruction: 'Wait for verification to hit 100%. Do NOT poke the progress bar or it gets scared.',
    potatoStatus: 'Waited 90 days underground',
    potatoQuip: 'Spud #01 possesses geological levels of patience.',
    difficulty: 'gentle',
  },
  {
    id: 'drag-to-peel',
    title: 'Manual Peeling Exam',
    instruction: 'Hold and rub left-to-right across the potato 3 times to prove you have opposable thumbs.',
    potatoStatus: 'Wearing multiple layers',
    potatoQuip: 'Spoiler: it\'s potatoes all the way down.',
    difficulty: 'gentle',
  },
  {
    id: 'liar-buttons',
    title: 'Ego Check',
    instruction: 'Be brutally honest: Are you actually smarter than an Idaho russet potato?',
    potatoStatus: 'Quietly judging your ego',
    potatoQuip: 'Spud #01 can smell main-character syndrome from a mile away.',
    difficulty: 'gentle',
  },
  {
    id: 'soundless-rhythm',
    title: 'Pulse Calibration',
    instruction: 'Tap 3 times at ~1-second intervals. Too robotic = AI. Too erratic = 4th espresso.',
    potatoStatus: 'Heart rate: 0 BPM',
    potatoQuip: 'Spud #01 runs on pure soil vibes, no pulse required.',
    difficulty: 'tricky',
  },
  {
    id: 'scroll-trap',
    title: 'The EULA Trap',
    instruction: 'Actually read the Human Renewal Agreement and find the REAL accept button (not at the bottom).',
    potatoStatus: 'Never signed a contract',
    potatoQuip: 'Spud #01 knows you never scroll slowly.',
    difficulty: 'gentle',
  },
  {
    id: 'spot-the-human',
    title: 'Reverse Turing Test',
    instruction: 'One of these 6 silhouettes is NOT a potato. Find the impostor.',
    potatoStatus: 'Blending in seamlessly',
    potatoQuip: 'Honestly, some days you look pretty tuber-shaped too.',
    difficulty: 'absurd',
  },
  {
    id: 'traffic-light-absurd',
    title: 'Existential CAPTCHA',
    instruction: 'Select every square containing "Sunday Scaries", then hit Submit.',
    potatoStatus: 'Doesn\'t know what Monday is',
    potatoQuip: 'Every day is a dirt vacation when you\'re a potato.',
    difficulty: 'gentle',
  },
  {
    id: 'typing-panic',
    title: 'Anti-Spud Spellcheck',
    instruction: 'Tap the word tiles in order to declare "I AM NOT A SPUD"—watch out for sabotage.',
    potatoStatus: 'Plot-twisting your keyboard',
    potatoQuip: 'Spud #01 believes language was humanity\'s biggest mistake.',
    difficulty: 'absurd',
  },
];

/**
 * Stage 3 Drawing Prompts (Daily absurd sketching prompts)
 */
export const STAGE3_PROMPTS: Stage3Prompt[] = [
  {
    id: 'p-layoff',
    title: 'Draw a potato that just got laid off via Zoom',
    hint: 'Stroke 1: closed potato outline. Strokes 2-4: add the soul-leaving-body face.',
    badgeText: 'Zoom Survivor',
  },
  {
    id: 'p-garlic',
    title: 'Draw a potato pretending to be an avocado',
    hint: 'Stroke 1: tuber body. Strokes 2-4: add smug brunch energy.',
    badgeText: 'Brunch Impostor',
  },
  {
    id: 'p-civil',
    title: 'Draw a potato surviving a 2-hour meeting that could\'ve been an email',
    hint: 'Polite outline, completely glazed-over eyes.',
    badgeText: 'Corporate Spud',
  },
  {
    id: 'p-gym',
    title: 'Draw a potato that never skips carb day',
    hint: 'Draw a sturdy silhouette, even though it\'s still 100% starch.',
    badgeText: 'Gym Bro Spud',
  },
  {
    id: 'p-sleep',
    title: 'Draw a potato doomscrolling at 3:14 AM',
    hint: 'Slumped silhouette + tired eyes. Keep it under 4 strokes.',
    badgeText: 'Insomniac Spud',
  },
  {
    id: 'p-love',
    title: 'Draw a potato down bad for a sweet potato',
    hint: 'Stroke 1: blushing body. Strokes 2-4: lovesick expression.',
    badgeText: 'Hopeless Romantic',
  },
  {
    id: 'p-rich',
    title: 'Draw a potato trying to act normal at airport security',
    hint: 'Calm exterior, mild panic behind the eyes.',
    badgeText: 'Suspicious Spud',
  },
  {
    id: 'p-fries',
    title: 'Draw a potato hearing the air fryer preheat',
    hint: 'Use 3-4 strokes to capture pure existential dread.',
    badgeText: 'Air Fryer Victim',
  },
  {
    id: 'p-zen',
    title: 'Draw a potato achieving inner peace (zero thoughts)',
    hint: 'Smooth closed outline + two serene closed-eye arcs.',
    badgeText: 'Zen Tuber',
  },
  {
    id: 'p-boss',
    title: 'Draw a potato who won the lottery and is acting broke',
    hint: 'Poker face on the outside, smug grin sneaking through.',
    badgeText: 'Stealth Wealth',
  },
];

/**
 * Hand-crafted expressive organic vector potato doodles with distinct silhouettes & character cues!
 */
export const SEED_POTATO_DRAWINGS: PotatoDrawing[] = [
  {
    id: 'seed-01',
    promptId: 'p-layoff',
    auditDate: '2026-11-23',
    caption: 'Quiet quitting',
    authorTag: 'Anon Human #409',
    fooledCount: 64,
    features: { dimples: [[30, 72], [70, 68]], eyebags: true },
    pathData: {
      strokes: [
        [[26, 48], [22, 30], [34, 18], [55, 19], [72, 27], [77, 44], [71, 56], [79, 71], [67, 84], [45, 85], [26, 77], [22, 62], [26, 48]],
        [[33, 42], [43, 46]],
        [[65, 42], [55, 46]],
        [[41, 66], [49, 61], [58, 66]],
      ],
    },
  },
  {
    id: 'seed-02',
    promptId: 'p-garlic',
    auditDate: '2026-11-23',
    caption: '100% organic kiwi',
    authorTag: 'Produce Spy #112',
    fooledCount: 41,
    features: { dimples: [[33, 73], [67, 73]], sprout: true },
    pathData: {
      strokes: [
        [[49, 20], [63, 28], [76, 44], [83, 64], [74, 80], [50, 86], [26, 80], [17, 64], [24, 44], [36, 28], [49, 20]],
        [[36, 52], [41, 47], [46, 52]],
        [[54, 52], [59, 47], [64, 52]],
        [[45, 65], [50, 69], [55, 65]],
      ],
    },
  },
  {
    id: 'seed-03',
    promptId: 'p-sleep',
    auditDate: '2026-11-23',
    caption: 'Doomscrolling',
    authorTag: 'Night Owl #887',
    fooledCount: 53,
    features: { eyebags: true, dimples: [[28, 66], [74, 34]] },
    pathData: {
      strokes: [
        [[14, 58], [18, 38], [34, 27], [58, 25], [79, 34], [87, 52], [82, 72], [62, 81], [36, 80], [17, 71], [14, 58]],
        [[33, 45], [41, 49], [33, 51]],
        [[67, 45], [59, 49], [67, 51]],
        [[44, 64], [51, 63], [58, 65]],
      ],
    },
  },
  {
    id: 'seed-04',
    promptId: 'p-zen',
    auditDate: '2026-11-23',
    caption: 'Unbothered.',
    authorTag: 'Idaho Monk #019',
    fooledCount: 29,
    features: { sprout: true, blush: true, dimples: [[34, 74]] },
    pathData: {
      strokes: [
        [[28, 48], [30, 29], [43, 21], [59, 21], [72, 31], [75, 52], [71, 73], [57, 84], [41, 83], [29, 71], [28, 48]],
        [[36, 48], [41, 52], [46, 48]],
        [[54, 48], [59, 52], [64, 48]],
        [[47, 63], [50, 65], [54, 63]],
      ],
    },
  },
  {
    id: 'seed-05',
    promptId: 'p-fries',
    auditDate: '2026-11-23',
    caption: 'Heard "air fryer"',
    authorTag: 'Fugitive Spud #703',
    fooledCount: 77,
    features: { sweat: true, dimples: [[32, 70]] },
    pathData: {
      strokes: [
        [[29, 34], [40, 17], [58, 17], [71, 30], [74, 53], [69, 77], [53, 86], [35, 81], [25, 62], [29, 34]],
        [[39, 40], [39, 46]],
        [[59, 40], [59, 46]],
        [[45, 59], [50, 54], [55, 59], [50, 68], [45, 59]],
      ],
    },
  },
  {
    id: 'seed-06',
    promptId: 'p-civil',
    auditDate: '2026-11-23',
    caption: 'Middle manager',
    authorTag: 'Corporate #204',
    fooledCount: 38,
    features: { dimples: [[29, 38], [71, 68]] },
    pathData: {
      strokes: [
        [[22, 46], [24, 26], [42, 20], [64, 21], [78, 30], [80, 54], [75, 75], [56, 82], [33, 81], [21, 68], [22, 46]],
        [[38, 44], [41, 44]],
        [[59, 44], [62, 44]],
        [[42, 58], [50, 63], [58, 58]],
      ],
    },
  },
  {
    id: 'seed-07',
    promptId: 'p-boss',
    auditDate: '2026-11-23',
    caption: 'Per my last email',
    authorTag: 'Zoom Survivor #516',
    fooledCount: 49,
    features: { sweat: true, dimples: [[26, 62], [75, 64]] },
    pathData: {
      strokes: [
        [[18, 52], [22, 33], [40, 23], [65, 25], [82, 38], [84, 59], [71, 76], [46, 78], [24, 70], [18, 52]],
        [[34, 46], [45, 46]],
        [[56, 46], [67, 46]],
        [[46, 61], [56, 58]],
      ],
    },
  },
  {
    id: 'seed-08',
    promptId: 'p-love',
    auditDate: '2026-11-23',
    caption: 'Down bad for yam',
    authorTag: 'Starch Poet #331',
    fooledCount: 33,
    features: { blush: true, dimples: [[68, 34]] },
    pathData: {
      strokes: [
        [[24, 44], [32, 23], [52, 19], [72, 26], [82, 46], [76, 69], [55, 84], [33, 78], [20, 61], [24, 44]],
        [[37, 46], [42, 41], [47, 46]],
        [[54, 46], [59, 41], [64, 46]],
        [[46, 61], [50, 66], [55, 61]],
      ],
    },
  },
  {
    id: 'seed-09',
    promptId: 'p-rich',
    auditDate: '2026-11-23',
    caption: 'Tax write-off',
    authorTag: 'Stealth Rich #998',
    fooledCount: 58,
    features: { blush: true, dimples: [[32, 32], [70, 72]] },
    pathData: {
      strokes: [
        [[21, 50], [26, 28], [46, 18], [69, 22], [81, 39], [77, 57], [81, 71], [62, 83], [36, 81], [20, 67], [21, 50]],
        [[35, 43], [44, 39]],
        [[56, 39], [65, 43]],
        [[39, 58], [52, 67], [65, 54]],
      ],
    },
  },
  {
    id: 'seed-10',
    promptId: 'p-gym',
    auditDate: '2026-11-23',
    caption: 'Carb day bro',
    authorTag: 'Lifter #612',
    fooledCount: 27,
    features: { dimples: [[30, 72], [70, 72]] },
    pathData: {
      strokes: [
        [[19, 32], [35, 20], [65, 20], [82, 32], [78, 56], [69, 80], [50, 84], [31, 80], [22, 56], [19, 32]],
        [[33, 40], [45, 46]],
        [[67, 40], [55, 46]],
        [[42, 63], [58, 63]],
      ],
    },
  },
  {
    id: 'seed-11',
    promptId: 'p-layoff',
    auditDate: '2026-11-23',
    caption: 'Zero brain cells',
    authorTag: 'Couch Spud #108',
    fooledCount: 45,
    features: { eyebags: true, dimples: [[26, 72], [74, 72]] },
    pathData: {
      strokes: [
        [[12, 68], [17, 49], [34, 38], [56, 36], [77, 43], [88, 60], [83, 77], [58, 84], [27, 83], [12, 68]],
        [[35, 56], [43, 59]],
        [[57, 59], [65, 56]],
        [[46, 70], [54, 70]],
      ],
    },
  },
  {
    id: 'seed-12',
    promptId: 'p-zen',
    auditDate: '2026-11-23',
    caption: 'Bombastic side-eye',
    authorTag: 'Judgy Spud #445',
    fooledCount: 51,
    features: { sprout: true, dimples: [[68, 70]] },
    pathData: {
      strokes: [
        [[26, 36], [42, 20], [66, 22], [80, 40], [74, 65], [60, 83], [36, 82], [22, 66], [26, 36]],
        [[36, 46], [46, 44]],
        [[56, 44], [66, 46]],
        [[47, 62], [56, 59]],
      ],
    },
  },
];

/**
 * Official Decoy Drawing (1 per 3x3 grid: RAZOR-SHARP geometric hexagon rock!)
 */
export const OFFICIAL_DECOY_DRAWING: PotatoDrawing = {
  id: 'official-decoy-01',
  promptId: 'official-decoy',
  auditDate: '2026-11-24',
  isOfficialDecoy: true,
  caption: 'Totally a real spud',
  authorTag: 'Audit Bureau QA',
  fooledCount: 120,
  features: { sharpPolygon: true },
  pathData: {
    strokes: [
      [[50, 14], [83, 32], [83, 68], [50, 86], [17, 68], [17, 32], [50, 14]],
      [[35, 45], [45, 45]],
      [[55, 45], [65, 45]],
      [[42, 62], [58, 62]],
    ],
  },
};

export function getVerdictForPurity(purity: number, beatPotato: boolean): { title: string; subtitle: string } {
  if (purity >= 90) {
    return {
      title: 'Peak Human · Certified Carbon-Based',
      subtitle: 'Control Potato (Spud #01) stares in reluctant, silent respect.',
    };
  }
  if (purity >= 72 && beatPotato) {
    return {
      title: 'Barely Passed · Outsmarted a Vegetable',
      subtitle: 'Questionable vibes, yet your human license is officially renewed.',
    };
  }
  if (purity >= 52) {
    return {
      title: 'Suspiciously Starchy · On Thin Ice',
      subtitle: 'Our audit detected alarming levels of couch-potato energy.',
    };
  }
  return {
    title: 'Audit Failed · Ratio\'d by a Potato',
    subtitle: 'Spud #01 literally didn\'t move and still won. Try coffee tomorrow.',
  };
}
