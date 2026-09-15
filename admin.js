const tokenInput=document.querySelector('#token');
const grid=document.querySelector('#admin-grid');
const message=document.querySelector('#message');
tokenInput.value=sessionStorage.getItem('token2049-admin-token')||'';
function headers(){return{'Content-Type':'application/json',Authorization:`Bearer ${tokenInput.value.trim()}`}}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
async function load(){
  const token=tokenInput.value.trim();
  if(!token){message.textContent='Enter your private admin token.';return}
  sessionStorage.setItem('token2049-admin-token',token);
  message.textContent='Loading live inventory…';
  const response=await fetch('/api/admin/spots',{headers:headers(),cache:'no-store'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){message.textContent=data.error||'Could not load inventory.';grid.innerHTML='';return}
  message.textContent='Verify pending claims in Basin and your wallet before marking them SOLD.';
  grid.innerHTML=data.spots.map(spot=>`<article class="card"><div class="id">${escapeHtml(spot.id)}</div><div class="status">${escapeHtml(spot.status)}</div><div class="details">${spot.brand?`<strong>${escapeHtml(spot.brand)}</strong><br>${escapeHtml(spot.email)} · <a href="${escapeHtml(spot.xProfile)}" target="_blank" rel="noopener">X profile ↗</a><br>${escapeHtml(spot.network)} · <a href="${escapeHtml(spot.transaction)}" target="_blank" rel="noopener">transaction ↗</a>`:'No submitted claim'}</div><div class="actions">${spot.status==='pending'?`<button class="sold" data-action="sold" data-id="${spot.id}">Mark SOLD</button>`:''}${spot.status!=='available'?`<button class="reopen" data-action="available" data-id="${spot.id}">Reopen</button>`:''}</div></article>`).join('');
}
async function update(id,status){
  const label=status==='sold'?'mark this placement SOLD':'reopen this placement';
  if(!confirm(`Are you sure you want to ${label}?`))return;
  const response=await fetch('/api/admin/status',{method:'POST',headers:headers(),body:JSON.stringify({spotId:id,status})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){message.textContent=data.error||'Update failed.';return}
  await load();
}
document.querySelector('#load').onclick=load;
tokenInput.addEventListener('keydown',event=>{if(event.key==='Enter')load()});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button)update(button.dataset.id,button.dataset.action)});
