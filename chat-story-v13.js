/* An authored synthetic account; never an unsupported Cloudflare role.
   All seven existing AI personalities and their transport remain unchanged. */
(()=>{
 const story=globalThis.StillwaterChatStory,older=story.reply;
 story.reply=(text,state)=>{
   if(!state.story.delivered.includes('v13.accepted'))return older(text,state);
   if(['v13.end-unverified','v13.end-released'].some(id=>state.story.delivered.includes(id)))return null;
   if(/10[月.\-/ ]*17|那天|后来|what happened|that day|october/i.test(text))return 'wcr-v13-day';
   if(/哪|where|location/i.test(text))return 'wcr-v13-where';
   if(/你是|本人|是谁|who|really you|identity/i.test(text))return 'wcr-v13-who';
   if(/吃|饭|hungry|food|dinner|lunch/i.test(text))return 'wcr-v13-food';
   if(/作业|赶工|homework|assignment/i.test(text))return 'wcr-v13-work';
   const mem=state.memories.wcr_new||={turn:0};mem.turn=(mem.turn||0)+1;
   return 'wcr-v13-ordinary-'+((mem.turn-1)%3);
 };
})();
