/* Independent fictional early-web windows, all opening local shop pages. */
globalThis.StillwaterAdCampaigns = (() => {
  const layouts={pet:'prize',cinema:'poster',repair:'utility',secondhand:'market',print:'coupon',cats:'message',weather:'widget',arcade:'arcade',travel:'travel',broadband:'broadband',snacks:'snacks',teahouse:'teahouse',vinyl:'vinyl',fortune:'fortune',ringtone:'ringtone',courses:'courses',sleep:'sleep'};
  const titles={
    pet:['恭喜您！访客礼包','Congratulations! Visitor gift'],
    cinema:['红沙发 · 今晚特价','Red Sofa · Tonight only'],
    repair:['老何在线 · 电脑服务','Mr Ho online · PC services'],
    secondhand:['小镇购物街 · 清仓专场','Smalltown mall · Clearance'],
    print:['打印优惠券，请收好','Your printing coupon'],
    cats:['您收到一条新消息','You have a new message'],
    weather:['小镇桌面天气','Smalltown desktop weather'],
    arcade:['系统来信 · 游戏礼包','System mail · Bonus pack'],
    travel:['周末旅游快讯','Weekend travel express'],
    broadband:['飞线宽带 · 小区通知','Fastwire · Area notice'],
    snacks:['早餐优惠派送','Breakfast coupons'],
    teahouse:['慢慢来 · 茶馆小窗','Take Your Time · Tea window'],
    vinyl:['唱片行 · 到货通知','Records · New arrivals'],
    fortune:['今日好运 · 免费翻签','Lucky slip · Free reading'],
    ringtone:['叮咚彩铃 · 本周榜单','Ding Dong · Weekly chart'],
    courses:['进修小课堂 · 招生','Quick Start · New classes'],
    sleep:['晚安家具 · 仓库清场','Goodnight · Warehouse sale'],
  };
  const effects={pet:'blink',cinema:'blink',repair:'lights',secondhand:'lights',print:'none',cats:'blink',weather:'none',arcade:'lights',travel:'blink',broadband:'none',snacks:'blink',teahouse:'none',vinyl:'none',fortune:'blink',ringtone:'lights',courses:'none',sleep:'blink'};
  function create({t,esc,photo}) {
    const text=(zh,en)=>esc(t(zh,en));
    const open=(ad,zh,en,cls='')=>`<button class="ad-offer-button ${cls}" data-ad-action="detail" data-ad-id="${ad.id}">${text(zh,en)}</button>`;
    const name=ad=>`<p class="ad-shop-name">${esc(t(...ad.name))}</p>`;
    function classicBody(ad) {
      return `<div class="ad-card-body"><p class="ad-teaser">✦ ${esc(t(...ad.tag))} ✦</p>${photo(ad.imageId)}<div><h2>${esc(t(...ad.headline))}</h2><p>${esc(t(...ad.copy))}</p>${name(ad)}<button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.cta))} →</button></div></div>`;
    }
    function body(ad) {
      switch(ad.id) {
        case 'pet':return `<div class="ad-card-body ad-prize-body"><p class="ad-teaser">${text('★ 第 888 位访客 ★','★ VISITOR No. 888 ★')}</p><h2>${text('恭喜！礼包已到站','Congratulations! A gift awaits')}</h2><div class="ad-prize-center">${photo(ad.imageId)}<div class="ad-prize-seal"><b>888</b><span>${text('幸运来访','LUCKY VISIT')}</span></div></div><p class="ad-prize-callout">${text('宠物护理礼包 · 限量派送','Pet care gift pack · Limited offer')}</p>${open(ad,'点击领取','Claim your gift')}${name(ad)}</div>`;
        case 'cinema':return `<div class="ad-card-body ad-poster-body"><div class="ad-poster-image">${photo(ad.imageId)}<span class="ad-poster-date">${text('今晚放映','TONIGHT')}</span><h2>${text('沙发给你留好了','Your sofa is waiting')}</h2></div><p class="ad-teaser">${text('电影之夜 · 特价入场','MOVIE NIGHT · SPECIAL ENTRY')}</p><div class="ad-ticket-offer"><strong>¥1</strong><span>${text('起 / 沙发席','FROM / SOFA SEAT')}</span>${open(ad,'查看场次','See the programme')}</div>${name(ad)}</div>`;
        case 'repair':return `<div class="ad-card-body ad-utility-body"><div class="ad-utility-menu" aria-hidden="true">${text('电脑服务　／　清灰　／　装机','PC SERVICE / CLEANING / SETUP')}</div><div class="ad-utility-main">${photo(ad.imageId)}<div><p class="ad-teaser">${text('老何今天在线','MR HO IS ONLINE')}</p><h2>${text('开机又等半天？','Still waiting for it to start?')}</h2></div></div><ul class="ad-service-list"><li>${text('网页卡顿','Slow websites')}</li><li>${text('风扇积灰','Dusty fans')}</li><li>${text('键盘失灵','Stuck keys')}</li></ul><p class="ad-utility-status"><i aria-hidden="true"></i>${text('免费咨询 · 不用下载东西','Free advice · No download')}</p>${open(ad,'找老何问问','Ask Mr Ho')}${name(ad)}</div>`;
        case 'secondhand':return `<div class="ad-card-body ad-market-body"><p class="ad-market-nav" aria-hidden="true">${text('首页　旧物　唱片　小家电','HOME / USED / RECORDS / HOMEWARE')}</p><div class="ad-market-head"><h2>${text('老板搬家！全场甩卖','MOVING SALE! EVERYTHING GOES')}</h2><p class="ad-teaser">${text('低到不敢标原价','TOO LOW TO SHOW THE OLD PRICE')}</p></div><div class="ad-market-goods">${[['旧电脑配件','PC parts','9.9','ad-computer'],['一箱唱片','Records','19','ad-records'],['旧打印设备','Print equipment','29','ad-print']].map(([zh,en,price,image])=>`<div>${photo(image)}<span>${text(zh,en)}</span><b>¥${price}<small>${text('起',' UP')}</small></b></div>`).join('')}</div>${open(ad,'进店捡漏','See the bargains')}${name(ad)}</div>`;
        case 'print':return `<div class="ad-card-body ad-coupon-body"><p class="ad-teaser">${text('凭此页面 · 到店优惠','BRING THIS PAGE · SHOP OFFER')}</p><div class="ad-coupon-ticket"><span>${text('打印 / 复印 / 装订','PRINT / COPY / BIND')}</span><h2><b>5</b>${text('折券','0% OFF')}</h2><p>${text('论文今晚交？先把券领了','Due tonight? Take the coupon first.')}</p></div><div class="ad-print-bottom">${photo(ad.imageId)}<p>${text('本店明早开门。\n今晚先祝你好运。','We open tomorrow morning.\nGood luck tonight.')}</p></div>${open(ad,'收下优惠券','Take the coupon')}${name(ad)}</div>`;
        case 'cats':return `<div class="ad-card-body ad-message-body"><div class="ad-message-person">${photo(ad.imageId)}<span><b>${text('照相馆小陈','Chen · Photo studio')}</b><small><i aria-hidden="true"></i>${text('在线 · 刚刚','Online · Just now')}</small></span></div><p class="ad-teaser">${text('新消息（1）','NEW MESSAGE (1)')}</p><div class="ad-chat-bubble">${text('在吗？新到三张猫照，给你看看。','You there? Three new cat pictures. Take a look.')}</div><div class="ad-message-photos">${ad.galleryIds.map(id=>photo(id)).join('')}</div><div class="ad-message-compose">${open(ad,'打开收到的相册','Open the photo album')}</div>${name(ad)}</div>`;
        case 'weather':return `<div class="ad-card-body ad-widget-body"><div class="ad-weather-main"><div><p class="ad-teaser">${text('小镇天气助手','SMALLTOWN WEATHER')}</p><h2>${text('出门带伞了吗？','Got your umbrella?')}</h2><strong>23°</strong><p>${text('多云，可能有雨','Cloudy. Possibly rain.')}</p></div>${photo(ad.imageId)}</div><div class="ad-weather-days">${[['今天','Today','☁'],['明天','Tomorrow','☂'],['后天','Next day','☀']].map(([zh,en,icon])=>`<span><b>${icon}</b>${text(zh,en)}</span>`).join('')}</div>${open(ad,'翻翻本周小报','Read this week’s bulletin')}${name(ad)}</div>`;
        case 'arcade':return `<div class="ad-card-body ad-arcade-body"><p class="ad-teaser">★ BONUS MAIL ★</p><div class="ad-arcade-screen"><span>1UP　000888</span><h2>${text('礼包已到账！','BONUS READY!')}</h2>${photo(ad.imageId)}<b>★ ★ ★</b></div>${open(ad,'领取游戏礼包','OPEN BONUS PACK')}<p>${text('无需下载 · 看看再说','NO DOWNLOAD · HAVE A LOOK')}</p>${name(ad)}</div>`;
        case 'travel':return `<div class="ad-card-body ad-travel-body"><div class="ad-travel-picture">${photo(ad.imageId)}<span>${text('周末出发','WEEKEND AWAY')}</span></div><div class="ad-travel-deal"><span>${text('两人同行','TRAVEL FOR TWO')}</span><h2>${text('一人免单？','ONE GOES FREE?')}</h2><small>${text('另一位负责看行李','The other minds the bags')}</small></div><p class="ad-teaser">${text('湖畔一日游 · 车上有空调','LAKESIDE DAY TRIP · AIR-CONDITIONED COACH')}</p>${open(ad,'查看行程','SEE THE TRIP')}${name(ad)}</div>`;
        case 'broadband':return `<div class="ad-card-body ad-broadband-body"><p class="ad-broadband-letter">${text('致本小区住户：','DEAR RESIDENT,')}</p><h2>${text('别再占着电话线啦','GIVE THE PHONE LINE BACK')}</h2><div class="ad-modem"><span aria-hidden="true">▰　▰　▰</span><b>POWER　LINK　DATA</b></div><ul><li>${text('上网不用拨号','No dial-up')}</li><li>${text('电话照样能打','Keep making calls')}</li><li>${text('师傅周三上门','Installer visits Wednesday')}</li></ul>${open(ad,'比较宽带套餐','COMPARE PLANS')}${name(ad)}</div>`;
        case 'snacks':return `<div class="ad-card-body ad-snacks-body"><span class="ad-snacks-stamp">${text('热！','HOT!')}</span><p class="ad-teaser">${text('早餐券 · 今天别空着肚子','BREAKFAST COUPON · EAT SOMETHING')}</p><h2>${text('第二份','SECOND ORDER')}<b>${text('半价','½ PRICE')}</b></h2>${photo(ad.imageId)}<p>${text('豆浆趁热 · 油条刚炸好','Hot soy milk · Fresh dough sticks')}</p>${open(ad,'看看今天吃什么','SEE THE MENU')}${name(ad)}</div>`;
        case 'teahouse':return `<div class="ad-card-body ad-teahouse-body"><div class="ad-teahouse-columns"><h2>${text('一壶茶','ONE POT')}<span>${text('坐一下午','TAKE YOUR TIME')}</span></h2>${photo(ad.imageId)}</div><p class="ad-teaser">${text('老板不催客　热水管够','NO RUSH · HOT WATER INCLUDED')}</p>${open(ad,'进来歇会儿','COME AND REST')}${name(ad)}</div>`;
        case 'vinyl':return `<div class="ad-card-body ad-vinyl-body"><p class="ad-vinyl-strip">SIDE A　／　33⅓ RPM</p><div class="ad-vinyl-sleeve">${photo(ad.imageId)}<span aria-hidden="true">●</span></div><h2>${text('最后一箱老唱片','LAST CRATE OF OLD RECORDS')}</h2><p>${text('封套旧一点，没关系。','A worn sleeve never hurt a good record.')}</p>${open(ad,'翻翻这一箱','DIG THROUGH THE CRATE')}${name(ad)}</div>`;
        case 'fortune':return `<div class="ad-card-body ad-fortune-body"><p class="ad-teaser">${text('今日好运 · 免费一签','TODAY’S LUCK · FREE SLIP')}</p><div class="ad-fortune-slip"><span>${text('签','LUCK')}</span><h2>${text('上上签','GOOD FORTUNE')}</h2><p>${text('今天，说不定就轮到你了。','Maybe today is your day.')}</p></div>${open(ad,'翻开看看','TURN IT OVER')}<p>${text('不问生辰 · 不收钱','NO BIRTHDAY · NO FEE')}</p>${name(ad)}</div>`;
        case 'ringtone':return `<div class="ad-card-body ad-ringtone-body"><p class="ad-teaser">${text('本周彩铃排行榜','THIS WEEK’S RINGBACK CHART')}</p><div class="ad-ringtone-player"><span aria-hidden="true">♪</span><h2>${text('来电，换个心情','A NEW SOUND FOR EVERY CALL')}</h2></div><ol><li><b>01</b>${text('马上就接','Be Right There')}</li><li><b>02</b>${text('今天休息','Day Off')}</li><li><b>03</b>${text('手机在哪','Where’s My Phone')}</li></ol>${open(ad,'打开完整榜单','VIEW THE CHART')}${name(ad)}</div>`;
        case 'courses':return `<div class="ad-card-body ad-courses-body"><p class="ad-courses-tab">${text('招生简章','COURSE NOTICE')}</p><h2>${text('三天学会','LEARN IN THREE DAYS')}<span>${text('准时下班','LEAVING ON TIME')}</span></h2><dl><div><dt>${text('周二','TUE')}</dt><dd>${text('表格入门','SPREADSHEETS')}</dd></div><div><dt>${text('周四','THU')}</dt><dd>${text('说话简洁','GET TO THE POINT')}</dd></div></dl><p>${text('第一课：先把电脑关了。','Lesson one: shut the computer down.')}</p>${open(ad,'看看课程安排','READ THE TIMETABLE')}${name(ad)}</div>`;
        case 'sleep':return `<div class="ad-card-body ad-sleep-body"><p class="ad-teaser">${text('样品清场　错过再等','FLOOR MODEL CLEARANCE')}</p><div class="ad-sleep-showroom">${photo(ad.imageId)}<strong>${text('零元','FREE')}<small>${text('试坐','TEST SIT')}</small></strong></div><h2>${text('坐下就不想走？','HARD TO GET UP AGAIN?')}</h2><p>${text('没事，老板也这么说。','The owner says the same thing.')}</p>${open(ad,'去看看样品','SEE THE SOFAS')}${name(ad)}</div>`;
        default:return '';
      }
    }
    return {
      body:(ad,classic=false)=>classic?classicBody(ad):body(ad),
      title:(ad,classic=false)=>classic?t('AD · 本地推荐','AD · Local picks'):t(...titles[ad.id]),
      layout:(ad,classic=false)=>classic?'classic':layouts[ad.id],
      effect:(ad,classic=false)=>classic?(['cinema','cats'].includes(ad.id)?'blink':['repair','secondhand'].includes(ad.id)?'lights':'none'):effects[ad.id],
    };
  }
  return {create,layouts,titles,effects};
})();
