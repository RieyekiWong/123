/* Dashboard-friendly, persistent quota gate. Each admission is ONE atomic SQLite
   INSERT ... SELECT ... WHERE statement. No read-then-write race or in-memory caps. */
const number=(env,key,fallback,max=10000000)=>Math.max(1,Math.min(max,Number.parseInt(env[key],10)||fallback));
export async function d1Gate(env,command,now=Date.now()) {
 const db=env.CHAT_DB,day=Date.UTC(new Date(now).getUTCFullYear(),new Date(now).getUTCMonth(),new Date(now).getUTCDate());
 if(command.kind==='release') {
  await db.prepare('UPDATE chat_quota SET lease_until = 0 WHERE id = ? AND kind = ?').bind(command.leaseId,'chat').run();
  return new Response(null,{status:204});
 }
 // Minimal quota metadata only; no text, tokens, raw IPs or personal identifiers.
 await db.prepare('DELETE FROM chat_quota WHERE at < ?').bind(now-86400000).run();
 if(!/^[a-zA-Z0-9_-]{30,64}$/.test(command.ip||''))return new Response(null,{status:429});
 let result;
 if(command.kind==='session') {
  result=await db.prepare(`INSERT INTO chat_quota (id,kind,ip,sid,at,reserved,lease_until)
   SELECT ?, 'session', ?, '', ?, 0, 0
   WHERE (SELECT COUNT(*) FROM chat_quota WHERE kind='session' AND ip=? AND at>=?) < 12
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='session' AND at>=?) < ?`)
   .bind(crypto.randomUUID(),command.ip,now,command.ip,now-3600000,day,number(env,'GLOBAL_SESSIONS_PER_DAY',600)).run();
 }else if(command.kind==='chat'&&typeof command.sid==='string'&&Number.isInteger(command.reserved)&&command.reserved>0&&command.reserved<=50000) {
  result=await db.prepare(`INSERT INTO chat_quota (id,kind,ip,sid,at,reserved,lease_until)
   SELECT ?, 'chat', ?, ?, ?, ?, ?
   WHERE (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND at>=?) < ?
   AND (SELECT COALESCE(SUM(reserved),0) FROM chat_quota WHERE kind='chat' AND at>=?) + ? <= ?
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND ip=? AND at>=?) < ?
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND ip=? AND at>=?) < ?
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND sid=? AND at>=?) < 60
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND sid=? AND at>=?) < 6
   AND (SELECT COUNT(*) FROM chat_quota WHERE kind='chat' AND lease_until>?) < ?
   AND NOT EXISTS (SELECT 1 FROM chat_quota WHERE kind='chat' AND sid=? AND lease_until>?)`)
   .bind(command.leaseId,command.ip,command.sid,now,command.reserved,now+18000,
    day,number(env,'GLOBAL_REQUESTS_PER_DAY',300),day,command.reserved,number(env,'GLOBAL_RESERVED_TOKENS_PER_DAY',300000),
    command.ip,day,number(env,'IP_REQUESTS_PER_DAY',60),command.ip,now-60000,number(env,'IP_REQUESTS_PER_MINUTE',6),
    command.sid,day,command.sid,now-60000,now,number(env,'MAX_CONCURRENT',6),command.sid,now).run();
 }else return new Response(null,{status:429});
 return new Response(null,{status:result.meta?.changes===1?204:429});
}
