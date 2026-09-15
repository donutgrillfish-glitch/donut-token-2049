const spots=[
  {id:'F1',name:'Mainnet',zone:'Pants · Front',price:'$550',amount:550,copy:'The largest front placement for arrivals, interviews, portraits and walking clips.'},
  {id:'F2',name:'Alpha Layer',zone:'Pants · Front',price:'$450',amount:450,copy:'A strong upper-leg position built to capture early attention in standing and seated content.'},
  {id:'F3',name:'Proof of Presence',zone:'Pants · Front',price:'$375',amount:375,copy:'A mid-leg placement proving real-world visibility while walking, meeting and filming.'},
  {id:'F4',name:'L2 Lane',zone:'Pants · Front',price:'$325',amount:325,copy:'A smaller, more accessible placement with full-fit and low-angle visibility.'},
  {id:'B0',name:'Prime Blockspace',zone:'Pants · Back',price:'$750',amount:750,copy:'The largest scarce canvas on the outfit, centered for exit shots and walking footage.'},
  {id:'B1',name:'Finality',zone:'Pants · Back',price:'$550',amount:550,copy:'A premium rear placement for crowd shots, exit frames and event-floor footage.'},
  {id:'B2',name:'Validator View',zone:'Pants · Back',price:'$450',amount:450,copy:'A clean upper-back position that remains visible while moving through the venue.'},
  {id:'B3',name:'Onchain Trail',zone:'Pants · Back',price:'$375',amount:375,copy:'A mid-leg rear position made for candid walking shots and recap sequences.'},
  {id:'B4',name:'Last Block',zone:'Pants · Back',price:'$325',amount:325,copy:'An accessible lower-back placement for full-body photographs and video.'},
  {id:'S1',name:'Gas Saver',zone:'Shoes',price:'$150',amount:150,copy:'The lowest-cost logo + QR entry for low-angle shots, fit checks and walking clips.'},
  {id:'S2',name:'Next Block',zone:'Shoes',price:'$200',amount:200,copy:'A logo + QR placement designed to land in every complete outfit frame.'}
];
const spotStatuses=new Map(spots.map(spot=>[spot.id,{status:'available',reservedUntil:null}]));
const grid=document.querySelector('#spot-grid');
const modal=document.querySelector('#claim-modal');
const title=document.querySelector('#modal-title');
const toast=document.querySelector('.toast');
const claimForm=document.querySelector('#claim-form');
const claimSubmit=document.querySelector('#claim-submit');
const networkSelect=document.querySelector('#payment-network');
const transactionInput=document.querySelector('[name="transaction"]');
const xProfileInput=document.querySelector('[name="x_profile"]');
const reservationNote=document.querySelector('#reservation-note');
const biddingStartsAt=new Date('2026-09-15T00:00:00Z').getTime();
const biddingEndsAt=new Date('2026-09-29T17:00:00Z').getTime();
let reservationTimer;
let openingSpot=false;

function biddingIsOpen(){const now=Date.now();return now>=biddingStartsAt&&now<biddingEndsAt}
function reservationKey(id){return `token2049-reservation-${id}`}
function getOwnReservation(id){
  try{
    const saved=JSON.parse(sessionStorage.getItem(reservationKey(id))||'null');
    if(!saved||!saved.token||saved.reservedUntil<=Date.now()){sessionStorage.removeItem(reservationKey(id));return null}
    return saved;
  }catch{sessionStorage.removeItem(reservationKey(id));return null}
}
function statusLabel(id){
  const state=spotStatuses.get(id)?.status||'available';
  if(state==='sold')return 'SOLD';
  if(state==='pending')return 'PENDING';
  if(state==='reserved')return getOwnReservation(id)?'YOUR RESERVATION':'RESERVED';
  return 'AVAILABLE';
}
function spotCanOpen(id){
  const state=spotStatuses.get(id)?.status||'available';
  return state==='available'||(state==='reserved'&&Boolean(getOwnReservation(id)));
}
function renderInventory(){
  grid.innerHTML=spots.map(spot=>{
    const state=spotStatuses.get(spot.id)?.status||'available';
    const canOpen=spotCanOpen(spot.id)&&biddingIsOpen();
    return `<article class="spot-card status-${state}${canOpen?'':' claimed'}" ${canOpen?`tabindex="0" data-id="${spot.id}"`:'aria-disabled="true"'}><span class="code">${spot.id} / ${spot.zone}</span><h3>${spot.name}</h3><p>${spot.copy}</p><footer><strong>${spot.price}</strong><span class="available">${statusLabel(spot.id)}</span></footer></article>`;
  }).join('');
  const availableCount=spots.filter(spot=>(spotStatuses.get(spot.id)?.status||'available')==='available').length;
  const raised=spots.filter(spot=>spotStatuses.get(spot.id)?.status==='sold').reduce((sum,spot)=>sum+spot.amount,0);
  document.querySelector('#open-count').textContent=String(availableCount);
  document.querySelector('#raised').textContent=`$${raised.toLocaleString()}`;
  document.querySelectorAll('.marker[data-id],.claim-feature[data-id]').forEach(el=>{
    const state=spotStatuses.get(el.dataset.id)?.status||'available';
    const canOpen=spotCanOpen(el.dataset.id)&&biddingIsOpen();
    el.classList.remove('status-available','status-reserved','status-pending','status-sold','claimed');
    el.classList.add(`status-${state}`);
    el.classList.toggle('claimed',!canOpen);
    el.setAttribute('aria-disabled',String(!canOpen));
    if(el.matches('button'))el.disabled=!canOpen;
  });
}
async function loadSpotStatuses(showFailure=false){
  try{
    const response=await fetch('/api/spots',{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error('Inventory unavailable');
    const data=await response.json();
    data.spots.forEach(state=>spotStatuses.set(state.id,state));
    renderInventory();
  }catch{
    if(showFailure)showToast('Inventory is reconnecting — please try again');
  }
}
function updateBiddingState(){
  const now=Date.now();
  const isOpen=biddingIsOpen();
  document.querySelector('#sales-status').textContent=now<biddingStartsAt?'BIDDING OPENS SEP 15':isOpen?'BIDDING LIVE':'BIDDING CLOSED';
  document.body.classList.toggle('sales-closed',!isOpen);
  renderInventory();
  if(!isOpen&&modal.open)modal.close();
}
async function reserveSpot(id){
  const own=getOwnReservation(id);
  if(own&&(spotStatuses.get(id)?.status==='reserved'))return own;
  const response=await fetch('/api/reserve',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({spotId:id})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'This placement was just reserved');
  const reservation={token:data.reservationToken,reservedUntil:data.reservedUntil};
  sessionStorage.setItem(reservationKey(id),JSON.stringify(reservation));
  spotStatuses.set(id,{id,status:'reserved',reservedUntil:data.reservedUntil});
  renderInventory();
  return reservation;
}
function startReservationCountdown(id,reservedUntil){
  clearInterval(reservationTimer);
  const update=()=>{
    const remaining=Math.max(0,reservedUntil-Date.now());
    const minutes=Math.floor(remaining/60000);
    const seconds=Math.floor((remaining%60000)/1000);
    reservationNote.textContent=remaining?`Reserved to you for ${minutes}:${String(seconds).padStart(2,'0')}. Submit payment details before the timer ends.`:'Reservation expired. Close this form and reserve the spot again.';
    if(!remaining){clearInterval(reservationTimer);claimSubmit.disabled=true;sessionStorage.removeItem(reservationKey(id));loadSpotStatuses()}
  };
  update();
  reservationTimer=setInterval(update,1000);
}
async function openClaim(id){
  if(openingSpot)return;
  if(!biddingIsOpen()){showToast('Bidding closed September 29 at 5:00 PM UTC');return}
  const spot=spots.find(item=>item.id===id);
  if(!spot)return;
  openingSpot=true;
  showToast('Securing this placement…');
  try{
    const reservation=await reserveSpot(id);
    claimForm.reset();
    setWallet();
    document.querySelector('#claim-success').style.display='none';
    document.querySelector('#claim-error').style.display='none';
    title.textContent=`${spot.id} — ${spot.price}`;
    document.querySelector('#claim-spot-id').value=spot.id;
    document.querySelector('#claim-spot-name').value=spot.name;
    document.querySelector('#claim-spot-price').value=spot.price;
    document.querySelector('#reservation-token').value=reservation.token;
    claimSubmit.disabled=false;
    claimSubmit.textContent='Submit claim for verification';
    modal.showModal();
    startReservationCountdown(id,reservation.reservedUntil);
    document.querySelectorAll('.marker').forEach(marker=>marker.classList.toggle('active',marker.dataset.id===id));
  }catch(error){
    showToast(error.message);
    await loadSpotStatuses();
  }finally{openingSpot=false}
}
document.addEventListener('click',event=>{const hit=event.target.closest('[data-id]');if(hit&&!hit.disabled)openClaim(hit.dataset.id)});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('spot-card'))openClaim(event.target.dataset.id)});
document.querySelector('.modal-close').onclick=()=>{clearInterval(reservationTimer);modal.close()};
modal.addEventListener('click',event=>{if(event.target===modal){clearInterval(reservationTimer);modal.close()}});

const walletMap={solana:{label:'SOLANA USDC',address:'9waU4ReAW6YCxbyCae4d2WsyQsTYhSkiA5s5pdFWG8ip'},ethereum:{label:'ETHEREUM ERC-20 USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'},base:{label:'BASE USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'}};
function setWallet(){const wallet=walletMap[networkSelect.value];document.querySelector('#wallet-label').textContent=`ONCHAIN CLAIM · ${wallet.label}`;document.querySelector('#wallet-address').textContent=wallet.address}
function validTransactionLink(){
  try{
    const url=new URL(transactionInput.value.trim());
    if(url.protocol!=='https:')return false;
    const host=url.hostname.toLowerCase().replace(/^www\./,'');
    const path=url.pathname.replace(/\/$/,'');
    if(networkSelect.value==='solana')return host==='solscan.io'&&/^\/tx\/[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(path);
    if(networkSelect.value==='ethereum')return host==='etherscan.io'&&/^\/tx\/0x[a-fA-F0-9]{64}$/.test(path);
    if(networkSelect.value==='base')return host==='basescan.org'&&/^\/tx\/0x[a-fA-F0-9]{64}$/.test(path);
    return false;
  }catch{return false}
}
function validateTransactionLink(){const valid=validTransactionLink();const explorer=networkSelect.value==='solana'?'Solscan':networkSelect.value==='ethereum'?'Etherscan':'Basescan';transactionInput.setCustomValidity(valid?'':`Paste a valid ${explorer} transaction link for the selected network.`);return valid}
function validXProfileLink(){
  try{
    const url=new URL(xProfileInput.value.trim());
    if(url.protocol!=='https:'||!['x.com','www.x.com'].includes(url.hostname.toLowerCase()))return false;
    const match=url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/?$/);
    if(!match)return false;
    return !new Set(['home','explore','notifications','messages','i','settings','search','compose','login','signup','tos','privacy']).has(match[1].toLowerCase());
  }catch{return false}
}
function validateXProfileLink(){const valid=validXProfileLink();xProfileInput.setCustomValidity(valid?'':'Paste a valid X profile link, for example https://x.com/yourbrand.');return valid}
networkSelect.addEventListener('change',()=>{setWallet();if(transactionInput.value)validateTransactionLink()});
transactionInput.addEventListener('input',()=>transactionInput.setCustomValidity(''));
xProfileInput.addEventListener('input',()=>xProfileInput.setCustomValidity(''));
document.querySelector('#copy-wallet').onclick=async()=>{const wallet=walletMap[networkSelect.value];try{await navigator.clipboard.writeText(wallet.address);showToast(`${wallet.label} wallet copied`)}catch{showToast('Copy the wallet address manually')}};
claimForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!biddingIsOpen()){modal.close();showToast('Bidding is closed');return}
  if(!claimForm.checkValidity()){claimForm.reportValidity();return}
  if(!validateXProfileLink()){xProfileInput.reportValidity();return}
  if(!validateTransactionLink()){transactionInput.reportValidity();return}
  claimSubmit.disabled=true;
  claimSubmit.textContent='Submitting securely…';
  try{
    const response=await fetch('/api/claim',{method:'POST',headers:{Accept:'application/json'},body:new FormData(claimForm)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Submission failed. Please try again.');
    const id=document.querySelector('#claim-spot-id').value;
    sessionStorage.removeItem(reservationKey(id));
    clearInterval(reservationTimer);
    modal.close();
    showToast('Claim received — pending payment verification');
    await loadSpotStatuses();
  }catch(error){
    document.querySelector('#claim-error').textContent=error.message;
    document.querySelector('#claim-error').style.display='block';
    showToast(error.message);
    claimSubmit.disabled=false;
    claimSubmit.textContent='Submit claim for verification';
    await loadSpotStatuses();
  }
});
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)}
document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('details').forEach(other=>{if(other!==detail)other.open=false})}));
document.querySelectorAll('.view-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.view-tab').forEach(item=>item.classList.toggle('active',item===tab));document.querySelectorAll('.fit-view').forEach(view=>view.classList.toggle('active',view.dataset.panel===tab.dataset.view))}));
updateBiddingState();
loadSpotStatuses(true);
setInterval(()=>loadSpotStatuses(),10000);
setInterval(updateBiddingState,1000);
