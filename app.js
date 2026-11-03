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
let activeWork=null,activeButton=null,transitioning=false,flight=null,edgeShift=0;
const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100;
function tweenScroll(left,top,ms){return new Promise(resolve=>{const x=viewport.scrollLeft,y=scrollY,start=performance.now();function frame(now){const p=ms?Math.min(1,(now-start)/ms):1,e=1-Math.pow(1-p,3);viewport.scrollTo({left:x+(left-x)*e,behavior:'instant'});window.scrollTo({top:y+(top-y)*e,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
works.forEach((work,i)=>{const b=track.children[i];b.addEventListener('click',()=>openWork(work,b));});
const detailImage=document.querySelector('#detail-img'),info=document.querySelector('.purchase-info');
function camera(from,to,ms){return new Promise(resolve=>{const start=performance.now();function frame(now){const p=ms?Math.min(1,(now-start)/ms):1;const t=Math.max(0,(p-.28)/.72),e=t*t*(3-2*t);dialog.scrollTop=from+(to-from)*e;if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
function box(r){return {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'}}
async function openWork(w,button){
 if(gallery.inert||transitioning||dialog.open)return;transitioning=true;activeWork=w;activeButton=button;warmRooms(roomIndex);
 const img=button.querySelector('img');await img.decode().catch(()=>{});
 const vr=viewport.getBoundingClientRect(),r=img.getBoundingClientRect();
 const x=viewport.scrollLeft+r.left+r.width/2-(vr.left+vr.width/2);
 if(x<0&&viewport.scrollLeft<2){edgeShift=-x;track.style.transform=`translateX(${edgeShift}px)`;await track.animate([{transform:'translateX(0)'},{transform:`translateX(${edgeShift}px)`}],{duration:reduced?0:450,easing:'cubic-bezier(.22,.7,.2,1)'}).finished;}else{await tweenScroll(x,scrollY,Math.abs(x-viewport.scrollLeft)>3?450:0);}
 const from=img.getBoundingClientRect();
 detailImage.src=img.src;detailImage.alt=w.title;detailImage.style.borderRadius=w.round?'50%':'0';
 document.querySelector('#detail-title').textContent=w.title;document.querySelector('#detail-size').textContent=w.size;document.querySelector('#on-wall').disabled=!(w.widthCm&&w.heightCm);document.querySelector('#on-wall').textContent=w.widthCm?'Посмотреть на стене':'Для просмотра на стене уточняется размер';document.querySelector('#detail-note').textContent=w.note||'Авторская картина';
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
 img.style.visibility='visible';flight.remove();flight=null;dialog.close();document.querySelector('main').inert=false;activeButton.focus({preventScroll:true});if(edgeShift){const shift=edgeShift;edgeShift=0;track.style.transform='none';await track.animate([{transform:`translateX(${shift}px)`},{transform:'translateX(0)'}],{duration:reduced?0:420,easing:'ease-in-out'}).finished;}transitioning=false;
}
document.querySelector('.close').onclick=closeWork;dialog.addEventListener('cancel',e=>{e.preventDefault();closeWork()});
document.querySelector('#buy').onclick=()=>{document.querySelector('#purchase-form').hidden=false;document.querySelector('#buy').hidden=true;document.querySelector('#buy').setAttribute('aria-expanded','true');document.querySelector('[name="name"]').focus({preventScroll:true})};
document.querySelector('#purchase-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const text=`Заявка на картину «${activeWork.title}»\nРазмер: ${activeWork.size}\nИмя: ${f.get('name')}\nПочта: ${f.get('email')}\nКомментарий: ${f.get('comment')}\n\nЧерновик заявки. Не отправлен. Оплата не произведена.`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='afletonova-zayavka.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#purchase-status').textContent='Заявка сохранена в файл. Она ещё не отправлена.'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Keep the requested destination during smooth scrolling, so repeated clicks
// advance from the last request rather than a partially completed animation.
let galleryTarget=null,galleryFrame=0;
function galleryStops(){const vr=viewport.getBoundingClientRect(),max=viewport.scrollWidth-viewport.clientWidth;return [0,...[...track.children].map(el=>Math.max(0,Math.min(max,viewport.scrollLeft+el.getBoundingClientRect().left-vr.left-parseFloat(getComputedStyle(track).paddingLeft)))),max].filter((n,i,a)=>i===0||n-a[i-1]>2);}
function updateGalleryControls(){const max=viewport.scrollWidth-viewport.clientWidth,pos=galleryTarget??viewport.scrollLeft;document.querySelector('#prev').disabled=pos<=2;document.querySelector('#next').disabled=pos>=max-2;}
function stopGalleryMotion(){cancelAnimationFrame(galleryFrame);galleryFrame=0;galleryTarget=null;updateGalleryControls();}
function move(direction){
 if(gallery.inert||transitioning)return;
 const current=galleryTarget??viewport.scrollLeft,stops=galleryStops(),target=direction>0?stops.find(n=>n>current+2):stops.findLast(n=>n<current-2);
 if(target===undefined)return;
 cancelAnimationFrame(galleryFrame);galleryTarget=target;updateGalleryControls();
 const from=viewport.scrollLeft,start=performance.now(),ms=reduced?0:400;
 function frame(now){const p=ms?Math.min(1,(now-start)/ms):1;viewport.scrollTo({left:from+(target-from)*(1-Math.pow(1-p,3)),behavior:'instant'});if(p<1)galleryFrame=requestAnimationFrame(frame);else{galleryFrame=0;galleryTarget=null;updateGalleryControls();}}
 galleryFrame=requestAnimationFrame(frame);
}
viewport.addEventListener('pointerdown',stopGalleryMotion,{passive:true});
viewport.addEventListener('wheel',stopGalleryMotion,{passive:true});
new ResizeObserver(()=>{stopGalleryMotion();updateGalleryControls()}).observe(viewport);
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
viewport.addEventListener('wheel',e=>{if(gallery.inert)return;if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const rect=viewport.getBoundingClientRect();if(rect.top>innerHeight*.5||rect.bottom<innerHeight*.25)return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),max=viewport.scrollWidth-viewport.clientWidth;if((d>0&&viewport.scrollLeft<max-2)||(d<0&&viewport.scrollLeft>2)){e.preventDefault();viewport.scrollLeft+=d}},{passive:false});
viewport.addEventListener('scroll',()=>{const p=viewport.scrollLeft/(viewport.scrollWidth-viewport.clientWidth||1);document.querySelector('#progress').style.width=(15+p*85)+'%';updateGalleryControls()});
const heroLogo=document.querySelector('.hero-logo'),film=document.querySelector('.film'),intro=document.querySelector('.intro'),gallery=document.querySelector('.gallery'),mainHeader=document.querySelector('body>.site-header'),introFoot=document.querySelector('.intro-foot');
const smoothStep=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
let videoRetired=false;
function update(){
 const p=Math.max(0,Math.min(1,scrollY/intro.offsetHeight)),ease=smoothStep(p),mobile=innerWidth<=700;
 if(p>=.82)videoRetired=true;else if(p<=.06&&!dialog.open)videoRetired=false;
 const videoOpacity=videoRetired?0:1-smoothStep(p/.45),galleryReady=p>=.82;
 const target=mainHeader.querySelector('.brand').getBoundingClientRect();
 const startWidth=innerWidth*(mobile?.78:.37),startLeft=innerWidth*.07,startTop=mobile?innerHeight*.19:innerHeight*.42-30;
 heroLogo.style.width=(startWidth+(target.width-startWidth)*ease)+'px';heroLogo.style.left=(startLeft+(target.left-startLeft)*ease)+'px';heroLogo.style.top=(startTop+(target.top-startTop)*ease)+'px';heroLogo.style.transform='none';heroLogo.style.visibility=p>=.999?'hidden':'visible';
 const headerOpacity=smoothStep((p-.28)/.72);mainHeader.style.opacity=headerOpacity;mainHeader.style.visibility=p===0?'hidden':'visible';mainHeader.style.pointerEvents=galleryReady?'auto':'none';mainHeader.querySelector('.brand').style.opacity=p>=.999?'1':'0';
 film.hidden=videoOpacity<=.001;film.style.opacity=videoOpacity;film.style.visibility=film.hidden?'hidden':'visible';film.style.pointerEvents=!film.hidden&&p<.4?'auto':'none';
 introFoot.style.opacity=1-smoothStep(p/.4);introFoot.style.visibility=p>=.45?'hidden':'visible';
 gallery.style.opacity=smoothStep((p-.5)/.32);gallery.style.pointerEvents=galleryReady?'auto':'none';gallery.inert=!galleryReady;

}
let openingHeight=intro.offsetHeight;
function resizeOpening(){const nextHeight=intro.offsetHeight;if(scrollY>=openingHeight-2){window.scrollTo({top:Math.max(nextHeight,scrollY+nextHeight-openingHeight),behavior:'instant'})}openingHeight=nextHeight;update()}
addEventListener('scroll',update,{passive:true});addEventListener('resize',resizeOpening);update();
function goToGallery(){window.scrollTo({top:intro.offsetHeight,behavior:reduced?'instant':'smooth'})}
document.querySelectorAll('.hero-logo,.intro-foot a').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();goToGallery()}));
const video=document.querySelector('video');if(reduced)video.pause();

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
].map((r,i)=>({...r,image:`assets/interior-wide-${String(i+1).padStart(2,'0')}-fast.webp`,small:`assets/interior-wide-${String(i+1).padStart(2,'0')}-small.webp`,widthCm:600,heightCm:200,ratio:3}));
const wallView=document.querySelector('#wall-view'),scene=document.querySelector('#room-scene');let roomIndex=0;
function fitWallArt(){if(!activeWork)return;const r=rooms[roomIndex],image=document.querySelector('#wall-art');image.style.width=(activeWork.widthCm/r.widthCm*100)+'%';image.style.height=(activeWork.heightCm/r.heightCm*100)+'%'}

const roomCache=new Map();let wantedRoom=0,roomTask=null,wallBusy=false;
const bgHost=document.querySelector('#room-background'),wallArt=document.querySelector('#wall-art');
const wrapRoom=i=>((i%rooms.length)+rooms.length)%rooms.length;
function loadRoom(i,priority='low'){
 i=wrapRoom(i);const cached=roomCache.get(i);if(cached){if(priority==='high')cached.image.fetchPriority='high';return cached.promise;}
 const r=rooms[i],image=new Image();image.decoding='async';image.fetchPriority=priority;
 const entry={image,promise:null};entry.promise=new Promise((resolve,reject)=>{image.onload=async()=>{try{await image.decode();resolve(image)}catch(error){roomCache.delete(i);reject(error)}};image.onerror=()=>{roomCache.delete(i);reject(new Error('Не удалось загрузить интерьер'))};});
 roomCache.set(i,entry);
 if(navigator.connection?.saveData){image.src=r.small;}else{image.srcset=`${r.small} 1280w, ${r.image} 2172w`;image.sizes=Math.ceil(Math.max(innerWidth,(innerHeight-72)*3))+'px';image.src=r.image;}
 return entry.promise;
}
function warmRooms(i){[i,i+1,i-1].forEach(n=>loadRoom(n).catch(()=>{}));}
function reportRoomError(){const el=document.querySelector('#room-status');el.textContent='Не удалось загрузить интерьер. Попробуйте ещё раз.';}
const status=document.createElement('span');status.id='room-status';status.setAttribute('role','status');document.querySelector('.room-bottom').append(status);
function updateRoomLabels(){const r=rooms[roomIndex];wallView.dataset.dark=String([0,2,3,5,8].includes(roomIndex));document.querySelector('#room-name').textContent=r.name;document.querySelector('#room-count').textContent=String(roomIndex+1).padStart(2,'0')+' / 10';document.querySelectorAll('.room-dot').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===roomIndex)));}
function showRoom(i,animate=true){
 wantedRoom=wrapRoom(i);if(roomTask)return roomTask;
 roomTask=(async()=>{while(wantedRoom!==roomIndex||!bgHost.firstElementChild){
  const target=wantedRoom,loaded=await loadRoom(target,'high');if(target!==wantedRoom)continue;
  const old=bgHost.lastElementChild,next=loaded.cloneNode();next.alt=rooms[target].name+', фон интерьера';next.removeAttribute('fetchpriority');
  const delta=(target-roomIndex+rooms.length)%rooms.length,dir=delta>rooms.length/2?-1:1;
  bgHost.append(next);roomIndex=target;updateRoomLabels();layoutScene();document.querySelector('#room-status').textContent='';
  if(old&&animate&&!reduced&&wallView.open){
   const incoming=next.animate([{opacity:0,transform:`translateX(${dir*38}px) scale(1.025)`},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:620,easing:'cubic-bezier(.22,.7,.2,1)'});
   const outgoing=old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-dir*28}px)`}],{duration:620,easing:'ease-in-out'});
   await Promise.all([incoming.finished,outgoing.finished]);
  }
  if(old)old.remove();warmRooms(roomIndex);
 }})().finally(()=>{roomTask=null;});return roomTask;
}
function requestRoom(i){if(wallBusy)return;showRoom(i).catch(reportRoomError);}
rooms.forEach((r,i)=>{const b=document.createElement('button');b.className='room-dot';b.setAttribute('aria-label',r.name);b.style.setProperty('--room-color',r.wall);b.onclick=()=>requestRoom(i);document.querySelector('#room-dots').append(b)});
function wallUiFade(enter){const els=wallView.querySelectorAll('.room-window,.wall-toolbar,.room-bottom');return [...els].map(el=>{el.getAnimations().forEach(a=>a.cancel());return el.animate([{opacity:enter?0:1},{opacity:enter?1:0}],{duration:reduced?0:650,easing:'ease',fill:'forwards'})});}
function flyImage(source,from,to){const clone=source.cloneNode();clone.removeAttribute('id');clone.className='wall-flight';clone.style.visibility='visible';Object.assign(clone.style,box(from));wallView.append(clone);clone.style.transformOrigin='top left';const animation=clone.animate([{transform:'translate(0,0) scale(1,1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`}],{duration:reduced?0:780,easing:'cubic-bezier(.22,.75,.2,1)',fill:'forwards'});return {clone,animation};}
async function openWall(){
 if(!activeWork?.widthCm||wallBusy||transitioning)return;wallBusy=true;const button=document.querySelector('#on-wall');button.setAttribute('aria-busy','true');
 try{
  await showRoom(roomIndex,false);const from=detailImage.getBoundingClientRect();
  wallArt.src=activeWork.asset||`assets/work-${activeWork.id}.webp`;wallArt.alt=activeWork.title+' в интерьере';wallArt.style.borderRadius=activeWork.round?'50%':'0';await wallArt.decode();
  document.querySelector('#wall-title').textContent=activeWork.title;document.querySelector('#wall-size').textContent=activeWork.size;
  updateRoomLabels();wallArt.style.visibility='hidden';wallView.showModal();layoutScene();
  const to=wallArt.getBoundingClientRect(),flight=flyImage(detailImage,from,to);detailImage.style.visibility='hidden';
  const fades=wallUiFade(true);await Promise.all([flight.animation.finished,...fades.map(a=>a.finished)]);
  wallArt.style.visibility='visible';detailImage.style.visibility='visible';flight.clone.remove();warmRooms(roomIndex);document.querySelector('#wall-close').focus({preventScroll:true});
 }catch(error){if(wallView.open)wallView.close();detailImage.style.visibility='visible';button.textContent='Попробовать просмотр ещё раз';}
 finally{wallBusy=false;button.removeAttribute('aria-busy');}
}
async function closeWall(){
 if(wallBusy||!wallView.open)return;wallBusy=true;
 const from=wallArt.getBoundingClientRect(),to=detailImage.getBoundingClientRect(),flight=flyImage(wallArt,from,to);wallArt.style.visibility='hidden';detailImage.style.visibility='hidden';
 const fades=wallUiFade(false);await Promise.all([flight.animation.finished,...fades.map(a=>a.finished)]);
 wallView.close();detailImage.style.visibility='visible';wallArt.style.visibility='visible';flight.clone.remove();document.querySelector('#on-wall').focus({preventScroll:true});wallBusy=false;
}
document.querySelector('#on-wall').onclick=openWall;
document.querySelector('#on-wall').addEventListener('pointerenter',()=>warmRooms(roomIndex));
document.querySelector('#on-wall').addEventListener('focus',()=>warmRooms(roomIndex));
document.querySelector('#wall-close').onclick=closeWall;
document.querySelector('#room-prev').onclick=()=>requestRoom(wantedRoom-1);document.querySelector('#room-next').onclick=()=>requestRoom(wantedRoom+1);
wallView.addEventListener('cancel',e=>{e.preventDefault();closeWall()});
wallView.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();requestRoom(wantedRoom+(e.key==='ArrowRight'?1:-1))}});
let touchStart=null,touchStartY=0;scene.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX;touchStartY=e.changedTouches[0].clientY},{passive:true});scene.addEventListener('touchend',e=>{if(touchStart===null)return;const d=e.changedTouches[0].clientX-touchStart;if(Math.abs(d)>45&&Math.abs(d)>Math.abs(e.changedTouches[0].clientY-(touchStartY||0))*1.2)requestRoom(wantedRoom+(d<0?1:-1));touchStart=null},{passive:true});
function layoutScene(){if(!wallView.open)return;const box=document.querySelector('.room-window').getBoundingClientRect(),ratio=rooms[roomIndex].ratio;const width=Math.max(box.width,box.height*ratio);scene.style.width=width+'px';scene.style.height=width/ratio+'px';fitWallArt();}
addEventListener('resize',layoutScene);new ResizeObserver(()=>layoutScene()).observe(document.querySelector('.room-window'));
document.querySelectorAll('.site-header a').forEach(link=>link.addEventListener('click',async event=>{event.preventDefault();if(transitioning||wallBusy)return;if(wallView.open)await closeWall();if(dialog.open)await closeWork();const target=link.getAttribute('href');if(target==='#')window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});else if(target==='#works')goToGallery();else document.querySelector(target).scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}));
const warmFirst=()=>loadRoom(0).catch(()=>{});if('requestIdleCallback' in window)requestIdleCallback(warmFirst,{timeout:2500});else setTimeout(warmFirst,1500);

// Scroll or swipe up returns one level, retaining the reverse artwork animation.
let lastBackWheel=0,backWheelConsumed=false,backWheelDistance=0;
window.addEventListener('wheel',event=>{if(event.ctrlKey)return;const now=performance.now();if(now-lastBackWheel>230){backWheelConsumed=false;backWheelDistance=0}lastBackWheel=now;if(backWheelConsumed&&event.deltaY<0&&!dialog.open&&!wallView.open)event.preventDefault();},{capture:true,passive:false});
function purchaseTop(){return Math.min(innerHeight,Math.max(0,dialog.scrollHeight-dialog.clientHeight))}
function navigateBack(view){backWheelConsumed=true;backWheelDistance=0;if(view===wallView)closeWall();else closeWork()}
function onBackWheel(event,view){
 if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.deltaY>=0)return;
 if(event.target.closest('input,textarea,select,canvas'))return;
 if(view===dialog&&wallView.open)return;
 const amount=-event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 if(view===dialog&&dialog.scrollTop>purchaseTop()+3){event.preventDefault();dialog.scrollTop=Math.max(purchaseTop(),dialog.scrollTop-amount);backWheelDistance=0;return;}
 event.preventDefault();if(transitioning||wallBusy||backWheelConsumed)return;
 backWheelDistance+=amount;if(backWheelDistance>=55)navigateBack(view);
}
[dialog,wallView].forEach(view=>{
 view.addEventListener('wheel',event=>onBackWheel(event,view),{passive:false});
 let touch=null;
 view.addEventListener('touchstart',event=>{if(event.touches.length!==1){touch=null;return}const t=event.touches[0];touch={x:t.clientX,y:t.clientY,atTop:view===wallView||dialog.scrollTop<=purchaseTop()+3,field:!!event.target.closest('input,textarea,select,canvas')};},{passive:true});
 view.addEventListener('touchmove',event=>{if(!touch||touch.field||!touch.atTop||event.touches.length!==1)return;const t=event.touches[0],dy=t.clientY-touch.y,dx=t.clientX-touch.x;if(dy>8&&dy>Math.abs(dx)*1.2)event.preventDefault();},{passive:false});
 view.addEventListener('touchend',event=>{if(!touch)return;const t=event.changedTouches[0],dy=t.clientY-touch.y,dx=t.clientX-touch.x;if(touch.atTop&&!touch.field&&dy>65&&dy>Math.abs(dx)*1.25&&!transitioning&&!wallBusy){navigateBack(view)}touch=null;},{passive:true});
});
dialog.addEventListener('scroll',()=>{if(dialog.open&&!wallView.open&&!transitioning&&dialog.scrollTop<purchaseTop()-1)dialog.scrollTop=purchaseTop();},{passive:true});
