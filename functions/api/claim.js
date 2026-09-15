import{SPOTS,BASIN_ENDPOINT,biddingIsOpen,json,normalizeTransaction,validXProfile}from'../_lib/common.js';
function text(form,key){return String(form.get(key)||'').trim()}
function validUrl(value){try{return new URL(value).protocol==='https:'}catch{return false}}
function validFile(file,required=false,types=[]){if(!(file instanceof File)||file.size===0)return !required;return file.size<=10*1024*1024&&types.includes(file.type)}
export async function onRequestPost({request,env}){
  if(!env.SPOTS_DB)return json({error:'Database binding is missing'},503);
  if(!biddingIsOpen())return json({error:'Bidding is closed'},403);
  const form=await request.formData();
  const id=text(form,'spot_id').toUpperCase();
  const spot=SPOTS[id];
  const token=text(form,'reservation_token');
  const brand=text(form,'brand');
  const email=text(form,'email');
  const xProfile=text(form,'x_profile');
  const destination=text(form,'destination');
  const network=text(form,'network');
  const transaction=normalizeTransaction(network,text(form,'transaction'));
  const logo=form.get('logo');
  const qrCode=form.get('qr_code');
  if(!spot||!token)return json({error:'Your reservation is missing or expired'},400);
  if(!brand||brand.length>120)return json({error:'Enter a valid brand name'},400);
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254)return json({error:'Enter a valid work email'},400);
  if(!validXProfile(xProfile))return json({error:'Enter a direct X profile link'},400);
  if(!validUrl(destination))return json({error:'Enter a valid QR destination'},400);
  if(!transaction)return json({error:'The explorer link does not match the selected network'},400);
  if(!validFile(logo,true,['image/png','image/svg+xml']))return json({error:'A PNG or SVG logo under 10 MB is required'},400);
  if(!validFile(qrCode,false,['image/png','image/svg+xml','image/jpeg']))return json({error:'The optional QR file must be a PNG, SVG or JPG under 10 MB'},400);
  const now=Date.now();
  let pending;
  try{
    pending=await env.SPOTS_DB.prepare("UPDATE spots SET status='pending',brand=?,email=?,x_profile=?,destination=?,network=?,transaction_url=?,updated_at=? WHERE id=? AND status='reserved' AND reservation_token=? AND reserved_until>?").bind(brand,email,xProfile,destination,network,transaction,now,id,token,now).run();
  }catch(error){
    if(String(error).toLowerCase().includes('unique'))return json({error:'This transaction link has already been submitted'},409);
    throw error;
  }
  if((pending.meta?.changes||0)!==1)return json({error:'This reservation expired or the placement is no longer available'},409);
  form.set('spot_id',id);
  form.set('spot_name',spot.name);
  form.set('spot_price',spot.price);
  form.set('transaction',transaction);
  form.delete('reservation_token');
  let basinResponse;
  try{
    basinResponse=await fetch(env.BASIN_ENDPOINT||BASIN_ENDPOINT,{method:'POST',headers:{Accept:'application/json'},body:form});
  }catch{
    basinResponse=null;
  }
  if(!basinResponse?.ok){
    await env.SPOTS_DB.prepare("UPDATE spots SET status='reserved',brand=NULL,email=NULL,x_profile=NULL,destination=NULL,network=NULL,transaction_url=NULL,updated_at=? WHERE id=? AND status='pending' AND reservation_token=?").bind(Date.now(),id,token).run();
    return json({error:'Basin could not receive the claim. Your reservation remains active; please try again.'},502);
  }
  return json({ok:true,spotId:id,status:'pending'});
}
