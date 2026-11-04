/* A small connected space; every hotspot also has a labelled keyboard control. */
globalThis.StillwaterSpaceViews = ({ t, getState }) => {
  const button = (target, label) =>
    `<button data-night-action="inspect" data-target="${target}">${label}</button>`;
  return {
    "service-passage": () => {
      const n = getState().night,
        p = n.passage,
        landing = p.position === "landing",
        west = p.position === "west";
      const labels = {
        landing: t("三楼 · 317 门外", "Third floor · Outside 317"),
        west: t("西侧维修柜", "West service cabinet"),
        service: t("B-3 配线室门外", "Outside B-3"),
      };
      const info = [];
      if (landing) {
        if (p.inspected.includes("plate"))
          info.push(
            t(
              "317 门牌底下留着一层旧胶。隔壁那扇门，刚才还是关着的。",
              "Old adhesive under the 317 plate. The door next to it was closed a moment ago.",
            ),
          );
        if (p.inspected.includes("peephole"))
          info.push(
            t(
              "猫眼里只看得见一盏灯，没有人。",
              "Only a light through the peephole. No one there.",
            ),
          );
        if (p.inspected.includes("photo"))
          info.push(
            t(
              "合照背面写着“2006.10.17 夜班”。E-014 那一栏被刮掉了。",
              "Written on the back: Night shift, 2006.10.17. The E-014 caption has been scratched out.",
            ),
          );
      } else if (west) {
        info.push(
          p.cartMoved
            ? t(
                "推车已挪到墙边，柜门前空出来了。",
                "The cart is against the wall. You can reach the cabinet.",
              )
            : t(
                "扶手缠着黄色胶带的推车挡住了维修柜。",
                "The cart with yellow tape blocks the cabinet.",
              ),
        );
        if (p.cabinetOpen)
          info.push(
            t(
              "柜门内贴着标签：“B-3 门锁供电”。合上拉杆即可解锁。",
              "Inside the cabinet: B-3 door supply. Raise the lever to release the lock.",
            ),
          );
        if (p.servicePower)
          info.push(
            t(
              "拉杆合上了。通道另一头的灯由红变绿。",
              "Lever raised. The lamp down the passage is green.",
            ),
          );
      } else
        info.push(
          p.servicePower
            ? t(
                "门锁松开了，里面是一块录像信号配线板。",
                "The latch is loose. The reel patch panel is inside.",
              )
            : t(
                "门上的红灯还亮着。沿墙上的电线看回去，另一头接在维修柜里。",
                "Red lock lamp. The cable runs back to the service cabinet.",
              ),
        );
      if (p.inspected.includes("notice"))
        info.push(
          t(
            "维修告示：门禁电源在西侧维修柜；录像信号请到 B-3 配线室检修。",
            "Service notice: Door supply in the west cabinet. Reel signal serviced separately inside B-3.",
          ),
        );
      const controls = landing
        ? button("plate", t("查看 317 门牌", "Inspect 317 plate")) +
          button("peephole", t("看猫眼", "Look through peephole")) +
          button("photo", t("翻看员工合照", "Turn over staff photograph"))
        : west
          ? button(
              "cart",
              p.cartMoved
                ? t("查看推车", "Check cart")
                : t("把推车挪到墙边", "Move cart against wall"),
            ) +
            button("cabinet", t("打开维修柜", "Open service cabinet")) +
            button(
              "power",
              p.servicePower
                ? t("门锁电源已接通", "Door supply connected")
                : t("合上门锁供电拉杆", "Raise door supply lever"),
            )
          : button("enter", t("推开 B-3 的门", "Open B-3 door"));
      return `<header class="page-heading"><p class="kicker">SERVICE ACCESS / 2006-10-17</p><h1>${labels[p.position]}</h1></header><section class="space-console"><div class="cctv-frame passage-frame" data-cctv-phase="terminal"><div class="cctv-picture" data-scene="${landing ? "hall" : "service"}" data-pan="${west ? "0" : "1"}" data-cart="${west}" data-landmark="${west ? "cart" : landing ? "" : "door"}" data-cart-moved="${p.cartMoved}" data-open-door="${landing && n.events.includes("plate-open-door")}" data-silhouette="${landing && (n.events.includes("hall-silhouette") || p.inspected.includes("photo"))}" data-cabinet="${west}" data-cabinet-open="${p.cabinetOpen}" data-power="${p.servicePower}" data-b3="${!landing}"></div><div class="cctv-osd"><span>CAM 0${landing ? "2" : "3"} / ${landing ? "WEST HALL" : "SERVICE"}</span><span>LOCAL VIEW</span></div><div class="cctv-osd bottom"><span>2006-10-17 03:17:00</span><span>${p.servicePower ? "ACCESS" : "HOLD"}</span></div><div class="scene-hotspots">${landing ? '<button data-night-action="inspect" data-target="plate" class="hotspot plate" aria-label="' + t("查看 317 门牌", "Inspect 317 plate") + '">317</button><button data-night-action="inspect" data-target="peephole" class="hotspot peephole" aria-label="' + t("看猫眼", "Look through peephole") + '">◉</button><button data-night-action="inspect" data-target="photo" class="hotspot photo" aria-label="' + t("翻看员工合照", "Turn over staff photograph") + '">' + t("合照", "PHOTO") + "</button>" : west ? '<button data-night-action="inspect" data-target="cart" class="hotspot cart" aria-label="' + t("挪开推车", "Move cart") + '">' + t("推车", "CART") + '</button><button data-night-action="inspect" data-target="cabinet" class="hotspot cabinet" aria-label="' + t("打开维修柜", "Open cabinet") + '">' + t("维修柜", "CABINET") + "</button>" : '<button data-night-action="inspect" data-target="enter" class="hotspot b3" aria-label="' + t("推开 B-3 的门", "Open B-3 door") + '">B-3</button>'}</div></div><aside class="space-controls"><h2>${t("附近", "Within reach")}</h2><div class="space-actions">${controls}${button("notice", t("查看维修告示", "Read service notice"))}</div><div class="space-observations" role="status">${info.map((line) => `<p>${line}</p>`).join("")}</div><p id="night-feedback" role="status"></p><nav aria-label="${t("通道方向", "Passage directions")}">${[
        "landing",
        "west",
        "service",
      ]
        .filter((v) => v !== p.position)
        .map(
          (v) =>
            `<button data-night-action="walk" data-position="${v}">${v === "landing" ? t("回头看 317", "Look back toward 317") : v === "west" ? t("走向西侧维修柜", "Go to west cabinet") : t("走到 B-3 门口", "Approach B-3")}</button>`,
        )
        .join(
          "",
        )}</nav><p><a href="#cameras">${t("返回监控台", "Return to camera desk")} →</a>${p.complete ? ' · <a href="#terminal">' + t("进入配线室", "Enter patch room") + " →</a>" : ""}</p></aside></section>`;
    },
  };
};
