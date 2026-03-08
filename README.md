# 字趣 — 儿童趣味汉字书写练习 App

面向 6~10 岁儿童的趣味汉字书写练习应用，适配 iPad + 触控笔使用场景，通过笔顺动画演示、跟写测验和星星奖励机制激发孩子的书写兴趣。

## 功能特性

- **田字格 + 笔顺动画** — 基于 [hanzi-writer](https://hanziwriter.org/) 实现标准笔顺动画演示
- **跟写测验** — 孩子在田字格上跟写，系统实时检测笔画正确性
- **星星奖励** — 根据书写准确度给予 1~3 星评价，满分触发撒花动画
- **自定义字表** — 家长可手动输入汉字或从预设字表（一年级上/下、常用字）快速添加
- **进度追踪** — 记录每个字的最佳成绩、练习次数和连续打卡天数
- **数据持久化** — 基于 localStorage 自动保存学习进度

## 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 7 | 构建工具 |
| Tailwind CSS 4 | 样式系统 |
| hanzi-writer | 汉字笔顺动画与测验引擎 |
| React Router 7 | 路由管理 |
| Lucide React | 图标库 |
| Sonner | Toast 通知 |

## 项目结构

```
src/
├── components/         # 通用组件
│   ├── Confetti.tsx       # 撒花庆祝动画
│   ├── ProgressBar.tsx    # 进度条
│   └── StarRating.tsx     # 星星评分
├── hooks/
│   └── useHanziWriter.ts  # hanzi-writer 封装 Hook
├── pages/
│   ├── HomePage.tsx       # 主页
│   ├── PracticePage.tsx   # 练字页（核心）
│   └── SettingsPage.tsx   # 家长设置页
├── store/
│   └── index.ts           # 状态管理（useSyncExternalStore + localStorage）
├── App.tsx
├── main.tsx
└── index.css              # 设计系统（配色、动画、字体等）
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 设计理念

- **大触控区域** — 所有按钮最小 48px 触控区域，适配儿童手指和触控笔操作
- **温暖配色** — 阳光黄 (#FFB800)、成长绿 (#4CAF50)、天空蓝 (#42A5F5) 为主色调
- **田字格书写** — 还原传统田字格练字体验，配合笔顺引导辅助线
- **即时反馈** — 每一笔都有视觉反馈，完成后立即显示星星评价
- **居中布局** — max-width 容器确保在 iPad 横竖屏下布局合理

## License

MIT
