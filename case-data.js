/* All case facts and clue provenance live here; decorative values never act as passwords. */
globalThis.StillwaterCaseData = (() => {
  const facts = Object.freeze({reservation:'R-4829', bookedRoom:'318', service:'317',
    guest:'E. Vale', reviewer:'E-014', reviewerName:'Mara Ellis', temporary:'TEMP-015',
    notice:'A-06-17', created:'2006-10-16T23:40', message:'2006-10-17T02:40',
    housekeeping:'2006-10-17T02:50', transfer:'2006-10-17T03:17', draft:'2006-10-17T03:24',
    closure:'2007-01-08', recruitment:'2026-11', system:'Continuity'});
  const inventory = Object.freeze(Array.from({length:20},(_,i)=>String(301+i)).filter(n=>n!==facts.service));
  const clues = Object.freeze({
    C1:{source:'careers/sample',route:'careers',usedFor:['reservation_search'],unlockedAt:'public',title:['样本预订编号','Sample reservation reference']},
    C2:{source:'hotel/reservation/'+facts.reservation,route:'reservations',usedFor:['inventory_comparison'],unlockedAt:'C1',title:['原预订与分配房号','Original booking and room assignment']},
    C3:{source:'hotel/rooms',route:'rooms',usedFor:['room_317_gap'],unlockedAt:'C2',title:['三层官方客房清单','Official third-floor guest inventory']},
    C4:{source:'hotel/guestbook/'+facts.message,route:'guestbook',usedFor:['floor_plan_lookup'],unlockedAt:'C3',title:['钥匙套上的房号','The number on the key sleeve']},
    C5:{source:'hotel/floor-plan',route:'floor-plan',usedFor:['service_docket','final_evidence_service'],unlockedAt:'C4',title:['服务区域的登记属性','Classification of the service area']},
    C6:{source:'staff/incident/'+facts.notice,route:'maintenance',usedFor:['night_audit','staff_E014','final_evidence_reviewer'],unlockedAt:'C5',title:['夜审移交处理人','Night-audit handover owner']},
    C7:{source:'staff/revisions',route:'revisions',usedFor:['final_evidence_revision'],unlockedAt:'audit',title:['原稿与修订的差异','Changes between the original and revision']},
    C8:{source:'hotel/closure-notice',route:'history',usedFor:['hiring_realization','mara_draft'],unlockedAt:'C7',title:['停止营业的日期','The closure date']},
    C9:{source:'staff/mara-draft',route:'mara',usedFor:['final_decision'],unlockedAt:'C8',title:['Mara 留存的原备注','Mara’s retained original note']}
  });
  return Object.freeze({facts,inventory,clues});
})();
