/* Contextual document references. No stage numbers or objectives are shown to visitors. */
window.StillwaterExploration = (() => {
  const known = ['room-status', 'review-reply', 'west-notice', 'register', 'room-307', 'diary', 'rowan', 'camera', 'letter', 'maintenance', 'rules'];
  const fresh = () => ({ seen: [] });
  function hydrate(raw) {
    return { seen: Array.isArray(raw?.seen) ? [...new Set(raw.seen.filter(id => known.includes(id)))] : [] };
  }
  function create({ getState, save, collect, actions, escape }) {
    const zh = document.documentElement.lang === 'zh-CN';
    const t = (a, b) => zh ? a : b;
    const state = () => getState();
    const seen = id => state().exploration.seen.includes(id);
    const remember = id => {
      if (!known.includes(id) || seen(id)) return;
      state().exploration.seen.push(id);
      save();
    };
    const link = (url, label) => `<a class="underlined" href="${url}">${label} →</a>`;
    const button = (action, label) => `<button class="underlined" data-action="${action}">${label} →</button>`;
    const reference = content => `<div class="document-reference" data-puzzle-original><p>${t('随附资料', 'ENCLOSED REFERENCE')}</p>${content}</div>`;
    const keyForTitle = {
      'The opening-night register': 'register',
      'The notebook under the pillow': 'diary',
      'A letter to the next guest': 'letter',
      'Maintenance log': 'maintenance',
      'A few house traditions': 'rules',
      'Room 307 — your room': 'room-307',
      'Public-area security': 'camera',
    };
    function departureReference() {
      const s = state();
      if (!s.clues.includes('register')) return link('#history?file=ledger', t('开业当晚的登记簿', 'The opening-night register'));
      if (!s.staff) return link('#employees', t('夜班档案索引', 'Night-desk archive index'));
      if (!s.checkedIn) return link('#reservations?source=mail', t('307 号房的领取登记', 'Room 307 collection record'));
      if (!s.clues.includes('clock')) return '<button class="underlined" data-room="307">'+t('307 号房留存物品', 'Room 307 retained belongings')+' →</button>';
      if (!s.clues.includes('ribbon')) return link('#guestbook?entry=rowan', t('E. Rowan 的附页', 'E. Rowan’s attached page'));
      if (!s.clues.includes('door')) return button('monitor', t('三层走廊留存录像 · 02 机位', 'Third-floor corridor footage · Camera 02'));
      if (!s.clues.includes('letter')) return button('letter', t('307 号房的未送达信件', 'Undelivered correspondence · Room 307'));
      if (!s.clues.includes('switch')) return button('maintenance', t('信封附带的维修记录', 'Maintenance record enclosed with the letter'));
      return '<button class="underlined" data-room="404">'+t('录像中未列出的房间', 'The unlisted room in the recording')+' →</button>';
    }
    function normalGuidelines(root) {
      const heading = root.querySelector('#dialog-title').outerHTML;
      root.innerHTML = heading + `<div data-puzzle-original><p class="document-intro">${t('入住时间为 15:00 起，安静时段为 22:00—次日 7:00。前台全天有人值班。', 'Check-in begins at 15:00. Quiet hours are 22:00–07:00. Reception is staffed around the clock.')}</p><p>${t('早餐在一层餐厅供应，时间为 7:00—9:00。如需加配床品或晚到安排，请联系前台。', 'Breakfast is served in the ground-floor dining room from 07:00 to 09:00. Contact reception for extra bedding or late-arrival arrangements.')}</p><p>${t('三层西翼正在维护，具体通行安排以当日公告为准。', 'The west end of the third floor is undergoing maintenance. Please refer to the current access notice.')}</p>${reference(link('#guide?notice=west', t('三层通行公告', 'Third-floor access notice')))}<div class="dialog-actions"><button class="paper-button" data-page="reservations">${t('返回入住登记', 'Return to registration')} →</button></div></div>`;
    }
    function removeOldReferences(root) {
      root.querySelectorAll(':scope > .dialog-actions').forEach(el => el.remove());
    }
    function recordVisible(root) {
      root.querySelectorAll('[data-clue]').forEach(el => {
        if (el.closest('details:not([open])')) return;
        collect(el.dataset.clue, true);
        el.textContent = t('副本已保存在本设备', 'Copy retained on this device');
        el.disabled = true;
        el.classList.add('retained-copy');
      });
    }
    function documentView(title, root) {
      const key = keyForTitle[title];
      root.querySelectorAll('.ledger-table .marked').forEach(el => el.classList.remove('marked'));
      root.querySelectorAll('.printed-menu li > b').forEach(el => el.replaceWith(document.createTextNode(el.textContent)));
      if (title === 'A few house traditions' && !seen('room-307') && !state().clues.includes('clock') && !state().staff && state().chapter === 1) {
        normalGuidelines(root);
        return;
      }
      const facility = {
        'The dining room': [t('早餐供应时间为每日 7:00—9:00，餐厅位于一层。饮食需求请向前台说明。', 'Breakfast is served from 07:00 to 09:00 in the ground-floor dining room. Contact reception about dietary requirements.'), t('餐厅留存服务卡', 'Retained dining-room card')],
        'The reading room': [t('阅览室位于东翼，备有图书、地方志和书桌。借阅登记保存在室内资料夹中。', 'The reading room is in the east wing, with books, local histories and a writing desk. Lending records are kept in the room folder.'), t('阅览室使用记录', 'Reading-room records')],
        'The courtyard walk': [t('从大堂可进入庭院。喷泉旁设有座椅，晚间请注意台阶。', 'The courtyard opens from the lobby. Seating is available beside the fountain; take care on the steps after dark.'), t('庭院留存说明', 'Retained courtyard information')],
        'Lost property, awaiting collection': [t('如有遗失物品，请联系前台。领取时请核对物品描述与寄存标签。', 'Contact reception about lost belongings. Please check the item description and storage tag before collection.'), t('查看失物登记原件', 'View the lost-property record')],
      }[title];
      if (facility && !state().clues.length && !state().staff && !seen('diary') && !state().sideQuests.dylan.met && state().chapter === 1) {
        const copy = document.createElement('div');
        copy.innerHTML = root.innerHTML;
        const heading = copy.querySelector('#dialog-title').outerHTML;
        copy.querySelector('#dialog-title').remove();
        root.innerHTML = heading + `<p class="document-intro" data-puzzle-original>${facility[0]}</p><details class="facility-records"><summary>${facility[1]}</summary>${copy.innerHTML}</details>`;
        return;
      }
      if (title === 'Third-floor maintenance' && !state().staff && !state().clues.length && state().chapter === 1) {
        const copy = document.createElement('div'); copy.innerHTML = root.innerHTML;
        const heading = copy.querySelector('#dialog-title').outerHTML; copy.querySelector('#dialog-title').remove();
        root.innerHTML = heading + `<div data-puzzle-original>${notice()}</div><details class="facility-records"><summary>${t('旧版修缮附页', 'Earlier conservation attachment')}</summary>${copy.innerHTML}</details>`;
        remember('west-notice');
        return;
      }
      if (title === 'Original photograph captions' && state().chapter < 2) {
        const heading = root.querySelector('#dialog-title').outerHTML;
        root.innerHTML = heading + `<div data-puzzle-original><p class="document-intro">${t('旅馆影像登记 / 001-B / 公开副本', 'Hotel photograph record / 001-B / Public copy')}</p><p>${t('题签写着“维尔夫妇与当班前台”。这份公开副本裁掉了右侧的身份卡。原始题签与早期员工名册一同保存，不在公开目录中。', 'The caption reads “The Vales with the relief porter.” This public copy has been cropped at the right-hand identification strip. The original captions are filed with the early staff census, outside the public catalogue.')}</p>${reference(link('#employees', t('夜班档案目录', 'Night-desk archive catalogue')))}</div>`;
        return;
      }
      if (key) remember(key);
      if (title === 'A letter to the next guest' && (!state().checkedIn || !state().clues.includes('clock') || !state().clues.includes('ribbon') || !state().clues.includes('door'))) {
        // The complete original letter remains accessible by deliberate expansion.
        const heading = root.querySelector('#dialog-title').outerHTML;
        const copy = document.createElement('div');
        copy.innerHTML = root.innerHTML;
        copy.querySelector('#dialog-title')?.remove();
        root.innerHTML = heading + `<div class="mail-cover" data-puzzle-original><p class="eyebrow">0307 / ${t('未送达信件', 'UNDELIVERED MAIL')}</p><p>${t('信封上只有“交下一位 307 号房住客”几个字。签收栏空着，转交记录里夹着一张罗温的附页和一份走廊录像索引。', 'The envelope reads “To the next occupant of Room 307.” Its collection field is blank. The forwarding record refers to Rowan’s attached page and a corridor recording.')}</p>${reference(departureReference())}</div><details class="sealed-correspondence"><summary>${t('展开留存信件', 'Unfold the retained letter')}</summary>${copy.innerHTML}</details>`;
        return;
      }
      recordVisible(root);
      let next = '';
      if (key === 'register') next = link('#employees', t('夜班档案索引', 'Night-desk archive index'));
      if (key === 'diary') next = link('#guestbook?entry=rowan', t('笔记提到的 E. Rowan 附页', 'E. Rowan’s page mentioned in the notebook'));
      if (key === 'letter') next = button('maintenance', t('随信归档：铜钟维修记录', 'Filed with this letter: clock maintenance record'));
      if (key === 'maintenance') next = departureReference();
      if (key === 'camera' && root.querySelector('[data-camera="2"][aria-pressed="true"]')) {
        next = state().clues.includes('ribbon') ? link('#employees?file=letter', t('307 号房未送达信件', 'Undelivered correspondence · Room 307')) : link('#guestbook?entry=rowan', t('同日归档：E. Rowan 附页', 'Filed on the same date: E. Rowan’s page'));
      }
      if (next) {
        removeOldReferences(root);
        root.insertAdjacentHTML('beforeend', reference(next));
      }
      // The floor plan itself has five rooms. The recording is what reveals the extra door.
      if (title === 'The third-floor directory' && !state().clues.includes('door')) {
        root.querySelector('[data-room="404"]')?.setAttribute('hidden', '');
        root.querySelector(':scope > .file-note')?.remove();
      }
      if (title === 'The Residence') root.insertAdjacentHTML('beforeend', roomStatus());
      if (title === 'A choice of departures' && (!state().checkedIn || ['clock','door','ribbon','register','switch','letter'].some(id => !state().clues.includes(id)))) {
        const copy = root.querySelector('.ending-option.special p');
        if (copy) copy.textContent = t('留在柜台的交接封套里少了一份原件。封面上保留着最后一次转交的出处。', 'An original is missing from the handover envelope. Its cover retains the last forwarding reference.');
        root.querySelector('.ending-option.special')?.insertAdjacentHTML('beforeend', reference(departureReference()));
      }
    }
    function roomStatus() {
      return `<aside class="room-availability" data-puzzle-original><p>${t('房态说明 · 10 月 3 日起，三层西翼客房暂停安排。长住客房请联系前台确认所在区域。', 'Availability · West-wing rooms on the third floor have been out of service since October 3. Contact reception to confirm the location of long-stay accommodation.')}</p>${link('#guestbook?review=307', t('住客入住评价', 'Guest stay reviews'))}</aside>`;
    }
    function archiveEntries() {
      const host = document.querySelector('#guestbook-archive-entries');
      if (!host) return;
      [...host.children].forEach(entry => {
        if (entry.classList.contains('dylan-public-entry')) return;
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = entry.querySelector('.entry-meta')?.textContent || t('留存留言', 'Retained entry');
        details.className = entry.classList.contains('suspect') ? 'rowan-leaf retained-entry' : 'retained-entry';
        if (entry.classList.contains('suspect')) details.dataset.observe = 'rowan';
        host.insertBefore(details, entry);
        details.append(summary, entry);
      });
      const rowan = host.querySelector('.rowan-leaf');
      rowan?.insertAdjacentHTML('beforeend', reference(button('monitor', t('附页提到的三层走廊录像 · 02 机位', 'Corridor recording cited on the page · Camera 02'))));
    }
    function guestReview() {
      const entries = document.querySelectorAll('.book-layout > section > .guest-entry:not(.local-guest-entry)');
      const entry = entries[2];
      if (!entry) return;
      entry.classList.add('recent-307-review');
      entry.setAttribute('data-puzzle-original', '');
      entry.querySelector('.entry-meta').innerHTML = `<span>L. Chen · ${t('307 号房', 'Room 307')}</span><time datetime="2026-10-12">${t('2026 年 10 月 12 日', '12 October 2026')}</time>`;
      entry.querySelector('blockquote').textContent = t('“10 月 12 日到店，前台安排了三层西翼的 307 号房。房间很安静，早餐也不错。”', '“Arrived on October 12 and was given Room 307 in the third-floor west wing. A quiet room and a good breakfast.”');
      entry.insertAdjacentHTML('beforeend', `<details class="reception-reply" data-observe="review-reply"><summary>${t('前台回复', 'Response from reception')}</summary><p>${t('谢谢您的评价。您提到的房号不在本期开放名单中，我们正在核对前台记录。通行安排已补充在三层公告内。', 'Thank you for your review. The room number mentioned is not on the current availability list. We are checking the reception records; the third-floor notice has been updated with access information.')}</p>${link('#guide?notice=west', t('三层通行公告', 'Third-floor access notice'))}</details>`);
    }
    function notice() {
      return `<section class="west-access-notice" id="west-access-notice" data-puzzle-original><p class="eyebrow">${t('前台公告 · 10 月 3 日', 'RECEPTION NOTICE · OCTOBER 3')}</p><h2>${t('三层西翼通行安排', 'Third-floor west-wing access')}</h2><p>${t('三层西翼自 10 月 3 日起暂停安排入住，已预订的住客由前台调整至其他区域。晚到住客请先到前台领取当日房卡。', 'West-wing rooms on the third floor have been out of service since October 3. Reception will relocate existing bookings. Late arrivals should collect their current room card at the desk.')}</p><p>${t('关于近期评价中提到的 307 号房：现行名单已停用该房号，旧登记资料仍保留原编号。早期房号及接待记录请见旅馆收藏的开业登记页。', 'Regarding the recent review mentioning Room 307: the number is no longer in the current availability list, but remains in the older register. Early room assignments and reception records are held with the opening-night page in the hotel collection.')}</p>${link('#history?file=ledger', t('公告所引的开业登记页', 'Opening register cited in this notice'))}</section>`;
    }
    function pageView(route) {
      const main = document.querySelector('#page-content');
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      if (route === 'rooms') {
        main.querySelector('.room-grid')?.insertAdjacentHTML('afterend', roomStatus());
      }
      if (route === 'guide') {
        const block = document.createElement('details');
        block.className = 'public-access-notice';
        block.dataset.observe = 'west-notice';
        block.innerHTML = `<summary>${t('三层西翼通行公告', 'Third-floor west-wing access notice')}</summary>${notice()}`;
        main.querySelector('.service-facts')?.after(block);
        if (params.get('notice') === 'west') block.open = true;
        if (!state().staff && !state().clues.length && state().chapter === 1) {
          main.querySelectorAll('.service-notices [data-action="switchboard"], .service-notices [data-action="residents"], .service-notices [data-action="photograph"]').forEach(el => el.hidden = true);
        }
      }
      if (route === 'guestbook') {
        guestReview();
        archiveEntries();
        if (params.get('entry') === 'rowan' || params.get('entry') === 'dylan') {
          main.querySelector('.guestbook-archive').open = true;
          if (params.get('entry') === 'rowan') {
            const leaf = main.querySelector('.rowan-leaf');
            if (leaf) { leaf.open = true; requestAnimationFrame(() => leaf.isConnected && leaf.scrollIntoView({ block: 'start' })); }
          }
        }
      }
      if (route === 'history') {
        const timeline = main.querySelector('.timeline');
        if (timeline?.children.length > 1) {
          const years = document.createElement('details');
          years.className = 'hotel-timeline';
          years.innerHTML = `<summary>${t('历年纪要', 'Through the years')}</summary>`;
          [...timeline.children].slice(1).forEach(el => years.append(el));
          timeline.after(years);
        }
      }
      if (route === 'employees' && state().staff) {
        const grid = main.querySelector('.document-grid');
        if (grid) {
          const primary = grid.querySelector('[data-action="letter"]');
          primary.querySelector('p:not(.eyebrow)').textContent = t('307 号房留存信封，签收栏空白。', 'Retained envelope for Room 307. Collection field blank.');
          primary.querySelector('h2').textContent = t('307 号房未送达信件', 'Undelivered correspondence · Room 307');
          const others = document.createElement('details');
          others.className = 'archive-file-index';
          others.innerHTML = `<summary>${t('其他留存档案', 'Other retained files')}</summary><div class="document-grid"></div>`;
          const target = others.querySelector('div');
          [...grid.children].forEach(el => {
            if (el === primary) return;
            const note = el.querySelector('p:not(.eyebrow)');
            if (note) { note.textContent = t('原件副本 · 夜班留存', 'Original copy · Retained by the night desk'); note.setAttribute('data-puzzle-original', ''); }
            target.append(el);
          });
          grid.after(others);
        }
      }
      if (route === 'reservations' && params.get('source') === 'mail' && !state().checkedIn) {
        main.querySelector('.page-heading')?.insertAdjacentHTML('beforeend', `<p class="mail-arrival-note" data-puzzle-original>${t('307 号房留有一封未送达信件。前台需先登记领取人，可使用昵称。', 'An undelivered envelope is held for Room 307. Reception needs a collection name; a nickname is sufficient.')}</p>`);
      }
      // Known file references only. Invalid and premature links remain readable with an ordinary recovery path.
      if ((route === 'history' && params.get('file') === 'ledger') || (route === 'employees' && state().staff && params.get('file') === 'letter')) {
        const action = params.get('file');
        queueMicrotask(() => { if (!document.querySelector('#story-dialog').open) actions[action]?.(); });
      }
      if (route === 'guestbook' && params.get('review') === '307') requestAnimationFrame(() => main.querySelector('.recent-307-review')?.scrollIntoView({ block: 'center' }));
    }
    document.addEventListener('toggle', event => {
      const el = event.target;
      if (!(el instanceof HTMLDetailsElement) || !el.open) return;
      if (el.dataset.observe) remember(el.dataset.observe);
      if (el.dataset.observe === 'rowan') collect('ribbon', true);
      if (el.closest('#story-dialog') || el.classList.contains('rowan-leaf')) recordVisible(el);
    }, true);
    return { pageView, documentView, departureReference };
  }
  return { create, fresh, hydrate };
})();
