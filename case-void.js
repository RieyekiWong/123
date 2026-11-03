/* Clickable black space, movable image fragments and a single in-world terminal. */
globalThis.StillwaterVoid = {
  create({getState,t,esc,onAction}) {
    const V=globalThis.StillwaterVoidModel;
    let root=null,canvas=null,drag=null,light=null,frame=0;
    const roman=['I','II','III'];
    const focusKey=el=>[el.dataset.voidAction,el.dataset.type??el.dataset.target??el.dataset.id??'',el.dataset.dx??'',el.dataset.dy??''].join(':');
    const state=()=>getState().night.void;
    const reduced=()=>getState().preferences.reduceMotion||matchMedia('(prefers-reduced-motion:reduce)').matches;
    const button=(action,label,attributes='')=>`<button data-void-action="${action}" ${attributes}>${label}</button>`;
    const description=anchors=>t(
      `光从${anchors[0]==='left'?'左':'右'}边落下；地缝在门${anchors[1]==='left'?'左':'右'}侧断开；门框${anchors[2]==='left'?'左':'右'}上角有缺口。`,
      `Light from the ${anchors[0]}; a break in the floor seam to the ${anchors[1]}; a notch in the upper-${anchors[2]} corner of the frame.`,
    );
    function feedbackText(v) {
      const scene=V.scenes[Math.min(3,v.step)];
      if(['reference','left','right'].includes(v.observation))return (v.observation==='reference'?t('来时的门框：','The frame behind you: '):v.observation==='left'?t('左侧的门：','Left door: '):t('右侧的门：','Right door: '))+description(scene[v.observation]);
      if(v.observation==='loop')return t('又回到入口了。脚下的断缝还是原来的位置。','Back at the entrance. The broken seam is in the same place.');
      if(v.observation==='joined')return t('地缝在另一边接上了。','The floor seam continues on the other side.');
      if(v.observation==='shadow')return t('照过去时，那里已经空了。','Nothing there when you turn the light toward it.');
      return t('来时门框的缺口、脚下的地缝和光照方向都还在。','The notch, broken floor seam and direction of the light are still there.');
    }
    function conflict(type) {
      const F=globalThis.StillwaterCaseData.facts;
      return ({
        ROOM:t(`${F.service} 的登记用途是 SERVICE HOLDING。原客房目录没有这个房号。`,`${F.service} is registered as SERVICE HOLDING. It is absent from the original guest-room directory.`),
        GUEST:t(`原预订单的住客是 ${F.guest}。后来写入住客栏的 ${F.reviewerName} 原本是处理人。`,`The original guest is ${F.guest}. ${F.reviewerName}, later placed in the guest field, was the reviewer.`),
        EMPLOYEE:t(`${F.temporary} 只有一条自动排班记录，没有实际到岗记录。`,`${F.temporary} has an automatic shift assignment, but no record of arriving for duty.`),
      })[type]||'';
    }
    function render() {
      const v=state(),corridor=v.stage==='corridor',fragments=v.stage==='fragments',terminal=v.stage==='classify';
      const title=corridor?t(...V.scenes[v.step].title):fragments?t('断裂影像','Fragmented picture'):terminal?t('分类终端','Classification terminal'):t('未归档画面','Unlisted picture');
      let controls='';
      if(corridor)controls=`<p class="void-instruction">${t('点画面左侧回看入口，点两扇门照亮门框。下面的按钮也能查看。','Touch the left edge to look back, or either door to illuminate its frame. The buttons below offer the same views.')}</p><div class="void-observe">${button('observe',t('回看入口门框','Look at the frame behind you'),'data-target="reference"')}${button('observe',t('照一下左侧门','Illuminate the left door'),'data-target="left"')}${button('observe',t('照一下右侧门','Illuminate the right door'),'data-target="right"')}${v.shadow?button('observe',t('查看走廊尽头','Look down the corridor'),'data-target="shadow"'):''}</div><p class="void-observation" role="status">${feedbackText(v)}</p><div class="void-directions">${button('walk',t('穿过左侧门','Go through the left door'),'data-direction="left"')}${button('walk',t('穿过右侧门','Go through the right door'),'data-direction="right"')}</div>`;
      else if(fragments)controls=`<p class="void-instruction">${t('拖动三块画面，让门框、墙角和地缝在边缘接上。也可以选中片段，再用方向键或下面的按钮移动。','Drag the three fragments until the frame, corner and floor seams meet at their edges. You can also select a fragment and use the arrow keys or buttons.')}</p><div class="void-fragment-tabs" role="group" aria-label="${t('选择影像片段','Select a fragment')}">${roman.map((label,id)=>button('select',t('片段 ','Fragment ')+label,`data-id="${id}" aria-pressed="${id===v.selected}" ${v.reviewed?'disabled':''}`)).join('')}</div><p class="void-alignment" role="status">${t('边缘已对齐','Edges aligned')}: ${V.aligned(v).length}/3</p>${v.reviewed?`<p class="void-missing-source">${t('中央黑区没有对应机位。它不是丢失的第四块画面。','No camera covers the black area. It is not a missing fourth fragment.')}</p>${button('terminal',t('查看黑区后面的终端','Look at the terminal beyond the gap'),'class="void-primary"')}`:`<div class="void-nudges">${[['0','-1','↑'],['-1','0','←'],['1','0','→'],['0','1','↓']].map(([dx,dy,label])=>button('move',label,`data-dx="${dx}" data-dy="${dy}" aria-label="${t('移动片段','Move fragment')} ${label}"`)).join('')}</div><div class="void-fragment-actions">${button('reset-fragments',t('重新摆放','Reset fragments'))}${button('review',t('复核这段画面','Review this picture'),'class="void-primary"')}</div>`}`;
      else if(terminal) {
        const current=['ROOM','GUEST','EMPLOYEE'].includes(v.observation)?v.observation:v.attempts.at(-1);
        controls=`<div class="void-classification"><p class="void-system-id">CONTINUITY / UNKNOWN SOURCE</p><h2>${t('无法识别此处。请选择记录类别。','Location unrecognized. Select a record type.')}</h2><div class="void-types">${['ROOM','GUEST','EMPLOYEE'].map(type=>button('classify',type,`data-type="${type}" aria-pressed="${v.attempts.includes(type)}"`)).join('')}</div>${current?`<div class="void-conflict" role="status"><span>${current} / ${t('与原件不符','SOURCE CONFLICT')}</span><p>${esc(conflict(current))}</p></div>`:''}${v.attempts.length===3?button('classify','UNVERIFIED', 'data-type="UNVERIFIED" class="void-primary"'):''}</div>`;
      } else controls=`<div class="void-return-record"><p>NO CAMERA / UNVERIFIED</p><h2>${t('保留无法确认的部分。','Leave the unknown unverified.')}</h2><p>${t('没有给这段画面分配房间、住客或员工身份。原来的夜班终端仍在等候交接。','No room, guest or employee identity has been assigned to this picture. The night terminal is still awaiting handover.')}</p>${button('lookback',t('再看最后一帧','Look back at the last frame'))}${button('leave',t('返回 B-3 配线室','Return to B-3'),'class="void-primary"')}</div>`;
      const elapsed=Date.now()-v.enteredAt;
      return `<main id="content" class="void-world" tabindex="-1"><header class="void-heading"><a href="#terminal">B-3 / ${t('返回配线室','Patch room')}</a><h1>${title}</h1><a data-case-language href="${document.documentElement.lang==='zh-CN'?'index.html':'index-zh.html'}${esc(location.search)}#void">${t('English','简体中文')}</a></header><div class="void-frame" data-void-stage="${v.stage}"><canvas class="void-canvas" width="480" height="360" tabindex="0" aria-label="${t('未归档空间；可用下方同名按钮调查，影像片段可拖动或用方向键移动。','Unlisted space. The buttons below offer the same observations. Fragments can be dragged or moved with arrow keys.')}" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"></canvas>${elapsed<2400&&!reduced()?`<div class="void-peeling-hud" aria-hidden="true" style="animation-delay:-${Math.max(0,elapsed)}ms"><span>CAM -- / NO INDEX</span><span>2006-10-17 03:17:00</span></div>`:''}${v.reviewed&&fragments?`<span class="void-no-camera">${t('没有对应机位','NO CAMERA')}</span>`:''}</div><section class="void-controls">${controls}<p id="void-feedback" role="status"></p></section><footer class="void-footer"><a href="#terminal">${t('暂时返回配线室','Return to the patch room')}</a><button data-case-action="toggle-sound" aria-pressed="${getState().preferences.sound}">${getState().preferences.sound?t('声音：开启','Sound: On'):t('声音：关闭','Sound: Off')}</button><button data-case-action="settings">${t('声音与设置','Sound & settings')}</button><button data-case-action="save-settings">${t('存档与重置','Saves & reset')}</button></footer></main>`;
    }
    function polygon(ctx,points,color) {ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
    function door(ctx,x,y,w,h,anchors,lit=false) {
      ctx.strokeStyle=lit?'#697078':'#34393e';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
      ctx.fillStyle='#020303';ctx.fillRect(x+3,y+3,w-6,h-3);
      const notch=anchors[2]==='left'?x+5:x+w-15;ctx.fillStyle='#010101';ctx.fillRect(notch,y-3,11,7);
      polygon(ctx,anchors[0]==='left'?[[x-12,y-16],[x+2,y-16],[x+w+18,y+h],[x+w-15,y+h]]:[[x+w-2,y-16],[x+w+12,y-16],[x+15,y+h],[x-18,y+h]],lit?'#262b30':'#14181c');
      ctx.strokeStyle=lit?'#7b8288':'#3a4148';ctx.lineWidth=2;
      const end=x+w/2+(anchors[1]==='left'?-44:44),middle=y+h+26;
      ctx.beginPath();ctx.moveTo(x+w/2,y+h);ctx.lineTo(end,middle);ctx.moveTo(end+(anchors[1]==='left'?-6:6),middle+7);ctx.lineTo(end+(anchors[1]==='left'?-22:22),360);ctx.stroke();
      ctx.strokeStyle=lit?'#858b90':'#454b51';ctx.strokeRect(x,y,w,h);
      ctx.fillStyle='#010101';ctx.fillRect(notch,y-3,11,7);
    }
    function corridor(ctx,v) {
      const scene=V.scenes[Math.min(3,v.step)];
      polygon(ctx,[[0,0],[164,68],[164,254],[0,360]],'#0b0e11');
      polygon(ctx,[[480,0],[320,68],[320,254],[480,360]],'#080b0d');
      polygon(ctx,[[0,360],[164,224],[320,224],[480,360]],'#111518');
      if(v.step===1)polygon(ctx,[[20,0],[122,26],[122,329],[20,360]],'#1b1f23');
      if(v.step===2)polygon(ctx,[[395,15],[480,0],[480,360],[395,293]],'#181c20');
      ctx.fillStyle='#0b0d10';ctx.fillRect(164,68,156,186);
      door(ctx,154,112,61,135,scene.left,v.observation==='left');
      door(ctx,290,91,52,125,scene.right,v.observation==='right');
      if(v.observation==='reference') {
        ctx.fillStyle='#060709';ctx.fillRect(18,196,108,141);
        door(ctx,38,214,58,88,scene.reference,true);
      }
      if(v.shadow&&!getState().preferences.skipScares) {
        ctx.fillStyle='#2b3034';ctx.beginPath();ctx.ellipse(251,163,7,10,0,0,7);ctx.fill();
        polygon(ctx,[[245,175],[258,175],[265,221],[237,221]],'#20252a');
      }
    }
    function fragmentSource(ctx) {
      ctx.fillStyle='#11171b';ctx.fillRect(20,28,440,296);
      polygon(ctx,[[20,28],[126,95],[126,244],[20,324]],'#2a3036');
      polygon(ctx,[[460,28],[354,95],[354,244],[460,324]],'#1a2025');
      polygon(ctx,[[20,324],[126,228],[354,228],[460,324]],'#30363b');
      ctx.strokeStyle='#778089';ctx.lineWidth=3;ctx.strokeRect(176,105,127,156);
      ctx.beginPath();ctx.moveTo(20,110);ctx.lineTo(126,147);ctx.lineTo(354,147);ctx.lineTo(460,110);ctx.moveTo(86,324);ctx.lineTo(205,230);ctx.moveTo(418,324);ctx.lineTo(278,230);ctx.stroke();
    }
    function fragments(ctx,v,positions=v.positions,selected=v.selected) {
      for(let i=0;i<3;i++) {
        const r=V.slots[i],x=r.x+positions[i][0]*8,y=r.y+positions[i][1]*8;
        ctx.save();ctx.beginPath();ctx.rect(x,y,r.w,r.h);ctx.clip();ctx.translate(positions[i][0]*8,positions[i][1]*8);fragmentSource(ctx);ctx.restore();
        ctx.strokeStyle=i===selected?'#929ba3':'#40474e';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,r.w-1,r.h-1);
        ctx.fillStyle='#a2a8ad';ctx.font='12px monospace';ctx.fillText(roman[i],x+8,y+17);
      }
      ctx.fillStyle='#000';ctx.fillRect(192,124,96,104);
      if(v.reviewed){ctx.strokeStyle='#373b40';ctx.setLineDash([3,4]);ctx.strokeRect(192,124,96,104);ctx.setLineDash([]);}
    }
    function terminal(ctx,v) {
      if(v.events.includes('terminal-shape')&&!getState().preferences.skipScares){ctx.fillStyle='#1e2226';ctx.beginPath();ctx.ellipse(382,91,14,21,0,0,7);ctx.fill();polygon(ctx,[[370,116],[394,116],[413,251],[351,251]],'#14191d');}
      polygon(ctx,[[77,58],[362,68],[354,276],[70,265]],'#262b30');
      ctx.fillStyle='#040506';ctx.fillRect(91,77,247,173);ctx.strokeStyle='#4d555c';ctx.strokeRect(91,77,247,173);
      ctx.fillStyle='#9aaba6';ctx.font='13px monospace';ctx.fillText('CONTINUITY',108,104);ctx.fillText('UNKNOWN SOURCE',108,129);
      ctx.fillStyle='#737d80';ctx.fillText(v.classified?'UNVERIFIED':v.attempts.at(-1)||'TYPE REQUIRED',108,192);
      polygon(ctx,[[83,279],[350,291],[379,330],[55,316]],'#21262a');
      ctx.fillStyle='#454b50';for(let r=0;r<3;r++)for(let c=0;c<13;c++)ctx.fillRect(90+c*18-r*5,288+r*9,12,5);
    }
    function paint(preview) {
      if(!canvas)return;const ctx=canvas.getContext('2d'),v=state();ctx.clearRect(0,0,480,360);ctx.fillStyle='#000';ctx.fillRect(0,0,480,360);
      if(v.stage==='corridor')corridor(ctx,v);
      else if(v.stage==='fragments')fragments(ctx,v,preview?.positions,preview?.selected);
      else if(v.stage==='classify')terminal(ctx,v);
      else {ctx.strokeStyle='#252b30';ctx.lineWidth=2;ctx.strokeRect(220,106,56,132);ctx.strokeStyle='#11171b';ctx.beginPath();ctx.moveTo(0,360);ctx.lineTo(222,238);ctx.moveTo(480,360);ctx.lineTo(276,238);ctx.stroke();}
      if(light&&!reduced()&&v.stage==='corridor'){const g=ctx.createRadialGradient(light.x,light.y,0,light.x,light.y,95);g.addColorStop(0,'#afbcc612');g.addColorStop(1,'#afbcc600');ctx.fillStyle=g;ctx.fillRect(0,0,480,360);}
      // Static, sparse analogue grain; no rapid flashing or hidden moving targets.
      ctx.fillStyle='#cbd3db08';for(let i=0;i<360;i++)ctx.fillRect((i*79+11)%480,(i*53+19)%360,1,1);
    }
    const point=event=>{const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*480/r.width,y:(event.clientY-r.top)*360/r.height};};
    function pointerdown(event) {
      if(state().stage==='corridor') {
        const p=point(event),v=state();
        const target=v.shadow&&p.x>230&&p.x<275&&p.y>145&&p.y<235?'shadow':p.x<130?'reference':p.x<250?'left':'right';
        event.preventDefault();onAction('observe',{target},'canvas');return;
      }
      if(state().stage!=='fragments'||state().reviewed)return;
      const p=point(event),v=state();
      for(const id of [v.selected,...[2,1,0].filter(id=>id!==v.selected)]) {
        const r=V.slots[id],x=r.x+v.positions[id][0]*8,y=r.y+v.positions[id][1]*8;
        if(p.x>=x&&p.x<=x+r.w&&p.y>=y&&p.y<=y+r.h){drag={id,start:p,positions:v.positions.map(p=>[...p])};canvas.setPointerCapture(event.pointerId);event.preventDefault();break;}
      }
    }
    function pointermove(event) {
      if(!canvas)return;const p=point(event);light=p;
      if(drag){const positions=drag.positions.map(p=>[...p]);positions[drag.id]=positions[drag.id].map((x,i)=>x+((i===0?p.x:p.y)-(i===0?drag.start.x:drag.start.y))/8);paint({positions,selected:drag.id});}
      else {cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>paint());}
    }
    function pointerup(event) {
      if(!drag)return;const p=point(event),old=drag;drag=null;
      onAction('move',{id:old.id,dx:Math.round((p.x-old.start.x)/8),dy:Math.round((p.y-old.start.y)/8)},'canvas');
    }
    function keydown(event) {
      if(event.target!==canvas||state().stage!=='fragments')return;
      const deltas={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(deltas[event.key]){event.preventDefault();onAction('move',{id:state().selected,dx:deltas[event.key][0],dy:deltas[event.key][1]},'canvas');}
    }
    function click(event) {
      const target=event.target.closest('[data-void-action]');if(!target)return;
      onAction(target.dataset.voidAction,{target:target.dataset.target,direction:target.dataset.direction,id:target.dataset.id===undefined?undefined:Number(target.dataset.id),dx:Number(target.dataset.dx||0),dy:Number(target.dataset.dy||0),type:target.dataset.type},focusKey(target));
    }
    function leave(){cancelAnimationFrame(frame);if(root)root.removeEventListener('click',click);if(canvas){canvas.removeEventListener('pointerdown',pointerdown);canvas.removeEventListener('pointermove',pointermove);canvas.removeEventListener('pointerup',pointerup);canvas.removeEventListener('keydown',keydown);}root=null;canvas=null;drag=null;light=null;}
    function mount(container,requestedFocus) {
      leave();root=container;canvas=root.querySelector('.void-canvas');root.addEventListener('click',click);
      canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointermove',pointermove);canvas.addEventListener('pointerup',pointerup);canvas.addEventListener('keydown',keydown);paint();
      if(requestedFocus==='canvas')canvas.focus({preventScroll:true});
      else if(requestedFocus){const match=[...root.querySelectorAll('[data-void-action]')].find(el=>focusKey(el)===requestedFocus);(match||canvas).focus({preventScroll:true});}
    }
    return {render,mount,leave,conflict,refresh:()=>paint()};
  },
};
