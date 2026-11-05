/* Small local interactions for eight independent, fictional popup formats. */
globalThis.StillwaterExtraAds = {
  meta: {
    scratch: {
      layout: "scratch",
      title: ["AD · 小卖部刮刮券", "AD · Corner shop scratch card"],
      effect: "lights",
    },
    parcel: {
      layout: "receipt",
      title: ["AD · 包裹到站提醒", "AD · Parcel arrival slip"],
      effect: "none",
    },
    photobooth: {
      layout: "filmstrip",
      title: ["AD · 三秒连拍", "AD · Three-second portraits"],
      effect: "none",
    },
    aquarium: {
      layout: "fishtank",
      title: ["AD · 桌面屏保小样", "AD · Desktop aquarium demo"],
      effect: "none",
    },
    pocket: {
      layout: "handset",
      title: ["AD · 本周手机壁纸", "AD · Pocket wallpaper picks"],
      effect: "none",
    },
    noodles: {
      layout: "takeaway",
      title: ["AD · 夜宵还有一份", "AD · One more late-night bowl"],
      effect: "blink",
    },
    books: {
      layout: "newspaper",
      title: ["AD · 路边旧书小报", "AD · Pavement books bulletin"],
      effect: "none",
    },
    karaoke: {
      layout: "jukebox",
      title: ["AD · 今晚你来点歌", "AD · Tonight’s request desk"],
      effect: "lights",
    },
  },
  create({ t, esc, photo }) {
    const text = (zh, en) => esc(t(zh, en));
    const button = (action, zh, en, attrs = "") =>
      `<button type="button" data-ad-toy="${action}" ${attrs}>${text(zh, en)}</button>`;
    const status = () => '<p class="ad-toy-status" role="status"></p>';
    const finish = (ad) =>
      `<button class="ad-offer-button" data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.cta))} →</button><p class="ad-shop-name">${esc(t(...ad.name))}</p>`;
    function body(ad) {
      let content = "";
      switch (ad.id) {
        case "scratch":
          content = `<p class="ad-teaser">${text("★ 人人有份 ★", "★ ONE EACH ★")}</p><h2>${text("大奖就藏在底下", "YOUR PRIZE IS UNDER HERE")}</h2><div class="ad-scratch-ticket"><span>LUCKY SHOP</span>${button("scratch", "点这里刮开", "SCRATCH HERE", 'class="ad-scratch-cover"')}<strong class="ad-scratch-prize" hidden>${text("全新纸巾一张", "ONE FRESH TISSUE")}</strong></div>${status()}`;
          break;
        case "parcel":
          content = `<div class="ad-receipt-top"><span>PARCEL / 006</span><b>${text("到站", "ARRIVED")}</b></div><h2>${text("有个包裹等你看看", "A PARCEL IS WAITING")}</h2><dl class="ad-receipt-fields"><div><dt>${text("件数", "ITEMS")}</dt><dd>01</dd></div><div><dt>${text("备注", "NOTE")}</dt><dd>${text("轻拿，里面东西不多", "HANDLE WITH CARE. MOSTLY BOX.")}</dd></div></dl><div class="ad-slip-barcode" aria-hidden="true"></div>${button("parcel", "翻到面单背面", "TURN THE SLIP OVER")}${status()}`;
          break;
        case "photobooth":
          content = `<p class="ad-film-label">PHOTO AUTOMAT · 3 × 1</p><div class="ad-contact-strip">${ad.galleryIds.map((id) => photo(id)).join("")}</div><h2>${text("总有一张没闭眼", "ONE WITH THE EYES OPEN")}</h2>${button("photo", "换一张放前面", "TRY ANOTHER AT THE FRONT")}${status()}`;
          break;
        case "aquarium":
          content = `<p class="ad-tank-menu">FILE　VIEW　FISH　?</p><h2>${text("电脑在忙，你先看鱼", "BUSY COMPUTER. IDLE FISH.")}</h2><div class="ad-fish-tank" aria-hidden="true"><span class="ad-toy-fish">&gt;&lt;(((°&gt;</span><span class="ad-toy-fish">&lt;°)))&gt;&lt;</span><span class="ad-toy-fish">&gt;&lt;((°&gt;</span><i>♧　♧　　　♧</i></div>${button("fish", "喂一粒", "FEED ONE FLAKE", 'aria-pressed="false"')}${status()}`;
          break;
        case "pocket":
          content = `<div class="ad-handset"><div class="ad-handset-speaker" aria-hidden="true"></div><div class="ad-phone-screen"><small>10:08　▰▰▰</small><div class="ad-wallpaper">${photo("ad-clouds")}</div></div><div class="ad-handset-keys" aria-hidden="true">1　2　3<br>4　5　6<br>7　8　9<br>＊ 0 ＃</div></div><h2>${text("换张壁纸，接着用", "A FRESH LOOK. SAME PHONE.")}</h2><div class="ad-toy-choices">${button("wallpaper", "晴天", "SKY", 'data-choice="ad-clouds" aria-pressed="true"')}${button("wallpaper", "猫", "CAT", 'data-choice="ad-cat-tabby" aria-pressed="false"')}</div>${status()}`;
          break;
        case "noodles":
          content = `<p class="ad-teaser">${text("饿了？夜宵还没收摊", "HUNGRY? WE’RE STILL OPEN")}</p><div class="ad-noodle-deal">${photo(ad.imageId)}<div><strong>¥2.5</strong><span>${text("水开了才计时", "THREE MINUTES AFTER IT BOILS")}</span></div></div><h2>${text("先挑口味，水还没开", "PICK A FLAVOUR. KETTLE’S ON.")}</h2><div class="ad-toy-choices">${button("flavour", "葱香", "ONION", 'data-choice="onion" aria-pressed="false"')}${button("flavour", "微辣", "MILD", 'data-choice="chilli" aria-pressed="false"')}</div>${status()}`;
          break;
        case "books":
          content = `<p class="ad-paper-masthead">${text("旧 书 小 报", "THE USED BOOK POST")}</p><p class="ad-paper-date">${text("每周一本 · 看完再来", "ONE A WEEK · COME BACK WHEN YOU’RE DONE")}</p><div class="ad-book-columns"><h2>${text("封面挺新", "FRESH COVER.")}<br>${text("内容读过", "WELL-READ PAGES.")}</h2><b>2<small>${text("元起", "COINS UP")}</small></b></div>${button("books", "翻到实用手册栏", "TURN TO USEFUL MANUALS", 'aria-pressed="false"')}${status()}`;
          break;
        case "karaoke":
          content = `<p class="ad-teaser">${text("本店麦克风今天有电", "MIC BATTERIES CHARGED TODAY")}</p><h2>${text("今晚你来点一首", "YOUR TURN TO PICK")}</h2><div class="ad-karaoke-display"><span aria-hidden="true">▂ ▅ ▃ ▇ ▄ ▆ ▂</span><output class="ad-toy-status" role="status">${text("还没人点歌", "NO REQUEST YET")}</output></div><div class="ad-song-keys">${button("song", "01 隔壁还没睡", "01 STILL AWAKE NEXT DOOR", 'data-choice="nextdoor" aria-pressed="false"')}${button("song", "02 明天再说", "02 ASK ME TOMORROW", 'data-choice="tomorrow" aria-pressed="false"')}</div>`;
          break;
        default:
          return "";
      }
      return `<div class="ad-card-body ad-extra-body ad-extra-${ad.id}">${content}${finish(ad)}</div>`;
    }
    function handle(event) {
      const control = event.target.closest("[data-ad-toy]");
      const card = control?.closest("#ad-host [data-active-ad]");
      if (!card) return false;
      const action = control.dataset.adToy,
        id = card.dataset.activeAd;
      const expected = {
        scratch: "scratch",
        parcel: "parcel",
        photo: "photobooth",
        fish: "aquarium",
        wallpaper: "pocket",
        flavour: "noodles",
        books: "books",
        song: "karaoke",
      };
      if (expected[action] !== id) return false;
      const out = card.querySelector(".ad-toy-status");
      const set = (zh, en) => {
        out.textContent = t(zh, en);
      };
      const choose = () =>
        card
          .querySelectorAll(`[data-ad-toy="${action}"]`)
          .forEach((el) =>
            el.setAttribute("aria-pressed", String(el === control)),
          );
      if (action === "scratch") {
        control.hidden = true;
        card.querySelector(".ad-scratch-prize").hidden = false;
        set(
          "老板：擦擦手，接着逛。",
          "Owner says: clean hands, carry on browsing.",
        );
        // A revealed cover leaves focus on the card’s real shop link.
        card
          .querySelector("[data-ad-action=detail]")
          .focus({ preventScroll: true });
      } else if (action === "parcel") {
        const back = control.getAttribute("aria-pressed") !== "true";
        control.setAttribute("aria-pressed", String(back));
        set(
          back ? "背面写着：一卷胶带，五层包装。" : "面单已翻回正面。",
          back
            ? "Back of slip: one roll of tape, five layers of wrapping."
            : "The slip is facing front again.",
        );
      } else if (action === "photo") {
        const strip = card.querySelector(".ad-contact-strip");
        strip.append(strip.firstElementChild);
        set(
          "这张放前面。其余两张也留着。",
          "That one at the front. Keep the other two as well.",
        );
      } else if (action === "fish") {
        const fed = control.getAttribute("aria-pressed") !== "true";
        control.setAttribute("aria-pressed", String(fed));
        card.querySelector(".ad-fish-tank").dataset.fed = String(fed);
        control.textContent = fed
          ? t("让它们游", "LET THEM SWIM")
          : t("喂一粒", "FEED ONE FLAKE");
        set(
          fed ? "都过来了。一粒够了。" : "吃完了，又游走了。",
          fed
            ? "Here they come. One flake was plenty."
            : "All gone. Back to swimming.",
        );
      } else if (
        action === "wallpaper" &&
        ["ad-clouds", "ad-cat-tabby"].includes(control.dataset.choice)
      ) {
        choose();
        card.querySelector(".ad-wallpaper").innerHTML = photo(
          control.dataset.choice,
        );
        set(
          "已换好，还是原来那台手机。",
          "New wallpaper. Still the same phone.",
        );
      } else if (
        action === "flavour" &&
        ["onion", "chilli"].includes(control.dataset.choice)
      ) {
        choose();
        set(
          control.dataset.choice === "onion"
            ? "葱香：先吹一吹，还烫着。"
            : "微辣：水在右手边。",
          control.dataset.choice === "onion"
            ? "Onion: let it cool a little."
            : "Mild: water’s on your right.",
        );
      } else if (action === "books") {
        const manuals = control.getAttribute("aria-pressed") !== "true";
        control.setAttribute("aria-pressed", String(manuals));
        control.textContent = manuals
          ? t("翻回故事书栏", "BACK TO STORIES")
          : t("翻到实用手册栏", "TURN TO USEFUL MANUALS");
        set(
          manuals
            ? "《收纳入门》：没找着，摊主还在翻。"
            : "《睡前故事》：上位读者看到一半睡着了。",
          manuals
            ? "Tidying for Beginners: missing. Owner still looking."
            : "Bedtime Stories: the last reader fell asleep halfway through.",
        );
      } else if (
        action === "song" &&
        ["nextdoor", "tomorrow"].includes(control.dataset.choice)
      ) {
        choose();
        set(
          control.dataset.choice === "nextdoor"
            ? "已点：隔壁还没睡"
            : "已点：明天再说",
          control.dataset.choice === "nextdoor"
            ? "QUEUED: STILL AWAKE NEXT DOOR"
            : "QUEUED: ASK ME TOMORROW",
        );
      }
      return true;
    }
    return { body, handle };
  },
};
