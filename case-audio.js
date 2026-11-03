/* Gesture-unlocked local music and original SFX, on separate buses. */
globalThis.StillwaterCaseAudio = {
  create({getState,getRoute,canOpen=()=>true,getPresentation=()=>({})}) {
    const policy=globalThis.StillwaterAudioPolicy,tracks=new Map(globalThis.StillwaterAudioTracks.map(t=>[t.id,t]));
    let mix={schema:1,music:.65,effects:.6};
    try {const raw=JSON.parse(localStorage.getItem('stillwater-audio:v1'));if(raw?.schema===1)for(const k of ['music','effects'])if(Number.isFinite(raw[k]))mix[k]=Math.max(0,Math.min(1,raw[k]));}catch {}
    let context=null,master,musicBus,effectBus,engaged=false,scene=null,desired=null,loading=null,generation=0;
    let restoreTimer,quietUntil=0,breathTimer,breathActive=false,breathQuietUntil=0,closeUntil=0,noise,seed=0x3170317;
    let lastNotification=-Infinity,lastSend=-Infinity;
    const cache=new Map(),voices=new Set(),effects=new Set(),breaths=new Set(),monitors=new Set(),failed=new Map();
    const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
    function ramp(parameter,value,seconds=.08) {parameter.cancelScheduledValues(context.currentTime);parameter.setTargetAtTime(value,context.currentTime,Math.max(.005,seconds/3));}
    function applyMix() {
      if(!context)return;const p=getState().preferences;
      ramp(master.gain,p.sound&&!document.hidden&&!getPresentation().blocked?Math.min(1,p.volume*2):0);
      ramp(musicBus.gain,Date.now()<quietUntil?0:mix.music);ramp(effectBus.gain,Date.now()<quietUntil?0:mix.effects);
    }
    async function unlock() {
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('AudioContext unavailable');
      if(!context){context=new Audio();master=context.createGain();musicBus=context.createGain();effectBus=context.createGain();master.gain.value=0;musicBus.gain.value=mix.music;effectBus.gain.value=mix.effects;musicBus.connect(master);effectBus.connect(master);master.connect(context.destination);}
      await context.resume();return context.state==='running';
    }
    function dispose(voice) {try{voice.source.stop();voice.source.disconnect();voice.gain.disconnect();}catch{}voices.delete(voice);}
    function retire(immediate=false) {
      for(const v of [...voices]){if(v.retiring&&!immediate)continue;v.retiring=true;if(immediate)dispose(v);else{ramp(v.gain.gain,0,.55);try{v.source.stop(context.currentTime+.6);}catch{dispose(v);}}}
    }
    function stopEffects() {clearTimeout(breathTimer);breathActive=false;for(const n of effects)try{n.stop?.();n.disconnect();}catch{}effects.clear();breaths.clear();monitors.clear();}
    function pause() {generation++;loading?.controller.abort();loading=null;desired=null;scene=null;clearTimeout(restoreTimer);quietUntil=0;retire(true);stopEffects();if(context)ramp(master.gain,0,.02);}
    function stop() {pause();if(context?.state==='running')void context.suspend();}
    function own(source,gain,role,extra=[]) {
      source.stillwaterRole=role;const nodes=[source,gain,...extra];nodes.forEach(n=>effects.add(n));
      source.onended=()=>{for(const n of nodes){try{n.disconnect();}catch{}effects.delete(n);breaths.delete(n);}};
    }
    function noiseBuffer() {if(!noise){noise=context.createBuffer(1,context.sampleRate*4,context.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(random()*2-1)*.55;}return noise;}
    function breath() {
      if(!breathActive||!getState().preferences.sound||document.hidden||context?.state!=='running')return;
      const until=Math.max(breathQuietUntil,quietUntil);if(Date.now()<until){breathTimer=setTimeout(breath,Math.max(200,until-Date.now()));return;}
      const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),now=context.currentTime,duration=2+random();
      source.buffer=noiseBuffer();filter.type='lowpass';filter.frequency.value=540;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(Date.now()<closeUntil ? .1 : .05,now+duration*.4);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      source.connect(filter).connect(gain).connect(effectBus);own(source,gain,'breath',[filter]);[source,gain,filter].forEach(n=>breaths.add(n));source.start();source.stop(now+duration+.1);
      breathTimer=setTimeout(breath,(duration+2+random()*4)*1000);
    }
    function syncBreathing() {
      const active=policy.deep(getRoute(),getState())&&(getState().lastEnding!=='released'||getRoute()==='void');
      if(active===breathActive)return;clearTimeout(breathTimer);breathActive=active;
      if(active)breathTimer=setTimeout(breath,1800);else for(const n of [...breaths]){try{n.stop?.();n.disconnect();}catch{}effects.delete(n);breaths.delete(n);}
    }
    function syncMonitor() {
      const active=['cameras','service-passage','terminal'].includes(getRoute())&&getState().lastEnding!=='released';
      if(!active) {for(const n of monitors){try{n.stop?.();n.disconnect();}catch{}effects.delete(n);}monitors.clear();return;}
      if(monitors.size)return;
      const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
      source.buffer=noiseBuffer();source.loop=true;filter.type='bandpass';filter.frequency.value=780;filter.Q.value=.5;gain.gain.value=.012;
      source.connect(filter).connect(gain).connect(effectBus);own(source,gain,'cctv-static',[filter]);[source,gain,filter].forEach(n=>monitors.add(n));source.start();
      const hum=context.createOscillator(),volume=context.createGain();hum.frequency.value=54;volume.gain.value=.006;hum.connect(volume).connect(effectBus);own(hum,volume,'cctv-static');[hum,volume].forEach(n=>monitors.add(n));hum.start();
    }
    async function load(id,signal) {
      if(cache.has(id)){const b=cache.get(id);cache.delete(id);cache.set(id,b);return b;}let error;
      for(const format of ['mp3','ogg'])try{
        const response=await fetch(tracks.get(id)[format],{signal,cache:'force-cache'});if(!response.ok)throw Error('Audio response '+response.status);
        const b=await context.decodeAudioData(await response.arrayBuffer());if(signal.aborted)return null;
        cache.set(id,b);while(cache.size>3)cache.delete(cache.keys().next().value);return b;
      }catch(e){if(signal.aborted)return null;error=e;}
      throw error;
    }
    async function start(id,token,request) {
      try {
        const buffer=await load(id,request.controller.signal);
        if(!buffer||token!==generation||desired!==id||!getState().preferences.sound||document.hidden||context.state!=='running')return;
        const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.loop=true;source.stillwaterRole='bgm';source.stillwaterTrack=id;
        gain.gain.value=0;source.connect(gain).connect(musicBus);const voice={source,gain,id,retiring:false};voices.add(voice);
        source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(voice);};source.start();ramp(gain.gain,policy.profiles[id].gain,policy.profiles[id].fade);applyMix();
      }catch{if(token===generation)failed.set(id,Date.now()+15000);}finally{if(loading===request)loading=null;}
    }
    async function sync() {
      if(!getState().preferences.sound||document.hidden){stop();return;}
      if(getPresentation().blocked){pause();return;}
      if(!context||context.state!=='running')return;
      const route=getRoute(),allowed=canOpen(route),presentation=getPresentation();if(allowed&&policy.investigate.has(route))engaged=true;
      const next=policy.scene({route,state:getState(),engaged,allowed,...presentation});applyMix();
      if(next!==scene){scene=next;quietUntil=0;clearTimeout(restoreTimer);applyMix();generation++;loading?.controller.abort();loading=null;retire(policy.silent.has(route));desired=next;}
      if(!allowed){stopEffects();return;}syncMonitor();syncBreathing();
      if(!next||loading?.id===next||[...voices].some(v=>v.id===next&&!v.retiring)||(failed.get(next)||0)>Date.now())return;
      desired=next;const request={id:next,controller:new AbortController()};loading=request;void start(next,generation,request);
    }
    function effect(kind='ui') {
      if(!context||context.state!=='running'||!getState().preferences.sound||document.hidden||getPresentation().blocked||Date.now()<quietUntil)return;
      if(kind.startsWith('chat-')&&getRoute()!=='chat')return;
      const now=context.currentTime,wall=Date.now();
      if(kind==='chat-receive'){if(wall-lastNotification<1800)return;lastNotification=wall;}
      if(kind==='chat-send'){if(wall-lastSend<120)return;lastSend=wall;}
      const received=kind==='chat-receive',sent=kind==='chat-send',door=kind==='door',camera=kind==='camera';
      const duration=received ? .16 : sent ? .075 : door ? .24 : camera ? .13 : .055;
      const source=context.createOscillator(),gain=context.createGain();source.type=door?'triangle':'sine';
      source.frequency.setValueAtTime(received?540:sent?380:door?91:camera?160:240,now);
      source.frequency.exponentialRampToValueAtTime(received?760:sent?490:door?69:camera?105:190,now+duration*.75);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(received ? .035 : sent ? .02 : door ? .018 : .012,now+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      source.connect(gain).connect(effectBus);own(source,gain,kind);source.start();source.stop(now+duration+.02);
    }
    function silence(ms=3200) {if(!context)return;quietUntil=Math.max(quietUntil,Date.now()+ms);applyMix();clearTimeout(restoreTimer);restoreTimer=setTimeout(()=>{quietUntil=0;applyMix();},Math.max(0,quietUntil-Date.now()));}
    function afterScare() {breathQuietUntil=Date.now()+8000;closeUntil=0;for(const n of [...breaths]){try{n.stop?.();n.disconnect();}catch{}effects.delete(n);breaths.delete(n);}silence(3200);}
    function approach() {breathQuietUntil=0;closeUntil=Date.now()+2500;silence(1200);clearTimeout(breathTimer);if(breathActive)breathTimer=setTimeout(breath,1200);}
    function setMix(channel,value) {if(!['music','effects'].includes(channel)||!Number.isFinite(value))return;mix[channel]=Math.max(0,Math.min(1,value));try{localStorage.setItem('stillwater-audio:v1',JSON.stringify(mix));}catch{}applyMix();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else void sync();});window.addEventListener('pagehide',stop);
    return {sync,stop,pause,unlock,effect,silence,afterScare,approach,setMix,getMix:()=>({...mix}),snapshot:()=>({scene,playing:[...voices].filter(v=>!v.retiring).map(v=>v.id),loading:loading?.id||null,quiet:Date.now()<quietUntil,cache:[...cache.keys()]})};
  },
};
