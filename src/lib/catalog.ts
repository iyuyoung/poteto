import type { PotatoDrawing, Stage1Prompt, Stage2GameMeta, Stage3Prompt } from './types';

/**
 * Stage 1 Prompts: UGC / Visual Identification (每日轮换命题)
 */
export const STAGE1_PROMPTS: Stage1Prompt[] = [
  {
    id: 's1-resign',
    title: '选出看起来最想辞职的 3 颗土豆',
    subtitle: '注意观察它们的轮廓塌陷度与眼神空洞指数（小心官方伪装项）',
    targetCount: 3,
    tagLabel: '职场倦怠鉴定',
  },
  {
    id: 's1-kiwi',
    title: '选出 3 颗正在假装自己是猕猴桃的土豆',
    subtitle: '高阶生物伪装辨识：别被毛躁的笔触蒙蔽',
    targetCount: 3,
    tagLabel: '物种渗透排查',
  },
  {
    id: 's1-innocent',
    title: '选出看起来最委屈、像刚被削了皮的 3 颗土豆',
    subtitle: '请结合人类同理心（若你仍有的话）做出判断',
    targetCount: 3,
    tagLabel: '共情能力抽检',
  },
  {
    id: 's1-monday',
    title: '选出 3 颗明显还没睡醒的周一土豆',
    subtitle: '对照组土豆（Poteto #01）每天早上六点自然醒',
    targetCount: 3,
    tagLabel: '生物钟核验',
  },
  {
    id: 's1-secret',
    title: '选出 3 颗像是藏了不可告人秘密的土豆',
    subtitle: '它们可能在酝酿发芽，也可能只是淀粉超标',
    targetCount: 3,
    tagLabel: '微表情测谎',
  },
  {
    id: 's1-philosopher',
    title: '选出 3 颗正在思考宇宙意义的哲学土豆',
    subtitle: '“我思故我在，但我只是一块块茎”',
    targetCount: 3,
    tagLabel: '高维意识筛查',
  },
  {
    id: 's1-rich',
    title: '选出 3 颗看起来出身北海道贵族农场的土豆',
    subtitle: '高贵的弧度往往只需要朴素的一笔',
    targetCount: 3,
    tagLabel: '阶层审美测试',
  },
];

/**
 * Stage 2 Micro-Games Pool (16 distinct counter-intuitive games; never repeats within 16 days)
 * Ordered so the punchiest visual/physical games land front-and-center.
 */
export const STAGE2_GAMES: Stage2GameMeta[] = [
  {
    id: 'dodging-button',
    title: '逃逸的确认键',
    instruction: '点击「我是人类」按钮完成核验。它有点社恐，追几次它就跑不动了。',
    potatoStatus: '冷眼旁观中',
    potatoQuip: 'Poteto #01 从不追逐任何按钮。',
    difficulty: 'tricky',
  },
  {
    id: 'stillness-5s',
    title: '绝对静止测试',
    instruction: '接下来的 5 秒内，不要移动鼠标或触碰屏幕。土豆在这项测试中保持全胜纪录。',
    potatoStatus: '静止如山 · 0 像素漂移',
    potatoQuip: 'Poteto #01 已经连续静止了 14 天。',
    difficulty: 'tricky',
  },
  {
    id: 'splitting-potatoes',
    title: '细胞分裂点名',
    instruction: '快速数清当前屏幕上到底有几颗土豆并选出答案——注意，它们会分裂。',
    potatoStatus: '正在有丝分裂',
    potatoQuip: 'Poteto #01 不数数，它只负责繁殖。',
    difficulty: 'absurd',
  },
  {
    id: 'dont-press-red',
    title: '冲动抑制实验',
    instruction: '倒计时 5 秒结束前，绝对不要按下面那颗非常诱人的红色按钮。',
    potatoStatus: '毫无手脚 · 绝对服从',
    potatoQuip: 'Poteto #01 没有手指，因此从未手贱。',
    difficulty: 'gentle',
  },
  {
    id: 'potato-blinking',
    title: '和土豆对视',
    instruction: '按住下方按钮与土豆对视，在它眨眼的瞬间立刻松手！提前松手算你胆怯。',
    potatoStatus: '眼神锁定中',
    potatoQuip: 'Poteto #01 理论上没有眼皮，但今天例外。',
    difficulty: 'tricky',
  },
  {
    id: 'reverse-slider',
    title: '反直觉纯度校准',
    instruction: '将下方滑块精准停在 48% ~ 52% 之间，但滑动方向被我们偷偷反接了。',
    potatoStatus: '稳定输出 50.0%',
    potatoQuip: 'Poteto #01 的淀粉含量常年精准卡在 50%。',
    difficulty: 'tricky',
  },
  {
    id: 'gravity-checkbox',
    title: '重力失控勾选框',
    instruction: '人机验证框不小心掉下去了！在它弹跳时精准点中它。',
    potatoStatus: '稳稳贴地',
    potatoQuip: 'Poteto #01 深受牛顿力学眷顾。',
    difficulty: 'absurd',
  },
  {
    id: 'tiny-target',
    title: '精准掐芽作业',
    instruction: '点中这颗土豆新冒出来的绿色小芽。它可能会临阵瞬移两次。',
    potatoStatus: '顽强发芽中',
    potatoQuip: 'Poteto #01 对你的精准度表示怀疑。',
    difficulty: 'tricky',
  },
  {
    id: 'fake-loading',
    title: '现代人耐心体检',
    instruction: '等待审验进度条加载到 100%。切记：千万别点「催一下」，否则会重置。',
    potatoStatus: '在地底已等了 90 天',
    potatoQuip: 'Poteto #01 对等待拥有地质纪元级别的耐心。',
    difficulty: 'gentle',
  },
  {
    id: 'drag-to-peel',
    title: '手工削皮资格考',
    instruction: '按住并左右来回擦拭土豆 3 次完成削皮，证明你拥有灵巧的对生拇指。',
    potatoStatus: '穿了两层皮',
    potatoQuip: '削完一层皮，里面还是 Poteto #01。',
    difficulty: 'gentle',
  },
  {
    id: 'liar-buttons',
    title: '灵魂诚实度测验',
    instruction: '请如实回答：你觉得自己真的比一颗北海道土豆更聪明吗？',
    potatoStatus: '保持谦卑（且高傲）',
    potatoQuip: 'Poteto #01 早已看穿了人类的虚荣心。',
    difficulty: 'gentle',
  },
  {
    id: 'soundless-rhythm',
    title: '人类心跳节拍器',
    instruction: '以大约 1 秒的间隔连续轻点 3 次。太精准像机器，太乱像心律不齐。',
    potatoStatus: '心率 0 BPM',
    potatoQuip: 'Poteto #01 靠光合作用间接存活，无需心跳。',
    difficulty: 'tricky',
  },
  {
    id: 'scroll-trap',
    title: '《人类使用协议》抽查',
    instruction: '认真阅读以下协议并找到真正的「我同意继续做人」按钮（它不在最底部）。',
    potatoStatus: '从未签过任何卖身契',
    potatoQuip: 'Poteto #01 提醒你：别光顾着拉到底。',
    difficulty: 'gentle',
  },
  {
    id: 'spot-the-human',
    title: '反向图灵辨认',
    instruction: '在以下 6 个轮廓中，找出唯一那个「不是土豆」的家伙。',
    potatoStatus: '全员伪装就位',
    potatoQuip: 'Poteto #01 怀疑你自己也长得很像块茎。',
    difficulty: 'absurd',
  },
  {
    id: 'traffic-light-absurd',
    title: '经典九宫格哲学版',
    instruction: '请选出所有包含「一个星期一早晨的疲惫感」的方块（选完点击提交）。',
    potatoStatus: '无视周一概念',
    potatoQuip: 'Poteto #01 每周七天都是泥土假期。',
    difficulty: 'gentle',
  },
  {
    id: 'typing-panic',
    title: '反打字机自证',
    instruction: '依次点击下方字块拼出「我不是土豆」——注意它们会偷偷互换位置。',
    potatoStatus: '拒绝打字',
    potatoQuip: 'Poteto #01 认为语言是人类多余的进化。',
    difficulty: 'absurd',
  },
];

/**
 * Stage 3 Drawing Prompts (每日荒诞手绘命题)
 */
export const STAGE3_PROMPTS: Stage3Prompt[] = [
  {
    id: 'p-layoff',
    title: '画一颗刚收到裁员通知的土豆',
    hint: '第 1 笔闭合轮廓，再用 2~3 笔画出它失去梦想的表情',
    badgeText: '职场受难薯',
  },
  {
    id: 'p-garlic',
    title: '画一颗正在拼命装蒜的土豆',
    hint: '第 1 笔土豆身体，后 3 笔加点假装清高的蒜瓣纹或表情',
    badgeText: '跨物种影帝',
  },
  {
    id: 'p-civil',
    title: '画一颗刚刚考上编制的土豆',
    hint: '轮廓圆润体面，眼神里透着稳重与端庄',
    badgeText: '上岸稳重薯',
  },
  {
    id: 'p-gym',
    title: '画一颗坚持健身三天的土豆',
    hint: '尽量画得硬朗一点，虽然本质还是碳水',
    badgeText: '高碳水猛男',
  },
  {
    id: 'p-sleep',
    title: '画一颗凌晨三点还在刷手机的土豆',
    hint: '轮廓可以歪一点，重点是黑眼圈或呆滞双目',
    badgeText: '熬夜冠军薯',
  },
  {
    id: 'p-love',
    title: '画一颗陷入单相思的土豆',
    hint: '第 1 笔画出害羞的块茎，后几笔点出含情脉脉的表情',
    badgeText: '纯爱战士薯',
  },
  {
    id: 'p-rich',
    title: '画一颗中了彩票但不敢告诉亲戚的土豆',
    hint: '表面镇定，内心狂喜，4 笔之内拿捏微表情',
    badgeText: '低调暴富薯',
  },
  {
    id: 'p-fries',
    title: '画一颗听到「空气炸锅」四个字时的土豆',
    hint: '用 3~4 笔传达出灵魂出窍的惊恐感',
    badgeText: '危机意识薯',
  },
  {
    id: 'p-zen',
    title: '画一颗已经看破红尘的佛系土豆',
    hint: '圆润闭合轮廓 + 两道波澜不惊的闭眼弧线',
    badgeText: '禅意块茎',
  },
  {
    id: 'p-boss',
    title: '画一颗正在开 2 小时无效周会的土豆',
    hint: '表面微笑，眼神已经飞出了会议室',
    badgeText: '摸鱼大师薯',
  },
];

/**
 * Hand-crafted expressive organic vector potato doodles with distinct silhouettes & character cues!
 * Peanut-waisted, pear-shaped, flat pancake, tall bean, lumpy russet, panicked air-fryer, etc.
 */
export const SEED_POTATO_DRAWINGS: PotatoDrawing[] = [
  {
    id: 'seed-01',
    promptId: 'p-layoff',
    auditDate: '2026-11-23',
    caption: '眼神已离职',
    authorTag: '匿名打工人 #409',
    fooledCount: 64,
    features: { dimples: [[30, 72], [70, 68]], eyebags: true },
    pathData: {
      // Peanut-waisted slumped potato
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
    caption: '我是蒜不是薯',
    authorTag: '菜市场卧底 #112',
    fooledCount: 41,
    features: { dimples: [[33, 73], [67, 73]], sprout: true },
    pathData: {
      // Pear-shaped chubby garlic-impostor potato
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
    caption: '凌晨三点的光',
    authorTag: '失眠专家 #887',
    fooledCount: 53,
    features: { eyebags: true, dimples: [[28, 66], [74, 34]] },
    pathData: {
      // Wide melting pillow potato
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
    caption: '发芽悟道薯',
    authorTag: '北海道修行者 #019',
    fooledCount: 29,
    features: { sprout: true, blush: true, dimples: [[34, 74]] },
    pathData: {
      // Tall oval zen potato
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
    caption: '空气炸锅预警',
    authorTag: '逃生块茎 #703',
    fooledCount: 77,
    features: { sweat: true, dimples: [[32, 70]] },
    pathData: {
      // Tall startled bean potato
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
    caption: '稳重编制薯',
    authorTag: '体制内土豆 #204',
    fooledCount: 38,
    features: { dimples: [[29, 38], [71, 68]] },
    pathData: {
      // Rounded-square dignified potato
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
    caption: '对齐颗粒度中',
    authorTag: '周会幸存者 #516',
    fooledCount: 49,
    features: { sweat: true, dimples: [[26, 62], [75, 64]] },
    pathData: {
      // Tilted diagonal kidney potato
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
    caption: '暗恋隔壁地瓜',
    authorTag: '淀粉诗人 #331',
    fooledCount: 33,
    features: { blush: true, dimples: [[68, 34]] },
    pathData: {
      // Plump heart-leaning chubby potato
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
    caption: '嘴角压不住',
    authorTag: '隐藏富豪 #998',
    fooledCount: 58,
    features: { blush: true, dimples: [[32, 32], [70, 72]] },
    pathData: {
      // Lumpy russet golden potato
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
    caption: '碳水猛男',
    authorTag: '卧推 2 公斤 #612',
    fooledCount: 27,
    features: { dimples: [[30, 72], [70, 72]] },
    pathData: {
      // Broad-shouldered muscular inverted-trapezoid potato
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
    caption: '歪成一滩泥',
    authorTag: '躺平土豆 #108',
    fooledCount: 45,
    features: { eyebags: true, dimples: [[26, 72], [74, 72]] },
    pathData: {
      // Super flat melted puddle potato
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
    caption: '斜眼看人类',
    authorTag: '清醒块茎 #445',
    fooledCount: 51,
    features: { sprout: true, dimples: [[68, 70]] },
    pathData: {
      // Crooked sideways crescent potato
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
  caption: '绝对是真土豆',
  authorTag: '年审局质检科',
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
      title: '人类纯度极高 · 碳基天花板',
      subtitle: '北海道对照组土豆（Poteto #01）向你致以沉默的敬意。',
    };
  }
  if (purity >= 72 && beatPotato) {
    return {
      title: '勉强过关 · 险胜对照组土豆',
      subtitle: '你的行为略带迷惑性，但依然保住了今日的人类资格。',
    };
  }
  if (purity >= 52) {
    return {
      title: '人类纯度存疑 · 含薯量偏高',
      subtitle: '经年审局复核，你在部分环节表现出了明显的淀粉倾向。',
    };
  }
  return {
    title: '年审未通过 · 输给了北海道马铃薯',
    subtitle: 'Poteto #01 全程一动未动就赢了，建议明日喝杯咖啡再来。',
  };
}
