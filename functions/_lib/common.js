export const SPOTS={
  F1:{name:'Mainnet',price:'$550',amount:550},F2:{name:'Alpha Layer',price:'$450',amount:450},F3:{name:'Proof of Presence',price:'$375',amount:375},F4:{name:'L2 Lane',price:'$325',amount:325},
  B0:{name:'Prime Blockspace',price:'$750',amount:750},B1:{name:'Finality',price:'$550',amount:550},B2:{name:'Validator View',price:'$450',amount:450},B3:{name:'Onchain Trail',price:'$375',amount:375},B4:{name:'Last Block',price:'$325',amount:325},
  S1:{name:'Gas Saver',price:'$150',amount:150},S2:{name:'Next Block',price:'$200',amount:200}
};
export const BASIN_ENDPOINT='https://usebasin.com/f/d99450cefe47';
export const RESERVATION_MS=15*60*1000;
export const BIDDING_START=Date.parse('2026-09-15T00:00:00Z');
export const BIDDING_END=Date.parse('2026-09-29T17:00:00Z');
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
export function biddingIsOpen(now=Date.now()){return now>=BIDDING_START&&now<BIDDING_END}
export async function releaseExpired(db,id=null){
  const now=Date.now();
  const sql=id?"UPDATE spots SET status='available',reservation_token=NULL,reserved_until=NULL,updated_at=? WHERE id=? AND status='reserved' AND reserved_until<=?":"UPDATE spots SET status='available',reservation_token=NULL,reserved_until=NULL,updated_at=? WHERE status='reserved' AND reserved_until<=?";
  const values=id?[now,id,now]:[now,now];
  await db.prepare(sql).bind(...values).run();
}
export function normalizeTransaction(network,value){
  try{
    const url=new URL(String(value).trim());
    if(url.protocol!=='https:')return null;
    const host=url.hostname.toLowerCase().replace(/^www\./,'');
    const path=url.pathname.replace(/\/$/,'');
    const valid=network==='solana'?host==='solscan.io'&&/^\/tx\/[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(path):network==='ethereum'?host==='etherscan.io'&&/^\/tx\/0x[a-fA-F0-9]{64}$/.test(path):network==='base'?host==='basescan.org'&&/^\/tx\/0x[a-fA-F0-9]{64}$/.test(path):false;
    return valid?`https://${host}${path}`:null;
  }catch{return null}
}
export function validXProfile(value){
  try{
    const url=new URL(String(value).trim());
    if(url.protocol!=='https:'||!['x.com','www.x.com'].includes(url.hostname.toLowerCase()))return false;
    const match=url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/?$/);
    if(!match)return false;
    return !new Set(['home','explore','notifications','messages','i','settings','search','compose','login','signup','tos','privacy']).has(match[1].toLowerCase());
  }catch{return false}
}
export function authorized(request,env){
  const header=request.headers.get('Authorization')||'';
  return Boolean(env.ADMIN_TOKEN)&&header===`Bearer ${env.ADMIN_TOKEN}`;
}
