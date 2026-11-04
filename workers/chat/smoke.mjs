/* Opt-in paid acceptance test. Four short requests; no real personal information. */
const base=(process.env.CHAT_WORKER_URL||'https://damp-rain-a5a6.ywang254.workers.dev').replace(/\/$/,'');
const origin=process.env.CHAT_FRONTEND_ORIGIN||'https://rieyekiwong.github.io';
const headers={Origin:origin,'Content-Type':'application/json','X-Stillwater-Chat':'1','User-Agent':'Mozilla/5.0 Stillwater-deployment-check/4.10.0'};
async function post(path,body,token='') {
 const response=await fetch(base+path,{method:'POST',headers:{...headers,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(16000)});
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{throw new Error('Worker did not return JSON. It may still be Hello World.');}
 if(!response.ok)throw new Error(`HTTP ${response.status}: ${data.error||'request failed'}`);
 if(response.headers.get('Access-Control-Allow-Origin')!==origin)throw new Error('CORS did not allow the GitHub Pages origin');
 return data;
}
try {
 const health=await (await fetch(base+'/api/health',{headers:{'User-Agent':headers['User-Agent']}})).json();
 if(health.service!=='stillwater-chat'||health.mode!=='ai'||!health.configured)throw new Error('Deploy the LIVE Worker with OPENAI_API_KEY and SESSION_SECRET first.');
 const session=await post('/api/session',{consent:true,...(process.env.CHAT_TURNSTILE_TOKEN?{turnstileToken:process.env.CHAT_TURNSTILE_TOKEN}:{})});
 const check=async(room,language,messages,id)=>{
  const data=await post('/api/chat',{version:1,requestId:id,room,language,messages,visibleGroup:[]},session.token);
  if(data.mode!=='ai'||!data.messages?.length)throw new Error('Expected a real AI response, not mock mode.');
  if(data.messages.some(m=>/317|Mara|Continuity|https?:/i.test(m.text)))throw new Error('Unexpected story information or URL');
  console.log(room,language,data.messages.map(m=>m.person+': '+m.text).join(' / '));return data.messages;
 };
 const opening=[{person:'me',text:'今天好累。'}],first=await check('mom','zh',opening,'q1');
 await check('mom','zh',[...opening,...first,{person:'me',text:'赶作业赶了一晚上，刚刚才交上去。'}],'q2');
 await check('zhe','en',[{person:'me',text:'I played a game yesterday. Have you had time to play anything lately?'}],'q3');
 await check('group','mixed',[{person:'gg',text:'看到个整理旧酒店预订单的兼职，工资还没问清楚。'},{person:'me',text:'bruh这个job有点sus，那你怎么敢发出来'}],'q4');
 console.log('PASS: live Responses API, CORS, Chinese, English, mixed input and a two-turn private context.');
}catch(error){console.error('NOT VERIFIED:',error.message);process.exitCode=1;}
