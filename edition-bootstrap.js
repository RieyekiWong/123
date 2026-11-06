/* One edition per document. The opt-in prototype never starts the 1.x app. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const preview = params.get('edition') === '2.0' || location.hash.startsWith('#sw2/');
  const version = '4.20.0';
  const common = [
    'site-media.js', 'chat-data.js', 'chat-personas.js', 'chat-protocol.js',
    'chat-fallback.js', 'chat-model.js', 'chat-config.js', 'chat-transport.js',
    'chat-photos.js', 'sw2-data.js', 'sw2-progress.js', 'sw2-chat-story.js',
    'chat-view.js', 'messenger-intrusion.js', 'messenger-bridge.js',
    'ad-data.js', 'ad-extra-campaigns.js', 'ad-campaigns.js', 'ad-system.js',
    'case-audio-tracks.js', 'case-audio-policy.js', 'case-audio.js',
    'case-night-model.js', 'case-ending.js', 'sw2-pages.js', 'sw2-story.js', 'sw2-app.js',
  ];
  globalThis.StillwaterEdition = Object.freeze({ id: preview ? '2.0' : 'v13', prototype: preview });
  if (preview) document.documentElement.dataset.edition = 'sw2';
  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(src));
      document.head.append(script);
    });
  }
  async function start() {
    if(params.get('edition')==='choose'){
      const zh=document.documentElement.lang==='zh-CN',root=document.querySelector('#case-shell');
      root.innerHTML=`<main id="content" tabindex="-1"><h1>${zh?'选择调查版本':'Choose an edition'}</h1><p>${zh?'原来的调查和聊天记录保留。2.0 目前是独立存档的文字开发预览。':'Your existing investigation and chats are retained. The 2.0 text prototype has a separate save.'}</p><p><a data-edition="current" href="${location.pathname}">${zh?'继续现有调查':'Continue the current investigation'}</a></p><p><a data-edition="prototype" href="${location.pathname}?edition=2.0">${zh?'进入 2.0 开发预览':'Open the 2.0 development preview'}</a></p></main>`;
      return;
    }
    if (preview) {
      const style = document.createElement('link');
      style.rel = 'stylesheet'; style.href = 'sw2-style.css?v=' + version;
      document.head.append(style);
    }
    const sources = preview ? common.map(file => file + '?v=' + version) :
      [...document.querySelectorAll('script[data-legacy-src]')].map(script => script.dataset.legacySrc);
    for(const src of sources){const preload=document.createElement('link');preload.rel='preload';preload.as='script';preload.href=src;document.head.append(preload);}
    for (const src of sources) await load(src);
  }
  function failure() {
    const root = document.querySelector('#case-shell');
    root.replaceChildren();
    const message = document.createElement('p');
    message.textContent = document.documentElement.lang === 'zh-CN' ?
      '页面文件未能完整加载，请刷新后重试。' :
      'The page files could not finish loading. Refresh to retry.';
    root.append(message);
  }
  void start().catch(failure);
})();
