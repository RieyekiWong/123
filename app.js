(() => {
  "use strict";
  const STORAGE_KEY = "no-return-hotel:v1";
  const freshState = () => ({
    name: "",
    checkedIn: false,
    clues: [],
    ending: null,
  });
  let state = freshState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object")
      state = {
        name: typeof saved.name === "string" ? saved.name.slice(0, 20) : "",
        checkedIn: saved.checkedIn === true,
        clues: Array.isArray(saved.clues)
          ? [
              ...new Set(
                saved.clues.filter((c) =>
                  ["clock", "tape", "name"].includes(c),
                ),
              ),
            ]
          : [],
        ending: ["exit", "stay"].includes(saved.ending) ? saved.ending : null,
      };
  } catch {
    /* Private browsing still supports this session. */
  }
  const $ = (s) => document.querySelector(s);
  const dialog = $("#story-dialog");
  const body = $("#dialog-body");
  let toastTimer;
  let previousFocus;
  const escape = (text) =>
    String(text).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const clueText = {
    clock: [
      "停下来的时钟",
      "住客须知背面写着：时钟停在 04:04。不存在的门，只认四位数字。",
    ],
    tape: [
      "被剪去的四楼",
      "03:17 的走廊监控中出现了 404 号门。电梯上被刮掉的数字是 4。",
    ],
    name: [
      "林远的留言",
      "失踪住客林远留下警告：真正的出口是红色的。白色的门通向下一次入住。",
    ],
  };
  function toast(text) {
    $("#toast").textContent = text;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4000,
    );
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      toast("浏览器未允许存储，本次探索仍可继续。");
    }
    $("#clue-count").textContent = String(state.clues.length).padStart(2, "0");
    $("#session-label").textContent = state.checkedIn
      ? `${state.name} · 307`
      : "访客模式";
  }
  function collect(id) {
    if (!state.clues.includes(id)) {
      state.clues.push(id);
      save();
      toast(`线索已记录：${clueText[id][0]} · ${state.clues.length}/3`);
    } else toast("这条线索已保存在您的笔记中。");
  }
  function show(title, content, label = "NO RETURN HOTEL / RECEPTION") {
    if (!dialog.open) previousFocus = document.activeElement;
    $("#dialog-label").textContent = label;
    body.innerHTML = `<p class="eyebrow">NO RETURN HOTEL · EST. 1984</p><h2 id="dialog-title">${title}</h2>${content}`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $("#dialog-close").focus({ preventScroll: true });
  }
  function close() {
    dialog.close();
  }
  $("#dialog-close").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        close();
    }
  });
  dialog.addEventListener("close", () => {
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
  });
  const actions = {
    rules() {
      show(
        "住客须知",
        `<p class="document-intro">尊敬的住客，欢迎入住无归旅馆。为了您与其他住客的安全，请仔细阅读并牢记以下规定。</p>
      <ol class="rules-list"><li><span>本旅馆只有三层。若电梯显示第四层，请闭上眼睛，直到铃声停止。</span></li><li><span>您的房间是 307。不要接受任何人递来的第二把钥匙，即使那个人看起来像您。</span></li><li><span>凌晨 <b>04:04</b> 后，请勿离开客房。如果时钟停下，请不要尝试修理。</span></li><li><span>走廊里没有儿童。若听见儿童的笑声，请将电视音量调到最小。</span></li><li><span>若有人敲门，请先确认门外是否有影子。没有影子时，<span class="redacted" title="不要开门">不要开门</span>。</span></li><li><span>离店时请寻找红色出口标识。我们从未安装过白色的出口门。</span></li></ol><p class="handwritten">背面有一行潦草的小字：<br>「不存在的门，只认停下来的时间。四位数字，别加冒号。」</p><button class="paper-button" data-action="clue-clock">记下背面的文字 ＋</button><div><span class="document-stamp">请勿带离客房</span></div>`,
        "GUEST GUIDELINES / DOCUMENT 001",
      );
    },
    "clue-clock"() {
      collect("clock");
    },
    "clue-tape"() {
      collect("tape");
    },
    "clue-name"() {
      collect("name");
    },
    checkin() {
      if (state.checkedIn) return actions.key();
      show(
        "您的客房，已等候多时。",
        `<p class="document-intro">请在登记簿上留下您的名字。无需证件，我们知道您从哪里来。</p><form id="checkin-form"><label class="form-label" for="guest-name">住客姓名 / GUEST NAME</label><input class="text-input" id="guest-name" name="name" autocomplete="nickname" maxlength="20" placeholder="请填写您的称呼" required><label class="check-row"><input type="checkbox" name="rules" required><span>我已阅读住客须知，并承诺不进入不存在的楼层。<br><button type="button" class="danger-link" data-action="rules" style="margin:0">阅读完整住客须知 ↗</button></span></label><div class="form-error" id="form-error" role="status"></div><button class="button button-red full-button" type="submit">领取 307 号房钥匙 <span>⚿</span></button></form><p class="form-hint">登记内容仅保存在当前浏览器，不会上传至任何服务器。</p>`,
      );
    },
    key() {
      show(
        "欢迎回来，" + escape(state.name) + "。",
        `<div class="key-card"><span class="eyebrow" style="justify-content:center">YOUR ROOM / 您的房间</span><div class="key-number">307</div><p>三层 · 走廊尽头 · 左手边第二间</p><span class="document-stamp">已登记入住</span></div><p>前台将一把冰凉的铜钥匙放在您手心。钥匙牌背面刻着一行字：<br><em>「您上次落下的东西，我们都替您保留着。」</em></p><div class="dialog-actions"><button class="button button-red" data-action="explore">前往客房 <span>→</span></button><button class="paper-button" data-action="journal">打开线索笔记</button></div>`,
      );
    },
    lookup() {
      if (state.checkedIn) return actions.key();
      show(
        "查询您的房间",
        `<p class="document-intro">请提供房号。若您尚未登记，前台一直在这里。</p><form id="lookup-form"><label class="form-label" for="room-number">房间号码 / ROOM NUMBER</label><input class="text-input" id="room-number" inputmode="numeric" maxlength="3" pattern="[0-9]{3}" placeholder="例如：307" required><div class="form-error" id="form-error" role="status"></div><button class="button button-red full-button" type="submit">查询房间 →</button></form><div class="dialog-actions"><button class="paper-button" data-action="checkin">尚未登记？办理入住 ↗</button></div>`,
      );
    },
    explore() {
      show(
        "三层 · 客房走廊",
        `<p class="document-intro">电梯门缓缓打开。空气里有旧地毯与消毒水的气味。走廊比您想象的更长。</p><div class="floor-map"><button data-room="301">301<small>请勿打扰</small></button><button data-room="303">303<small>门缝透出微光</small></button><button data-room="307">307<small>您的房间</small></button><button data-room="309">309<small>空置</small></button><button data-room="311">311<small>正在清洁</small></button><button class="locked" data-room="404">404<small>不在平面图上</small></button></div><p class="handwritten">您数了两遍。这里明明只有五扇门。<br>但走廊的尽头，似乎还有一扇。</p><button class="paper-button" data-action="monitor">查看走廊监控 ↗</button>`,
        "FLOOR DIRECTORY / LEVEL 03",
      );
    },
    monitor() {
      camera(1);
    },
    archives() {
      show(
        "异常档案室",
        `<p class="document-intro">这些记录从未正式归档。若您正在阅读，请不要告诉前台。</p><button class="entry archive-entry" style="width:100%;text-align:left" data-action="monitor"><div class="entry-top"><span>CASE 001 / 监控异常</span><span>1984.11.03 ↗</span></div><p>第三层走廊录像中，出现了一扇未在图纸上标记的门。</p></button><button class="entry archive-entry" style="width:100%;text-align:left" data-action="lost"><div class="entry-top"><span>CASE 002 / 遗失物品</span><span>1984.11.01 ↗</span></div><p>307 号房枕头下的日记。最后几页被反复撕下，又粘了回去。</p></button><button class="entry archive-entry" style="width:100%;text-align:left" data-action="notice"><div class="entry-top"><span>CASE 003 / 电梯停运</span><span>日期已涂去 ↗</span></div><p>旅馆只有三层，但电梯检修记录里出现了第四个按钮。</p></button>`,
        "RESTRICTED ARCHIVE / STAFF ONLY",
      );
    },
    guestbook() {
      show(
        "那些留下的声音",
        `<p class="document-intro">留言簿上的墨迹还没有干。您分不清这些话写于昨天，还是很多年以前。</p><article class="entry"><div class="entry-top"><span>住客 021 · 陈女士</span><span>1984.10.28</span></div><p>很安静。窗外的景色每天都一样，连树上的那只鸟也没有动过。下次还会来。</p></article><article class="entry"><div class="entry-top"><span>住客 306 · 佚名</span><span>1984.11.01</span></div><p>我不记得自己住了多久。前台说我的家人已经回去了。可我一直是一个人来的。</p></article><article class="entry"><div class="entry-top"><span>住客 307 · 林远</span><span>日期不详</span></div><p class="handwritten">如果你能看到这些字，记住：红色的门才是出口。白色的门，会让你回到第一天。别像我一样，再次签下自己的名字。</p><button class="paper-button" data-action="clue-name">记下林远的警告 ＋</button></article><p class="form-hint">这一页的背面，依稀透着您的名字。</p>`,
        "GUEST MESSAGES / VOLUME 04",
      );
    },
    notice() {
      show(
        "关于四层电梯临时停用的通知",
        `<p class="eyebrow">1984.11.03 / 设施维护通知</p><p>因例行检修，四层电梯按钮即日起停止使用。请各位住客从三层返回客房。</p><p>若检修期间听见井道内有人呼救，请勿自行开启电梯门。值班人员将予以处理。</p><p class="handwritten">补充说明：本旅馆没有四层。<br>上一段通知系打字员失误，请忽略。</p><p>经理室 敬启<br>无归旅馆设施管理部</p><button class="paper-button" data-action="explore">查看楼层导览 ↗</button>`,
        "HOTEL NOTICE / 1984.11.03",
      );
    },
    lost() {
      show(
        "失物招领：无名日记",
        `<p class="eyebrow">LOST & FOUND / ITEM 0307</p><p>日记封皮已经开裂，扉页的名字被划掉了。</p><article class="entry"><p>「第一天。下雨了，我走进这家旅馆避雨。前台说我的房间已经准备好。奇怪，我明明没有预约。」</p><p>「第三天。走廊尽头那扇门，只在 <b>04:04</b> 出现。四位数字是钥匙。我用口袋里的纸记下来，却发现纸上早就写着同样的数字。」</p><p>「第……天。不要相信白色的光。找到林远。他在留言簿里留了答案。」</p></article><button class="paper-button" data-action="clue-clock">记录日记中的时间 ＋</button><div class="dialog-actions"><button class="paper-button" data-action="guestbook">翻阅住客留言 ↗</button></div>`,
        "LOST & FOUND / INTERNAL RECORD",
      );
    },
    journal() {
      const count = state.clues.length;
      show(
        "您的线索笔记",
        `<p class="document-intro">${state.checkedIn ? escape(state.name) + " · 307 号房住客" : "一位尚未登记的访客"}<br>已收集 ${count} / 3 条线索。${count === 3 ? "现在，您知道去哪里，也知道如何离开。" : "留意须知的背面、走廊的监控，以及最后一位住客的留言。"}</p><div class="progress-track"><div style="width:${(count / 3) * 100}%"></div></div><ul class="journal-list">${Object.entries(
          clueText,
        )
          .map(
            ([id, [title, text]], i) =>
              `<li><span>0${i + 1}</span>${state.clues.includes(id) ? "<b>" + title + "</b><p>" + text + "</p>" : "尚未找到 · " + ["住客须知", "公共区域监控", "住客留言"][i]}</li>`,
          )
          .join(
            "",
          )}</ul>${state.ending ? `<p class="handwritten">已记录结局：${state.ending === "exit" ? "天亮以后" : "另一位归客"}</p>` : ""}<div class="dialog-actions"><button class="button button-red" data-room="404">寻找那扇门 →</button><button class="paper-button" data-action="archives">前往档案室</button></div>`,
      );
    },
    about() {
      show(
        "关于本次入住",
        `<p>《无归旅馆》是一部原创、虚构的后室风格 ARG 网页短篇。它包含规则怪谈、阅读解谜与两个结局。所有人物、地址、监控和留言均属故事设定。</p><h3>如何游玩</h3><p>办理入住后，阅读住客须知，切换监控，翻看住客留言。主动将发现记入笔记，再去寻找不存在的客房。整个谜题都能在本站内解开，无需访问现实地点或联系任何人。</p><p class="accessibility-note">无突然惊吓画面。环境音默认关闭，可随时切换。进度仅保存在此浏览器中；系统减少动态效果设置会被尊重。</p><button class="danger-link" data-action="reset-prompt">重新开始 / 清除本地探索进度</button>`,
      );
    },
    "reset-prompt"() {
      show(
        "重新登记？",
        `<p>这将清除当前浏览器中的姓名、线索和结局。环境音也会关闭。</p><div class="dialog-actions"><button class="button button-red" data-action="reset-confirm">确认重新开始</button><button class="paper-button" data-action="about">保留我的记录</button></div>`,
      );
    },
    "reset-confirm"() {
      state = freshState();
      save();
      if (soundContext) {
        soundContext.close();
        soundContext = null;
        setSoundButton(false);
      }
      close();
      toast("登记簿翻到了新的一页。欢迎第一次来到这里。");
    },
    "ending-exit"() {
      ending("exit");
    },
    "ending-stay"() {
      ending("stay");
    },
  };
  function camera(id) {
    const feeds = {
      1: [
        "LOBBY / 大堂",
        "03:17:02",
        "前台空无一人。登记簿却被翻到了新的一页。",
      ],
      2: [
        "CORRIDOR / 三层走廊",
        "03:17:04",
        "画面里有六扇门。第六扇门的铜牌上，清晰地写着 404。电梯按钮上的「4」被人刮掉了。",
      ],
      3: [
        "ELEVATOR / 电梯间",
        "04:04:00",
        "画面停在了 04:04:00。电梯门开着，里面似乎又是一条完全相同的走廊。",
      ],
    };
    const [title, time, note] = feeds[id];
    show(
      "公共区域监控",
      `<p class="document-intro">画面仅供住客安全使用。系统显示的时间可能存在偏差。</p><div class="camera-screen" style="background-position:${id === 1 ? "center" : id === 2 ? "75% center" : "25% center"}"><div class="camera-top"><span>● REC &nbsp; CAM 0${id}</span><span>${time}</span></div>${id === 2 ? '<span class="door-number" style="font-size:28px">404</span>' : ""}<div class="camera-bottom">${title} &nbsp; / &nbsp; 1984.11.03</div></div><div class="camera-switches">${[1, 2, 3].map((n) => `<button class="${n === id ? "selected" : ""}" data-camera="${n}" aria-pressed="${n === id}">CAM 0${n}</button>`).join("")}</div><p class="camera-note">${note}</p>${id === 2 ? '<button class="paper-button" data-action="clue-tape">保存异常画面 ＋</button>' : '<p class="form-hint">试试切换到其他摄像头，留意走廊尽头。</p>'}`,
      "SECURITY SYSTEM / LIVE FEED",
    );
  }
  function room(number) {
    if (number === "404")
      return show(
        "404 · 此房间不存在",
        `<p class="document-intro">您走到了走廊尽头。门牌并不在平面图上。门锁没有钥匙孔，只有四个旧数字转盘。</p><form id="unlock-form"><label class="form-label" for="door-code">请输入四位数字 / ACCESS CODE</label><input class="text-input" id="door-code" name="code" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="_ _ _ _" autocomplete="off" required><div class="form-error" id="form-error" role="status"></div><button class="button button-red full-button" type="submit">转动门锁 →</button></form><div class="dialog-actions"><button class="paper-button" data-action="journal">查看线索笔记</button><button class="paper-button" data-action="rules">回想住客须知</button></div>`,
        "ROOM 404 / ACCESS RESTRICTED",
      );
    if (number === "307") {
      if (!state.checkedIn) return actions.checkin();
      return show(
        "307 · 您的房间",
        `<p class="document-intro">钥匙转动了两圈。门开了。房间里的一切似乎都很熟悉。</p><p>一张单人床，一盏床头灯，一台没有信号的电视。墙上的时钟停在了 <b>04:04</b>。窗外是一条没有尽头的走廊。</p><p>枕头下面有一本日记。封面已经褪色，但您认出了自己的笔迹。</p><p class="handwritten">「不要睡着。找到不存在的房间。」</p><div class="dialog-actions"><button class="paper-button" data-action="lost">翻开枕下的日记 ↗</button><button class="button button-red" data-action="explore">回到走廊 →</button></div>`,
        "GUEST ROOM / 307",
      );
    }
    const notes = {
      301: "里面传来缓慢的脚步声。门把手轻轻转了一下。您决定不再打扰。",
      303: "门缝里的光突然熄灭了。一个声音说：「您走错了，您的房间在前面。」",
      309: "门上挂着一张褪色的清洁卡。日期是明天。",
      311: "您听到了拖把拖过地毯的声音。可这里不应该用拖把。",
    };
    show(
      escape(number) + " · 请勿打扰",
      `<p>${notes[number] || "这间客房暂不开放。"}</p><div class="dialog-actions"><button class="paper-button" data-action="explore">返回走廊 ←</button></div>`,
    );
  }
  function unlock() {
    show(
      "门后的两束光",
      `<p class="document-intro">门锁发出一声轻响。里面不是客房，而是一座没有按钮的电梯。</p><p>电梯下行了很久。门再次打开时，您看见两条路。</p><div class="entry"><h3>左边 · 红色出口</h3><p>生锈的铁门上亮着暗红色的 EXIT。门后吹来潮湿的风，带着陌生城市的气味。</p><button class="button button-red" data-action="ending-exit">推开红色的门 →</button></div><div class="entry"><h3>右边 · 白色的门</h3><p>明亮、温暖，像家一样。一个熟悉的声音在门后说：「欢迎回来，房间已经准备好了。」</p><button class="paper-button" data-action="ending-stay">走向白色的光 →</button></div><button class="danger-link" data-action="journal">先回想一下林远的警告</button>`,
      "BASEMENT / THE LAST CHOICE",
    );
  }
  function ending(type) {
    state.ending = type;
    save();
    show(
      type === "exit" ? "天亮以后" : "另一位归客",
      `<div class="ending"><div class="ending-symbol">${type === "exit" ? "☼" : "⚿"}</div><p class="ending-code">ENDING ${type === "exit" ? "01 / THE WAY OUT" : "02 / WELCOME BACK"}</p>${type === "exit" ? '<p>您推开了生锈的门。<br>清晨的空气冰凉，却真实得让人想哭。<br>身后是一堵旧墙。旅馆不见了。</p><p>您摊开手心。那把 307 号房的钥匙还在。</p><p class="handwritten">这一次，请记住回家的路。</p>' : '<p>白光温柔地包裹了您。<br>再睁眼时，您站在前台。<br>一个面带微笑的人，把登记簿推到您面前。</p><p>「夜深了。您终于回来了。」</p><p class="handwritten">桌上的登记簿，又多了一个您的名字。</p>'}<div class="dialog-actions" style="justify-content:center"><button class="paper-button" data-action="journal">查看本次探索记录</button><button class="paper-button" data-room="404">返回那扇门</button></div><p class="form-hint">结局已保存在本地。您可以继续探索，或在「关于本次入住」中重新开始。</p></div>`,
      "STAY COMPLETE / AN ENDING, PERHAPS",
    );
  }
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(
      "[data-action], [data-room], [data-camera]",
    );
    if (!trigger) return;
    if (trigger.dataset.action) actions[trigger.dataset.action]?.();
    else if (trigger.dataset.room) room(trigger.dataset.room);
    else if (trigger.dataset.camera) camera(Number(trigger.dataset.camera));
    closeMenu();
  });
  document.addEventListener("submit", (event) => {
    if (
      !["checkin-form", "lookup-form", "unlock-form"].includes(event.target.id)
    )
      return;
    event.preventDefault();
    const form = event.target;
    if (form.id === "checkin-form") {
      const name = form.elements.name.value.trim();
      if (!name) {
        $("#form-error").textContent = "请留下一个名字，前台才能为您登记。";
        return;
      }
      state.name = name;
      state.checkedIn = true;
      save();
      actions.key();
      toast("入住已登记 · 307 号房的钥匙交给您了。");
    } else if (form.id === "lookup-form") {
      const number = $("#room-number").value;
      if (["307", "404"].includes(number)) room(number);
      else
        $("#form-error").textContent =
          "登记簿里没有这间客房。请确认房号，或先办理入住。";
    } else if (form.id === "unlock-form") {
      if ($("#door-code").value === "0404") unlock();
      else {
        $("#form-error").textContent =
          "门没有打开。想一想：住客须知里的时钟停在几点？";
        $("#door-code").select();
      }
    }
  });
  function closeMenu() {
    $("nav").classList.remove("open");
    $(".mobile-menu").setAttribute("aria-expanded", "false");
    $(".mobile-menu").setAttribute("aria-label", "打开导航");
  }
  $(".mobile-menu").addEventListener("click", () => {
    const open = $("nav").classList.toggle("open");
    $(".mobile-menu").setAttribute("aria-expanded", String(open));
    $(".mobile-menu").setAttribute(
      "aria-label",
      open ? "关闭导航" : "打开导航",
    );
  });
  document.querySelectorAll("nav a").forEach((a) =>
    a.addEventListener("click", () => {
      closeMenu();
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  // A quiet ventilation hum, generated locally. Sound only starts after an explicit click.
  let soundContext = null;
  function setSoundButton(on) {
    $("#sound-button").setAttribute("aria-pressed", String(on));
    $("#sound-button").innerHTML =
      `<span id="sound-icon">${on ? "≋" : "◌"}</span> 环境音：${on ? "开启" : "关闭"}`;
  }
  $("#sound-button").addEventListener("click", async () => {
    if (soundContext) {
      await soundContext.close();
      soundContext = null;
      setSoundButton(false);
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      soundContext = context;
      await context.resume();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, context.currentTime + 2);
      gain.connect(context.destination);
      for (const frequency of [55, 55.4, 110]) {
        const osc = context.createOscillator();
        osc.frequency.value = frequency;
        osc.type = "sine";
        osc.connect(gain);
        osc.start();
      }
      setSoundButton(true);
    } catch {
      soundContext = null;
      setSoundButton(false);
      toast("当前浏览器暂不支持环境音。您仍可正常探索。");
    }
  });
  let elapsed = 0;
  function tick() {
    const total = 3 * 3600 + 17 * 60 + elapsed++;
    $("#hotel-clock").textContent = [
      Math.floor(total / 3600) % 24,
      Math.floor(total / 60) % 60,
      total % 60,
    ]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }
  tick();
  setInterval(tick, 1000);
  save();
})();
