/* Audio follows existing progress and never grants or persists a clue. */
globalThis.StillwaterAudioPolicy = (() => {
  const silent=new Set(['chat','forum','careers']);
  const investigate=new Set(['rooms','history','reservations','guestbook','floor-plan']);
  const hotel=new Set(['hotel','rooms','history','reservations','guestbook','floor-plan','contact','notices','gallery','credits']);
  const archive=new Set(['maintenance','night-audit','staff','revisions','closure','mara','review','notes','guest-index','source-review','source-trace','history-cache','wcr-sources','photo-overlay','rewrite-review','null-archive']);
  const profiles={investigation:{gain:.8,fade:5},archive:{gain:.85,fade:2.5},rewrite:{gain:.85,fade:3},cctv:{gain:.8,fade:1.8},passage:{gain:.7,fade:2},unlisted:{gain:.65,fade:2.5},deep:{gain:.8,fade:3},safe:{gain:.5,fade:4}};
  function scene({route,state,engaged=false,allowed=true,transition=false,blocked=false,endingPending=false,ending=state.lastEnding}) {
    if(blocked||!allowed||silent.has(route))return null;
    if(transition)return 'rewrite';
    if(route==='ending')return ending==='released'&&!endingPending?'safe':null;
    if(route==='void')return state.night.void.stage==='corridor'?'unlisted':'deep';
    if(route==='cameras')return 'cctv';
    if(['service-passage','terminal'].includes(route))return 'passage';
    if(archive.has(route))return 'archive';
    if(state.night.started&&state.lastEnding!=='released'&&(hotel.has(route)||route==='mirror'))return 'rewrite';
    if(hotel.has(route)&&(engaged||state.evidence.includes('C2')))return 'investigation';
    return null;
  }
  const deep=(route,state)=>['service-passage','terminal','void'].includes(route)&&state.night.door&&(route!=='void'||state.night.void.stage!=='corridor')&&(!state.night.passageRequired||state.night.passage.cabinetOpen);
  return {scene,profiles,investigate,silent,deep};
})();
