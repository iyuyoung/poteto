# Poteto — 每日人类资格年审

免注册、零登录门槛的 90 秒每日全球同题网页小游戏。基于 **Astro 5 + React 19 + Tailwind CSS v4 + DaisyUI v5 + Cloudflare Workers + Neon (PostgreSQL)** 构建。

## 核心特性
- **零摩擦入口**：首屏即本体（经典「我不是机器人」勾选框 + 当日编号 + UTC 过期倒计时 + 昨日画作回访战报）。
- **每日三关全球同题（Deterministic Seed）**：
  1. **第 1 关（视觉 / UGC 辨别）**：8 张昨日网友矢量土豆 + 1 张官方干扰项，角落支持一键举报（满 3 次自动熔断顶替）。
  2. **第 2 关（反直觉交互）**：内置 16 套微交互关卡，按日期取模轮换，连续 7 天以上不重复。
  3. **第 3 关（手绘自证）**：`0-100` 归一化坐标 + Ramer-Douglas-Peucker 抽稀（300–600 字节），3 笔 / 8 秒 / 闭合度 / 长宽比硬约束。
- **人类资格鉴定书**：自动将手绘土豆扣作证件照，支持一键复制 Wordle 风格 Emoji 战绩、下载鉴定书 PNG、进入无尽年审（Endless Mode）与开启明日过期提醒。
- **零配置本地可运行**：未设置 `DATABASE_URL` 时自动无缝降级为内置精选矢量画作池；配置 Neon PostgreSQL 后自动启用持久化与边缘缓存。

## 快速开始

```bash
pnpm install
pnpm generate:assets
pnpm dev
```

## 数据库初始化（Neon PostgreSQL）

在 Neon SQL Editor 中执行 [`db/schema.sql`](./db/schema.sql)，并在 Cloudflare Workers 环境变量中配置 `DATABASE_URL`。

## 每日精选审核（Layer 2 Cron）

```bash
DATABASE_URL=... GEMINI_API_KEY=... pnpm curate
```

## 部署至 Cloudflare Workers

```bash
pnpm build
pnpm deploy
```
