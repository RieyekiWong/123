/* Ordinary hotel ephemera. None of these controls records evidence. */
globalThis.StillwaterHotelExtras = (()=>{
 const guests=[
 {name:'L. Chen',at:'2006-09-08 10:26',text:['我们只住了一晚。房间挺安静的，早上到湖边走了走。前台帮忙找到了忘在餐厅的围巾，谢谢。','We only stayed one night. The room was quiet and we walked by the lake in the morning. Thank you to reception for finding the scarf we left in the dining room.']},
 {name:'M. Cooper',at:'2006-09-24 16:11',text:['庭院比照片里小一点，不过天气好的时候坐着很舒服。早餐的面包不错。','The courtyard is a little smaller than it looks in the pictures, but lovely to sit in when the weather is good. Nice bread at breakfast.']},
 {name:'H. Wong',at:'2006-10-09 08:48',text:['到得太晚了，本来怕没人。前台还亮着灯，办入住很快。下次希望能多待两天。','We arrived very late and were worried no one would be there. The reception light was on and check-in was quick. Hope to stay longer next time.']},
 {name:'S. Reed',at:'2006-10-12 12:07',text:['二楼那边走路会听到一点木地板的声音，不过总体挺不错。大堂的旧照片很好看。','Some creaking from the wooden floor on the second floor, but a good stay overall. Loved the old photographs in the lobby.']},
 ];
 const captions={
 'lobby.jpg':["进门左转，前台就在木楼梯旁。",'Reception is beside the old wooden stairs. Turn left as you come in.'],
 'web/hotel-dining.jpg':['餐厅不大，早上供应简单的早餐。','A small dining room serving a simple breakfast each morning.'],
 'web/hotel-garden.jpg':['有太阳的时候，院子里的座位最先坐满。','The courtyard seats fill up first on sunny days.'],
 'web/hotel-lounge.jpg':['雨天可以在这里看书，旁边有热水供应。','A place to read on rainy days, with hot water nearby.'],
 'guestroom.jpg':['双人床、书桌和独立卫浴。','A double bed, writing desk and private bathroom.'],
 'twin.jpg':["配有两张单人床，房间靠庭院一侧。","Two single beds, on the courtyard side of the hotel."],
 'suite.jpg':["设有独立休息区，适合住上几晚。",'A sitting area for guests planning to stay a little longer.'],
 'web/hotel-exterior.jpg':['湖边的建筑，门前有一段石板路。','The lakeside building, with a stone path by the entrance.'],
 };
 function note({t}) {return `<aside class="hotel-desk-note"><h2>${t('前台便条','A note from reception')}</h2><p>${t("出门前需要寄存行李，请先到前台问一下。贵重物品请随身带好。",'If you would like to leave luggage before going out in the morning, please check with the member of staff on duty. Keep valuables with you.')}</p></aside>`;}
 function guide({t}) {return `<details class="hotel-guest-guide"><summary>${t('住店小指南','A little guide to your stay')}</summary><ul><li>${t('早餐请到一层餐厅。','Breakfast is in the ground-floor dining room.')}</li><li>${t("需要加一条毛巾，请到前台领取。",'Ask reception for extra towels.')}</li><li>${t("夜间请轻声关门，以免打扰其他住客。",'Close doors quietly at night so other guests can rest.')}</li></ul></details>`;}
 function home({t,esc}) {
  const exterior=globalThis.StillwaterMedia.find('hotel-exterior');
  return `<nav class="hotel-useful-links" aria-label="${t('了解旅馆','Explore the hotel')}">${[['rooms',['看看房间','See the rooms'],['双人房、双床房和长住套间。','Double, twin and longer-stay rooms.']],['gallery',['翻翻相册','Browse the album'],['大堂、庭院，还有一些房间照片。','The lobby, courtyard and a few rooms.']],['contact',['前台服务','Reception services'],["早餐时间、加领毛巾和晚到入住。",'Breakfast, towels and late arrivals.']]].map(([route,title,copy],i)=>`<a href="#${route}"><span aria-hidden="true">0${i+1}</span><strong>${t(...title)} →</strong><small>${t(...copy)}</small></a>`).join('')}</nav><section class="hotel-ephemera"><div><button type="button" class="hotel-postcard" data-hotel-postcard aria-pressed="false" aria-label="${t('翻看旅馆明信片','Turn the hotel postcard over')}"><span class="hotel-postcard-front"><img src="assets/${esc(exterior.file)}" alt="${esc(t(...exterior.alt))}" loading="lazy"><strong>Greetings from Stillwater</strong><span>${t("希望您来的时候，湖边正是好天气。",'Wishing you fine weather by the lake.')}</span></span><span class="hotel-postcard-back" hidden><strong>STILLWATER HOTEL</strong><span>${t('早餐 7:00–9:00 / 前台全天有人 / 离店前请归还房卡','Breakfast 7:00–9:00 / Reception staffed around the clock / Please return your room card before leaving')}</span></span><small class="hotel-postcard-turn">${t('轻点翻面','Click to turn over')} ↔</small></button></div><div>${note({t})}${guide({t})}</div></section>`;
 }
 function guestEntries({t,esc}) {return guests.map(guest=>`<article class="guest-message ordinary-guest-entry"><header><strong>${guest.name}</strong><time datetime="${guest.at.replace(' ','T')}">${guest.at}</time></header><p>${esc(t(...guest.text))}</p></article>`).join('');}
 let lightbox=null,returnFocus=null;
 function closePhoto(){lightbox?.close();}
 function openPhoto(button) {
  const figure=button.closest('figure'),image=button.querySelector('img'),caption=figure.querySelector('figcaption');if(!image||!caption)return;
  const zh=document.documentElement.lang==='zh-CN';
  if(!lightbox){lightbox=document.createElement('dialog');lightbox.id='hotel-lightbox';lightbox.setAttribute('aria-labelledby','hotel-photo-caption');document.body.append(lightbox);
   lightbox.addEventListener('click',event=>{if(event.target===lightbox||event.target.closest('[data-hotel-photo-close]'))closePhoto();});
   lightbox.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  }
  returnFocus=button;lightbox.replaceChildren();
  const heading=document.createElement('header'),title=document.createElement('span'),close=document.createElement('button');title.textContent=zh?'旅馆相册':'Hotel album';close.type='button';close.dataset.hotelPhotoClose='';close.textContent='×';close.setAttribute('aria-label',zh?'关闭照片':'Close photograph');heading.append(title,close);
  const photo=document.createElement('img');photo.src=image.currentSrc||image.src;photo.alt=image.alt;
  const text=document.createElement('p');text.id='hotel-photo-caption';text.textContent=caption.textContent;lightbox.append(heading,photo,text);lightbox.showModal();close.focus();
 }
 globalThis.document?.addEventListener('click',event=>{
  const postcard=event.target.closest('[data-hotel-postcard]');if(postcard){const back=postcard.getAttribute('aria-pressed')!=='true';postcard.setAttribute('aria-pressed',String(back));postcard.querySelector('.hotel-postcard-front').hidden=back;postcard.querySelector('.hotel-postcard-back').hidden=!back;}
  const photo=event.target.closest('[data-hotel-photo]');if(photo)openPhoto(photo);
 });
 globalThis.window?.addEventListener('hashchange',closePhoto);
 return {home,note,guide,guestEntries,captions,guests};
})();
