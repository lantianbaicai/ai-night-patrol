# GitHub Pages 发布检查表

目标仓库：

- `https://github.com/lantianbaicai/ai-night-patrol`
- 预期 Pages：`https://lantianbaicai.github.io/ai-night-patrol/`

## 发布前

在仓库根目录依次运行：

```powershell
python tools/build_dashboard_data.py
python -m unittest discover -s tests -v
node --check dashboard/app.js
python tools/validate_public_release.py
```

全部返回成功后再发布。发布包不应包含：

- `.git/`
- `.playwright-cli/`
- `output/`
- `__pycache__/`
- 本机凭据、浏览器 Cookie 或 Personal Access Token

## GitHub 连接

优先使用 Codex 的 GitHub 连接发布，不把 Token 写入脚本、远端地址或文档。连接后确认：

1. 当前账号能够写入 `lantianbaicai/ai-night-patrol`。
2. 默认分支为 `main`。
3. 仓库 Settings → Pages 的来源为 GitHub Actions。
4. `.github/workflows/pages.yml` 已进入远端仓库。

## 发布后

等待 `Deploy Night Patrol dashboard` 工作流完成，然后检查：

1. 仓库 README 显示 V3 的四个视图。
2. Pages 根地址自动进入 `/dashboard/`。
3. 机会情报、求职证据、运行健康、验证账本均可切换。
4. 桌面与手机宽度没有横向溢出或内容重叠。
5. 外部证据链接可以打开。
6. 页面中的本地摘要、公开归档和待发布数量必须与 `data/dashboard.json` 一致，且不能把它们描述成用户或任务次数。
7. 验证账本显示外部证据为 `0`，直到确实获得外部反馈。

## 首次公开后的记录

首次公开不是“验证成功”。在 `data/decision_ledger.json` 继续记录：

- Pages 上线时间和远端提交 SHA；
- 定向投递数量；
- 招聘方是否点开、追问或讨论作品；
- 外部使用者运行失败和反馈；
- 到期后的继续、调整或停止结论。
