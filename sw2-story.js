/* Idempotent authored delivery. Closing a reading panel is the navigation boundary. */
globalThis.Stillwater2Story = {
  create({getState,save,chat,navigate}){
    const M=globalThis.Stillwater2Progress;
    function sync(){
      const s=getState();chat.setStoryRequest(s.friendRequest);
      for(const id of [...s.events.pending]){
        if(chat.deliverStory(id)){M.action(s,'delivered',{id});save();}
      }
    }
    function continueReading(){
      const s=getState();if(!s.transition)return;
      M.action(s,'continue');save();sync();
      navigate(s.route==='chat'?'chat?request=1':s.route);
    }
    return {sync,continueReading};
  },
};
