/* Fictional story contacts. Distinct account IDs; never impersonate an AI API role. */
globalThis.StillwaterChatStory = (() => {
  const D=globalThis.StillwaterChatData,S=globalThis.StillwaterStoryData;
  const line=(person,zh,en)=>({person,text:[zh,en]});
  const old=[line('wcr_old','GG 说那边拆光了。','GG says it was all knocked down.'),line('wcr_old','我觉得不对。','I’m not sure.'),line('wcr_old','地图上那个楼跟照片长得不一样。','The building on the map doesn’t match the photo.'),line('me','你又自己跑过去了？','You went out there on your own again?'),line('wcr_old','我就看一下，真的。','Just having a look. Seriously.'),line('wcr_old','我好像找到那个地方了。','I think I found the place.'),line('wcr_old','但这里没有酒店啊。','But there’s no hotel here.'),line('wcr_old','等我回去跟你们说。','I’ll tell you when I get back.')];
  old[5].storyImage='assets/story-v417/north-ferry.png';
  D.people.wcr_old={name:['王楚人','Wang Churen']};D.people.wcr_new={name:['王楚人','Wang Churen']};
  D.sideChats.wcr_old={name:['王楚人 · 旧会话','Wang Churen · older chat'],avatar:'wcr_old',messages:old,kind:'archive',historyAt:Date.parse('2023-10-21T18:10:00Z')};
  D.sideChats.wcr_new={name:['王楚人 · 新账号','Wang Churen · new account'],avatar:'wcr_new',messages:[],kind:'scripted'};
  globalThis.StillwaterChatPeople.order.splice(2,0,'wcr_old','wcr_new');
  for(const [id,file]of [['wcr_old','north-ferry.png'],['wcr_new','west-passage.png']])globalThis.StillwaterChatPhotos.push({id,file:'assets/story-v417/'+file,source:'#credits',author:'404 Studio',license:'Fictional scene / generated artwork',license_url:'#credits'});
  Object.assign(S.messages,{
    'wcr-where':line('wcr_new','我不知道该怎么跟你说。这里所有地方都写着 317。','I don’t know how to explain it. Everything here says 317.'),
    'wcr-who':line('wcr_new','你们以前都叫我楚人。GG 老把我发的地图看反。这个也不算证明吗。','You used to call me Churen. GG always read my maps the wrong way round. Doesn’t that count for anything?'),
    'wcr-confirm':line('wcr_new','没有确认我就没有记录。没有记录你们怎么找我。','Without confirmation I have no record. Without a record, how are you going to find me?'),
    'wcr-ordinary-0':line('wcr_new','你说的我看到了。只是有些事我现在也说不清。','I can see what you wrote. There are things I can’t explain either.'),
    'wcr-ordinary-1':line('wcr_new','你可以慢慢看。我还在。','Take your time. I’m still here.'),
    'wcr-ordinary-2':line('wcr_new','先别急着替我填。你还留着原来的那份吗。','Don’t fill it in for me yet. Do you still have the original?'),
  });
  const entry=key=>S.messages[key]||null;
  function reply(text,s){
    if(/哪|where|location|place/i.test(text))return 'wcr-where';
    if(/你是|本人|真是|who|really you|identity/i.test(text))return 'wcr-who';
    if(/确认|为什么|why|confirm|record/i.test(text))return 'wcr-confirm';
    const turn=(s.memories.wcr_new?.turn||0)+1;s.memories.wcr_new={turn};return 'wcr-ordinary-'+((turn-1)%3);
  }
  return {entry,reply,old};
})();
