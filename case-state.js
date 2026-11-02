globalThis.StillwaterCaseState = (() => {
  const data = globalThis.StillwaterCaseData;
  const fresh = () => ({schema:2,evidence:[],completed:{},drafts:{},endings:[],lastEnding:'',
    notices:{shown:false,dismissed:false},queueRefreshed:false,effectSeen:false,
    preferences:{sound:false,volume:0.2,reduceMotion:false,skipScares:true}});
  function hydrate(raw) {
    const state=fresh();
    if (!raw || raw.schema!==2) return state;
    state.evidence=Object.keys(data.clues).filter(id=>Array.isArray(raw.evidence)&&raw.evidence.includes(id));
    state.notices={shown:raw.notices?.shown===true,dismissed:raw.notices?.dismissed===true};
    return state;
  }
  function record(state,id) {
    if (!data.clues[id]) return false;
    if (!state.evidence.includes(id)) state.evidence.push(id);
    return true;
  }
  return {fresh,hydrate,record};
})();
