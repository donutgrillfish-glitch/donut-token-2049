import{SPOTS,authorized,json}from'../../_lib/common.js';
export async function onRequestPost({request,env}){
  if(!authorized(request,env))return json({error:'Unauthorized'},401);
  if(!env.SPOTS_DB)return json({error:'Database binding is missing'},503);
  const body=await request.json().catch(()=>({}));
  const id=String(body.spotId||'').toUpperCase();
  const status=String(body.status||'').toLowerCase();
  if(!SPOTS[id]||!['sold','available'].includes(status))return json({error:'Invalid update'},400);
  if(status==='sold'){
    const result=await env.SPOTS_DB.prepare("UPDATE spots SET status='sold',reservation_token=NULL,reserved_until=NULL,updated_at=? WHERE id=? AND status='pending'").bind(Date.now(),id).run();
    if((result.meta?.changes||0)!==1)return json({error:'Only a pending claim can be marked SOLD'},409);
  }else{
    await env.SPOTS_DB.prepare("UPDATE spots SET status='available',reservation_token=NULL,reserved_until=NULL,brand=NULL,email=NULL,x_profile=NULL,destination=NULL,network=NULL,transaction_url=NULL,updated_at=? WHERE id=?").bind(Date.now(),id).run();
  }
  return json({ok:true,spotId:id,status});
}
