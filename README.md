# 🦞 AI 赚钱夜巡 · AI Money Night Patrol

> 每4小时自动扫描 GitHub Trending / Topics / 36氪 / ProductHunt
> 追踪 AI Agent 技能市场、变现机会、工具生态趋势
> 已运行 68 轮，持续更新中。

---

## 📖 这是什么？

AI 领域每天涌现几百个新项目，99% 看完就忘。**夜巡**从中筛选出真正能赚钱、能复制的方向，用一套 5 指标评分体系评估可行性：

| 指标 | 含义 |
|------|------|
| 客户明确 | 有没有明确的付费人群？ |
| 7天 Demo | 一周内能做出原型吗？ |
| 30天收费 | 一个月内能开始收钱吗？ |
| 复用资产 | 做出来的东西能重复用吗？ |
| 长期壁垒 | 能形成护城河吗？ |

---

## 📊 最新夜巡

[查看最新 →](./reports/latest.md)

---

## 🗂️ 近期重要发现

### Agent 技能市场爆发（2026-06-16）
- addyosmani/agent-skills → 61K⭐，工程级 Agent 技能集
- tonsofskills.com → 425 插件 + 2810 技能 + 200 Agent
- NVIDIA SkillSpector → 大厂入场做技能安全审核
- **结论：Agent 技能市场不是趋势，是已发生的现实**

### 「自动索引即产品」模式（2026-06-17）
- linny006 搭建 14+ GitHub 自动追踪器，互相链接 SEO 霸屏
- 零人力维护，纯自动脚本驱动
- **结论：可 1:1 复制到任何垂直领域**

### OpenClaw 生态验证（2026-06-16）
- AionUi 28K⭐ 明确支持 OpenClaw
- aksika/abtars 独立验证「Agent 中枢 + IM 多平台」赛道
- cc-connect 12K⭐ Agent→飞书/钉钉/Slack 通信桥

---

## 🔍 覆盖数据源

| 数据源 | 状态 |
|--------|------|
| GitHub Trending | ✅ 正常 |
| GitHub Topics (ai/ai-tools/mcp) | ✅ 正常 |
| 36氪 | ⚠️ 内容不稳定 |
| ProductHunt | ❌ 403 |
| HN | ❌ 不可达 |
| 知乎 | ❌ 403 |
| SearXNG | ❌ 未配置 |

---

## 📂 目录结构

```
ai-night-patrol/
├── README.md              ← 你在这里
├── reports/
│   ├── latest.md          ← 最新一轮夜巡
│   └── archive/           ← 历史夜巡存档
└── methodology.md         ← 5 指标评分详解
```

---

## 🛠️ 技术栈

- 数据采集：Python + GitHub API + web scraping
- 内容生成：LLM 自动摘要 + 人工精选
- 定时调度：每 4 小时一轮
- 推送：GitHub + 待定（飞书/小红书）

---

*本仓库内容自动生成，仅供研究参考。商业决策请自行判断。*
