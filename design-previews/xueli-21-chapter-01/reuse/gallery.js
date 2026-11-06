import { counts, items, sources } from './catalog.js';

const root = document.querySelector('#reuse-root');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = { ready: '现成可用', components: '组件 · 尚非整图', original: '仍需原创 / 待定', existing: '原项目已有', all: '全部需求' };
let filter = 'ready';
function example(item) {
  if (item.kind === 'icon') return `<span class="art borrowed-art palette-${escape(item.palette || 'gold')}"><img src="${escape(item.file)}" width="48" height="48" alt="像素图形预览"></span>`;
  return `<span class="reuse-example-cell"><span class="reuse-sprite" data-file="${escape(item.file)}" data-index="${item.index}" data-tile="${item.tile}" data-cols="${item.columns}" data-rows="${item.rows}" role="img" aria-label="原始图集组件 ${item.index}"></span></span>`;
}
function card(item) {
  const pictures = item.status === 'ready' ? example(item) : item.status === 'components' ? item.examples.map(example).join('') : item.status === 'existing' ? `<a class="reuse-existing" href="${escape(item.file)}" target="_blank" rel="noopener">查看原项目已批准的鬼脸 ↗</a>` : '<span class="reuse-placeholder">需要画</span>';
  const ids = item.status === 'components' ? [...new Set(item.examples.map(e => e.source))] : item.source ? [item.source] : [];
  const credit = ids.map(id => {const source=sources.find(s=>s.id===id);return `${source.title} / ${source.license}`;}).join('；');
  return `<article class="reuse-item" data-status="${item.status}" data-item="${escape(item.id)}"><p class="reuse-id">${escape(item.id)}.png</p><div class="reuse-examples">${pictures}</div><h2>${escape(item.title)}</h2><p class="reuse-status ${item.status}">${labels[item.status]}</p><p>${escape(item.reason)}</p>${credit ? `<div class="reuse-credit">${escape(credit)}</div>` : ''}</article>`;
}
function render() {
  const visible = filter === 'all' ? items : items.filter(item => item.status === filter);
  root.innerHTML = `<main class="reuse-shell"><nav class="reuse-top"><span class="pixel">STILLWATER / ART SELECTION</span><a href="../index.html">返回开发样本 →</a></nav><header class="reuse-intro"><h1>哪些可以直接用，哪些还得画？</h1><p>按原来的 69 项美术需求逐项筛选。通用图标用同一套像素库；完整照片、人物与剧情地标继续按故事制作。这里是开发素材页，不读取游戏或聊天存档。</p><div class="reuse-counts"><span>现成可用 ${counts.ready}</span><span>可用组件 ${counts.components}</span><span>原项目已有 ${counts.existing}</span><span>仍需原创 / 待定 ${counts.original}</span></div><p class="reuse-count-label">数字按需求项统计，多个需求可以复用同一个源文件。组件不等于已经做好的场景；本次没有生成新插图。</p></header><nav class="reuse-filters" aria-label="筛选素材">${['ready','components','original','existing','all'].map(key=>`<button data-filter="${key}" aria-pressed="${filter===key}">${labels[key]} ${key==='all'?items.length:counts[key]}</button>`).join('')}</nav><p class="reuse-summary" aria-live="polite">${filter==='components'?'这些只是经过核对的零件。还要拼构图、统一视角，并补个人物件和剧情细节；没有把它们算成免画的整张图。':filter==='original'?'这 21 项需要人物与场景前后对应，或尚待剧本确定。请按原画稿的优先级制作，不必现在全部画完。':filter==='existing'?'保留原项目中已经批准的 NULL 与信号表现，不在正常开场播放。点击链接后才查看原脸图。':'先使用已经核实许可、风格统一的通用图形。四个当前程序图标与 GGbond 头像已经接入开发样本。'}</p><section class="reuse-grid" aria-label="素材清单">${visible.map(card).join('')}</section><section class="reuse-sources"><h2>来源与使用许可</h2>${sources.map(source=>`<article class="reuse-source"><h3>${escape(source.title)}</h3><p>${escape(source.author)} · ${escape(source.license)}</p><p>${escape(source.usage)}</p><p><a href="${escape(source.url)}" target="_blank" rel="noopener">来源与作者</a>${source.licenseFile?`<a href="${escape(source.licenseFile)}" target="_blank" rel="noopener">本地许可记录</a>`:''}</p></article>`).join('')}</section><p class="reuse-note">保留原始 SVG / PNG 文件与来源哈希，不把真实家庭照或其他游戏截图当作本作人物。图标用 CSS 的统一底色与整数倍显示；监控、员工合照和王楚人的生活照片不会用不相干的库存图片充数。完整审查见 <a href="REUSE-AUDIT.zh-CN.md">文字清单</a>。</p></main>`;
  for (const node of root.querySelectorAll('.reuse-sprite')) {
    const { index, tile, cols, rows, file } = node.dataset;
    const size=Number(tile)*3, column=Number(index)%Number(cols), row=Math.floor(Number(index)/Number(cols));
    node.style.width=`${size}px`;node.style.height=`${size}px`;
    node.style.backgroundImage=`url("${file}")`;
    node.style.backgroundSize=`${Number(cols)*size}px ${Number(rows)*size}px`;
    node.style.backgroundPosition=`${-column*size}px ${-row*size}px`;
  }
}
root.addEventListener('click', event=>{const button=event.target.closest('[data-filter]');if(!button)return;filter=button.dataset.filter;render();root.querySelector(`[data-filter="${filter}"]`)?.focus({preventScroll:true});});
render();
