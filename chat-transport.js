/* The only chat network boundary. Explicit consent + a configured Worker are required. */
globalThis.StillwaterChatTransport = (() => {
 const P=globalThis.StillwaterChatProtocol,KEY='stillwater-chat-ai:v1',SESSION='stillwater-chat-session:v1';
 function create({config=globalThis.StillwaterChatConfig,fetcher=(...args)=>fetch(...args),storage,sessionStorage:session,onStatus=()=>{}}={}) {
  const transient=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};
  // The getters themselves may throw in private/blocked-storage browsers.
  if(!storage)try{storage=globalThis.localStorage;}catch{}
  if(!session)try{session=globalThis.sessionStorage;}catch{}
  storage||=transient();session||=transient();
  let endpoint='',consent=false,token='',expires=0,mode='',queue=Promise.resolve(),controllers=new Map(),epoch=0;
  try {
   const url=new URL(config.endpoint);
   if(url.pathname==='/api/chat'&&!url.username&&!url.password&&!url.search&&!url.hash&&
      (url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname))))endpoint=url.href;
  }catch{}
  try{const saved=JSON.parse(storage.getItem(KEY));consent=!!endpoint&&saved?.version===1&&saved.endpoint===endpoint&&saved.enabled===true;}catch{}
  try{const saved=JSON.parse(session.getItem(SESSION));if(consent&&saved?.endpoint===endpoint&&saved.expires>Date.now()){token=saved.token;expires=saved.expires;mode=saved.mode;}}catch{}
  const eligible=()=>!!endpoint&&consent&&!!token&&expires>Date.now();
  const status=()=>!endpoint?'unconfigured':!consent?'local':!eligible()?'reconnect':mode==='mock'?'mock':'ai';
  function clearSession(){token='';expires=0;try{session.removeItem(SESSION);}catch{}}
  function cancel(room) {controllers.get(room)?.abort();controllers.delete(room);}
  function cancelAll(){epoch++;for(const room of controllers.keys())cancel(room);}
  function disable(){consent=false;cancelAll();clearSession();try{storage.removeItem(KEY);}catch{}onStatus('local');}
  async function enable(turnstileToken='') {
   if(!endpoint)throw new Error('unconfigured');
   const current=epoch;
   const response=await fetcher(new URL('/api/session',endpoint),{method:'POST',mode:'cors',credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',
    headers:{'Content-Type':'application/json','X-Stillwater-Chat':'1'},body:JSON.stringify({consent:true,...(turnstileToken?{turnstileToken}:{})}),signal:AbortSignal.timeout(9000)});
   if(current!==epoch)throw new Error('cancelled');
   if(!response.ok)throw new Error(response.status===429?'limited':response.status===403?'verification':'unavailable');
   const data=await response.json();
   if(current!==epoch)throw new Error('cancelled');
   if(typeof data.token!=='string'||data.token.length>800||!['ai','mock'].includes(data.mode)||!Number.isInteger(data.expiresIn)||data.expiresIn<1||data.expiresIn>1800)throw new Error('invalid');
   consent=true;token=data.token;mode=data.mode;expires=Date.now()+data.expiresIn*1000;
   try{storage.setItem(KEY,JSON.stringify({version:1,enabled:true,endpoint}));session.setItem(SESSION,JSON.stringify({endpoint,token,mode,expires}));}catch{}
   onStatus(status());return mode;
  }
  function request(payload,{isCurrent=()=>true}={}) {
   if(!eligible())return Promise.reject(new Error(status()));
   cancel(payload.room);
   const controller=new AbortController();controllers.set(payload.room,controller);const current=epoch;
   const work=async()=>{
    if(controller.signal.aborted||current!==epoch||!isCurrent()||!eligible())throw new Error('cancelled');
    const timeout=setTimeout(()=>controller.abort(),11000);
    try {
     const response=await fetcher(endpoint,{method:'POST',mode:'cors',credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',
      headers:{'Content-Type':'application/json','X-Stillwater-Chat':'1',Authorization:'Bearer '+token},body:JSON.stringify(payload),signal:controller.signal});
     if(current!==epoch||controller.signal.aborted||!isCurrent()||!consent)throw new Error('cancelled');
     if(response.status===401){clearSession();throw new Error('reconnect');}
     if(!response.ok)throw new Error(response.status===429?'limited':'unavailable');
     const value=P.output(await response.json(),payload.room,payload.requestId);if(!value)throw new Error('invalid');
     if(current!==epoch||controller.signal.aborted||!isCurrent()||!consent)throw new Error('cancelled');
     onStatus(value.mode==='mock'?'mock':'ai');return value;
    }finally{clearTimeout(timeout);if(controllers.get(payload.room)===controller)controllers.delete(payload.room);}
   };
   const result=queue.catch(()=>{}).then(work);queue=result.catch(()=>{});return result;
  }
  return {configured:()=>!!endpoint,enabled:()=>consent,eligible,status,enable,disable,request,cancel,cancelAll,reset:()=>disable(),siteKey:()=>config.turnstileSiteKey||''};
 }
 return {KEY,SESSION,create};
})();
