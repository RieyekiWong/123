/* Ordinary life before the investigation. Historical player lines are read-only. */
globalThis.Stillwater2OpeningData = (() => {
  const pair=(zh,en)=>[zh,en],folder='assets/story-v12/';
  const photos={
    old:{file:folder+'wcr-01-avatar-old.png',date:'2022',title:pair('咖啡店那张','The café photo'),caption:pair('你拍的。楚人说这张太像学校招生照，过了几天还是换成了头像。','You took this. Churen said it looked like a college brochure, then made it his avatar a few days later.')},
    friends:{file:folder+'wcr-02-three-friends.png',date:'2022-05-14',title:pair('吃完饭，走错了路','After lunch, the wrong way home'),caption:pair('左边是 GG，楚人在右边，拿相机的是你。GG 把地图转来转去，最后说“反正也没走多远”。','GG on the left, Churen on the right, you behind the camera. GG kept turning the map around, then said, “We didn’t go that far.”')},
    family:{file:folder+'wcr-04-family-dinner.png',date:'2021-08',title:pair('出发前的晚饭','Dinner before he left'),caption:pair('苏州，出国前。爸爸正低头夹菜，妈妈在跟楚人说话，妹妹又一笑得停不下来。楚人说不记得那天到底在笑什么了。','Suzhou, before Chicago. His dad is reaching for food, his mum is talking to him, and his sister Youyi can’t stop laughing. Churen said he couldn’t remember what was so funny.')},
    camera:{file:folder+'wcr-06-old-camera.png',date:'2022',title:pair('二手相机到了','The used camera arrived'),caption:pair('GG 帮忙试机，楚人一直盯着镜头有没有伸出来。镜头盖挂在腕带上，后来每张照片里都晃来晃去。','GG was testing it while Churen checked whether the lens had extended. The cap on the wrist strap kept swinging into later shots.')},
    campus:{file:'assets/story-v13/wcr-campus-original.png',date:'2022',title:pair('打印室的废片','The bad print'),caption:pair('学校打印室，颜色印偏了。楚人低头看了半天，最后决定先去吃饭。GG 当然把这张留了下来。','The college print room. The colours came out wrong. Churen stared at the sheet for a while, then decided to get food. Of course GG kept the photo.')},
  };
  const old=[];
  const say=(date,time,person,zh,en,extra={})=>old.push({person,text:pair(zh,en),displayTime:date+' '+time,at:Date.parse(date+'T'+time+':00'+(date.slice(5,7)==='11'?'-06:00':'-05:00')),...extra});
  say('2021-09-18','19:34','wcr_old','到芝加哥了 昨天一觉睡到下午','Made it to Chicago. Slept through most of yesterday.');
  say('2021-09-18','19:35','me','房间收拾好了没','Unpacked yet?');
  say('2021-09-18','19:36','wcr_old','箱子开了 算收拾了吧','The suitcase is open. Does that count?');
  say('2021-09-18','19:37','wcr_old','出门前吃的 最后一顿还是我妈问我吃饱没有','Last dinner at home. Mum still asked if I’d eaten enough.',{photo:'family'});
  say('2022-05-14','15:42','wcr_old','你跟 GG 到哪了','Where are you and GG?');
  say('2022-05-14','15:43','me','他说过了这个路口就到','He says it’s just past this junction.');
  say('2022-05-14','15:43','wcr_old','他刚才也是这么说的','He said that at the last one.');
  say('2022-05-14','18:06','wcr_old','地图拿反的是他 为什么笑最大声的也是他','He’s the one holding the map upside down. Why is he laughing the loudest?',{photo:'friends'});
  say('2022-05-14','18:07','me','这张挺好的啊','It’s a good photo though.');
  say('2022-05-14','18:08','wcr_old','下次喊我站近一点 我跟路过的一样','Tell me to stand closer next time. I look like I just wandered past.');
  say('2022-10-08','14:21','wcr_old','相机到了 GG 非要试','Camera arrived. GG insisted on testing it.',{photo:'camera'});
  say('2022-10-08','14:22','wcr_old','结果给我拍了二十张差不多的','Twenty almost identical pictures of me.');
  say('2022-10-08','14:23','me','至少没把镜头盖忘了','At least he remembered the lens cap.');
  say('2022-10-08','14:24','wcr_old','前五张是黑的 你猜为什么','First five were black. Guess why.');
  say('2022-11-09','17:42','wcr_old','你们别发群里 我那天在看印坏的样张','Don’t send this to the group. I was checking a bad print.',{photo:'campus'});
  say('2022-11-09','17:43','me','GG 已经发了','GG already did.');
  say('2022-11-09','17:44','wcr_old','行 晚饭他请','Fine. Dinner’s on him.');
  say('2023-08-23','17:02','wcr_old','你导出的那份文件发我一下','Send me that export?');
  say('2023-08-23','17:03','me','final_final_2 那个吗','The final_final_2 one?');
  say('2023-08-23','17:04','wcr_old','光 final 就三个了 你确定你也找得到吗','Three files called final. Can you even find it?');
  say('2023-09-22','21:16','wcr_old','我妈说蓝衣服穿三年了 明明最多两年半','Mum says I’ve worn the blue hoodie for three years. Two and a half, tops.');
  say('2023-09-22','21:17','wcr_old','又一给我发了个小狗 画得像土豆 我说这叫 potato-dog','Youyi sent me a dog drawing. Looks like a potato. Told her it’s a potato-dog.');
  say('2023-09-22','21:18','me','她没让你重画一个吗','Did she make you draw one back?');
  say('2023-09-22','21:19','wcr_old','让我不要画 说我更差','Told me not to. Says mine are worse.');
  say('2023-10-12','20:18','wcr_old','周末可能去银松镇 对一下作业那几张老照片','Might go to Silverpine this weekend. Need to place those old photos for class.');
  say('2023-10-12','20:19','wcr_old','只拍公开的地方 没打算进封起来的楼','Only the public areas. Not going into any closed buildings.');
  say('2023-10-12','20:20','wcr_old','等我回来找你们吃饭 不吃上次那家','Food when I get back. Anywhere but that place from last time.');
  say('2023-10-17','18:10','wcr_old','我好像找到那个地方了','I think I found the place.');
  say('2023-10-17','18:10','wcr_old','但这里没有酒店啊','But there’s no hotel here.');
  say('2023-10-17','18:11','wcr_old','地图上那个照片是不是放错了 我再看一下','Is the map photo in the wrong place? I’ll take another look.');
  say('2023-10-17','18:12','wcr_old','等我回去跟你们说','I’ll tell you when I get back.');
  const profile={about:pair('2002 年生，苏州人。2021 年到芝加哥读设计，跟你和 GG 常一起做作业、找吃的。喜欢拍旧招牌，买二手相机之前比价了半个月。','Born in 2002, from Suzhou. Moved to Chicago to study design in 2021. You, he and GG worked on assignments and found places to eat together. He liked old signs and spent two weeks comparing prices for a used camera.'),family:pair('爸爸妈妈和妹妹又一住在苏州。他分过家里寄来的点心，也常拿妹妹画的小狗当贴纸用。','His parents and younger sister Youyi live in Suzhou. He shared the pastries they sent and used his sister’s dog drawings as stickers.'),missing:pair('2023 年 10 月去银松镇拍课程照片后失去联系。你和 GG 找了三年，家人和学校也一直在找。最后可靠消息仍是这里留下的几句。','He lost contact after a course-photography trip to Silverpine in October 2023. You and GG have been looking for three years, alongside his family and school. These are still his last reliable messages.')};
  return Object.freeze({photos,old,profile});
})();
