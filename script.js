const spots=[
  {id:'F1',name:'Mainnet',zone:'Pants · Front',price:'$550',copy:'The largest front placement for arrivals, interviews, portraits and walking clips.'},
  {id:'F2',name:'Alpha Layer',zone:'Pants · Front',price:'$450',copy:'A strong upper-leg position built to capture early attention in standing and seated content.'},
  {id:'F3',name:'Proof of Presence',zone:'Pants · Front',price:'$375',copy:'A mid-leg placement proving real-world visibility while walking, meeting and filming.'},
  {id:'F4',name:'L2 Lane',zone:'Pants · Front',price:'$325',copy:'A smaller, more accessible placement with full-fit and low-angle visibility.'},
  {id:'B0',name:'Prime Blockspace',zone:'Pants · Back',price:'$750',copy:'The largest scarce canvas on the outfit, centered for exit shots and walking footage.'},
  {id:'B1',name:'Finality',zone:'Pants · Back',price:'$550',copy:'A premium rear placement for crowd shots, exit frames and event-floor footage.'},
  {id:'B2',name:'Validator View',zone:'Pants · Back',price:'$450',copy:'A clean upper-back position that remains visible while moving through the venue.'},
  {id:'B3',name:'Onchain Trail',zone:'Pants · Back',price:'$375',copy:'A mid-leg rear position made for candid walking shots and recap sequences.'},
  {id:'B4',name:'Last Block',zone:'Pants · Back',price:'$325',copy:'An accessible lower-back placement for full-body photographs and video.'},
  {id:'S1',name:'Gas Saver',zone:'Shoes',price:'$150',copy:'The lowest-cost logo + QR entry for low-angle shots, fit checks and walking clips.'},
  {id:'S2',name:'Next Block',zone:'Shoes',price:'$200',copy:'A logo + QR placement designed to land in every complete outfit frame.'}
];
// After verifying a real payment, add only that placement ID here.
// Example: new Set(['B0']) or new Set(['B0','F3'])
const claimedSpotIds=new Set([]);
const grid=document.querySelector('#spot-grid');
const modal=document.querySelector('#claim-modal');
const title=document.querySelector('#modal-title');
const toast=document.querySelector('.toast');
const biddingStartsAt=new Date('2026-09-15T00:00:00Z').getTime();
const biddingEndsAt=new Date('2026-09-29T17:00:00Z').getTime();
function biddingIsOpen(){const now=Date.now();return now>=biddingStartsAt&&now<biddingEndsAt}
function updateBiddingState(){
  const now=Date.now();
  const isOpen=biddingIsOpen();
  document.querySelector('#sales-status').textContent=now<biddingStartsAt?'BIDDING OPENS SEP 15':isOpen?'BIDDING LIVE':'BIDDING CLOSED';
  document.body.classList.toggle('sales-closed',!isOpen);
  document.querySelectorAll('[data-id]').forEach(el=>{
    const isClaimed=claimedSpotIds.has(el.dataset.id);
    const isDisabled=!isOpen||isClaimed;
    el.classList.toggle('claimed',isClaimed);
    el.setAttribute('aria-disabled',String(isDisabled));
    if(el.matches('button'))el.disabled=isDisabled;
  });
  if(!isOpen&&modal.open)modal.close();
}
grid.innerHTML=spots.map(s=>{const isClaimed=claimedSpotIds.has(s.id);return `<article class="spot-card${isClaimed?' claimed':''}" ${isClaimed?'aria-disabled="true"':`tabindex="0" data-id="${s.id}"`}><span class="code">${s.id} / ${s.zone}</span><h3>${s.name}</h3><p>${s.copy}</p><footer><strong>${s.price}</strong><span class="available">${isClaimed?'Claimed':'Available'}</span></footer></article>`}).join('');
document.querySelector('#open-count').textContent=String(spots.length-claimedSpotIds.size);
function openClaim(id){if(claimedSpotIds.has(id)){showToast('This placement is already claimed');return}if(!biddingIsOpen()){showToast('Bidding closed September 29 at 5:00 PM UTC');return}const s=spots.find(x=>x.id===id);if(!s)return;const form=document.querySelector('#claim-form');if(form.style.display==='none')form.reset();form.style.display='grid';document.querySelector('#claim-success').style.display='none';document.querySelector('#claim-error').style.display='none';title.textContent=`${s.id} — ${s.price}`;document.querySelector('#claim-spot-id').value=s.id;document.querySelector('#claim-spot-name').value=s.name;document.querySelector('#claim-spot-price').value=s.price;modal.showModal();document.querySelectorAll('.marker').forEach(m=>m.classList.toggle('active',m.dataset.id===id));}
document.addEventListener('click',e=>{const hit=e.target.closest('[data-id]');if(hit)openClaim(hit.dataset.id);});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('spot-card'))openClaim(e.target.dataset.id)});
document.querySelector('.modal-close').onclick=()=>modal.close();
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
const walletMap={solana:{label:'SOLANA USDC',address:'9waU4ReAW6YCxbyCae4d2WsyQsTYhSkiA5s5pdFWG8ip'},ethereum:{label:'ETHEREUM ERC-20 USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'},base:{label:'BASE USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'}};
const networkSelect=document.querySelector('#payment-network');
const claimForm=document.querySelector('#claim-form');
const transactionInput=document.querySelector('[name="transaction"]');
const xProfileInput=document.querySelector('[name="x_profile"]');
const claimSuccess=document.querySelector('#claim-success');
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
function validateTransactionLink(){
  const isValid=validTransactionLink();
  const explorer=networkSelect.value==='solana'?'Solscan':networkSelect.value==='ethereum'?'Etherscan':'Basescan';
  transactionInput.setCustomValidity(isValid?'':`Paste a valid ${explorer} transaction link for the selected network.`);
  return isValid;
}
function validXProfileLink(){
  try{
    const url=new URL(xProfileInput.value.trim());
    if(url.protocol!=='https:'||!['x.com','www.x.com'].includes(url.hostname.toLowerCase()))return false;
    const match=url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/?$/);
    if(!match)return false;
    const reserved=new Set(['home','explore','notifications','messages','i','settings','search','compose','login','signup','tos','privacy']);
    return !reserved.has(match[1].toLowerCase());
  }catch{return false}
}
function validateXProfileLink(){
  const isValid=validXProfileLink();
  xProfileInput.setCustomValidity(isValid?'':'Paste a valid X profile link, for example https://x.com/yourbrand.');
  return isValid;
}
networkSelect.addEventListener('change',()=>{setWallet();if(transactionInput.value)validateTransactionLink()});
transactionInput.addEventListener('input',()=>transactionInput.setCustomValidity(''));
xProfileInput.addEventListener('input',()=>xProfileInput.setCustomValidity(''));
document.querySelector('#copy-wallet').onclick=async()=>{const wallet=walletMap[networkSelect.value];try{await navigator.clipboard.writeText(wallet.address);showToast(`${wallet.label} wallet copied`)}catch{showToast('Copy the wallet address manually')}};
claimForm.addEventListener('submit',e=>{if(!biddingIsOpen()){e.preventDefault();e.stopImmediatePropagation();modal.close();showToast('Bidding is closed');return}if(!validateXProfileLink()){e.preventDefault();e.stopImmediatePropagation();xProfileInput.reportValidity();return}if(!validateTransactionLink()){e.preventDefault();e.stopImmediatePropagation();transactionInput.reportValidity()}},true);
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000)}
let submissionResetStarted=false;
const successObserver=new MutationObserver(()=>{
  const submissionSucceeded=getComputedStyle(claimSuccess).display!=='none'&&!claimSuccess.hidden;
  if(!submissionSucceeded||submissionResetStarted)return;
  submissionResetStarted=true;
  sessionStorage.setItem('claim-submitted','true');
  window.location.reload();
});
successObserver.observe(claimSuccess,{attributes:true,childList:true,subtree:true});
if(sessionStorage.getItem('claim-submitted')==='true'){
  sessionStorage.removeItem('claim-submitted');
  setTimeout(()=>showToast('Claim received — remaining spots are ready'),250);
}
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('details').forEach(o=>{if(o!==d)o.open=false})}));
document.querySelectorAll('.view-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.view-tab').forEach(t=>t.classList.toggle('active',t===tab));document.querySelectorAll('.fit-view').forEach(v=>v.classList.toggle('active',v.dataset.panel===tab.dataset.view))}));
updateBiddingState();
setInterval(updateBiddingState,1000);
