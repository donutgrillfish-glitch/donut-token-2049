import{json,releaseExpired}from'../_lib/common.js';
export async function onRequestGet({env}){
  if(!env.SPOTS_DB)return json({error:'Database binding is missing'},503);
  await releaseExpired(env.SPOTS_DB);
  const result=await env.SPOTS_DB.prepare('SELECT id,status,reserved_until AS reservedUntil FROM spots ORDER BY id').all();
  return json({spots:result.results||[]});
}
