const works=[
{id:'0758',title:'Поле',size:'Ø 30 см',round:true,widthCm:30,heightCm:30},
{id:'0757',title:'Маяк',size:'20 × 30 см',widthCm:20,heightCm:30},
{id:'0754',title:'Аист',size:'30 × 40 см',widthCm:30,heightCm:40},
{id:'0752',title:'На юг',size:'40 × 30 см',widthCm:40,heightCm:30},
{id:'0748',title:'Лодка',size:'100 × 50 см',widthCm:50,heightCm:100},
{id:'0750',title:'Цапля',size:'80 × 50 см',widthCm:50,heightCm:80},
{id:'0756',title:'Круглый маяк',size:'Ø 30 см',round:true,widthCm:30,heightCm:30},
{id:'heron60',title:'Круглая цапля',size:'Ø 60 см',round:true,widthCm:60,heightCm:60,asset:'assets/work-heron60.svg'}];
const track=document.querySelector('#track'),viewport=document.querySelector('.viewport'),dialog=document.querySelector('dialog');
let activeWork=null,activeButton=null,transitioning=false,flight=null;
const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100;
function tweenScroll(left,top,ms){return new Promise(resolve=>{const x=viewport.scrollLeft,y=scrollY,start=performance.now();function frame(now){const p=ms?Math.min(1,(now-start)/ms):1,e=1-Math.pow(1-p,3);viewport.scrollTo({left:x+(left-x)*e,behavior:'instant'});window.scrollTo({top:y+(top-y)*e,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
works.forEach((work,i)=>{const b=document.createElement('button');b.className='art'+(work.round?' round':'');b.innerHTML=`<span class="label"><h2>${work.title}</h2><span class="size">${work.size}</span></span><img src="${work.asset||`assets/work-${work.id}.webp`}" alt="Картина ${work.title}" loading="lazy">`;b.addEventListener('click',()=>openWork(work,b));track.append(b)});
const detailImage=document.querySelector('#detail-img'),info=document.querySelector('.purchase-info');
function camera(from,to,ms){return new Promise(resolve=>{const start=performance.now();function frame(now){const p=ms?Math.min(1,(now-start)/ms):1;const t=Math.max(0,(p-.28)/.72),e=t*t*(3-2*t);dialog.scrollTop=from+(to-from)*e;if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
function box(r){return {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'}}
async function openWork(w,button){
 if(transitioning||dialog.open)return;transitioning=true;activeWork=w;activeButton=button;
 const img=button.querySelector('img');await img.decode().catch(()=>{});
 const vr=viewport.getBoundingClientRect(),r=img.getBoundingClientRect();
 const x=viewport.scrollLeft+r.left+r.width/2-(vr.left+vr.width/2);
 await tweenScroll(x,scrollY,Math.abs(x-viewport.scrollLeft)>3?450:0);
 const from=img.getBoundingClientRect();
 detailImage.src=img.src;detailImage.alt=w.title;detailImage.style.borderRadius=w.round?'50%':'0';
 document.querySelector('#detail-title').textContent=w.title;document.querySelector('#detail-size').textContent=w.size;document.querySelector('#on-wall').disabled=!(w.widthCm&&w.heightCm);document.querySelector('#on-wall').textContent=w.widthCm?'Посмотреть на стене ↗':'Для просмотра на стене уточняется размер';document.querySelector('#detail-note').textContent=w.note||'Авторская картина';
 document.querySelector('#purchase-form').hidden=true;document.querySelector('#purchase-form').reset();document.querySelector('#purchase-status').textContent='';document.querySelector('#buy').hidden=false;document.querySelector('#buy').setAttribute('aria-expanded','false');
 dialog.showModal();dialog.scrollTop=0;document.querySelector('main').inert=true;
 await detailImage.decode().catch(()=>{});
 const to=detailImage.getBoundingClientRect();flight=img.cloneNode();flight.className='flying-painting';Object.assign(flight.style,box(from));flight.style.borderRadius=w.round?'50%':'0';dialog.append(flight);img.style.visibility='hidden';detailImage.style.visibility='hidden';
 document.body.classList.add('detail-open');
 const anim=flight.animate([box(from),box(to)],{duration:duration(),easing:'cubic-bezier(.45,0,.25,1)',fill:'forwards'});
 const follow=camera(0,innerHeight,duration());
 info.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:duration(),delay:duration()*.65,fill:'both'});
 await Promise.all([anim.finished,follow]);detailImage.style.visibility='visible';flight.remove();flight=null;transitioning=false;
}
async function closeWork(){
 if(transitioning||!dialog.open)return;transitioning=true;
 const img=activeButton.querySelector('img'),rect=detailImage.getBoundingClientRect(),from={left:rect.left,top:rect.top+dialog.scrollTop,width:rect.width,height:rect.height},to=img.getBoundingClientRect();
 flight=detailImage.cloneNode();flight.removeAttribute('id');flight.className='flying-painting';flight.style.visibility='visible';Object.assign(flight.style,box(from));dialog.append(flight);detailImage.style.visibility='hidden';
 info.animate([{opacity:1},{opacity:0}],{duration:duration()*.5,fill:'forwards'});
 document.body.classList.remove('detail-open');
 await Promise.all([flight.animate([box(from),box(to)],{duration:duration(),easing:'cubic-bezier(.45,0,.25,1)',fill:'forwards'}).finished,camera(dialog.scrollTop,0,duration())]);
 img.style.visibility='visible';flight.remove();flight=null;dialog.close();document.querySelector('main').inert=false;activeButton.focus({preventScroll:true});transitioning=false;
}
document.querySelector('.close').onclick=closeWork;dialog.addEventListener('cancel',e=>{e.preventDefault();closeWork()});
document.querySelector('#buy').onclick=()=>{document.querySelector('#purchase-form').hidden=false;document.querySelector('#buy').hidden=true;document.querySelector('#buy').setAttribute('aria-expanded','true');document.querySelector('[name="name"]').focus({preventScroll:true})};
document.querySelector('#purchase-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const text=`Заявка на картину «${activeWork.title}»\nРазмер: ${activeWork.size}\nИмя: ${f.get('name')}\nПочта: ${f.get('email')}\nКомментарий: ${f.get('comment')}\n\nЧерновик заявки. Не отправлен. Оплата не произведена.`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='afletonova-zayavka.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#purchase-status').textContent='Заявка сохранена в файл. Она ещё не отправлена.'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function move(direction){viewport.scrollBy({left:direction*viewport.clientWidth*.65,behavior:reduced?'instant':'smooth'})}
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
viewport.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const rect=viewport.getBoundingClientRect();if(rect.top>innerHeight*.5||rect.bottom<innerHeight*.25)return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),max=viewport.scrollWidth-viewport.clientWidth;if((d>0&&viewport.scrollLeft<max-2)||(d<0&&viewport.scrollLeft>2)){e.preventDefault();viewport.scrollLeft+=d}},{passive:false});
viewport.addEventListener('scroll',()=>{const p=viewport.scrollLeft/(viewport.scrollWidth-viewport.clientWidth||1);document.querySelector('#progress').style.width=(15+p*85)+'%';document.querySelector('#count').textContent=String(Math.min(works.length,1+Math.round(p*(works.length-1)))).padStart(2,'0')+' — '+String(works.length).padStart(2,'0')});
const brand=document.querySelector('.brand'),film=document.querySelector('.film');
function update(){const mobile=innerWidth<=700;const p=Math.min(1,Math.max(0,scrollY/(innerHeight*.8)));const s=p*p*(3-2*p);brand.style.top=((mobile?innerHeight*.19:innerHeight*.42-30)*(1-s)+26*s)+'px';brand.style.width=((mobile?innerWidth*.78:innerWidth*.37)*(1-s)+(mobile?135:155)*s)+'px';film.style.opacity=1-p;brand.style.pointerEvents='auto'}
addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
const video=document.querySelector('video'),play=document.querySelector('#play');if(reduced){video.pause();play.textContent='▶'}play.onclick=()=>{if(video.paused){video.play().catch(()=>{});play.textContent='Ⅱ';play.setAttribute('aria-label','Приостановить видео')}else{video.pause();play.textContent='▶';play.setAttribute('aria-label','Воспроизвести видео')}};


// Generated photographs use a common approximate 2m-wide scene.
// Real artwork dimensions preserve the relative scale between every painting.
const rooms=[
{name:'Графит и золото',wall:'#3d3b37'},
{name:'Тёплый беж',wall:'#b7a084'},
{name:'Оливковый интерьер',wall:'#656952'},
{name:'Терракотовый вечер',wall:'#9b5c47'},
{name:'Северный свет',wall:'#d0d0c9'},
{name:'Глубокий синий',wall:'#323f4e'},
{name:'Молочный минимализм',wall:'#e6e0d4'},
{name:'Пудровая гостиная',wall:'#c5a495'},
{name:'Шоколад и камень',wall:'#58473b'},
{name:'Мягкий шалфей',wall:'#a5ac98'}
].map((r,i)=>({...r,image:`assets/interior-${String(i+1).padStart(2,'0')}.webp`,widthCm:200,heightCm:200}));
const wallView=document.querySelector('#wall-view'),scene=document.querySelector('#room-scene');let roomIndex=0;
function fitWallArt(){if(!activeWork)return;const r=rooms[roomIndex],image=document.querySelector('#wall-art');image.style.width=(activeWork.widthCm/r.widthCm*100)+'%';image.style.height=(activeWork.heightCm/r.heightCm*100)+'%'}
rooms.forEach((r,i)=>{const b=document.createElement('button');b.className='room-dot';b.setAttribute('aria-label',r.name);b.style.setProperty('--room-color',r.wall);b.onclick=()=>showRoom(i);document.querySelector('#room-dots').append(b)});
function showRoom(i){roomIndex=(i+rooms.length)%rooms.length;const r=rooms[roomIndex];document.querySelector('#room-background').innerHTML=`<img src="${r.image}" alt="${r.name}, фон интерьера" decoding="async">`;fitWallArt();document.querySelector('#room-name').textContent=r.name;document.querySelector('#room-count').textContent=String(roomIndex+1).padStart(2,'0')+' / 10';document.querySelectorAll('.room-dot').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===roomIndex)));}
function openWall(){if(!activeWork?.widthCm)return;const image=document.querySelector('#wall-art');image.src=activeWork.asset||`assets/work-${activeWork.id}.webp`;image.alt=activeWork.title+' в интерьере';image.style.borderRadius=activeWork.round?'50%':'0';document.querySelector('#wall-title').textContent=activeWork.title;document.querySelector('#wall-size').textContent=activeWork.size;showRoom(roomIndex);wallView.showModal()}
function closeWall(){wallView.close();document.querySelector('#on-wall').focus({preventScroll:true})}
document.querySelector('#on-wall').onclick=openWall;document.querySelector('#wall-close').onclick=closeWall;document.querySelector('#room-prev').onclick=()=>showRoom(roomIndex-1);document.querySelector('#room-next').onclick=()=>showRoom(roomIndex+1);
wallView.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showRoom(roomIndex+(e.key==='ArrowRight'?1:-1))}});
let touchStart=null;scene.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX},{passive:true});scene.addEventListener('touchend',e=>{if(touchStart===null)return;const d=e.changedTouches[0].clientX-touchStart;if(Math.abs(d)>45)showRoom(roomIndex+(d<0?1:-1));touchStart=null},{passive:true});
