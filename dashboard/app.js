const DATA_URL = "../data/dashboard.json";

const roleLabels = {
  fde: "AI 解决方案 / FDE",
  industrial: "工业数智化",
  harness: "Agent Harness"
};

const decisionLabels = {
  build: "进入构建",
  validate: "继续验证",
  hold: "暂缓",
  reject: "否决",
  observe: "观察",
  channel: "渠道实验",
  research: "待研究"
};

const confidenceLabels = {
  high: "高可信",
  medium: "中可信",
  low: "低可信"
};

const qualityLabels = {
  has_timestamp: "报告时间",
  has_model: "模型记录",
  has_source_links: "原报告来源链接",
  has_structured_opportunities: "结构化机会",
  has_actions: "明确行动",
  matches_project_facts: "项目事实一致性"
};

const statusLabels = {
  proved: "已有证据",
  partial: "部分具备",
  gap: "证据缺口"
};

const evaluationStatusLabels = {
  planned: "待验证",
  validating: "验证中",
  validated: "已证实",
  rejected: "已否决",
  stopped: "已停止"
};

const checkpointStatusLabels = {
  complete: "已完成",
  partial: "进行中",
  pending: "待开始"
};

const fitDimensionLabels = {
  asset_reuse: "资产复用",
  capability_fit: "能力匹配",
  channel_access: "渠道触达",
  evidence_readiness: "证据成熟"
};

const reviewStatusLabels = {
  overdue: "已逾期",
  "due-soon": "即将到期",
  scheduled: "已排期",
  completed: "已复核"
};

const reviewResultLabels = {
  confirmed: "判断成立",
  mixed: "部分成立",
  reversed: "判断被推翻",
  "no-signal": "暂无信号"
};

let dashboard = null;
let selectedOpportunityId = null;
let currentView = "overview";

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  bindEvents();
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    dashboard = await response.json();
    selectedOpportunityId = dashboard.latest.opportunities[0]?.id || null;
    document.getElementById("loadingState").hidden = true;
    renderAll();
  } catch (error) {
    document.getElementById("loadingState").hidden = true;
    document.getElementById("errorState").hidden = false;
    document.getElementById("errorMessage").textContent =
      `无法读取 ${DATA_URL}（${error.message}）。请通过 HTTP 服务打开。`;
    refreshIcons();
  }
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  document.getElementById("searchInput").addEventListener("input", renderOpportunityList);
  document.getElementById("decisionFilter").addEventListener("change", renderOpportunityList);
  document.getElementById("confidenceFilter").addEventListener("change", renderOpportunityList);
  document.getElementById("exportBrief").addEventListener("click", exportBrief);
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== view;
  });
  const titles = {
    overview: "可信机会情报与作品证据",
    career: "求职证据与作品缺口",
    evaluation: "个人机会决策与结果复盘",
    health: "运行健康与方法说明"
  };
  document.getElementById("pageTitle").textContent = titles[view];
  refreshIcons();
}

function renderAll() {
  renderGlobal();
  renderOverview();
  renderCareer();
  renderEvaluation();
  renderHealth();
  switchView(currentView);
}

function renderGlobal() {
  const { system, latest } = dashboard;
  document.getElementById("reportDate").textContent = latest.date;
  document.getElementById("latestReportLink").href = `../${latest.path}`;
  document.getElementById("sideLocalRuns").textContent = system.local_summary_count;
  document.getElementById("sidePublicRuns").textContent = system.public_archive_count;
  document.getElementById("sideWindow").textContent =
    `${shortDate(system.history_window.from)} - ${shortDate(system.history_window.to)}`;

  const sourceList = document.getElementById("sourceList");
  sourceList.innerHTML = latest.sources
    .map(
      (source) => `
        <div class="source-row">
          <span>${escapeHtml(source.name)}</span>
          <strong class="${sourceClass(source.status)}">${escapeHtml(source.status)}</strong>
        </div>
      `
    )
    .join("");
}

function renderOverview() {
  const { system, latest, history } = dashboard;
  const top = latest.opportunities[0];
  document.getElementById("issueNumber").textContent =
    `第 ${String(system.report_archive_count).padStart(3, "0")} 期`;
  document.getElementById("modelName").textContent = latest.model;
  document.getElementById("headlineTitle").textContent = latest.headline.title;
  document.getElementById("headlineSummary").textContent = latest.headline.summary;
  setStatusBadge(document.getElementById("headlineConfidence"), latest.headline.confidence);
  setDecisionBadge(document.getElementById("headlineDecision"), top?.decision || "research");

  document.getElementById("statLocalRuns").textContent = system.local_summary_count;
  document.getElementById("statPublicRuns").textContent = system.public_archive_count;
  document.getElementById("statEvidence").textContent = latest.evidence_source_count;
  document.getElementById("statQuality").textContent = `${latest.quality.score}/100`;

  document.getElementById("historyWindow").textContent =
    `${history.length} 份 · ${shortDate(system.history_window.from)} 至 ${shortDate(system.history_window.to)}`;

  renderOpportunityList();
  renderTrends();
  renderMatrix();
  renderHistory();
}

function visibleOpportunities() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const decision = document.getElementById("decisionFilter").value;
  const confidence = document.getElementById("confidenceFilter").value;
  return dashboard.latest.opportunities.filter((item) => {
    const haystack = [
      item.title,
      item.signal,
      item.recommendation,
      item.tags.join(" ")
    ].join(" ").toLowerCase();
    return (
      (!keyword || haystack.includes(keyword)) &&
      (decision === "all" || item.decision === decision) &&
      (confidence === "all" || item.confidence === confidence)
    );
  });
}

function renderOpportunityList() {
  if (!dashboard) return;
  const items = visibleOpportunities();
  const list = document.getElementById("opportunityList");
  if (!items.length) {
    list.innerHTML = '<div class="empty-state">当前筛选没有结果。</div>';
    renderOpportunityDetail(null);
    return;
  }
  if (!items.some((item) => item.id === selectedOpportunityId)) {
    selectedOpportunityId = items[0].id;
  }
  list.innerHTML = items
    .map(
      (item, index) => `
        <button
          class="opportunity-row ${item.id === selectedOpportunityId ? "is-selected" : ""}"
          type="button"
          data-opportunity="${escapeHtml(item.id)}"
        >
          <span class="opportunity-name">
            <b>${String(index + 1).padStart(2, "0")}</b>
            <span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.tags.join(" · "))}</small>
            </span>
          </span>
          <span class="score-cell">${formatScore(item.score)}</span>
          <span><span class="status-badge ${item.confidence}">${confidenceLabels[item.confidence]}</span></span>
          <span class="recurrence-cell">${item.recurrence.reports}/${item.recurrence.window}</span>
          <span><span class="decision-badge ${item.decision}">${decisionLabels[item.decision] || item.decision}</span></span>
        </button>
      `
    )
    .join("");
  list.querySelectorAll("[data-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = button.dataset.opportunity;
      renderOpportunityList();
    });
  });
  renderOpportunityDetail(
    dashboard.latest.opportunities.find((item) => item.id === selectedOpportunityId)
  );
}

function renderOpportunityDetail(item) {
  if (!item) {
    document.getElementById("detailTitle").textContent = "没有匹配机会";
    document.getElementById("detailSignal").textContent = "调整筛选后继续查看。";
    document.getElementById("detailPaid").textContent = "--";
    document.getElementById("detailRecurrence").textContent = "--";
    document.getElementById("roleFitList").innerHTML = "";
    document.getElementById("evidenceList").innerHTML = "";
    document.getElementById("detailAction").textContent = "";
    document.getElementById("detailRisk").textContent = "";
    return;
  }

  document.getElementById("detailTitle").textContent = item.title;
  document.getElementById("detailSignal").textContent = item.signal;
  document.getElementById("detailPaid").textContent = item.paid_evidence;
  document.getElementById("detailRecurrence").textContent =
    `${item.recurrence.reports}/${item.recurrence.window} 份报告`;
  document.getElementById("detailAction").textContent = item.recommendation;
  document.getElementById("detailRisk").textContent = item.risk;

  const roleEntries = Object.entries(item.role_fit || {}).sort((a, b) => b[1] - a[1]);
  document.getElementById("roleFitList").innerHTML = roleEntries.length
    ? roleEntries
        .map(
          ([role, score]) => `
            <div class="role-fit-row">
              <span>${escapeHtml(roleLabels[role] || role)}</span>
              <div class="fit-track"><span style="width:${clamp(score, 0, 100)}%"></span></div>
              <strong>${score}</strong>
            </div>
          `
        )
        .join("")
    : '<p class="empty-copy">尚未建立岗位映射。</p>';

  document.getElementById("evidenceCount").textContent = `${item.evidence.length} 个来源`;
  document.getElementById("evidenceList").innerHTML = item.evidence.length
    ? item.evidence
        .map(
          (evidence) => `
            <article class="evidence-item">
              <a href="${escapeHtml(evidence.url)}" target="_blank" rel="noreferrer">
                <span>${escapeHtml(evidence.title)}</span>
                <i data-lucide="external-link"></i>
              </a>
              <p><b>支持：</b>${escapeHtml(evidence.supports)}</p>
              <p class="boundary"><b>不支持：</b>${escapeHtml(evidence.does_not_support)}</p>
            </article>
          `
        )
        .join("")
    : `
      <div class="missing-evidence">
        <i data-lucide="link-2-off"></i>
        <span>当前没有已核验的一手来源，结论保持低可信。</span>
      </div>
    `;
  refreshIcons();
}

function renderTrends() {
  const trends = dashboard.trends.slice(0, 8);
  document.getElementById("trendList").innerHTML = trends
    .map(
      (trend) => `
        <div class="trend-row">
          <span>
            <strong>${escapeHtml(trend.label)}</strong>
            <small>${decisionLabels[trend.decision] || trend.decision}</small>
          </span>
          <div class="trend-track">
            <span style="width:${Math.round(trend.ratio * 100)}%"></span>
          </div>
          <b>${trend.reports}/${trend.window}</b>
        </div>
      `
    )
    .join("");
}

function renderMatrix() {
  const items = dashboard.latest.opportunities;
  const matrix = document.getElementById("evidenceMatrix");
  const confidenceY = { low: 22, medium: 55, high: 84 };
  matrix.innerHTML = `
    <span class="matrix-y-label">证据可信度</span>
    <span class="matrix-x-label">岗位贴合度</span>
    ${items
      .map((item, index) => {
        const fit = Math.max(30, ...Object.values(item.role_fit || {}));
        const jitter = (index % 3 - 1) * 3;
        return `
          <button
            type="button"
            class="matrix-dot ${item.confidence}"
            data-matrix-opportunity="${escapeHtml(item.id)}"
            style="--matrix-x:${clamp(fit + jitter, 12, 90)}%;--matrix-y:${confidenceY[item.confidence]}%"
            title="${escapeHtml(item.title)}"
          >${index + 1}</button>
        `;
      })
      .join("")}
  `;
  matrix.querySelectorAll("[data-matrix-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = button.dataset.matrixOpportunity;
      switchView("overview");
      renderOpportunityList();
      document.getElementById("detailTitle").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  document.getElementById("matrixLegend").innerHTML = items
    .map(
      (item, index) => `
        <button type="button" data-legend-opportunity="${escapeHtml(item.id)}">
          <b>${index + 1}</b><span>${escapeHtml(item.title)}</span>
        </button>
      `
    )
    .join("");
  document.querySelectorAll("[data-legend-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = button.dataset.legendOpportunity;
      renderOpportunityList();
    });
  });
}

function renderHistory() {
  document.getElementById("historyList").innerHTML = dashboard.history
    .slice(0, 12)
    .map(
      (item) => `
        <a class="history-row" href="../${escapeHtml(item.path)}" target="_blank">
          <time>${escapeHtml(item.date)}</time>
          <strong>${escapeHtml(item.headline)}</strong>
          <span>${item.opportunity_count}</span>
          <span>${item.linked_sources}</span>
          <span class="quality-value ${item.quality < 60 ? "warn" : ""}">${item.quality}/100</span>
        </a>
      `
    )
    .join("");
}

function renderCareer() {
  const { roles, portfolio } = dashboard.career;
  document.getElementById("careerRoleGrid").innerHTML = roles
    .map(
      (role) => `
        <article class="career-role">
          <header>
            <div>
              <p>${escapeHtml(role.resume_file)}</p>
              <h3>${escapeHtml(role.label)}</h3>
            </div>
            <div class="readiness">
              <strong>${role.readiness}</strong>
              <span>证据完成度</span>
            </div>
          </header>
          <div class="role-counts">
            <span class="proved">${role.proved} 项已有证据</span>
            <span class="partial">${role.partial} 项部分具备</span>
            <span class="gap">${role.gaps} 项缺口</span>
          </div>
          <div class="criteria-list">
            ${role.criteria
              .map(
                (criterion) => `
                  <div class="criterion ${criterion.status}">
                    <i data-lucide="${statusIcon(criterion.status)}"></i>
                    <span>
                      <strong>${escapeHtml(criterion.label)}</strong>
                      <small>${escapeHtml(criterion.evidence)}</small>
                    </span>
                    <em>${statusLabels[criterion.status]}</em>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");

  document.getElementById("portfolioList").innerHTML = portfolio
    .map(
      (item) => `
        <article class="portfolio-row">
          <div>
            <span class="portfolio-status ${item.status}">${portfolioStatus(item.status)}</span>
            <h4>${escapeHtml(item.label)}</h4>
          </div>
          <div class="portfolio-roles">
            ${item.roles.map((role) => `<span>${escapeHtml(roleLabels[role] || role)}</span>`).join("")}
          </div>
          <p>${escapeHtml(item.next_proof)}</p>
        </article>
      `
    )
    .join("");
  refreshIcons();
}

function renderOpportunityProfile(profile) {
  const { owner, constraints, assets } = profile;
  document.getElementById("profileName").textContent = owner.name;
  document.getElementById("profileRole").textContent = owner.role;
  document.getElementById("profileGoal").textContent = owner.goal;
  document.getElementById("profileConstraints").innerHTML = [
    `${constraints.weekly_hours} 小时 / 周`,
    `预算上限 ¥${constraints.budget_cny}`,
    `同时只做 ${constraints.max_parallel_builds} 个`,
    `${constraints.validation_days} 天验证`
  ]
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  document.getElementById("profileAssets").innerHTML = assets
    .slice()
    .sort((left, right) => right.maturity - left.maturity)
    .map(
      (asset) => `
        <div>
          <span>${escapeHtml(asset.label)}</span>
          <strong>${asset.maturity}/5</strong>
        </div>
      `
    )
    .join("");
}

function renderPersonalFit(opportunities) {
  document.getElementById("personalFitList").innerHTML = opportunities
    .slice()
    .sort((left, right) => right.personal_fit.score - left.personal_fit.score)
    .map((item) => {
      const fit = item.personal_fit;
      const matched = [
        ...fit.matched_assets.map((label) => `资产：${label}`),
        ...fit.matched_channels.map((label) => `渠道：${label}`)
      ];
      return `
        <article class="personal-fit-card ${fit.decision}">
          <header>
            <div class="fit-score" aria-label="个人匹配分 ${fit.score} 分">
              <strong>${fit.score}</strong>
              <span>/100</span>
            </div>
            <div class="fit-title">
              <span>${escapeHtml(decisionLabels[fit.decision] || fit.decision)}</span>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(fit.rationale)}</p>
            </div>
          </header>
          <div class="fit-dimensions">
            ${Object.entries(fit.dimensions)
              .map(
                ([key, value]) => `
                  <div class="fit-dimension">
                    <div><span>${escapeHtml(fitDimensionLabels[key] || key)}</span><strong>${value}</strong></div>
                    <div class="fit-track"><span style="width:${clamp(value, 0, 100)}%"></span></div>
                  </div>
                `
              )
              .join("")}
          </div>
          <details class="fit-details">
            <summary>查看匹配依据与缺口</summary>
            <div>
              <p><strong>已匹配</strong>${matched.length ? matched.map(escapeHtml).join(" · ") : "暂无"}</p>
              <p><strong>能力</strong>${fit.matched_capabilities.length ? fit.matched_capabilities.map(escapeHtml).join(" · ") : "暂无"}</p>
              <ul>${fit.gaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("")}</ul>
            </div>
          </details>
        </article>
      `;
    })
    .join("");
}

function renderReviewQueue(evaluation) {
  const { summary, review_queue: queue } = evaluation;
  document.getElementById("reviewHonestyNote").textContent = summary.review_completed
    ? `已记录 ${summary.review_completed} 个真实结果。`
    : "真实结果仍为 0，不把计划写成成果。";
  document.getElementById("reviewSummary").innerHTML = `
    <div><span>待复核</span><strong>${summary.review_total - summary.review_completed}</strong></div>
    <div><span>7 天内</span><strong>${summary.review_due_soon}</strong></div>
    <div><span>已逾期</span><strong>${summary.review_overdue}</strong></div>
    <div><span>已完成</span><strong>${summary.review_completed}</strong></div>
  `;
  document.getElementById("reviewQueue").innerHTML = queue
    .map(
      (review) => `
        <article class="review-row ${review.status}">
          <div class="review-window"><strong>${review.window_days}</strong><span>天</span></div>
          <div class="review-copy">
            <h4>${escapeHtml(review.title)}</h4>
            <p>${escapeHtml(review.result ? reviewResultLabels[review.result] : reviewPrompt(review))}</p>
            ${review.evidence ? `<small>${escapeHtml(review.evidence)}</small>` : ""}
          </div>
          <div class="review-date">
            <span class="review-status ${review.status}">${escapeHtml(reviewStatusLabels[review.status] || review.status)}</span>
            <time datetime="${review.due_date}">${escapeHtml(review.due_date)}</time>
          </div>
        </article>
      `
    )
    .join("");
}

function renderEvaluation() {
  const { summary, records, rules } = dashboard.evaluation;
  renderOpportunityProfile(dashboard.opportunity_profile);
  renderPersonalFit(dashboard.latest.opportunities);
  renderReviewQueue(dashboard.evaluation);
  document.getElementById("evaluationTotal").textContent = summary.total;
  document.getElementById("evaluationActive").textContent = summary.active;
  document.getElementById("evaluationValidated").textContent = summary.validated;
  document.getElementById("evaluationRejected").textContent = summary.rejected;
  document.getElementById("evaluationExternal").textContent = summary.external_evidence;
  document.getElementById("evaluationNextReview").textContent = summary.next_review
    ? `下一次复核：${summary.next_review}`
    : "当前没有开放的复核日期";

  document.getElementById("ledgerRuleList").innerHTML = rules
    .map((rule) => `<li>${escapeHtml(rule)}</li>`)
    .join("");

  document.getElementById("ledgerList").innerHTML = records
    .map(
      (record) => `
        <article class="ledger-card">
          <header>
            <div>
              <p>${escapeHtml(record.origin_signal)}</p>
              <h3>${escapeHtml(record.title)}</h3>
            </div>
            <span class="evaluation-status ${record.status}">
              ${escapeHtml(evaluationStatusLabels[record.status] || record.status)}
            </span>
          </header>

          <div class="ledger-meta">
            <span><i data-lucide="calendar-range"></i>${escapeHtml(formatReviewDue(record))}</span>
            <span><i data-lucide="scale"></i>${escapeHtml(record.evidence_boundary)}</span>
            <span><i data-lucide="route"></i>${escapeHtml(decisionLabels[record.decision] || record.decision)}</span>
          </div>

          <div class="ledger-progress">
            <div>
              <span>检查点</span>
              <strong>${record.completed_checkpoints}/${record.checkpoint_count}</strong>
            </div>
            <div class="progress-track" aria-label="检查点完成度 ${record.progress}%">
              <span style="width:${clamp(record.progress, 0, 100)}%"></span>
            </div>
            <b>${record.progress}%</b>
          </div>

          <div class="ledger-copy">
            <p><strong>原始假设</strong>${escapeHtml(record.hypothesis)}</p>
            <p><strong>当前结果</strong>${escapeHtml(record.current_result)}</p>
          </div>

          <div class="checkpoint-list">
            ${record.checkpoints
              .map(
                (checkpoint) => `
                  <div class="checkpoint ${checkpoint.status}">
                    <i data-lucide="${checkpointIcon(checkpoint.status)}"></i>
                    <span>
                      <strong>${escapeHtml(checkpoint.label)}</strong>
                      <small>${escapeHtml(checkpoint.evidence)}</small>
                    </span>
                    <em>${escapeHtml(checkpointStatusLabels[checkpoint.status] || checkpoint.status)}</em>
                  </div>
                `
              )
              .join("")}
          </div>

          <details class="ledger-details">
            <summary>查看成功标准与停止条件</summary>
            <div>
              <h4>成功标准</h4>
              <ul>
                ${record.success_criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
              <h4>停止条件</h4>
              <p>${escapeHtml(record.stop_condition)}</p>
            </div>
          </details>
        </article>
      `
    )
    .join("");
  refreshIcons();
}

function renderHealth() {
  const { latest, system, methodology } = dashboard;
  document.getElementById("healthQualityScore").textContent = `${latest.quality.score}/100`;
  document.getElementById("qualityChecks").innerHTML = Object.entries(latest.quality.checks)
    .map(
      ([key, passed]) => `
        <div class="check-row ${passed ? "pass" : "fail"}">
          <i data-lucide="${passed ? "check-circle-2" : "circle-alert"}"></i>
          <span>${escapeHtml(qualityLabels[key] || key)}</span>
          <strong>${passed ? "通过" : key === "matches_project_facts" ? "冲突" : "缺失"}</strong>
        </div>
      `
    )
    .join("") +
    (latest.quality.fact_conflicts || [])
      .map(
        (conflict) => `
          <div class="fact-conflict-note">
            <i data-lucide="triangle-alert"></i>
            <span>${escapeHtml(conflict)}</span>
          </div>
        `
      )
      .join("");

  const security = system.security;
  const securityBadge = document.getElementById("securityStatus");
  securityBadge.textContent = security.status === "pass" ? "检查通过" : "需要处理";
  securityBadge.className = `status-badge ${security.status === "pass" ? "high" : "low"}`;
  document.getElementById("securityFacts").innerHTML = `
    <div><dt>检查文件</dt><dd>${security.checked_files}</dd></div>
    <div><dt>明文凭据</dt><dd>${security.hardcoded_credentials_detected}</dd></div>
    <div><dt>凭据来源</dt><dd>${escapeHtml(security.credential_source)}</dd></div>
    <div><dt>发布方式</dt><dd>${escapeHtml(security.publish_mode)}</dd></div>
    <div><dt>本地报告</dt><dd>${system.report_archive_count}</dd></div>
    <div><dt>已公开</dt><dd>${system.public_archive_count}</dd></div>
    <div><dt>待发布</dt><dd>${system.unpublished_report_count}</dd></div>
    <div><dt>发布状态</dt><dd>${escapeHtml(system.publication.message)}</dd></div>
  `;

  document.getElementById("healthSources").innerHTML = latest.sources
    .map(
      (source) => `
        <div class="check-row ${source.status === "已采集" ? "pass" : "fail"}">
          <i data-lucide="${source.status === "已采集" ? "radio-tower" : "wifi-off"}"></i>
          <span>${escapeHtml(source.name)}</span>
          <strong>${escapeHtml(source.status)}</strong>
        </div>
      `
    )
    .join("");

  document.getElementById("methodologyNote").textContent = methodology.note;
  document.getElementById("confidenceGuide").innerHTML = Object.entries(methodology.confidence_levels)
    .map(
      ([level, description]) => `
        <div>
          <dt><span class="status-badge ${level}">${confidenceLabels[level]}</span></dt>
          <dd>${escapeHtml(description)}</dd>
        </div>
      `
    )
    .join("");
  refreshIcons();
}

function exportBrief() {
  if (!dashboard) return;
  const item =
    dashboard.latest.opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ||
    dashboard.latest.opportunities[0];
  const evidence = item.evidence.length
    ? item.evidence
        .map(
          (source) =>
            `- [${source.title}](${source.url})\n  - 支持：${source.supports}\n  - 不支持：${source.does_not_support}`
        )
        .join("\n")
    : "- 暂无核验来源";
  const content = [
    `# AI 夜巡可信简报 · ${dashboard.latest.date}`,
    "",
    `## ${item.title}`,
    `- 原报告评分：${item.score}/5`,
    `- 可信度：${confidenceLabels[item.confidence]}`,
    `- 历史重复：${item.recurrence.reports}/${item.recurrence.window} 份报告`,
    `- 付费证据：${item.paid_evidence}`,
    "",
    item.signal,
    "",
    "## 来源与证据边界",
    evidence,
    "",
    "## 建议行动",
    item.recommendation,
    "",
    "## 风险",
    item.risk
  ].join("\n");
  downloadText(`night-patrol-${item.id}.md`, content);
}

function setStatusBadge(element, confidence) {
  element.textContent = confidenceLabels[confidence] || "可信度待定";
  element.className = `status-badge ${confidence}`;
}

function setDecisionBadge(element, decision) {
  element.textContent = decisionLabels[decision] || decision;
  element.className = `decision-badge ${decision}`;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  }
}

function sourceClass(status) {
  return status === "已采集" ? "source-ok" : status === "受限" ? "source-warn" : "";
}

function statusIcon(status) {
  return status === "proved" ? "check-circle-2" : status === "partial" ? "circle-dashed" : "circle-x";
}

function checkpointIcon(status) {
  return status === "complete" ? "check-circle-2" : status === "partial" ? "circle-dashed" : "circle";
}

function formatReviewDue(record) {
  if (!record.review_due) return "该判断已关闭";
  if (record.due_state === "overdue") {
    return `逾期 ${Math.abs(record.days_remaining)} 天 · ${record.review_due}`;
  }
  if (record.due_state === "closed") return `已关闭 · ${record.review_due}`;
  if (record.days_remaining === 0) return `今天复核 · ${record.review_due}`;
  return `${record.days_remaining} 天后复核 · ${record.review_due}`;
}

function reviewPrompt(review) {
  if (review.status === "overdue") {
    return `已逾期 ${Math.abs(review.days_remaining)} 天，需要记录真实结果。`;
  }
  if (review.days_remaining === 0) return "今天到期，记录判断是否成立。";
  return `${review.days_remaining} 天后复核，不提前填写结果。`;
}

function portfolioStatus(status) {
  return {
    active: "升级中",
    tested: "已测试",
    demo: "已有 Demo"
  }[status] || status;
}

function formatScore(score) {
  return Number.isInteger(score) ? `${score}/5` : `${score.toFixed(1)}/5`;
}

function shortDate(value) {
  return String(value || "").slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
