const projects = {
  night: {
    name: "AI 夜巡报刊",
    subtitle: "不是教别人做 AI，而是把自己做过的东西讲清楚。",
    fitScore: 91,
    facts: {
      action: "把每天生成的 Markdown 夜巡报告，改成能看机会评分、历史趋势和下一步行动的可视化报刊。",
      problem: "信息越来越多，却很难快速判断哪个项目真的值得做。",
      result: "已经完成本地可视化版本，可以读取历史报告并给机会排序。"
    },
    images: [
      {
        src: "./night-patrol.png",
        label: "成品界面",
        title: "先让人一眼看到成品",
        description: "用完整首页做首图，证明这不是一个停留在想法里的项目。"
      }
    ],
    missing: "补一张旧版 Markdown 报告或终端运行截图，能把“为什么要改”讲得更直观。",
    quality: ["有真实成品截图", "没有虚构收益", "结尾问题够具体"],
    content: {
      showcase: {
        titles: [
          "我让 AI 每晚替我找赚钱项目，最后做成了这个夜巡报刊",
          "夜巡跑了 16 期后，我终于不想再看 Markdown 了",
          "我把自己的 AI 情报系统，做成了一份每天更新的报刊"
        ],
        body: "一开始，夜巡只是每天给我生成一份 Markdown。信息不少，但看完以后，我还是很难判断哪个项目值得继续做。\n\n后来我把它改成了一个可视化报刊：自动整理近期信号、机会评分、历史趋势和下一步行动。现在打开首页，能先看到本期最值得关注的方向，再决定要不要继续研究。\n\n它目前还是本地版本，也不能保证真的找到赚钱项目。对我来说更实际的价值，是早点排除那些看起来热闹、实际不适合我的方向。\n\n接下来我准备继续验证一件事：它能不能真的帮我找到一个能收钱的小项目。你们更想看它怎么筛选，还是想看这个网站是怎么做出来的？",
        tags: ["AI工具", "独立开发", "本地AI", "项目复盘"],
        pinned: "夜巡现在已经跑到第 16 期了。下一篇可以拆它的评分规则，也可以公开一期完整报告，你们想先看哪个？",
        angle: "你过去浏览较高的内容都有明确实测对象。这个标题先说“我做了什么”，再露出赚钱项目这个真实动机，比讲通用方法更像你的账号。"
      },
      process: {
        titles: [
          "一个 Markdown 报告，是怎么被我改成 AI 夜巡网站的",
          "我给自己的 AI 情报系统重做了一次界面",
          "做了 16 期夜巡后，我删掉了最没用的部分"
        ],
        body: "夜巡最早只是一个定时任务：每天搜集信息，然后落成 Markdown。跑了一段时间后，问题也很明显，报告越积越多，我却越来越不想打开。\n\n这次改版我只盯住三个动作：先看本期重点，再看它和我现有能力是否匹配，最后留下一个能执行的下一步。于是我把历史报告接进网页，补了机会雷达、归档趋势和行动队列。\n\n界面好看只是表面，真正难的是把“信息很多”变成“知道先做什么”。目前评分还不够稳定，有些热门项目会被高估，我还在继续调。\n\n这是我第一次认真给自己的情报系统做产品化。等再跑几期，我会回来看看它到底只是更好看了，还是确实让我少走了弯路。",
        tags: ["AI开发", "VibeCoding", "独立开发", "产品复盘"],
        pinned: "最早的版本真的只有一堆 Markdown。后面整理一下新旧版对比，应该比只看成品更有意思。",
        angle: "过程复盘会承接你账号里“去 AI 味”和本地部署类内容的评论信号，重点写取舍和问题，不写教程清单。"
      },
      problem: {
        titles: [
          "AI 每晚给我找项目，结果最大的问题是信息太多",
          "我做 AI 夜巡时踩的坑：评分高，不代表适合我",
          "情报系统最难的不是会搜索，而是敢替你排除"
        ],
        body: "我原本以为，AI 夜巡只要搜得够多，就能减少信息差。真正跑起来以后才发现，信息越多不一定越有用。\n\n最明显的坑是：一个项目在 GitHub 很热、讨论很多，评分就容易变高，但它可能根本不适合我的工具、经验和获客方式。最后我得到的只是一份更精致的“稍后再看”。\n\n所以这次我把评分拆成了两部分：外部信号只负责说明它是不是趋势，适配度才决定我现在要不要行动。页面上也不再把所有项目平铺出来，而是强迫自己只选一个下一步。\n\n这个逻辑还远远谈不上成熟，但已经让我少收藏了不少“看起来应该有用”的东西。你们平时会不会也收藏很多，最后一个都没做？",
        tags: ["AI工具", "信息差", "独立开发", "踩坑记录"],
        pinned: "现在最容易误判的是“很火但和自己没关系”的项目。适配度权重我还在调，后面会公开规则。",
        angle: "“反常识 + 自己踩过的坑”更容易引出评论，而且不需要夸大系统能力。你的旧内容里，过程判断比纯展示更容易被讨论。"
      }
    }
  },
  robo: {
    name: "园区机器人 3D Demo",
    subtitle: "客户需求还没说清时，先把能动的样品做出来。",
    fitScore: 88,
    facts: {
      action: "根据运营大屏、机器人类型示意和园区实景三张参考图，做了一个能巡逻、切换视角和展示设备状态的 3D Demo。",
      problem: "客户只有大概想法，没有 CAD、三维模型和真实设备数据，但需要先确认我们有没有能力。",
      result: "完成可操作演示并录制视频，对方看完样品后确认了合作。"
    },
    images: [
      {
        src: "./robo-overview.png",
        label: "园区总览",
        title: "第一张先放可操作全景",
        description: "读者不用看文字，就能知道这是一个完整的园区机器人演示。"
      },
      {
        src: "./robo-detail.png",
        label: "近景视角",
        title: "第二张证明不只是静态效果图",
        description: "补充视角切换、机器人位置和状态面板等交互细节。"
      }
    ],
    missing: "补一张客户最初给的参考图，形成“3 张参考图 → 可操作 Demo”的前后对比。",
    quality: ["有客户场景", "边界说明清楚", "结果可被证明"],
    content: {
      showcase: {
        titles: [
          "客户只给了 3 张参考图，我先做了个园区机器人 3D Demo",
          "需求还没定，我先把园区机器人跑起来给客户看",
          "没有模型和设备数据，我怎么先做出园区 3D 样品"
        ],
        body: "前段时间接到一个园区机器人展示需求。对方只给了三张参考图：运营大屏、机器人类型示意和园区实景，具体功能还没有完全定。\n\n她最先想确认的不是报价，而是我们有没有做 3D 展示的能力。于是我没有等完整资料，先把能验证的部分做成 Demo：园区建筑、机器人巡逻路线、设备状态和几个可以切换的观察视角。\n\n这个版本不是最终数字孪生，也没有接真实设备数据，重点是让客户先看到“成品大概会长什么样”。我把演示视频发过去以后，对方确认了合作。\n\n做完这次我越来越觉得：客户自己也说不清需求时，一个能动的样品，往往比继续讲方案更有效。后面可以再单独拆一下这个 Demo 是怎么搭出来的。",
        tags: ["3D可视化", "机器人", "项目复盘", "VibeCoding"],
        pinned: "说明一下：图里是用于确认方向的演示数据，不是真实园区设备数据。后续有完整资料才会进入正式建模。",
        angle: "这篇最大的可信点不是 3D 技术，而是“三张图做出样品并拿到后续合作”。首图先给成品，正文再主动说明 Demo 边界。"
      },
      process: {
        titles: [
          "从 3 张参考图到园区机器人 Demo，我先做了这 4 步",
          "客户没有 CAD，我是怎么搭园区 3D 样品的",
          "先别急着建全园区：这个机器人 Demo 只验证了 4 件事"
        ],
        body: "这个园区机器人项目一开始没有 CAD，也没有现成三维模型。客户给我的只有运营大屏、机器人类型示意和一张园区实景。\n\n我先把目标缩到一个能录视频的样品：搭出园区空间关系，放入几类机器人，给它们设置巡逻路径，再做一个能看状态和切换视角的控制层。建筑细节和真实数据接入全部放到后面。\n\n这样做的好处，是客户能先判断展示方式是不是她想要的，我们也能尽早发现性能、镜头和交互上的问题。它解决不了正式交付，但足够回答“这件事能不能做”。\n\n正式项目最怕一开始就把所有东西做满。这个 Demo 对我最大的价值，是把模糊需求变成了可以指着屏幕讨论的东西。",
        tags: ["ThreeJS", "3D项目", "机器人", "开发过程"],
        pinned: "这版把精度和数据接入都放在后面了，只验证空间、运动、视角和信息展示。",
        angle: "过程型标题保留具体约束“没有 CAD”，读者会更容易理解你解决了什么，而不是只看到一个炫技页面。"
      },
      problem: {
        titles: [
          "做园区 3D Demo 最难的，居然不是建模",
          "客户说要“机器人巡逻”，这句话里至少藏着 5 个需求",
          "没有真实数据时，3D 园区 Demo 最容易演过头"
        ],
        body: "刚接到园区机器人需求时，我也以为最难的是建模。真正开始做才发现，最大的风险其实是把 Demo 当成了正式系统。\n\n客户说“想看机器人在园区巡逻”，里面可能同时包含园区建模、路径规划、实时定位、状态监控和数据大屏。少问一句，报价和工期就可能完全不同。\n\n所以这版我只做视觉验证：机器人能沿路线移动，视角能切换，状态能展示，但数据全部是演示数据。等客户确认展示方向，再讨论 CAD、设备接口和后台。\n\nDemo 可以帮我们拿到项目，也可能让客户误以为正式系统已经做完。把边界写清楚，是这类样品里最重要的一部分。",
        tags: ["项目避坑", "3D可视化", "需求分析", "自由职业"],
        pinned: "以后接类似项目，我会先把“视觉演示”和“真实系统”拆成两份报价，避免双方理解不一致。",
        angle: "把“最难的不是建模”作为反差，能吸引同样在接项目的人，同时自然带出你对需求边界的判断。"
      }
    }
  },
  yunxi: {
    name: "云曦桌宠开发",
    subtitle: "成品图不一定最有意思，出错的那一帧反而更像真实开发。",
    fitScore: 94,
    facts: {
      action: "把云曦从静态角色图做成可以在桌面活动、对话和切换动作的桌面伴侣。",
      problem: "动作素材尺寸和锚点不一致，第一次切帧后角色会跳动，甚至只剩一块脸。",
      result: "重新裁切、统一画布并对齐脚底锚点后，角色已经能稳定播放多组动作。"
    },
    images: [
      {
        src: "./yunxi-fixed.png",
        label: "现在的样子",
        title: "首图先给完整桌面效果",
        description: "让读者先认识云曦，再看后面那张有点离谱的开发事故。"
      },
      {
        src: "./yunxi-bug.png",
        label: "切帧事故",
        title: "第二张放最真实的错误",
        description: "只有一块脸的画面，比抽象描述“锚点错误”更容易理解。"
      }
    ],
    missing: "补一段 5 秒动作录屏或 GIF，能直接证明统一尺寸和锚点后的实际效果。",
    quality: ["有前后对比", "问题足够具体", "语气像本人复盘"],
    content: {
      showcase: {
        titles: [
          "我把 AI 画出来的角色，真的做成了桌面伴侣",
          "云曦不再是一张立绘了，她现在会在我的桌面上走动",
          "做了这么久 AI 图片，我最后把角色放进了桌面"
        ],
        body: "之前用 AI 画了很多云曦的形象，但它们基本都停在图片里。最近我终于把她接进了桌面伴侣：能在桌面活动、切换动作，也能和本地工具联动。\n\n真正做起来以后，最费时间的不是聊天功能，而是那些看起来很小的视觉问题。每张动作图的尺寸、脚底位置和角色比例只要差一点，播放时就会一直跳。\n\n我后来把所有小帧重新裁切，统一画布，再按脚底锚点对齐，才让动作稳定下来。现在还远远不是成品，但第一次看见自己画出来的角色真的在桌面上动，还是挺上头的。\n\n下一步我想继续补待机、走路和互动动作。桌宠这种东西，你们会更在意它好看，还是更在意它真的有用？",
        tags: ["AI桌宠", "独立开发", "AI绘画", "桌面美化"],
        pinned: "现在动作素材还不算多，我正在整理统一规格的精灵表。后面可以放一版动作对比。",
        angle: "桌宠题材本来就在你的账号里出现过，但这次要从“AI 画了一张图”升级到“角色真的动起来了”，成品和技术过程要同时露出来。"
      },
      process: {
        titles: [
          "一张 AI 立绘，变成桌面宠物要经过多少步",
          "我给云曦做动作时，终于搞懂了什么叫脚底锚点",
          "AI 角色不是切成小图就能变桌宠"
        ],
        body: "把一张角色图做成桌宠，并不是切成很多小图再连起来就结束了。\n\n我先整理动作素材，再自动裁出每个小帧，统一画布尺寸，最后按脚底位置对齐锚点。只要有一帧的角色高度或脚底位置不同，播放起来就会抖，走路时还会像在漂。\n\n第一次处理时我只看了透明边界，结果有一帧直接裁得只剩脸。后来改成先识别角色区域，再保留安全边距，并把所有帧放回同样大小的透明画布。\n\n现在这套流程已经可以稳定处理现有动作。下一步的问题不是怎么裁，而是怎么生成更多风格一致、动作连贯的原始素材。",
        tags: ["桌宠开发", "精灵表", "Pillow", "AI绘画"],
        pinned: "技术上最关键的是统一画布和脚底锚点。只裁透明区域，看起来紧凑，播放时反而更容易跳。",
        angle: "你以前的参数对比内容收藏较高，这篇也用“错误帧 → 修正方法 → 最终效果”的可验证结构。"
      },
      problem: {
        titles: [
          "我给 AI 桌宠加动作时，先把她的脸切成了四块",
          "桌宠第一次动起来了，只不过屏幕上只剩一只眼睛",
          "AI 精灵表最容易忽略的，不是画风，是锚点"
        ],
        body: "给云曦加动作的第一晚，我以为最麻烦的是生成更多姿势。结果程序一跑，桌面上只剩下一只放大的眼睛。\n\n问题出在自动切帧：原图里的动作没有排成标准网格，透明区域也不一致。程序按固定尺寸硬切以后，有的帧只有半张脸，有的帧虽然完整，播放时却上下乱跳。\n\n后来我把流程改成了三步：先检测每个角色的实际边界，再放到统一大小的透明画布，最后按脚底锚点对齐。修完以后动作总算稳定了。\n\nAI 能很快给我很多“看起来像动作”的图片，但把它们变成真正可播放的素材，还是得老老实实处理每一帧。第二张就是那只著名的眼睛。",
        tags: ["开发踩坑", "AI桌宠", "精灵表", "Pillow"],
        pinned: "第二张不是特效，是真的切错了。现在这个自动裁切流程已经修好，之后会把完整动作放出来。",
        angle: "这组素材天然有反差，错误画面比完美成品更抓人，也符合你账号里“真实测试 + 参数差异”的内容信号。"
      }
    }
  }
};

let activeProjectKey = "night";
let activeType = "showcase";
let activeTitleIndex = 0;
let activeImageIndex = 0;
let currentBody = "";
let toastTimer;

function init() {
  bindEvents();
  selectProject("night");
  refreshIcons();
}

function bindEvents() {
  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => selectProject(button.dataset.project));
  });

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => selectType(button.dataset.type));
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => selectTab(button.dataset.tab));
  });

  document.getElementById("previousImage").addEventListener("click", () => showImage(activeImageIndex - 1));
  document.getElementById("nextImage").addEventListener("click", () => showImage(activeImageIndex + 1));
  document.getElementById("generateButton").addEventListener("click", regenerateFromFacts);
  document.getElementById("copyAllButton").addEventListener("click", copyAll);
  document.getElementById("exportButton").addEventListener("click", exportMarkdown);

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyPart(button.dataset.copy));
  });

  document.getElementById("bodyEditor").addEventListener("input", (event) => {
    currentBody = event.target.value;
    updateBodyPreview();
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "ArrowLeft") showImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showImage(activeImageIndex + 1);
  });
}

function selectProject(key) {
  activeProjectKey = key;
  activeType = key === "yunxi" ? "problem" : "showcase";
  activeTitleIndex = 0;
  activeImageIndex = 0;

  document.querySelectorAll("[data-project]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.project === key);
  });

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.type === activeType);
  });

  fillFactFields();
  renderProject();
  setStatus("已读取真实项目素材", false);
}

function selectType(type) {
  activeType = type;
  activeTitleIndex = 0;
  document.querySelectorAll("[data-type]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.type === type);
  });
  renderContent();
}

function selectTab(tab) {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tab);
  });
}

function fillFactFields() {
  const project = projects[activeProjectKey];
  document.getElementById("projectName").value = project.name;
  document.getElementById("projectAction").value = project.facts.action;
  document.getElementById("projectProblem").value = project.facts.problem;
  document.getElementById("projectResult").value = project.facts.result;
}

function renderProject() {
  const project = projects[activeProjectKey];
  document.getElementById("workspaceTitle").textContent = project.name;
  document.getElementById("workspaceSubtitle").textContent = project.subtitle;
  document.getElementById("fitScore").textContent = project.fitScore;
  document.getElementById("qualityScore").textContent = activeProjectKey === "robo" ? "91" : "94";
  document.getElementById("qualityLabel").textContent = "可以发";
  document.getElementById("qualityItems").innerHTML = project.quality
    .map((item) => `<div class="quality-item"><i data-lucide="circle-check"></i><span>${escapeHtml(item)}</span></div>`)
    .join("");
  document.getElementById("missingMaterial").textContent = project.missing;
  renderAssetSequence();
  renderMediaDots();
  renderContent();
  showImage(0, false);
  refreshIcons();
}

function renderContent() {
  const packageData = getActivePackage();
  currentBody = packageData.body;
  activeTitleIndex = Math.min(activeTitleIndex, packageData.titles.length - 1);

  document.getElementById("titleOptions").innerHTML = packageData.titles
    .map((title, index) => `
      <button class="title-option${index === activeTitleIndex ? " is-active" : ""}" data-title-index="${index}" type="button">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(title)}</strong>
        <i data-lucide="circle-check"></i>
      </button>`)
    .join("");

  document.querySelectorAll("[data-title-index]").forEach((button) => {
    button.addEventListener("click", () => selectTitle(Number(button.dataset.titleIndex)));
  });

  document.getElementById("angleReason").textContent = packageData.angle;
  document.getElementById("bodyEditor").value = currentBody;
  document.getElementById("pinnedComment").textContent = packageData.pinned;
  document.getElementById("editorTags").innerHTML = packageData.tags
    .map((tag) => `<span>#${escapeHtml(tag)}</span>`)
    .join("");
  document.getElementById("previewTags").innerHTML = packageData.tags
    .map((tag) => `<span>#${escapeHtml(tag)}</span>`)
    .join("");

  updateTitlePreview();
  updateBodyPreview();
  refreshIcons();
}

function selectTitle(index) {
  activeTitleIndex = index;
  document.querySelectorAll("[data-title-index]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.titleIndex) === index);
  });
  updateTitlePreview();
}

function updateTitlePreview() {
  const packageData = getActivePackage();
  document.getElementById("previewTitle").textContent = packageData.titles[activeTitleIndex];
}

function updateBodyPreview() {
  document.getElementById("previewBody").textContent = currentBody;
  document.getElementById("bodyCount").textContent = `${countChineseLength(currentBody)} 字`;
}

function renderMediaDots() {
  const images = projects[activeProjectKey].images;
  document.getElementById("mediaDots").innerHTML = images
    .map((_, index) => `<button class="${index === activeImageIndex ? "is-active" : ""}" data-image-index="${index}" type="button" aria-label="查看第 ${index + 1} 张图"></button>`)
    .join("");
  document.querySelectorAll("[data-image-index]").forEach((button) => {
    button.addEventListener("click", () => showImage(Number(button.dataset.imageIndex)));
  });
}

function showImage(index, animate = true) {
  const images = projects[activeProjectKey].images;
  activeImageIndex = (index + images.length) % images.length;
  const image = images[activeImageIndex];
  const preview = document.getElementById("previewImage");

  const applyImage = () => {
    preview.src = image.src;
    preview.alt = image.title;
    document.getElementById("mediaTag").textContent = image.label;
    document.getElementById("imageCounter").textContent = `${activeImageIndex + 1} / ${images.length}`;
    document.querySelectorAll("[data-image-index]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.imageIndex) === activeImageIndex);
    });
    preview.classList.remove("is-changing");
  };

  if (animate) {
    preview.classList.add("is-changing");
    window.setTimeout(applyImage, 120);
  } else {
    applyImage();
  }
}

function renderAssetSequence() {
  const images = projects[activeProjectKey].images;
  document.getElementById("assetSequence").innerHTML = images
    .map((image, index) => `
      <div class="asset-item">
        <span class="asset-index">${String(index + 1).padStart(2, "0")}</span>
        <img src="${image.src}" alt="${escapeHtml(image.label)}" />
        <div><strong>${escapeHtml(image.title)}</strong><span>${escapeHtml(image.description)}</span></div>
        <i data-lucide="grip-vertical"></i>
      </div>`)
    .join("");
}

function regenerateFromFacts() {
  const button = document.getElementById("generateButton");
  const name = cleanInput(document.getElementById("projectName").value) || projects[activeProjectKey].name;
  const action = cleanInput(document.getElementById("projectAction").value);
  const problem = cleanInput(document.getElementById("projectProblem").value);
  const result = cleanInput(document.getElementById("projectResult").value);

  button.disabled = true;
  setStatus("正在核对项目事实", true);
  window.setTimeout(() => setStatus("正在去掉通用 AI 表达", true), 420);
  window.setTimeout(() => {
    const project = projects[activeProjectKey];
    const unchanged = name === project.name
      && action === project.facts.action
      && problem === project.facts.problem
      && result === project.facts.result;

    if (!unchanged) {
      project.name = name;
      project.facts = { action, problem, result };
      project.content[activeType] = buildCustomPackage(name, action, problem, result, project.content[activeType]);
    }

    document.getElementById("workspaceTitle").textContent = name;
    renderContent();
    button.disabled = false;
    setStatus("已按真实事实重新整理", false);
    showToast(unchanged ? "文案已重新整理" : "已根据你的修改更新笔记");
  }, 900);
}

function buildCustomPackage(name, action, problem, result, previous) {
  const titleByType = {
    showcase: [`我把「${name}」做成了一个能展示的版本`, `最近完成的项目：${name}`, `这次我没有只写方案，先把「${name}」做出来了`],
    process: [`「${name}」是怎么从想法变成成品的`, `做「${name}」时，我把流程拆成了这几步`, `复盘一下最近做完的「${name}」`],
    problem: [`做「${name}」时，我最先卡在了这里`, `「${name}」最难的并不是我一开始以为的事`, `这次项目踩的坑，差点让我把方向做反了`]
  };

  const opening = activeType === "problem"
    ? `最近在做「${name}」时，最先把我卡住的是：${problem || "项目里一个很具体的细节"}。`
    : `最近把「${name}」整理出了一个可以展示的版本。`;
  const body = `${opening}\n\n${action || "我先把最关键的流程做成了可以被验证的样品。"}\n\n真正做起来以后，${problem || "很多原来没被说清楚的问题才慢慢暴露出来"}。我没有把这些问题藏掉，而是把它们留在这次复盘里。\n\n最后，${result || "项目已经跑通了一个可以继续验证的版本"}。这还不是终点，但至少已经能回答“这件事能不能做”。\n\n如果继续更新这个项目，你更想看完整成品，还是想看中间踩过的坑？`;

  return {
    ...previous,
    titles: titleByType[activeType],
    body,
    angle: "这次文案只使用左侧填写的项目事实，没有补写未经确认的客户评价、收益或测试数据。"
  };
}

function getActivePackage() {
  return projects[activeProjectKey].content[activeType];
}

function buildMarkdown() {
  const project = projects[activeProjectKey];
  const packageData = getActivePackage();
  const title = packageData.titles[activeTitleIndex];
  const sequence = project.images
    .map((image, index) => `${index + 1}. ${image.label}：${image.description}`)
    .join("\n");
  return `# ${title}\n\n${currentBody}\n\n${packageData.tags.map((tag) => `#${tag}`).join(" ")}\n\n## 置顶评论\n${packageData.pinned}\n\n## 配图顺序\n${sequence}\n\n## 建议补拍\n${project.missing}\n`;
}

async function copyAll() {
  await copyText(buildMarkdown());
  showToast("整篇笔记已复制");
}

async function copyPart(part) {
  const packageData = getActivePackage();
  const value = part === "title" ? packageData.titles[activeTitleIndex] : currentBody;
  await copyText(value);
  showToast(part === "title" ? "标题已复制" : "正文已复制");
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function exportMarkdown() {
  const blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `xiaohongshu-${activeProjectKey}-${activeType}.md`;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
  showToast("Markdown 已导出");
}

function setStatus(text, working) {
  document.getElementById("statusText").textContent = text;
  document.getElementById("statusDot").classList.toggle("is-working", working);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
}

function countChineseLength(value) {
  return value.replace(/\s/g, "").length;
}

function cleanInput(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
    document.documentElement.classList.add("icons-loaded");
  }
}

document.addEventListener("DOMContentLoaded", init);
