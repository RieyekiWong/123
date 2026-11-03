/* Seven fictional early-web campaigns; each opens its existing local shop. */
globalThis.StillwaterAdCampaigns = (() => {
  const layouts={pet:'prize',cinema:'poster',repair:'utility',secondhand:'market',print:'coupon',cats:'message',weather:'widget'};
  const titles={
    pet:['恭喜您！访客礼包','Congratulations! Visitor gift'],
    cinema:['红沙发 · 今晚特价','Red Sofa · Tonight only'],
    repair:['老何在线 · 电脑服务','Mr Ho online · PC services'],
    secondhand:['小镇购物街 · 清仓专场','Smalltown mall · Clearance'],
    print:['打印优惠券，请收好','Your printing coupon'],
    cats:['您收到一条新消息','You have a new message'],
    weather:['小镇桌面天气','Smalltown desktop weather'],
  };
  const effects={pet:'blink',cinema:'blink',repair:'lights',secondhand:'lights',print:'none',cats:'blink',weather:'none'};
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
