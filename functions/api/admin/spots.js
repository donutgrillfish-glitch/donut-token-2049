import{authorized,json,releaseExpired}from'../../_lib/common.js';
export async function onRequestGet({request,env}){
  if(!authorized(request,env))return json({error:'Unauthorized'},401);
  if(!env.SPOTS_DB)return json({error:'Database binding is missing'},503);
  await releaseExpired(env.SPOTS_DB);
  const result=await env.SPOTS_DB.prepare('SELECT id,status,reserved_until AS reservedUntil,brand,email,x_profile AS xProfile,destination,network,transaction_url AS "transaction",updated_at AS updatedAt FROM spots ORDER BY id').all();
  return json({spots:result.results||[]});
}
