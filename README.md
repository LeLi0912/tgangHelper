# 提肛助手 (tgang-helper)

科学盆底肌训练（凯格尔运动）Web 应用 — 动画引导 · 语音辅助 · AI 姿态矫正。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 动画 | Framer Motion 12 |
| 姿态检测 | @mediapipe/tasks-vision (PoseLandmarker, VIDEO 模式) |
| AI 建议 | DeepSeek V4 API (OpenAI 兼容格式, 通过 Next.js API Route 代理) |
| 语音 | Web Speech API (SpeechSynthesis) |
| 存储 | localStorage |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局 (zh-CN, 渐变背景, Navbar)
│   ├── page.tsx                # 首页 (性别选择 + 课程卡片 + 训练要点)
│   ├── globals.css             # 全局样式 (滚动条, 动画)
│   ├── train/
│   │   └── page.tsx            # 训练页 (呼吸圈 + 人形图 + 控制器 + 姿态检测)
│   ├── records/
│   │   └── page.tsx            # 记录页 (热力图 + 周统计 + 最近记录 + 导出)
│   └── api/
│       └── posture-advice/
│           └── route.ts        # DeepSeek AI 姿势建议 API 代理
├── components/
│   ├── BreathingCircle.tsx     # 呼吸动画圈 (SVG 轨道环 + 缩放圆圈 + 倒计时)
│   ├── PostureFigure.tsx       # 人体姿势 SVG 图 (线稿风格, 收缩/放松动画)
│   ├── CourseCard.tsx          # 课程卡片 (难度色条 + 提示标签 + CTA 按钮)
│   ├── Navbar.tsx              # 顶部导航栏 (毛玻璃 + 活跃态指示)
│   ├── PoseDetector.tsx        # 摄像头姿态检测组件 (动态加载, 无 SSR)
│   ├── AIAdvice.tsx            # AI 建议展示组件 (调用 API + 语音播报)
│   ├── TrainingCalendar.tsx    # 90 天训练热力图 (月份分组 + 强度颜色)
│   └── StatsChart.tsx          # 8 周统计柱状图 + 训练类型分布
├── hooks/
│   ├── useTraining.ts          # 训练状态机 (计时/步骤/组数推进, 100ms 精度)
│   ├── useVoice.ts             # 语音播报 (即时模式, cancel+speak, 与显示同步)
│   ├── usePoseDetector.ts      # MediaPipe 姿态检测 (30 帧历史, 60% 持续性阈值)
│   └── useLocalStorage.ts      # localStorage 读写封装
├── data/
│   └── courses.ts              # 6 套课程定义 + 呼吸动画参数
└── types/
    └── index.ts                # 全部 TypeScript 类型定义
```

## 课程体系

6 套科学分级课程，按性别和难度划分：

| 课程 ID | 标题 | 难度 | 时长 | 内容 |
|---------|------|------|------|------|
| male-beginner | 男性入门 · 唤醒盆底肌 | 入门 | 8 分钟 | 快收快放 + 持续收缩 |
| male-intermediate | 男性进阶 · 力量持久训练 | 进阶 | 12 分钟 | 快速 + 持续 + 阶梯 |
| male-advanced | 男性强化 · 终极控制 | 强化 | 16 分钟 | 高强度综合训练 |
| female-beginner | 女性入门 · 找到你的盆底肌 | 入门 | 9 分钟 | 温和激活 + 基础发力 |
| female-intermediate | 女性进阶 · 耐力与控制 | 进阶 | 13 分钟 | 耐力 + 阶梯训练 |
| female-advanced | 女性强化 · 全能盆底 | 强化 | 17 分钟 | 综合高强度训练 |

### 训练动作类型

- **快速收缩/放松** (1s): 激活快肌纤维
- **持续收缩→保持→放松** (3-10s): 训练慢肌纤维和耐力
- **阶梯收缩 (20%→50%→80%→100%)**: 精细控制训练
- **阶梯放松 (60%→30%→完全)**: 控制力训练
- **组间休息** (10-20s)

## 设计风格

健康正向、简洁清新。以 emerald/teal/green 为主色调，白色卡片 + 微妙渐变背景 + 细线边框。呼吸圈用颜色编码阶段（绿=收缩, 黄=保持, 蓝=放松, 灰=休息）。人体图采用线稿风格（stroke:#CBD5E1），收缩时躯干微微缩小。

## 关键设计决策

### 语音播报同步

`useVoice.speak()` 采用即时模式：每次调用先 `cancel()` 当前语音，立即播报新指令。这保证语音与屏幕显示严格同步 — 步骤切换时，显示更新和语音播报同时发生。通过 `currentTextRef` 去重避免同一指令重复播。快速动作（≤2s）使用单字指令（"收"/"放"），语速 0.75。训练页用 `useRef` 而非 `useState` 追踪已播步骤，避免 React 异步状态更新导致的去重失效。

（早期尝试过队列模式避免打断，但导致语音延迟于显示更新，已废弃。）

### 姿态检测持续性判断

MediaPipe 每帧检测，维护最近 30 帧历史。单帧出现的问题不算，需某类问题在历史中出现超过 60% 才判定为"持续性问题"。每 3 秒检查一次，触发后 10 秒内不重复提醒。

### DeepSeek API 代理

API Route 兼容完整 URL 和 base URL 两种格式（自动补齐 `/v1/chat/completions`）。期望 JSON 格式回复，解析失败时返回默认建议。

## 环境变量

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

## 开发

```bash
npm run dev      # 启动开发服务器 (默认 localhost:3000)
npm run build    # 生产构建
npm run lint     # ESLint 检查
```

## 开发进度

### 已完成

- [x] 项目初始化 (Next.js 16 + TypeScript + Tailwind CSS 4)
- [x] 类型系统定义
- [x] 6 套训练课程数据
- [x] 训练状态机 (步骤→重复→组推进)
- [x] 呼吸圈动画 (SVG 轨道环 + 缩放圆 + 倒计时)
- [x] 人体姿势 SVG 图 (线稿风格 + 收缩动画)
- [x] 语音播报 (即时同步模式, cancel+speak, useRef 去重)
- [x] 语音显示同步 (语音与屏幕文字严格对齐)
- [x] 首页 (性别选择 + 难度筛选 + 课程卡片)
- [x] 训练页 (呼吸圈 + 人形图 + 进度条 + 控制按钮)
- [x] 记录页 (热力图 + 周统计 + 最近记录 + JSON 导出)
- [x] MediaPipe Pose 姿态检测 (30 帧持续判断)
- [x] DeepSeek AI 姿势建议 API 代理
- [x] AI 建议展示 + 语音播报
- [x] 暂停/继续/结束/重来 控制
- [x] 训练完成自动保存记录
- [x] 响应式适配 (移动端/桌面端)
- [x] 全局 UI 细节 (毛玻璃导航, 渐变装饰, 微交互动画)

### 待完成

- [ ] 摄像头权限引导与错误恢复 UI
- [ ] 训练中姿态评分与记录关联
- [ ] PWA 支持 (离线缓存, 添加到主屏幕)
- [ ] 推送提醒 (每日训练通知)
- [ ] 训练数据云端同步
- [ ] 训练背景音乐/白噪音
- [ ] 更多训练课程 (场景化: 办公族, 孕期, 老年等)
- [ ] 国际化 (i18n)
- [ ] 单元测试 / E2E 测试

### 已知限制

- MediaPipe Pose 首次加载需下载约 6MB 的 WASM + 模型文件
- 语音合成在部分移动浏览器上的中文发音可能不自然
- iOS Safari 可能限制 `speechSynthesis` 的自动播放
- 摄像头检测需要 HTTPS 或 localhost 环境
