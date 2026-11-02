/* Equipment views. State/graph validation lives in the shared progression model. */
globalThis.StillwaterNightViews = ({ t, getState }) => {
  const N = globalThis.StillwaterNightModel,
    names = [
      ["大堂楼梯", "LOBBY STAIRS"],
      ["三楼西走廊", "WEST CORRIDOR"],
      ["员工通道", "STAFF PASSAGE"],
    ];
  const btn = (action, label, attrs = "") =>
    `<button data-night-action="${action}" ${attrs}>${label}</button>`;
  const link = (route, label) => `<a href="#${route}">${label} →</a>`;
  const heading = (n, title, desc = "") =>
    `<header class="page-heading"><p class="kicker">${n}</p><h1>${title}</h1><p>${desc}</p></header>`;
  const anchorText = (anchor) =>
    ({
      cart: t(
        "清洁推车，扶手缠着黄色胶带。",
        "Cleaning cart, yellow tape around the handle.",
      ),
      notice: t(
        "维修告示，右下角缺了一块。",
        "Maintenance notice with the lower-right corner missing.",
      ),
      door: t(
        "告示背后有一扇维修门。",
        "A maintenance door behind the notice.",
      ),
      "": t(
        "这个角度看不到通道标志。",
        "No passage landmark visible from this angle.",
      ),
    })[anchor];
  function camera(cam, terminal = false) {
    const n = getState().night,
      pan = n.pans[cam],
      anchor = N.anchor(cam, pan),
      c = N.circuit(n),
      file = cam === 0 ? "lobby" : "hallway";
    return `<div class="cctv-frame ${terminal ? "signal-change" : ""}" data-cctv-phase="${terminal ? "terminal" : "altered"}" data-camera-view="${cam}" data-signal="${terminal && c.readable ? "readable" : "unavailable"}"><div class="cctv-picture" style="background-image:url('assets/lowres/${file}.jpg');background-size:170% auto;background-position:${pan * 50}% center">${anchor === "cart" ? '<span class="scene-cart" aria-hidden="true"><i></i><b>▥</b><em>●　●</em></span>' : anchor === "notice" ? '<span class="scene-notice" aria-hidden="true">MAINTENANCE<br>KEEP CLEAR</span>' : anchor === "door" ? '<span class="scene-service-door" aria-hidden="true">SERVICE<br>ACCESS</span>' : ""}${terminal && !c.readable ? '<span class="no-signal">NO SIGNAL</span>' : ""}</div><div class="cctv-osd"><span>CAM 0${cam + 1} · ${names[cam][1]}</span><span>${terminal ? "PLAYBACK" : "REC"}</span></div><div class="cctv-osd bottom"><span>${terminal && c.readable ? "03:17:00" : "--:--:--"}</span><span>STILLWATER</span></div></div>`;
  }
  function mirror() {
    if (getState().lastEnding === "released")
      return (
        heading("DIRECTORY RESTORED", t("目录已恢复", "Directory restored")) +
        link("rooms", t("查看客房目录", "View room directory"))
      );
    return (
      heading(
        "DIRECTORY SYNC",
        t("酒店目录已更新", "Hotel directory updated"),
        t(
          "以下为当前页面，原来的资料保存在历史副本中。",
          "Current directory. Earlier records remain in historical copies.",
        ),
      ) +
      `<section class="document"><h2>${t("三楼客房", "Third-floor rooms")}</h2><div class="mirror-directory">${[316, 317, 318].map((r) => `<article><img src="assets/${r === 317 ? "suite" : "guestroom"}.jpg" alt="${t("客房照片", "Guest room photograph")}"><h3>${r}</h3><p>${t("可入住 · 独立卫浴", "Available · Private bathroom")}</p>${r === 317 ? link("mirror?room=317", t("查看客房", "View room")) : ""}</article>`).join("")}</div>${new URLSearchParams(location.hash.split("?")[1]).has("room") ? `<p class="mirror-wait" role="status">${t("房卡正在制作，请不要离开本页。", "Your room card is being prepared. Please remain on this page.")}</p>${link("mirror", t("返回房间目录", "Back to the directory"))}` : ""}<h2>${t("前台留言", "Reception entry")}</h2><p>E. Vale · 2006-10-17：${t("已正常入住。", "Checked in normally.")}</p><p>${t("当前人员", "Current staff")}: TEMP-015 / NIGHT SHIFT / PENDING</p><p>${link("rooms?copy=original", t("历史房间目录", "Historical room directory"))} · ${link("guestbook?copy=original", t("历史留言副本", "Historical guestbook copy"))}</p><p>${link("cameras", t("通道监控 · 查看维修入口", "Passage cameras · Locate maintenance access"))}</p></section>`
    );
  }
  function cameras() {
    const n = getState().night;
    return (
      heading(
        "07 / PASSAGE CAMERAS",
        t("通道监控", "Passage cameras"),
        t(
          "维修说明：转动镜头，找到交接处的同一件物品后，接通相邻机位。",
          "Maintenance: pan adjacent cameras to the same landmark before linking them.",
        ),
      ) +
      `<section class="camera-grid">${names.map((name, cam) => `<article><h2>CAM 0${cam + 1} / ${t(...name)}</h2>${camera(cam)}<div class="pan-controls" role="group" aria-label="${t("调整镜头方向", "Pan camera")} ${cam + 1}">${[t("左移", "Left"), t("居中", "Centre"), t("右移", "Right")].map((label, pan) => btn("pan", label, `data-cam="${cam}" data-pan="${pan}" aria-pressed="${n.pans[cam] === pan}"`)).join("")}</div><p class="landmark-description">${anchorText(N.anchor(cam, n.pans[cam]))}</p></article>`).join("")}</section><section class="document connection-map"><h2>${t("通道连接图", "Passage connections")}</h2>${[0, 1].map((i) => `<div class="map-edge ${n.links.includes(i) ? "connected" : ""}"><span>CAM 0${i + 1} ${n.links.includes(i) ? "━━━━" : "┄┄┄┄"} CAM 0${i + 2}</span>${btn("link", n.links.includes(i) ? t("连接已保留", "Connection retained") : t("确认连接", "Confirm connection"), `data-link="${i}"`)}</div>`).join("")}<p id="night-feedback" role="status"></p>${n.links.length === 2 && n.pans[2] === 2 ? btn("door", t("打开员工维修门", "Open maintenance door"), 'class="primary"') : ""}<p>${link("mirror", t("返回酒店目录", "Back to the directory"))}</p></section>`
    );
  }
  const direction = [
    ["上", "North"],
    ["右", "East"],
    ["下", "South"],
    ["左", "West"],
  ];
  function terminal() {
    const n = getState().night,
      c = N.circuit(n);
    return (
      heading(
        "08 / NIGHT CONTROL",
        t("夜班控制室", "Night control room"),
        "SERVICE ACCESS OPEN / CURRENT REVIEWER TEMP-015",
      ) +
      `<section class="terminal-layout"><div>${camera(1, true)}<p role="status" class="circuit-status">${c.readable ? t("原始录像已接通 · 03:17", "Original reel connected · 03:17") : t("CAM 02 无信号", "CAM 02 NO SIGNAL")}</p>${btn("frame", t("恢复监控最后一帧", "Restore the last recorded frame"), n.frame ? "disabled" : "")}<div class="last-frame">${n.frame ? `<p>${t("最后一帧：317 / SERVICE HOLDING。交接人 E-014；自动登记没有停止。", "Last frame: 317 / SERVICE HOLDING. Handover E-014; automatic registration is still running.")}</p>` : ""}</div><p>${btn("settings", t("声音与画面设置", "Sound & viewing settings"))}</p><p class="small">${t("呼吸声可在设置中开启，默认静音。画面信息不依赖声音。", "Optional breathing in settings; muted by default. All clues remain visible without sound.")}</p></div><section class="patch-panel"><h2>${t("录像信号配线板", "Reel signal patch panel")}</h2><p class="small">${t("维修标签：弯头两端均须相接。左上输入，右下输出。橙色支路为回写电源；检修时拉开隔离闸，并使用手动模式。", "Service label: both ends of each elbow must connect. Input upper left, output lower right. Orange branch powers auto-write; isolate it during maintenance and select manual mode.")}</p><p class="port-label">ORIGINAL REEL → A</p><div class="circuit-grid">${n.orientations
        .map(
          (rot, i) =>
            `<button class="circuit-node ${c.original.includes(i) ? "energized" : ""} ${c.write.includes(i) ? "write-live" : ""}" data-night-action="rotate" data-node="${i}" aria-label="${String.fromCharCode(65 + i)} ${t("接头", "junction")}：${N.ports(
              rot,
            )
              .map((d) => t(...direction[d]))
              .join(
                " / ",
              )}；${t("旋转90度", "rotate 90 degrees")}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 5 V50 H95" transform="rotate(${rot * 90} 50 50)"/><circle cx="50" cy="50" r="5"/></svg><span>${String.fromCharCode(65 + i)} · ${N.ports(
              rot,
            )
              .map((d) => t(...direction[d]))
              .join(" / ")}</span></button>`,
        )
        .join(
          "",
        )}</div><p class="port-label output-port">F → READ-ONLY ARCHIVE</p><div class="circuit-switches">${btn("isolate", `AUTO-WRITE / ${n.isolated ? t("已隔离", "ISOLATED") : t("接通", "CONNECTED")}`, `aria-pressed="${n.isolated}"`)}${btn("manual", n.manual ? "MANUAL / " + t("手动", "Manual") : "AUTO / " + t("自动", "Automatic"), `aria-pressed="${n.manual}"`)}</div><p class="small">AUTO-WRITE → D → STAFF REGISTER / F</p><div class="panel-actions">${btn("undo", t("撤销一步", "Undo"))}${btn("reset", t("恢复接线初始位置", "Reset wiring"))}${btn("save", t("保存当前配置", "Save configuration"), 'class="primary"')}</div><p id="night-feedback" role="status">${n.saved ? t("配置已保存。只读备份可加锁。", "Configuration saved. Read-only archive can be locked.") : ""}</p>${n.saved ? btn("lock", n.locked ? t("原件已锁定", "Original archive locked") : t("锁定原始备份，停止后续改写", "Lock original archive against further writes"), n.locked ? "disabled" : "") : ""}</section><aside class="document live-register"><h2>STAFF REGISTER</h2><p>TEMP-015 / ${n.isolated ? "REVIEW ENDED" : c.register ? "ASSIGNED" : "PENDING"}</p><p>${t("录像通路", "Reel path")}: ${c.readable ? "READABLE" : "NO SIGNAL"}</p><p>AUTO-WRITE: ${n.isolated ? "ISOLATED" : c.register ? "WRITING" : "POWERED"}</p><p>ARCHIVE: ${n.locked ? "LOCKED / READ ONLY" : n.saved ? "READ ONLY" : "NOT SAVED"}</p><details><summary>${t("相关旧资料", "Related historical records")}</summary><p>${link("floor-plan", "317 / SERVICE HOLDING")}</p><p>${link("maintenance?record=A-06-17", "A-06-17 / E-014")}</p><p>${link("mara", t("Mara 的原备注", "Mara’s original note"))}</p></details></aside></section>${n.frame && n.operations > 0 ? `<section class="document night-disposition"><h2>${t("结束夜班", "End this shift")}</h2><p>${t("尚未锁定的备份仍可被自动程序改写。", "An unlocked archive can still be changed by the automatic process.")}</p><div class="decision-actions"><button data-case-action="close-case" data-ending="auto-close">AUTO CLOSE · ${t("同意自动结案", "Accept automatic closure")}</button><button data-case-action="close-case" data-ending="unverified">UNVERIFIED · ${t("拒绝签字，离开终端", "Leave without signing")}</button>${n.locked ? '<button class="primary" data-case-action="close-case" data-ending="released">' + t("保留原件并退出夜班", "Keep the originals and end the shift") + "</button>" : ""}</div></section>` : ""}`
    );
  }
  function released() {
    return (
      heading(
        "REVIEW ENDED",
        t("工作已结束", "Review ended"),
        t(
          "原始资料已转为只读保存。",
          "Original records retained in read-only storage.",
        ),
      ) +
      `<article class="document ending-record" data-ending-record="released"><h2>TEMP-015 / RELEASED</h2><p>317 / SERVICE HOLDING<br>E-014 / Mara Ellis<br>R-4829 / UNVERIFIED</p><p>${t("没有新的值班安排。Mara 的备注未改动；这份预订仍待核实。", "No further shift assigned. Mara’s note is unchanged; the reservation remains unverified.")}</p><p>${link("careers", t("查看岗位", "View the role"))} · ${link("hotel", t("返回酒店", "Return to the hotel"))} · ${link("notes", t("查看保留的资料", "Retained records"))}</p></article>`
    );
  }
  return { mirror, cameras, terminal, released, camera };
};
