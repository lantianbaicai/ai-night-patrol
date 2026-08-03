const cases = {
  shop: {
    short: "抖店上架",
    code: "CASE 01",
    title: "同行价驱动的商品上架",
    status: "信息不足",
    source: "客户群聊",
    channel: "平台自动化",
    updated: "案例整理于 06/29",
    attachment: { name: "货盘表-龙虾.xls", note: "商品规格与编码 · 脱敏副本", icon: "file-spreadsheet" },
    messages: [
      { role: "client", text: "读取货盘表里的商品链接、规格和商品编码，根据同行店铺链接上架。" },
      { role: "client", text: "价格按同行真实成交价 +20，上架后做单品直降 15 元；一个活动最多 100 个商品。" },
      { role: "self", text: "真实成交价具体指页面标价、券后价，还是直播和平台补贴后的价格？" },
      { role: "client", text: "重点就是如何快速识别同行真实成交价，店铺预计几十个。" }
    ],
    decision: "只接付费验证",
    riskLabel: "高风险",
    riskTone: "high",
    score: 48,
    metrics: [
      { label: "需求清晰度", value: 43, color: "var(--yellow)" },
      { label: "技术可行性", value: 35, color: "var(--coral)" },
      { label: "交付把握", value: 47, color: "var(--cyan)" },
      { label: "商务完整度", value: 67, color: "var(--lime)" }
    ],
    reason: "核心定价依赖无法直接证明的“真实成交价”，且涉及登录、风控和多店铺批量操作；先验证数据是否拿得到，再谈正式版。",
    pipeline: [
      { label: "需求复述", state: "done" },
      { label: "数据验证", state: "active" },
      { label: "小量上架", state: "wait" },
      { label: "批量评估", state: "wait" }
    ],
    summary: "读取货盘表和同行链接，计算一个可确认的价格，再在已登录的抖店中完成少量商品上架与活动配置。",
    highlight: "可确认的价格",
    facts: [
      "平台已明确为抖店，输入包含商品链接、规格和编码。",
      "规则包含“同行价 +20”和单品直降 15 元。",
      "计划扩展到几十个店铺，每个活动最多 100 个商品。"
    ],
    assumptions: "当前只能把页面可见标价、SKU 价与可见优惠定义为“可见到手价”，不能等同于每个买家的真实成交价。",
    questions: [
      { text: "“真实成交价”采用哪一种口径，页面可见券后价是否可以？", why: "决定能否实现" },
      { text: "请录一段从打开商品到发布、再创建直降活动的完整操作。", why: "决定页面流程" },
      { text: "验证阶段提供哪个店铺、多少真实商品，验证码由谁处理？", why: "决定测试环境" },
      { text: "发布成功如何验收，价格识别错误时是否先进入人工确认表？", why: "决定验收" },
      { text: "页面改版、账号失效和后续维护是否单独计费？", why: "决定售后边界" }
    ],
    risks: [
      { level: "高", name: "真实成交价不可直接证明", impact: "直播、新客、平台补贴和个性化优惠会让同一商品出现不同价格。", action: "先定义“可见到手价”，生成待确认表后再上架。" },
      { level: "高", name: "平台风控与封号", impact: "批量点击、多店铺和异常频率可能触发验证码、限流或账号处罚。", action: "单账号小量验证，限制频率，验证码由人工处理。" },
      { level: "中", name: "后台页面改版", impact: "控件位置或字段变化会使浏览器自动化失效。", action: "正式版单列维护周期，页面改版按范围评估。" },
      { level: "中", name: "范围失控", impact: "几十个店铺的类目、规格和异常分支可能完全不同。", action: "Demo 只验 1 店 3-5 商品，不承诺批量版。" }
    ],
    scope: {
      include: ["1 个已登录店铺", "3-5 个真实商品", "识别页面可见价格", "上架与单品直降流程", "成功/失败记录"],
      exclude: ["直播间或新客专属价", "绕过验证码与风控", "几十店批量稳定性", "长期页面改版维护"],
      accept: ["流程可重复跑通一次", "价格先由客户确认", "失败步骤有明确记录", "录屏展示完整链路"]
    },
    quotes: [
      { type: "验证版", badge: "建议先做", price: "¥2,000", duration: "3 天", tone: "recommended", items: ["1 店 3-5 商品", "可见价格识别", "上架 + 单品直降", "一次录屏验收"] },
      { type: "完整批量版", badge: "验证后再议", price: "暂不报价", duration: "数据验证后评估", tone: "later", items: ["按真实店铺数量拆分", "确认成功率与限频", "单列部署和维护", "重新核算工期"] }
    ],
    quoteNote: "报价前提：客户先提供完整操作录屏和 3-5 条真实样例；录屏确认后的验证范围不返工。",
    reply: "我把这个需求重新拆了一下。目前最大的难点不是上架动作，而是“同行真实成交价”没有统一且稳定的数据口径。直播价、新客券和平台补贴通常不能从普通商品页完整拿到。\n\n建议先做一个 3 天的付费验证：用 1 个店铺、3-5 个真实商品，先验证页面可见价格能否稳定读取，再跑通上架和单品直降。验证版 2000 元。验证通过后，我再根据店铺数量和实际成功率评估批量版；现阶段不先承诺几十个店铺。\n\n开始前需要你们提供一次完整操作录屏，以及 3-5 条真实商品样例。验证码等风控步骤由人工处理。"
  },

  assessment: {
    short: "考核系统",
    code: "CASE 02",
    title: "员工考核数字化系统",
    status: "可继续沟通",
    source: "客户私聊",
    channel: "低代码 Web",
    updated: "案例整理于 06/29",
    attachment: { name: "功能需求说明.txt", note: "人员、考核、归档与台账", icon: "file-text" },
    messages: [
      { role: "client", text: "想做一个简单的员工考核数字化辅助系统，用低代码平台也可以。" },
      { role: "client", text: "要有人员管理、月度/季度/年度模板，员工填报，主管审核和自动合计分数。" },
      { role: "client", text: "还要按姓名、部门、时间查询归档，一键导出 Excel，电脑和手机都能用。" },
      { role: "self", text: "人员角色、审批层级、部署方式和 Excel 台账格式还需要确认。" }
    ],
    decision: "可进入详细报价",
    riskLabel: "中低风险",
    riskTone: "low",
    score: 82,
    metrics: [
      { label: "需求清晰度", value: 86, color: "var(--lime)" },
      { label: "技术可行性", value: 92, color: "var(--cyan)" },
      { label: "交付把握", value: 78, color: "var(--yellow)" },
      { label: "商务完整度", value: 66, color: "var(--coral)" }
    ],
    reason: "核心流程和数据结构已经明确，技术路径成熟；补齐角色权限、部署与验收样表后，可以拆成功能清单正式报价。",
    pipeline: [
      { label: "需求复述", state: "done" },
      { label: "权限确认", state: "active" },
      { label: "原型确认", state: "wait" },
      { label: "正式开发", state: "wait" }
    ],
    summary: "为员工、主管和管理员提供考核填报、审核、自动计分、历史查询与 Excel 台账导出的响应式 Web 系统。",
    highlight: "填报、审核、自动计分",
    facts: [
      "人员基础信息按部门管理，支持状态维护。",
      "考核模板按月度、季度和年度复用，总分 100 分。",
      "员工填报、主管审核，数据自动归档并可导出 Excel。"
    ],
    assumptions: "暂按三级角色（管理员、主管、员工）和单公司内部使用评估；不包含复杂组织架构、薪酬联动和企业微信审批。",
    questions: [
      { text: "管理员、主管、员工分别能查看和修改哪些数据？", why: "决定权限模型" },
      { text: "一个员工是否可能被多位主管审核，退回后是否保留版本？", why: "决定审批流程" },
      { text: "预计用户数和历史数据量是多少，是否需要批量导入？", why: "决定数据方案" },
      { text: "部署在客户服务器、云端，还是交付源码自行部署？", why: "决定部署成本" },
      { text: "请提供现有 Excel 台账和一张完整考核表作为验收样例。", why: "决定导入导出" }
    ],
    risks: [
      { level: "中", name: "权限边界", impact: "员工跨部门查看或主管误改数据会造成内部信息泄露。", action: "先确认角色矩阵，用测试账号逐项验收。" },
      { level: "中", name: "考核规则变更", impact: "后期增加维度、权重或特殊扣分会牵动数据结构。", action: "模板和维度配置化，首期限制规则类型。" },
      { level: "低", name: "移动端表格体验", impact: "宽表在手机上填写和审核容易拥挤。", action: "手机端改为分组表单，桌面端保留总览表。" }
    ],
    scope: {
      include: ["员工与部门管理", "三级角色权限", "考核模板与填报", "主管审核与自动计分", "查询归档与 Excel 导出"],
      exclude: ["薪酬绩效联动", "企业微信审批接入", "复杂多公司组织架构", "原生 iOS/Android App"],
      accept: ["三类账号权限正确", "完整月度流程跑通", "分数计算与样表一致", "手机和电脑可正常操作"]
    },
    quotes: [
      { type: "原型验证", badge: "先确认流程", price: "¥1,500–2,500", duration: "3–4 天", tone: "recommended", items: ["登录与角色演示", "考核填报流程", "自动计分示例", "响应式页面"] },
      { type: "首期正式版", badge: "当前基线", price: "¥4,800–8,000", duration: "7–12 天", tone: "later", items: ["人员和权限", "完整考核闭环", "查询与归档", "Excel 导入导出"] }
    ],
    quoteNote: "区间会随用户数、部署方式、历史数据导入和审批层级变化；以功能清单和验收样表为最终依据。",
    reply: "这个需求可以做，核心流程已经比较清楚：人员管理、员工填报、主管审核、自动计分、历史查询和 Excel 台账导出。\n\n正式报价前还需要确认 5 个点：角色权限、审批是否会退回、预计用户数、部署方式，以及现有 Excel 样表。资料齐后我可以先出一版可点击原型，把手机和电脑端的关键流程跑给你看。\n\n按目前范围，原型验证约 3-4 天、1500-2500 元；首期正式版暂估 7-12 天、4800-8000 元，最后以确认后的功能清单为准。"
  },

  robot: {
    short: "园区 3D",
    code: "CASE 03",
    title: "园区机器人调度展示",
    status: "适合售前 Demo",
    source: "图片 + 口述",
    channel: "Three.js 可视化",
    updated: "真实项目演示 · 已脱敏",
    attachment: { name: "园区照片与参考图 × 3", note: "缺少 CAD、模型与设备接口", icon: "images" },
    image: "robo-overview.png",
    messages: [
      { role: "client", text: "园区里有很多机器人，希望做一个网页或 App 展示。" },
      { role: "client", text: "需要 3D 全景模型，里面能看到巡逻、清扫、配送和无人机等设备运行。" },
      { role: "client", text: "现在先看你们有没有这方面的作品，价格、周期和详细步骤还没确定。" },
      { role: "self", text: "可以先用简化园区和模拟数据做一段可交互 Demo，正式数字孪生另行评估。" }
    ],
    decision: "先做售前 Demo",
    riskLabel: "边界可控",
    riskTone: "medium",
    score: 71,
    metrics: [
      { label: "需求清晰度", value: 57, color: "var(--yellow)" },
      { label: "技术可行性", value: 88, color: "var(--cyan)" },
      { label: "交付把握", value: 79, color: "var(--lime)" },
      { label: "商务完整度", value: 49, color: "var(--coral)" }
    ],
    reason: "对方当前买的是“能力证明”，不是完整数字孪生。用简化 3D 园区、机器人路线和状态面板，就能低成本验证展示效果。",
    pipeline: [
      { label: "视觉参考", state: "done" },
      { label: "场景白模", state: "done" },
      { label: "巡逻动画", state: "active" },
      { label: "客户演示", state: "wait" }
    ],
    summary: "使用简化 3D 园区、模拟机器人路线和实时状态面板，制作一段可交互的售前能力展示。",
    highlight: "售前能力展示",
    facts: [
      "客户只提供园区照片、概念图和大屏参考图。",
      "希望出现多类机器人在园区巡逻和执行任务。",
      "当前目标是证明团队有能力，而不是立即交付真实系统。"
    ],
    assumptions: "Demo 使用简化建筑白模和模拟轨迹，不承诺还原真实建筑尺寸，也不连接真实机器人、监控或业务后台。",
    questions: [
      { text: "客户更看重园区还原度，还是机器人调度和大屏效果？", why: "决定演示重点" },
      { text: "展示用于电脑网页、大屏，还是需要手机端同时适配？", why: "决定画面比例" },
      { text: "需要出现哪些机器人，每类设备展示什么状态？", why: "决定资产数量" },
      { text: "后续是否能提供 CAD、无人机扫描、BIM 或设备模型？", why: "决定正式版精度" },
      { text: "正式项目是否需要接真实定位、任务和告警接口？", why: "决定系统边界" }
    ],
    risks: [
      { level: "中", name: "Demo 被当成正式交付", impact: "客户可能默认场景已按真实园区建模并能连接设备。", action: "视频和方案明确标注“模拟数据 / 售前 Demo”。" },
      { level: "中", name: "三维资产缺失", impact: "仅靠照片无法准确还原建筑尺寸、材质和内部结构。", action: "先做视觉白模，正式版再根据 CAD/BIM 计价。" },
      { level: "低", name: "性能与大屏适配", impact: "模型过重会影响浏览器帧率和大屏展示。", action: "首期控制面数、贴图和设备数量，多分辨率实测。" }
    ],
    scope: {
      include: ["简化园区 3D 场景", "3-4 类模拟机器人", "巡逻路线与状态变化", "数据大屏与告警演示", "可录屏的浏览器成品"],
      exclude: ["厘米级真实建模", "BIM/CAD 深度还原", "真实设备接口", "机器人控制与调度算法"],
      accept: ["场景可旋转与缩放", "机器人沿路线运动", "状态面板同步变化", "桌面大屏不卡顿"]
    },
    quotes: [
      { type: "售前 Demo", badge: "建议范围", price: "¥2,000–4,000", duration: "3–5 天", tone: "recommended", items: ["简化园区场景", "模拟机器人动画", "状态大屏", "一轮视觉调整"] },
      { type: "正式数字孪生", badge: "资料齐后报价", price: "另行评估", duration: "需 CAD / 接口后评估", tone: "later", items: ["真实模型精度", "设备定位接口", "任务与告警联动", "部署与长期维护"] }
    ],
    quoteNote: "售前 Demo 的价值是让客户看到能力；正式版必须在 CAD/BIM、设备清单和接口资料明确后重新立项。",
    reply: "这个方向可以先做一个售前 Demo，而且没必要一开始就做成完整数字孪生。\n\n我建议用 3-5 天做一个简化园区：场景可以旋转缩放，里面放巡逻、清扫、配送等机器人，按模拟路线移动；右侧同步显示在线状态、任务和告警。这样你能直接录一段视频给业主看，证明 3D 展示和调度界面都能做。\n\nDemo 暂估 2000-4000 元。需要提前说明，演示采用简化模型和模拟数据；如果后续要还原真实园区、接机器人定位和任务接口，需要拿到 CAD/BIM 和接口资料后另行报价。"
  }
};

const tabs = [
  { id: "summary", label: "结论" },
  { id: "questions", label: "必问" },
  { id: "risks", label: "风险" },
  { id: "scope", label: "MVP 边界" },
  { id: "quote", label: "工期报价" },
  { id: "reply", label: "客户回复" }
];

let activeCaseId = "shop";
let activeTab = "summary";
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
}

function toneForRisk(tone) {
  if (tone === "high") return { color: "var(--coral)", background: "var(--coral-soft)" };
  if (tone === "low") return { color: "var(--success)", background: "#e3f5ed" };
  return { color: "var(--warning)", background: "var(--yellow-soft)" };
}

function renderSwitcher() {
  const container = $("#caseSwitcher");
  container.innerHTML = Object.entries(cases).map(([id, item]) => `
    <button class="case-button ${id === activeCaseId ? "active" : ""}" type="button" data-case="${escapeHTML(id)}">
      <strong>${escapeHTML(item.short)}</strong>
      <span>${escapeHTML(item.code)}</span>
    </button>
  `).join("");

  container.querySelectorAll("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCaseId = button.dataset.case;
      activeTab = "summary";
      renderAll();
    });
  });
}

function renderSource(item) {
  $("#sourceTitle").textContent = item.title;
  $("#sourceStatus").textContent = item.status;
  $("#sourceMeta").innerHTML = `
    <span class="meta-chip"><i data-lucide="message-square"></i>${escapeHTML(item.source)}</span>
    <span class="meta-chip"><i data-lucide="layers-3"></i>${escapeHTML(item.channel)}</span>
    <span class="meta-chip"><i data-lucide="messages-square"></i>${item.messages.length} 条关键消息</span>
  `;

  $("#chatStream").innerHTML = item.messages.map((message, index) => `
    <article class="message ${escapeHTML(message.role)}" style="animation-delay:${index * 45}ms">
      <p class="message-label">${message.role === "self" ? "我方" : "客户 A"}</p>
      <div class="message-bubble">${escapeHTML(message.text)}</div>
    </article>
  `).join("");

  $("#attachmentStrip").innerHTML = `
    <div class="attachment-icon"><i data-lucide="${escapeHTML(item.attachment.icon)}"></i></div>
    <div>
      <strong>${escapeHTML(item.attachment.name)}</strong>
      <small>${escapeHTML(item.attachment.note)}</small>
    </div>
  `;
}

function animateScore(target) {
  const number = $("#overallScore");
  const ring = $("#scoreRing");
  const scoreColor = target >= 75 ? "var(--lime)" : target >= 60 ? "var(--yellow)" : "var(--coral)";
  ring.style.setProperty("--score-color", scoreColor);
  ring.style.setProperty("--score", "0");
  const start = performance.now();
  const duration = 560;

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    number.textContent = value;
    ring.style.setProperty("--score", String(value));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderDecision(item) {
  $("#decisionTitle").textContent = item.decision;
  $("#decisionReason").textContent = item.reason;
  const pill = $("#riskPill");
  const tone = toneForRisk(item.riskTone);
  pill.textContent = item.riskLabel;
  pill.style.color = tone.color;
  pill.style.background = tone.background;

  $("#pipeline").innerHTML = item.pipeline.map((step, index) => `
    <div class="pipeline-step ${escapeHTML(step.state)}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <b>${escapeHTML(step.label)}</b>
    </div>
  `).join("");

  animateScore(item.score);
}

function renderMetrics(item) {
  const strip = $("#metricStrip");
  strip.innerHTML = item.metrics.map((metric) => `
    <div class="metric-item">
      <div class="metric-head"><span>${escapeHTML(metric.label)}</span><strong>${metric.value}</strong></div>
      <div class="metric-track"><span style="--metric-color:${escapeHTML(metric.color)}"></span></div>
    </div>
  `).join("");
  requestAnimationFrame(() => {
    strip.querySelectorAll(".metric-track span").forEach((bar, index) => {
      bar.style.width = `${item.metrics[index].value}%`;
    });
  });
}

function renderTabs() {
  const container = $("#analysisTabs");
  container.innerHTML = tabs.map((tab) => `
    <button class="tab-button ${tab.id === activeTab ? "active" : ""}" type="button" data-tab="${escapeHTML(tab.id)}">
      ${escapeHTML(tab.label)}
    </button>
  `).join("");
  container.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      renderTabs();
      renderView(cases[activeCaseId]);
    });
  });
}

function listHTML(items, className = "fact-list") {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function highlightedSummary(item) {
  const safe = escapeHTML(item.summary);
  const highlight = escapeHTML(item.highlight);
  return safe.replace(highlight, `<mark>${highlight}</mark>`);
}

function summaryView(item) {
  const visual = item.image ? `
    <div class="project-visual">
      <img src="${escapeHTML(item.image)}" alt="园区机器人演示项目截图" />
      <span>真实项目视觉 · 演示数据</span>
    </div>
  ` : "";
  return `
    <div class="view-heading">
      <div><h3>需求已经被翻译成什么</h3><p>先对齐目标，再讨论技术和价格。</p></div>
      <span class="source-status">事实 / 推断已分开</span>
    </div>
    <div class="insight-grid">
      <section class="section-block">
        <h4>一句话需求</h4>
        <p class="summary-sentence">${highlightedSummary(item)}</p>
        <div class="signal-banner">
          <i data-lucide="lightbulb"></i>
          <div><strong>当前判断的关键前提</strong><span>${escapeHTML(item.assumptions)}</span></div>
        </div>
        ${visual}
      </section>
      <section class="section-block">
        <h4>客户已明确的事实</h4>
        ${listHTML(item.facts)}
      </section>
    </div>
  `;
}

function questionsView(item) {
  return `
    <div class="view-heading">
      <div><h3>报价前只问这 ${item.questions.length} 个问题</h3><p>每个问题都会改变技术方案、工期或验收。</p></div>
    </div>
    <ol class="question-list">
      ${item.questions.map((question) => `<li><span>${escapeHTML(question.text)}</span><em>${escapeHTML(question.why)}</em></li>`).join("")}
    </ol>
  `;
}

function riskStyle(level) {
  if (level === "高") return { color: "var(--danger)", bg: "var(--coral-soft)" };
  if (level === "中") return { color: "var(--warning)", bg: "var(--yellow-soft)" };
  return { color: "var(--success)", bg: "#e3f5ed" };
}

function risksView(item) {
  return `
    <div class="view-heading">
      <div><h3>不是“有风险”，而是怎么处理</h3><p>风险、影响和应对动作必须同时出现。</p></div>
    </div>
    <div class="risk-list">
      ${item.risks.map((risk) => {
        const style = riskStyle(risk.level);
        return `
          <article class="risk-row" style="--risk-color:${style.color};--risk-bg:${style.bg}">
            <span class="risk-level">${escapeHTML(risk.level)}风险</span>
            <strong>${escapeHTML(risk.name)}</strong>
            <div class="risk-cell"><span>可能影响</span><p>${escapeHTML(risk.impact)}</p></div>
            <div class="risk-cell"><span>建议动作</span><p>${escapeHTML(risk.action)}</p></div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function scopeView(item) {
  return `
    <div class="view-heading">
      <div><h3>把第一阶段钉死在可验收范围</h3><p>演示、验证和正式版不是同一个交付物。</p></div>
    </div>
    <div class="scope-columns">
      <section class="scope-card include">
        <h4><i data-lucide="circle-check"></i>本阶段包含</h4>
        ${listHTML(item.scope.include, "scope-list")}
      </section>
      <section class="scope-card exclude">
        <h4><i data-lucide="circle-x"></i>明确不包含</h4>
        ${listHTML(item.scope.exclude, "scope-list")}
      </section>
      <section class="scope-card accept">
        <h4><i data-lucide="clipboard-check"></i>验收条件</h4>
        ${listHTML(item.scope.accept, "scope-list")}
      </section>
    </div>
  `;
}

function quoteView(item) {
  return `
    <div class="view-heading">
      <div><h3>报价跟着风险分阶段</h3><p>金额是当前资料下的沟通基线。</p></div>
    </div>
    <div class="quote-grid">
      ${item.quotes.map((quote) => `
        <section class="quote-card ${escapeHTML(quote.tone)}">
          <div class="quote-head"><span>${escapeHTML(quote.type)}</span><em>${escapeHTML(quote.badge)}</em></div>
          <div class="quote-price">${escapeHTML(quote.price)}</div>
          <div class="quote-duration"><i data-lucide="clock-3"></i> ${escapeHTML(quote.duration)}</div>
          <ul>${quote.items.map((detail) => `<li>${escapeHTML(detail)}</li>`).join("")}</ul>
        </section>
      `).join("")}
    </div>
    <div class="quote-note">${escapeHTML(item.quoteNote)}</div>
  `;
}

function replyView(item) {
  return `
    <div class="view-heading">
      <div><h3>可以直接发，但仍像你自己说的话</h3><p>先讲判断，再讲方案、价格和客户要配合的内容。</p></div>
    </div>
    <div class="reply-layout">
      <article class="reply-paper"><p id="replyText">${escapeHTML(item.reply)}</p></article>
      <aside class="copy-actions">
        <button class="button button-primary" id="copyReplyButton" type="button"><i data-lucide="copy"></i><span>复制回复</span></button>
        <button class="button button-ghost" id="copyQuestionsButton" type="button"><i data-lucide="list-checks"></i><span>只复制问题</span></button>
        <div class="tone-check"><strong>语气检查</strong><span>没有夸口、没有堆术语、没有把风险全甩给客户。</span></div>
      </aside>
    </div>
  `;
}

function renderView(item) {
  const views = {
    summary: summaryView,
    questions: questionsView,
    risks: risksView,
    scope: scopeView,
    quote: quoteView,
    reply: replyView
  };
  const stage = $("#viewStage");
  stage.style.animation = "none";
  stage.offsetHeight;
  stage.style.animation = "";
  stage.innerHTML = views[activeTab](item);

  const copyReplyButton = $("#copyReplyButton");
  if (copyReplyButton) copyReplyButton.addEventListener("click", () => copyText(item.reply, "客户回复已复制"));
  const copyQuestionsButton = $("#copyQuestionsButton");
  if (copyQuestionsButton) {
    copyQuestionsButton.addEventListener("click", () => {
      const text = item.questions.map((question, index) => `${index + 1}. ${question.text}`).join("\n");
      copyText(text, "必问问题已复制");
    });
  }
  icons();
}

function renderAll() {
  const item = cases[activeCaseId];
  renderSwitcher();
  renderSource(item);
  renderDecision(item);
  renderMetrics(item);
  renderTabs();
  renderView(item);
  $("#caseUpdated").textContent = item.updated;
  icons();
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(successMessage);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function reportMarkdown(item) {
  const lines = [
    `# ${item.title} · 接单评估`,
    "",
    `- 建议：${item.decision}`,
    `- 综合把握：${item.score}/100`,
    `- 一句话需求：${item.summary}`,
    "",
    "## 已确认事实",
    ...item.facts.map((fact) => `- ${fact}`),
    "",
    "## 报价前必问",
    ...item.questions.map((question, index) => `${index + 1}. ${question.text}`),
    "",
    "## 风险与应对",
    ...item.risks.map((risk) => `- **${risk.level}风险 · ${risk.name}**：${risk.impact} 应对：${risk.action}`),
    "",
    "## MVP 边界",
    `- 包含：${item.scope.include.join("；")}`,
    `- 不包含：${item.scope.exclude.join("；")}`,
    `- 验收：${item.scope.accept.join("；")}`,
    "",
    "## 工期报价",
    ...item.quotes.map((quote) => `- ${quote.type}：${quote.price}，${quote.duration}`),
    `- 前提：${item.quoteNote}`,
    "",
    "## 可发送回复",
    item.reply,
    "",
    "> 由接单雷达生成。金额和工期仅为当前资料下的沟通基线。"
  ];
  return lines.join("\n");
}

function exportReport() {
  const item = cases[activeCaseId];
  const blob = new Blob([reportMarkdown(item)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${item.short}-接单评估.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("评估报告已导出");
}

function openModal() {
  $("#requestModal").hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#requestText").focus(), 0);
}

function closeModal() {
  $("#requestModal").hidden = true;
  document.body.style.overflow = "";
}

function containsAny(text, words) {
  return words.some((word) => text.includes(word));
}

function buildCustomCase(name, text) {
  const automated = containsAny(text, ["自动", "批量", "定时", "采集", "爬虫", "补单", "自动化"]);
  const platform = containsAny(text, ["抖音", "小红书", "1688", "淘宝", "微信", "QQ", "后台", "店铺", "平台"]);
  const login = containsAny(text, ["登录", "账号", "后台", "店铺", "验证码", "QQ", "微信"]);
  const hiddenData = containsAny(text, ["真实成交价", "隐藏", "直播价", "平台补贴", "新客券", "内部数据"]);
  const multiAccount = containsAny(text, ["多账号", "多个账号", "几十个", "多个店铺", "批量账号"]);
  const dataSensitive = containsAny(text, ["手机号", "联系人", "员工", "客户资料", "身份证", "隐私"]);
  const hasVolume = /\d+\s*(个|条|家|店|账号|人|份)/.test(text);
  const hasDeadline = /\d+\s*(天|日|周|月)|月底|本周|下周/.test(text);
  const hasOutput = containsAny(text, ["网页", "系统", "工具", "报表", "Excel", "视频", "小程序", "App", "软件"]);

  let feasibility = 90;
  if (hiddenData) feasibility -= 35;
  if (automated && platform) feasibility -= 18;
  if (login) feasibility -= 7;
  if (multiAccount) feasibility -= 10;
  const clarity = Math.min(88, 35 + (hasVolume ? 16 : 0) + (hasDeadline ? 12 : 0) + (hasOutput ? 15 : 0));
  const delivery = Math.min(85, 38 + (hasVolume ? 18 : 0) + (hasDeadline ? 15 : 0) - (multiAccount ? 8 : 0));
  const commercial = Math.min(75, 30 + (hasDeadline ? 15 : 0) + (hasVolume ? 15 : 0));
  const score = Math.max(18, Math.round(clarity * .3 + feasibility * .3 + delivery * .25 + commercial * .15));
  const highRisk = hiddenData || (automated && platform && multiAccount);
  const decision = feasibility < 30 ? "不建议直接承接" : highRisk ? "只接付费验证" : score >= 75 ? "可进入详细报价" : "先补信息";
  const riskTone = highRisk ? "high" : score >= 75 ? "low" : "medium";

  const questions = [];
  if (!hasVolume) questions.push({ text: "首期和日常分别要处理多少条数据、多少个账号？", why: "决定工作量" });
  if (login) questions.push({ text: "账号由谁登录和保管，验证码是否允许人工处理？", why: "决定部署方式" });
  if (automated) questions.push({ text: "请提供一次从输入到完成的真实操作录屏。", why: "决定自动化流程" });
  if (hiddenData) questions.push({ text: "目标数据的准确定义是什么，普通页面上是否真实可见？", why: "决定能否实现" });
  questions.push({ text: "什么结果算验收通过，失败时允许怎样人工介入？", why: "决定验收" });
  if (!hasDeadline) questions.push({ text: "期望何时看到 Demo，正式版是否有硬性截止时间？", why: "决定排期" });

  const risks = [];
  if (hiddenData) risks.push({ level: "高", name: "数据可得性", impact: "核心数据可能因账号、场景或优惠条件不同而无法稳定取得。", action: "把数据验证拆成第一阶段，不先承诺正式版。" });
  if (automated && platform) risks.push({ level: highRisk ? "高" : "中", name: "平台风控", impact: "批量或高频操作可能触发验证码、限流和账号异常。", action: "先做单账号小量验证，保留人工检查点。" });
  if (login) risks.push({ level: "中", name: "账号与凭证", impact: "登录状态失效或凭证保存不当会影响交付与安全。", action: "客户本人登录，不在程序中保存密码和验证码。" });
  if (dataSensitive) risks.push({ level: "中", name: "隐私数据", impact: "联系人或员工信息可能被误传、误发或留存在日志。", action: "只保留必要字段，测试使用脱敏数据并记录授权。" });
  if (!risks.length) risks.push({ level: "低", name: "验收范围", impact: "需求继续增加会让工期和价格失去基准。", action: "先确认功能清单和一份验收样例。" });

  const fallbackQuestions = [
    { text: "输入样例、输出样例和异常样例能否各提供一份？", why: "决定数据边界" },
    { text: "部署在客户电脑、服务器，还是交付源码？", why: "决定交付方式" },
    { text: "第三方页面或规则变更后的维护如何约定？", why: "决定售后边界" },
    { text: "首期必须完成哪些功能，哪些可以放到第二阶段？", why: "决定 MVP 边界" },
    { text: "是否接受按验证、开发和验收分阶段付款？", why: "决定合作方式" }
  ];
  for (const fallback of fallbackQuestions) {
    if (questions.length >= 5) break;
    if (!questions.some((question) => question.text === fallback.text)) questions.push(fallback);
  }

  const validationPrice = highRisk ? "¥2,000–4,000" : "¥1,500–3,000";
  const validationTime = highRisk ? "3–5 天" : "2–4 天";
  const summary = automated
    ? `把客户提供的资料转换成一条可重复执行的自动化流程，并输出可核对的处理结果。`
    : `把客户提供的信息整理成一个可操作的数字化工具，并输出可核对的结果。`;

  return {
    short: "新需求",
    code: "LOCAL",
    title: name || "新客户需求",
    status: "本地规则初筛",
    source: "临时输入",
    channel: platform ? "平台 / 自动化" : "软件定制",
    updated: "刚刚完成本地初筛",
    attachment: { name: "客户原话.txt", note: "内容仅保存在当前浏览器页面", icon: "file-lock-2" },
    messages: [{ role: "client", text }],
    decision,
    riskLabel: highRisk ? "需验证" : score >= 75 ? "可控" : "待补资料",
    riskTone,
    score,
    metrics: [
      { label: "需求清晰度", value: clarity, color: "var(--yellow)" },
      { label: "技术可行性", value: Math.max(0, feasibility), color: "var(--cyan)" },
      { label: "交付把握", value: delivery, color: "var(--lime)" },
      { label: "商务完整度", value: commercial, color: "var(--coral)" }
    ],
    reason: highRisk
      ? "当前描述包含数据可得性、平台风控或多账号变量，必须先用真实环境做小量验证。"
      : "技术方向初步可行，但当前输入还不足以直接锁定正式版价格和验收结果。",
    pipeline: [
      { label: "关键词初筛", state: "done" },
      { label: "资料补全", state: "active" },
      { label: "MVP 验证", state: "wait" },
      { label: "正式报价", state: "wait" }
    ],
    summary,
    highlight: "可重复执行",
    facts: [
      `客户原话共 ${text.length} 个字符，已在本地完成关键词初筛。`,
      automated ? "描述中包含自动或批量处理意图。" : "描述中暂未出现明确的批量自动化要求。",
      login ? "需求可能涉及登录态、账号或后台操作。" : "当前描述未明确要求使用客户账号。"
    ],
    assumptions: "这是不调用云端模型的规则初筛，只能提示风险线索；正式判断仍需要原始样例、操作流程和验收标准。",
    questions: questions.slice(0, 5),
    risks,
    scope: {
      include: ["1 个真实流程", "少量样例数据", "关键步骤演示", "成功与失败记录"],
      exclude: ["未验证的批量稳定性", "绕过验证码或平台限制", "未确认的附加功能", "长期免费维护"],
      accept: ["关键流程可跑通", "结果可人工核对", "失败原因有记录", "客户确认演示范围"]
    },
    quotes: [
      { type: "MVP 验证", badge: "当前建议", price: validationPrice, duration: validationTime, tone: "recommended", items: ["1 个真实流程", "少量数据测试", "一次演示验收", "输出问题清单"] },
      { type: "正式版", badge: "资料齐后报价", price: "暂不锁价", duration: "验证后评估", tone: "later", items: ["按真实数量核算", "确认部署方式", "确认异常分支", "单列维护范围"] }
    ],
    quoteNote: "这只是规则初筛给出的沟通区间，必须在样例、录屏和验收标准确认后再形成正式报价。",
    reply: `你好，我先把需求拆了一下。按目前信息，建议先不要直接做完整版本，而是先用一个真实流程和少量数据做 MVP 验证。\n\n开始前还需要确认：${questions.slice(0, 3).map((question) => question.text).join("；")}\n\n资料齐后我会把包含范围、不包含范围和验收结果写清楚，再给最终报价。当前验证阶段可先按 ${validationTime}、${validationPrice} 作为沟通基线。`
  };
}

function submitCustomRequest(event) {
  event.preventDefault();
  const name = $("#requestName").value.trim();
  const text = $("#requestText").value.trim();
  if (!text) return;
  cases.custom = buildCustomCase(name, text);
  activeCaseId = "custom";
  activeTab = "summary";
  closeModal();
  renderAll();
  showToast("本地初筛完成");
}

function bindStaticEvents() {
  $("#newRequestButton").addEventListener("click", openModal);
  $("#closeModalButton").addEventListener("click", closeModal);
  $("#requestModal").addEventListener("click", (event) => {
    if (event.target === $("#requestModal")) closeModal();
  });
  $("#requestForm").addEventListener("submit", submitCustomRequest);
  $("#useExampleButton").addEventListener("click", () => {
    $("#requestName").value = "1688 商品与 QQ 通知";
    $("#requestText").value = "客户提供特定图片，需要批量上架到 1688 店铺。商品发布后拿到新链接，根据商品信息自动生成话术，再登录对应 QQ 账号发送给联系人。报表数据需要进入后台查看。预计多个账号，具体数量和验收方式还没确认。";
  });
  $("#exportButton").addEventListener("click", exportReport);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#requestModal").hidden) closeModal();
  });
}

bindStaticEvents();
renderAll();
