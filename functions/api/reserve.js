import{SPOTS,RESERVATION_MS,biddingIsOpen,json,releaseExpired}from'../_lib/common.js';
export async function onRequestPost({request,env}){
  if(!env.SPOTS_DB)return json({error:'Database binding is missing'},503);
  if(!biddingIsOpen())return json({error:'Bidding is closed'},403);
  const body=await request.json().catch(()=>({}));
  const id=String(body.spotId||'').toUpperCase();
  if(!SPOTS[id])return json({error:'Unknown placement'},400);
  await releaseExpired(env.SPOTS_DB,id);
  const token=crypto.randomUUID();
  const now=Date.now();
  const reservedUntil=now+RESERVATION_MS;
  const result=await env.SPOTS_DB.prepare("UPDATE spots SET status='reserved',reservation_token=?,reserved_until=?,updated_at=? WHERE id=? AND status='available'").bind(token,reservedUntil,now,id).run();
  if((result.meta?.changes||0)!==1)return json({error:'This placement has already been reserved'},409);
  return json({spotId:id,reservationToken:token,reservedUntil},201);
}
