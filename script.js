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
    el.setAttribute('aria-disabled',String(!isOpen));
    if(el.matches('button'))el.disabled=!isOpen;
  });
  if(!isOpen&&modal.open)modal.close();
}
grid.innerHTML=spots.map(s=>`<article class="spot-card" tabindex="0" data-id="${s.id}"><span class="code">${s.id} / ${s.zone}</span><h3>${s.name}</h3><p>${s.copy}</p><footer><strong>${s.price}</strong><span class="available">Available</span></footer></article>`).join('');
function openClaim(id){if(!biddingIsOpen()){showToast('Bidding closed September 29 at 5:00 PM UTC');return}const s=spots.find(x=>x.id===id);title.textContent=`${s.id} — ${s.price}`;document.querySelector('#claim-spot-id').value=s.id;document.querySelector('#claim-spot-name').value=s.name;document.querySelector('#claim-spot-price').value=s.price;modal.showModal();document.querySelectorAll('.marker').forEach(m=>m.classList.toggle('active',m.dataset.id===id));}
document.addEventListener('click',e=>{const hit=e.target.closest('[data-id]');if(hit)openClaim(hit.dataset.id);});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('spot-card'))openClaim(e.target.dataset.id)});
document.querySelector('.modal-close').onclick=()=>modal.close();
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
const walletMap={solana:{label:'SOLANA USDC',address:'9waU4ReAW6YCxbyCae4d2WsyQsTYhSkiA5s5pdFWG8ip'},ethereum:{label:'ETHEREUM ERC-20 USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'},base:{label:'BASE USDC',address:'0x457f42ea307709aa56e45eca299986590f830521'}};
const networkSelect=document.querySelector('#payment-network');
function setWallet(){const wallet=walletMap[networkSelect.value];document.querySelector('#wallet-label').textContent=`ONCHAIN CLAIM · ${wallet.label}`;document.querySelector('#wallet-address').textContent=wallet.address}
networkSelect.addEventListener('change',setWallet);
document.querySelector('#copy-wallet').onclick=async()=>{const wallet=walletMap[networkSelect.value];try{await navigator.clipboard.writeText(wallet.address);showToast(`${wallet.label} wallet copied`)}catch{showToast('Copy the wallet address manually')}};
document.querySelector('#claim-form').addEventListener('submit',e=>{if(!biddingIsOpen()){e.preventDefault();modal.close();showToast('Bidding is closed')}});
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000)}
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('details').forEach(o=>{if(o!==d)o.open=false})}));
document.querySelectorAll('.view-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.view-tab').forEach(t=>t.classList.toggle('active',t===tab));document.querySelectorAll('.fit-view').forEach(v=>v.classList.toggle('active',v.dataset.panel===tab.dataset.view))}));
updateBiddingState();
setInterval(updateBiddingState,1000);
