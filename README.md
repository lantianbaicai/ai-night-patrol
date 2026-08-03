# AI 夜巡：可信机会情报

AI 夜巡不是“每日热点搬运”，而是一套持续运行的机会研究工作流：

1. 从 GitHub、36氪、Hacker News 等来源采集候选信号。
2. 保留原始报告中的商业可行性评分。
3. 为重要方向补充一手来源、历史重复次数和证据边界。
4. 把研究结果映射到可构建项目与求职作品证据。
5. 公开归档每次报告，并显示来源、解析、发布和凭据健康状态。

截至 2026-08-01，本地保留 `340` 份摘要，公开作品集包含全部 `111` 份去重报告，当前待发布为 `0`。它们是研究材料数量，不是用户数、客户数或任务成功次数。

## 在线仪表盘

[打开可信机会情报仪表盘](./dashboard/)

仪表盘包含四个视图：

- **机会情报**：原始评分、证据可信度、近 30 份报告重复次数、当前决策和证据边界。
- **求职证据**：AI 解决方案 / FDE、工业数智化、Agent Harness 三条岗位线的已有证据与缺口。
- **运行健康**：最新报告质量门、来源覆盖、明文凭据扫描和发布方式。
- **验证账本**：预先记录假设、成功标准、检查点、复核日期和停止条件，并保留被否定的判断。

## 为什么要做 V3

旧版只回答“这个方向看起来热不热”。V3 进一步回答：

- 结论来自哪里？
- 来源实际支持什么，又不能支持什么？
- 是一次热点，还是连续出现的信号？
- 有没有付费证据？
- 对当前作品集和岗位目标有什么价值？
- 自动发布失败时，系统是否会明确报错？

GitHub 热度不等于付费需求，重复出现也不等于应该立刻开工。因此，仪表盘把热度、证据和行动决策分开呈现。

## 数据与目录

```text
ai-night-patrol/
|-- dashboard/                 # 静态 V3 仪表盘
|-- data/
|   |-- dashboard.json         # 可复现的仪表盘数据
|   |-- evidence_catalog.json  # 主题证据、边界、风险与建议
|   |-- career_profile.json    # 岗位能力证据清单
|   `-- decision_ledger.json   # 假设、检查点、结果与停止条件
|-- reports/
|   |-- latest.md
|   `-- archive/
|-- tools/
|   `-- build_dashboard_data.py
|-- tests/
|-- methodology.md
`-- index.html                 # GitHub Pages 入口
```

## 本地运行

```powershell
python tools/build_dashboard_data.py
python -m unittest discover -s tests -v
python tools/validate_public_release.py
python -m http.server 8765 --bind 127.0.0.1
```

浏览器打开 `http://127.0.0.1:8765/dashboard/`。

## V4：从趋势雷达到个人决策

V4 新增一套与原报告评分相互独立的个人机会决策层：

- `data/opportunity_profile.json` 保存当前目标、时间预算、现有资产、能力和可触达渠道。
- 每条最新机会都会生成资产复用、能力匹配、渠道触达、证据成熟四项可解释评分。
- `data/decision_outcomes.json` 只保存真实复核结果，初始为空，不用模拟数据填充成绩。
- 每个预先判断自动进入 7 天、30 天复核队列，包括已经否决的判断。
- `tools/record_decision_outcome.py` 用于写入带证据的结果，并支持原判断被推翻。

详细规则与记录方法见 [个人机会决策引擎](./docs/PERSONAL_OPPORTUNITY_ENGINE.md)。

## 发布安全

- GitHub 凭据只从 `GITHUB_TOKEN` 环境变量读取。
- 发布脚本失败时返回非零退出码，不再把失败报告成成功。
- 文件通过 Git Data API 组成一次原子提交，并校验远端 SHA。
- 仪表盘构建时扫描目标脚本中的明文 Personal Access Token。

## 当前重点

最近 30 份报告中，Agent Skills、本地优先 AI、办公文档 AI、Agent 基础设施和开源 SaaS 替代持续出现。但当前行动不是同时开发五个产品：

- **进入构建**：办公文档 AI，用现有工程资料预审台补齐可选 OfficeCLI 校验。
- **继续验证**：Agent Skills，优先测任务成功率和跨代理可复现性。
- **求职资产**：把夜巡本身做成 FDE / Agent Harness 的评测、证据和可观测性案例。
- **暂缓**：只存在 GitHub 热度、缺少客户与付费证据的方向。

详细规则见 [methodology.md](./methodology.md)，本轮项目取舍见
[docs/DECISION_2026-07-31.md](./docs/DECISION_2026-07-31.md)，最近五天信号复核见
[docs/REVIEW_2026-07-31_RECENT_SIGNALS.md](./docs/REVIEW_2026-07-31_RECENT_SIGNALS.md)，发布门槛见
[docs/PUBLISH_CHECKLIST.md](./docs/PUBLISH_CHECKLIST.md)。

> 本仓库用于机会研究和作品验证，不构成投资或经营承诺。自动生成内容需要人工复核。
