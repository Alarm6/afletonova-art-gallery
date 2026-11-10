// Gift preparation is part of the local order draft, never a payment.
const giftPanel=document.createElement('section');
giftPanel.className='gift-panel';giftPanel.hidden=true;
giftPanel.innerHTML=`<div class="gift-heading"><span class="eyebrow">ПОДАРОК С ЛИЧНОЙ ИСТОРИЕЙ</span><h3>Искусство дарить</h3><p>Художница сама нарисует открытку к вашему подарку.</p></div><label class="gift-choice"><input id="gift-add" type="checkbox" name="gift-card" form="purchase-form"><span>Добавить открытку</span><strong>+ 600 ₽</strong></label><div class="gift-editor">
 <div class="gift-card">
  <div class="card-front"><img src="assets/logo-black.svg" alt="Afletonova Art"><span>Почтовая открытка</span></div>
  <div class="card-back">
   <div class="postcard-drawing">
    <canvas id="gift-canvas" width="1000" height="760" aria-label="Поле для рисунка"></canvas>
    <button type="button" id="gift-clear">Очистить рисунок</button>
   </div>
   <div class="postcard-address">
    <label>Кому<input id="gift-to" maxlength="80" autocomplete="off"></label>
    <label>От кого<input id="gift-from" maxlength="80" autocomplete="off"></label>
    <label>Пожелание<textarea id="gift-message" maxlength="350" rows="3" placeholder="Ваши тёплые слова"></textarea></label>
   </div>
  </div>
 </div>
</div>`;
document.querySelector('#buy').after(giftPanel);
const giftAdd=document.querySelector('#gift-add'),giftMessage=document.querySelector('#gift-message'),giftCanvas=document.querySelector('#gift-canvas'),giftContext=giftCanvas.getContext('2d');
let giftDrawing=false,giftPoint=null;
const giftTo=document.querySelector('#gift-to'),giftFrom=document.querySelector('#gift-from');
giftAdd.onchange=()=>giftPanel.classList.toggle('gift-enabled',giftAdd.checked);
function clearDrawing(){
 giftContext.clearRect(0,0,giftCanvas.width,giftCanvas.height);
 giftDrawing=false;
 giftPoint=null;
}
document.querySelector('#gift-clear').onclick=clearDrawing;
function penPoint(e){const r=giftCanvas.getBoundingClientRect();return {x:(e.clientX-r.left)*giftCanvas.width/r.width,y:(e.clientY-r.top)*giftCanvas.height/r.height};}
giftCanvas.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();giftCanvas.setPointerCapture(e.pointerId);giftPoint=penPoint(e);giftDrawing=true;giftContext.fillStyle='#292f42';giftContext.beginPath();giftContext.arc(giftPoint.x,giftPoint.y,2,0,Math.PI*2);giftContext.fill();};
giftCanvas.onpointermove=e=>{if(!giftPoint)return;for(const sample of e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e]){const p=penPoint(sample);giftContext.strokeStyle='#292f42';giftContext.lineWidth=3.5;giftContext.lineCap='round';giftContext.lineJoin='round';giftContext.beginPath();giftContext.moveTo(giftPoint.x,giftPoint.y);giftContext.lineTo(p.x,p.y);giftContext.stroke();giftPoint=p;}};
giftCanvas.onpointerup=giftCanvas.onpointercancel=()=>giftPoint=null;
function resetGift(){giftPanel.hidden=true;dialog.classList.remove('gift-order');giftAdd.checked=false;giftPanel.classList.remove('gift-enabled');giftTo.value='';giftFrom.value='';giftMessage.value='';clearDrawing();document.querySelector('.painting-column').classList.remove('gift-wrapped');document.querySelector('.kraft-wrap')?.remove();document.querySelector('#on-wall').hidden=false;}
const originalOpenWork=openWork;openWork=async function(w,b){if(!gallery.inert&&!transitioning&&!dialog.open)resetGift();return originalOpenWork(w,b);};
document.querySelector('#buy').onclick=async()=>{
 if(transitioning)return;transitioning=true;
 const column=document.querySelector('.painting-column');
 const slot=document.querySelector('.painting-slot');
 const buy=document.querySelector('#buy');
 const previous=detailImage.getBoundingClientRect();
 dialog.classList.add('gift-order');
 column.classList.add('gift-wrapped');
 buy.hidden=true;
 buy.setAttribute('aria-expanded','true');
 document.querySelector('#on-wall').hidden=true;
 dialog.scrollTop=purchaseTop();
 if(!reduced){
  const stage=dialog.animate([
   {backgroundColor:'#fff'},{backgroundColor:'#111'}
  ],{duration:540,easing:'ease'});
  await Promise.all([animateArtworkFrom(previous,540),stage.finished]);
 }

 const bounds=detailImage.getBoundingClientRect();
 const paper=document.createElement('div');
 paper.className='kraft-wrap';
 paper.style.width=bounds.width+'px';
 paper.style.height=bounds.height+'px';
 paper.innerHTML='<i class="kraft-left"></i><i class="kraft-right"></i><i class="kraft-top"></i><i class="kraft-bottom"></i><span class="kraft-string"></span><img class="kraft-seal" src="assets/logo-black.svg" alt="Afletonova Art">';
 slot.append(paper);
 if(!reduced)await Promise.all(paper.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));
 giftPanel.hidden=false;document.querySelector('#purchase-form').hidden=false;
 if(!reduced)giftPanel.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:650,easing:'ease-out'});
 transitioning=false;giftPanel.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
};
document.querySelector('#purchase-form').onsubmit=e=>{
 e.preventDefault();const data=new FormData(e.currentTarget),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const drawing=giftDrawing?`<img alt="Рисунок для открытки" style="width:500px;max-width:100%" src="${giftCanvas.toDataURL()}">`:'';
 const gift=giftAdd.checked?`<h2>Открытка художницы · + 600 ₽</h2><p>Кому: ${escape(giftTo.value)}<br>От кого: ${escape(giftFrom.value)}</p><p style="white-space:pre-wrap">${escape(giftMessage.value)}</p>${drawing}`:'<p>Без открытки</p>';
 const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src data:; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;"><meta name="referrer" content="no-referrer"><title>Заявка Afletonova Art</title><body style="font:16px/1.6 Arial;max-width:700px;margin:50px auto;padding:20px"><h1>${escape(activeWork.title)}</h1><p>${escape(activeWork.size)}</p><p>Имя: ${escape(data.get('name'))}<br>Почта: ${escape(data.get('email'))}</p><p>${escape(data.get('comment'))}</p>${gift}<hr><p>Черновик заявки. Не отправлен. Оплата не произведена. Стоимость картины уточняется отдельно.</p></body></html>`;
 const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='afletonova-zayavka.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#purchase-status').textContent='Заявка с оформлением открытки сохранена. Она ещё не отправлена.';
};

// Keep the paper fitted when the viewport or artwork size changes.
new ResizeObserver(()=>{const paper=document.querySelector('.kraft-wrap');if(paper){const r=detailImage.getBoundingClientRect();paper.style.width=r.width+'px';paper.style.height=r.height+'px';}}).observe(detailImage);
