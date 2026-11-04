/* Shared, dependency-free wire contract. No case state is part of this API. */
globalThis.StillwaterChatProtocol = (() => {
  const people=['gg','zhang','lin','mom','dad','milk','zhe'];
  const members=['gg','zhang','lin'];
  const rooms=['group',...people,'lunch'];
  const limits=Object.freeze({input:2400,history:20,historyChars:9000,reply:600,bodyBytes:48000});
  const hidden=/\b(?:mara|continuity|temp[\s-]*015|r[\s-]*4829|e[\s-]*014)\b|(?:^|\D)[3３][1１][7７](?:\D|$)|三一七|三百一十七|迪伦|哈克|dylan\s+hack/i;
  const link=/(?:https?:|www\.|javascript:|data:|#(?:forum|hotel|staff)|\[[^\]]+\]\([^)]*\)|(?:[a-z0-9-]+\.)+(?:com|net|org|io|cn|dev)\b)/i;
  const allowed=room=>room==='group'?members:room==='lunch'?['zhang','lin']:people.includes(room)?[room]:[];
  function language(text,previous='zh') {
    const han=(String(text).match(/[\u3400-\u9fff]/g)||[]).length;
    const words=(String(text).match(/[a-z]+/gi)||[]).length;
    if(han&&words>=2)return 'mixed';
    if(han)return 'zh';
    return words?'en':previous;
  }
  function output(value,room,requestId) {
    if(!value||value.version!==1||value.requestId!==requestId||!['ai','mock'].includes(value.mode)||!Array.isArray(value.messages))return null;
    const max=room==='group'?3:2,permitted=allowed(room),speakers=new Set();
    if(!value.messages.length||value.messages.length>max)return null;
    const messages=[];
    for(const entry of value.messages) {
      if(!entry||Object.keys(entry).some(k=>!['person','text'].includes(k))||!permitted.includes(entry.person)||typeof entry.text!=='string')return null;
      const text=entry.text.trim();
      if(!text||text.length>limits.reply||hidden.test(text)||link.test(text)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))return null;
      speakers.add(entry.person);messages.push({person:entry.person,text});
    }
    if(speakers.size>(room==='group'?2:room==='lunch'?2:1))return null;
    return {version:1,requestId,mode:value.mode,messages};
  }
  return Object.freeze({people,members,rooms,limits,hidden,allowed,language,output});
})();
