/* Equipment views. State/graph validation lives in the shared progression model. */
globalThis.StillwaterNightViews = ({ t, getState, sourceCheck = () => "" }) => {
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
        "清洁推车的扶手上缠着黄色胶带。",
        "Cleaning cart, yellow tape around the handle.",
      ),
      notice: t(
        "一张维修告示，右下角撕掉了一块。",
        "Maintenance notice with the lower-right corner missing.",
      ),
      door: t("告示旁是一扇维修门。", "A maintenance door behind the notice."),
      "": t(
        "这个角度看不到通道标志。",
        "No passage landmark visible from this angle.",
      ),
    })[anchor];
  function camera(cam, terminal = false) {
    const n = getState().night,
      pan = n.pans[cam],
      anchor = N.anchor(cam, pan),
      c = N.circuit(n);
    return `<div class="cctv-frame ${terminal ? "signal-change" : ""}" data-cctv-phase="${terminal ? "terminal" : "altered"}" data-camera-view="${cam}" data-signal="${terminal && c.readable ? "readable" : "unavailable"}"><div class="cctv-picture" data-scene="${cam === 0 ? "lobby" : cam === 1 ? "hall" : "service"}" data-pan="${pan}" data-landmark="${anchor}" data-cart-moved="${n.passage.cartMoved}" data-open-door="${cam === 1 && n.events.includes("plate-open-door")}" data-silhouette="${cam === 1 && pan === 1 && (n.events.includes("hall-silhouette") || n.passage.inspected.includes("photo"))}" data-power="${n.passage.servicePower}">${terminal && !c.readable ? '<span class="no-signal">NO SIGNAL</span>' : ""}</div><div class="cctv-osd"><span>CAM 0${cam + 1} · ${names[cam][1]}</span><span>${terminal ? "PLAYBACK" : "REC"}</span></div><div class="cctv-osd bottom"><span>2006-10-17 ${terminal && c.readable ? "03:17:00" : "03:17:--"}</span><span>STILLWATER</span></div></div>`;
  }
  function scareChoice() {
    if (
      getState().night.comfortAcknowledged ||
      getState().preferences.scareChoiceMade
    )
      return "";
    const skipped = getState().preferences.skipScares;
    return `<aside class="chapter-comfort" aria-label="${t("恐怖章节显示设置", "Horror chapter display settings")}"><p>${t("接下来的监控和通道会有鬼脸、突脸及画面故障。鬼脸默认开启；关闭后，剧情和解谜仍可全部完成。", "The cameras and passage may show sudden close-up faces and signal glitches. Faces and jump scares are on by default. You may switch them off with all story and interactions still available.")}</p><p class="chapter-scare-status" role="status">${skipped ? t("鬼脸与突脸：已关闭", "Faces & jump scares: Off") : t("鬼脸与突脸：已开启", "Faces & jump scares: On")}</p><button data-night-action="comfort" data-enable="true">${skipped ? t("开启鬼脸与突脸", "Enable faces & jump scares") : t("保持开启，继续浏览", "Keep on and continue")}</button><button data-night-action="comfort" data-enable="false">${skipped ? t("保持跳过，继续浏览", "Keep skipping and continue") : t("关闭鬼脸与突脸", "Turn off faces & jump scares")}</button><p class="small">${t("声音可在底部菜单单独开关，也可打开设置调整。", "Sound is controlled separately in the footer. You can change these choices in settings.")}</p></aside>`;
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
          "当前页面已更新，旧资料仍可在历史副本中查看。",
          "Current directory. Earlier records remain in historical copies.",
        ),
      ) +
      scareChoice() +
      `<section class="document"><h2>${t("三楼客房", "Third-floor rooms")}</h2><div class="mirror-directory">${[316, 317, 318].map((r) => `<article><img src="assets/${r === 317 ? "suite" : "guestroom"}.jpg" alt="${t("客房照片", "Guest room photograph")}"><h3>${r}</h3><p>${t("可入住 · 独立卫浴", "Available · Private bathroom")}</p>${r === 317 ? link("mirror?room=317", t("查看客房", "View room")) : ""}</article>`).join("")}</div>${new URLSearchParams(location.hash.split("?")[1]).has("room") ? `<p class="mirror-wait" role="status">${t("正在制作房卡，请留在此页。", "Your room card is being prepared. Please remain on this page.")}</p>${link("mirror", t("返回房间目录", "Back to the directory"))}` : ""}<h2>${t("前台留言", "Reception entry")}</h2><p>E. Vale · 2006-10-17：${t("已正常入住。", "Checked in normally.")}</p><p>${t("本班值守", "Current staff")}: TEMP-015 / NIGHT SHIFT / PENDING</p><p>${link("rooms?copy=original", t("历史房间目录", "Historical room directory"))} · ${link("guestbook?copy=original", t("历史留言副本", "Historical guestbook copy"))}</p><p>${N.spreadReady(getState().night) ? link("cameras", t("通道监控 · 查看维修入口", "Passage cameras · Locate maintenance access")) : link(!getState().night.spread.rooms ? "rooms" : "guestbook", !getState().night.spread.rooms ? t("查看当前客房目录", "View current room directory") : t("查看当前住客留言", "View current guestbook"))}</p></section>`
    );
  }
  function cameras() {
    const n = getState().night;
    return (
      heading(
        "07 / PASSAGE CAMERAS",
        t("通道监控", "Passage cameras"),
        t(
          "转动镜头，查看相邻机位的交界处。两边拍到同一件物品后，再确认连接。",
          "Turn the cameras toward the overlap. When both views show the same object, confirm their connection.",
        ),
      ) +
      `<section class="camera-grid">${names.map((name, cam) => `<article><h2>CAM 0${cam + 1} / ${t(...name)}</h2>${camera(cam)}<div class="pan-controls" role="group" aria-label="${t("调整镜头方向", "Pan camera")} ${cam + 1}">${[t("左移", "Left"), t("居中", "Centre"), t("右移", "Right")].map((label, pan) => btn("pan", label, `data-cam="${cam}" data-pan="${pan}" aria-pressed="${n.pans[cam] === pan}"`)).join("")}</div><p class="landmark-description">${anchorText(N.anchor(cam, n.pans[cam]))}</p></article>`).join("")}</section><section class="document connection-map"><h2>${t("通道连接图", "Passage connections")}</h2>${[0, 1].map((i) => `<div class="map-edge ${n.links.includes(i) ? "connected" : ""}"><span>CAM 0${i + 1} ${n.links.includes(i) ? "━━━━" : "┄┄┄┄"} CAM 0${i + 2}</span>${btn("link", n.links.includes(i) ? t("连接已确认", "Connection retained") : t("确认连接", "Confirm connection"), `data-link="${i}"`)}</div>`).join("")}<p id="night-feedback" role="status"></p>${n.links.length === 2 && n.pans[2] === 2 ? btn("door", t("打开员工维修门", "Open maintenance door"), 'class="primary"') : ""}<p>${link("mirror", t("返回酒店目录", "Back to the directory"))}</p></section>`
    );
  }
  const direction = [
    ["上", "North"],
    ["右", "East"],
    ["下", "South"],
    ["左", "West"],
  ];
  function junctionSvg(rot,index) {
    const turn=`rotate(${rot*90} 50 50)`,ports=N.ports(rot);
    const wire="M50 6 V39 Q50 50 61 50 H94";
    const screws=[[10,10],[90,10],[10,90],[90,90]].map(([x,y])=>`<g class="mount-screw"><circle cx="${x}" cy="${y}" r="4"/><line x1="${x-2.5}" y1="${y}" x2="${x+2.5}" y2="${y}"/></g>`).join('');
    const contacts=[0,1,2,3].map(side=>`<g class="terminal-contact ${ports.includes(side)?'contact-used':''}" data-port="${side}" data-connected="${ports.includes(side)}" transform="rotate(${side*90} 50 50)"><rect x="42" y="1" width="16" height="14" rx="2"/><rect class="contact-collar" x="46" y="3" width="8" height="10"/><circle cx="50" cy="7" r="3"/></g>`).join('');
    return `<svg class="junction-hardware" viewBox="0 0 100 100" aria-hidden="true"><rect class="socket-plate" x="3" y="3" width="94" height="94" rx="3"/><rect class="phenolic-board" x="15" y="15" width="70" height="70" rx="2"/><g class="fixed-ground"><polyline points="19,33 23,33 23,75 77,75 77,66"/><polyline points="17,36 20,36 20,80 73,80"/><line x1="26" y1="58" x2="34" y2="58"/><line x1="27" y1="61" x2="33" y2="61"/></g>${screws}${contacts}<rect class="resistor-body" x="29" y="72" width="15" height="6" rx="1"/><g class="resistor-bands"><line x1="33" y1="72" x2="33" y2="78"/><line x1="36" y1="72" x2="36" y2="78"/><line x1="41" y1="72" x2="41" y2="78"/></g><path class="wire-shadow" d="${wire}" transform="${turn}"/><path class="wire-jacket" d="${wire}" transform="${turn}"/><path class="wire-core" data-circuit-wire d="${wire}" transform="${turn}"/><path class="wire-ribbing" d="${wire}" transform="${turn}"/><g transform="${turn}"><rect class="strain-relief" x="44" y="18" width="12" height="8" rx="2"/><rect class="strain-relief" x="75" y="44" width="8" height="12" rx="2"/></g><circle class="junction-nut" cx="50" cy="50" r="7"/><line class="junction-slot" x1="46" y1="50" x2="54" y2="50"/><circle class="node-lamp" cx="83" cy="24" r="3"/><text class="board-stamp" x="23" y="27">J0${index+1}</text><text class="board-stamp" x="49" y="84">GND</text></svg>`;
  }
  function closingStatus(n, c) {
    if (n.locked) return t(
      "原件已锁定。点击下方“保留原件并退出夜班”，即可结束本次工作。",
      "Originals locked. Keep the originals and end the shift below to finish.",
    );
    if (n.saved && n.frame && !globalThis.StillwaterCaseState.promoChecked(getState()))
      return t("录像已恢复。监控下方有一份影像来源核对。", "Recording restored. The source image check is below the monitor.");
    if (n.saved && n.frame && !globalThis.StillwaterVoidModel.finished(n))
      return t("录像末尾多出一段未归档画面，入口在监控下方。", "An unlisted picture remains at the end of the reel. Open it below the monitor.");
    if (n.saved) return n.frame
      ? t("接线配置已保存。还需锁定原始备份，再办理退出交接。", "Configuration saved. Lock the original archive before ending the shift.")
      : t("接线配置已保存。先在监控下方恢复缓存的最后一帧，再锁定原始备份。", "Configuration saved. Restore the last recorded frame below the camera, then lock the archive.");
    if (c.valid) return t("线路已接好，请先保存配置，再锁定原始备份。", "The circuit is ready. Save the configuration, then lock the original archive.");
    return "";
  }
  function terminal() {
    const n = getState().night,
      c = N.circuit(n);
    const sourcePanel = sourceCheck();
    const unlisted = sourcePanel || (globalThis.StillwaterCaseState.canOpen(getState(), "void")
      ? `<section class="unlisted-record"><h2>03:17 / ${t("无机位编号", "NO CAMERA INDEX")}</h2><div class="unlisted-preview" aria-hidden="true"></div><p>${n.void.complete ? t("该画面保留为未核实，未分配身份。现在可以锁定原件，继续交接。", "Classification kept unverified, with no identity assigned. Continue with the archive lock and handover.") : t("最后一帧后面还有画面，却查不到对应的摄像头。", "A picture follows the last recorded frame. No camera is assigned to it.")}</p><a href="#void" data-unlisted-entry>${n.void.complete ? t("回看未归档画面", "Revisit the unlisted picture") : n.void.entered ? t("继续查看未归档画面", "Continue the unlisted picture") : t("查看未归档画面", "Open unlisted picture")} →</a></section>` : "");

    return (
      heading(
        "08 / NIGHT CONTROL",
        t("夜班控制室", "Night control room"),
        "SERVICE ACCESS OPEN / CURRENT REVIEWER TEMP-015",
      ) +
      `<section class="terminal-layout"><div>${camera(1, true)}<p role="status" class="circuit-status">${c.readable ? t("原始录像已接通 · 03:17", "Original reel connected · 03:17") : t("CAM 02 无信号", "CAM 02 NO SIGNAL")}</p>${btn("frame", t("恢复缓存的最后一帧", "Restore the last recorded frame"), n.frame && n.events.includes("last-frame") ? "disabled" : "")}<div class="last-frame">${n.frame ? `<p>${t("最后一帧：317 / SERVICE HOLDING。经手人 E-014。自动登记仍在运行。", "Last frame: 317 / SERVICE HOLDING. Handover E-014; automatic registration is still running.")}</p>` : ""}</div>${unlisted}</div><section class="patch-panel"><h2>${t("录像信号配线板", "Reel signal patch panel")}</h2><div class="maintenance-label"><h3>${t("接线与检修说明", "Wiring & service label")}</h3><p>${t("每点一次接头，顺时针转动 90°。把相邻接口对齐，接成连续的线路。", "Press a junction to turn it 90° clockwise. Facing ends must meet to carry the signal.")}</p><p>${t("信号从 A 的左侧进入，须接到 F 右侧的只读存储。接通后可查看 03:17 的录像。", "The original reel enters A from the left and must reach the read-only archive at F on the right. A connected path restores the 03:17 recording.")}</p><h3>${t("员工记录同步", "Staff record synchronization")}</h3><p>${t("AUTO-WRITE 是酒店原有的自动写入线路。只要线路保持连接，系统就会继续更新夜班员工名单。", "AUTO-WRITE is the hotel’s existing automatic write circuit. While it remains connected, the system continues to update the night-shift staff register.")}</p><p>${t("检修时，可以暂时隔离这条线路，并将操作模式切换为 MANUAL（手动）。完成后即可保存当前接线配置。", "During maintenance, you can temporarily isolate this circuit and switch the operating mode to MANUAL. You can then save the current wiring configuration.")}</p></div><p class="port-label">${t("原始录像 → A 左侧", "ORIGINAL REEL → LEFT OF A")}</p><div class="wiring-chassis"><div class="cabinet-nameplate"><strong>B-3 / VIDEO PATCH</strong><span>DC 24 V</span></div><div class="cable-duct" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="circuit-grid">${n.orientations
        .map(
          (rot, i) =>
            `<button class="circuit-node ${c.original.includes(i) ? "energized" : ""} ${c.write.includes(i) ? "write-live" : ""}" data-night-action="rotate" data-node="${i}" aria-label="${String.fromCharCode(65 + i)} ${t("接头", "junction")}：${N.ports(
              rot,
            )
              .map((d) => t(...direction[d]))
              .join(
                " / ",
              )}；${t("旋转90度", "rotate 90 degrees")}">${junctionSvg(rot,i)}<span>${String.fromCharCode(65 + i)} · ${N.ports(
              rot,
            )
              .map((d) => t(...direction[d]))
              .join(" / ")}</span></button>`,
        )
        .join(
          "",
        )}</div><div class="ground-strap" aria-hidden="true"><i></i><span>${t("固定屏蔽线","FIXED SHIELD")}</span><i></i></div><div class="cabinet-diagnostics" aria-label="${t("设备指示灯","Equipment indicators")}"><span data-feed="reel" data-on="${c.readable}"><i></i>REEL · ${c.readable?t("已接通","READY"):t("无信号","NO SIGNAL")}</span><span data-feed="write" data-on="${!n.isolated}"><i></i>AUTO-WRITE · ${n.isolated?t("已隔离","ISOLATED"):t("有电","POWERED")}</span><span data-feed="mode" data-on="${n.manual}"><i></i>${n.manual?"MANUAL":"AUTO"}</span></div></div><p class="port-label output-port">${t("F 右侧 → 只读存储", "RIGHT OF F → READ-ONLY ARCHIVE")}</p><div class="circuit-switches">${btn("isolate", `AUTO-WRITE / ${n.isolated ? t("已隔离", "ISOLATED") : t("接通", "CONNECTED")}`, `aria-pressed="${n.isolated}"`)}${btn("manual", n.manual ? "MANUAL / " + t("手动", "Manual") : "AUTO / " + t("自动", "Automatic"), `aria-pressed="${n.manual}"`)}</div><p class="small">${t("自动回写电源从 D 上方接入，与员工名册共用 F 的出口。", "Auto-write enters above D; the staff register shares the outlet at F.")}</p><div class="panel-actions">${btn("undo", t("撤销一步", "Undo"))}${btn("reset", t("恢复接线初始位置", "Reset wiring"))}${btn("save", t("保存当前配置", "Save configuration"), 'class="primary"')}</div><p id="night-feedback" role="status">${closingStatus(n,c)}</p>${n.saved && globalThis.StillwaterVoidModel.finished(n) ? btn("lock", n.locked ? t("原件已锁定", "Original archive locked") : t("锁定原始备份，停止后续改写", "Lock original archive against further writes"), n.locked ? "disabled" : "") : ""}</section><aside class="document live-register"><h2>STAFF REGISTER</h2><p>TEMP-015 / ${n.isolated ? "REVIEW ENDED" : c.register ? "ASSIGNED" : "PENDING"}</p><p>${t("录像通路", "Reel path")}: ${c.readable ? "READABLE" : "NO SIGNAL"}</p><p>AUTO-WRITE: ${n.isolated ? "ISOLATED" : c.register ? "WRITING" : "POWERED"}</p><p>ARCHIVE: ${n.locked ? "LOCKED / READ ONLY" : n.saved ? "READ ONLY" : "NOT SAVED"}</p><details><summary>${t("相关旧资料", "Related historical records")}</summary><p>${link("floor-plan", "317 / SERVICE HOLDING")}</p><p>${link("maintenance?record=A-06-17", "A-06-17 / E-014")}</p><p>${link("mara", t("Mara 的原备注", "Mara’s original note"))}</p></details></aside></section>${n.frame && n.operations > 0 ? `<section class="document night-disposition"><h2>${n.locked ? t("交接完成，可以离开", "Handover complete") : t("结束本次夜班", "End this shift")}</h2><p>${n.locked ? t("原件已锁定，自动回写线路已隔离。选择“保留原件并退出夜班”，完成退出交接。", "The originals are locked and auto-write is isolated. Select Keep the originals and end the shift to leave.") : t("直接结案或离开，都会保留当前处理结果。如需保护原件，请先保存接线配置，再锁定备份。", "Leaving or accepting closure keeps the current disposition. To protect the originals, save the panel configuration and lock the archive first.")}</p><div class="decision-actions"><button data-case-action="close-case" data-ending="auto-close">AUTO CLOSE · ${t("同意自动结案", "Accept automatic closure")}</button><button data-case-action="close-case" data-ending="unverified">UNVERIFIED · ${t("拒绝签字，离开终端", "Leave without signing")}</button>${n.locked ? '<button class="primary" data-case-action="close-case" data-ending="released">' + t("保留原件并退出夜班", "Keep the originals and end the shift") + "</button>" : ""}</div></section>` : ""}`
    );
  }
  function released() {
    return (
      heading(
        "REVIEW ENDED",
        t("保留的结局记录", "Retained ending record"),
        t(
          "原始资料已锁定，只能查看。",
          "Original records retained in read-only storage.",
        ),
      ) +
      `<article class="document ending-record" data-ending-record="released"><h2>TEMP-015 / RELEASED</h2><p>317 / SERVICE HOLDING<br>E-014 / Mara Ellis<br>R-4829 / UNVERIFIED</p><p>${t("后续排班已取消。Mara 的备注和原始预订单已保留，自动改写已停止。", "Further shifts are cancelled. Mara’s note and the original booking are retained, protected against automatic changes.")}</p></article>`
    );
  }
  return { mirror, cameras, terminal, released, camera, scareChoice };
};
