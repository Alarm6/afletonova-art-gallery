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


// Front elevations are drawn in centimetre-calibrated coordinates: 3 units = 1 cm.
const rooms=[
{name:'Тёплый минимализм',wall:'#ddd3c2',floor:'#b2a18d',fabric:'#e9e3d6',wood:'#8c6c4e',kind:'sofa',accent:'#998a69'},
{name:'Терракотовая гостиная',wall:'#974e3d',floor:'#b6a38d',fabric:'#e6d5bd',wood:'#674c3b',kind:'sofa',accent:'#d2ad74'},
{name:'Северный свет',wall:'#e7e9e6',floor:'#cbbba3',fabric:'#a7b2ad',wood:'#ba9270',kind:'chair',accent:'#4c625e'},
{name:'Оливковая спальня',wall:'#6c7663',floor:'#b5a58b',fabric:'#ebe4d6',wood:'#6b4e39',kind:'bed',accent:'#b79f75'},
{name:'Тихая библиотека',wall:'#b2a391',floor:'#806956',fabric:'#6a584a',wood:'#493d32',kind:'library',accent:'#a58b6a'},
{name:'Белая галерея',wall:'#eeeae3',floor:'#c4c0b8',fabric:'#dfd6c6',wood:'#978573',kind:'bench',accent:'#817d71'},
{name:'Обеденная зона',wall:'#d0c5b5',floor:'#9e826b',fabric:'#b4a189',wood:'#71523b',kind:'dining',accent:'#736c55'},
{name:'Графитовый кабинет',wall:'#454a48',floor:'#91816d',fabric:'#827a6a',wood:'#6d4e37',kind:'desk',accent:'#c9ad78'},
{name:'Песочная прихожая',wall:'#e0cbb5',floor:'#b19c83',fabric:'#d4baa0',wood:'#8c5b3f',kind:'console',accent:'#9a7764'},
{name:'Мягкий вечер',wall:'#a4a4b1',floor:'#ae9b8d',fabric:'#d4cbd1',wood:'#6a5a54',kind:'sofa',accent:'#726c80'}];
const wallView=document.querySelector('#wall-view'),scene=document.querySelector('#room-scene');let roomIndex=0;
function roomSvg(r){
 const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
 const leg=(x,y,h=70)=>rect(x,y,13,h,r.wood,2);
 const lamp=`<path d="M130 720V440Q130 380 200 380" fill="none" stroke="${r.accent}" stroke-width="7"/><path d="M160 414L178 365H220L239 414Z" fill="${r.accent}"/>${rect(98,716,66,8,r.accent,4)}`;
 const plant=`<path d="M1065 665V388" stroke="#5d6651" stroke-width="5" fill="none"/><g fill="#737d60"><ellipse cx="1039" cy="443" rx="19" ry="51" transform="rotate(-45 1039 443)"/><ellipse cx="1086" cy="485" rx="18" ry="48" transform="rotate(40 1086 485)"/><ellipse cx="1043" cy="534" rx="21" ry="49" transform="rotate(-48 1043 534)"/><ellipse cx="1085" cy="395" rx="17" ry="43" transform="rotate(25 1085 395)"/></g><path d="M1019 645H1112L1097 738H1034Z" fill="${r.accent}"/>`;
 let furniture='';
 if(r.kind==='sofa')furniture=`<ellipse cx="600" cy="783" rx="410" ry="29" fill="#000" opacity=".09"/>${leg(295,720)}${leg(895,720)}<g filter="url(#shadow)">${rect(270,550,660,180,r.fabric,35)}${rect(280,605,640,120,r.fabric,22)}${rect(255,595,62,137,r.fabric,20)}${rect(883,595,62,137,r.fabric,20)}<path d="M494 562V662M710 562V662M319 678H881" stroke="#000" opacity=".09" fill="none"/><path d="M319 690H881" stroke="#fff" opacity=".22"/>${rect(335,576,105,88,r.accent,17)}${rect(769,580,99,80,'#c6bcae',17)}</g>${lamp}${plant}`;
 if(r.kind==='chair')furniture=`${plant}${lamp}<g filter="url(#shadow)">${leg(305,700,90)}${leg(480,700,90)}${rect(292,548,225,177,r.fabric,38)}${rect(281,626,247,91,r.fabric,24)}${rect(334,576,141,89,'#c9cec4',20)}</g>${leg(775,673,105)}<ellipse cx="782" cy="662" rx="104" ry="18" fill="${r.wood}"/><path d="M763 625L754 577H795L786 625Z" fill="${r.accent}"/>`;
 if(r.kind==='bed')furniture=`${leg(314,700)}${leg(884,700)}<g filter="url(#shadow)">${rect(290,528,620,195,r.wood,30)}${rect(284,636,632,148,r.fabric,16)}${rect(327,570,228,81,'#f0ece2',24)}${rect(642,570,228,81,'#f0ece2',24)}${rect(284,693,632,91,'#c5bdab',12)}<path d="M310 701H893M310 713H893" stroke="#fff" opacity=".18"/></g>${rect(138,646,107,73,r.wood,4)}${rect(945,646,107,73,r.wood,4)}${leg(145,712,58)}${leg(1030,712,58)}<path d="M179 635V574M985 635V574" stroke="${r.accent}" stroke-width="5"/><path d="M146 578L157 536H199L213 578ZM952 578L963 536H1005L1019 578Z" fill="${r.accent}"/>`;
 if(r.kind==='library')furniture=`${rect(55,170,175,590,r.wood,1)}${rect(970,170,175,590,r.wood,1)}${Array.from({length:5},(_,i)=>`${rect(66,260+i*100,153,6,r.accent)}${rect(981,260+i*100,153,6,r.accent)}${Array.from({length:7},(_,j)=>rect(73+j*20,198+i*100,12,60-(j%3)*9,['#c1ac8b','#777968','#aa8c72'][j%3])).join('')}${Array.from({length:7},(_,j)=>rect(986+j*20,198+i*100,12,60-(j%3)*9,['#b9ab99','#8a7f70','#6c6f62'][j%3])).join('')}`).join('')}${leg(340,700)}${leg(840,700)}${rect(314,598,570,121,r.fabric,21)}${rect(299,652,600,58,r.fabric,12)}${lamp}`;
 if(r.kind==='bench')furniture=`<ellipse cx="600" cy="792" rx="320" ry="17" opacity=".08"/>${leg(330,683,110)}${leg(845,683,110)}${rect(300,655,600,35,r.wood,6)}${rect(320,634,560,25,r.fabric,10)}${rect(150,548,94,210,'#d4cfc5')}${rect(974,608,75,150,'#d4cfc5')}<path d="M179 548Q161 512 183 487Q215 484 209 548Z" fill="${r.accent}"/>`;
 if(r.kind==='dining')furniture=`${leg(359,658,132)}${leg(839,658,132)}${rect(320,618,560,39,r.wood,9)}${[255,470,728,915].map(x=>`${leg(x,719,75)}${leg(x+95,719,75)}${rect(x-13,560,137,162,r.fabric,15)}${rect(x-18,703,147,19,r.wood,4)}`).join('')}<ellipse cx="600" cy="618" rx="52" ry="8" fill="${r.accent}"/><path d="M585 610L577 555H624L615 610Z" fill="${r.accent}"/>${plant}`;
 if(r.kind==='desk')furniture=`${rect(280,627,650,27,r.wood,5)}${leg(300,654,137)}${leg(895,654,137)}${rect(320,659,145,96,r.wood,4)}${rect(341,677,104,3,'#c1a586')}${rect(341,712,104,3,'#c1a586')}${rect(545,663,181,117,r.fabric,21)}${rect(558,604,155,80,r.fabric,20)}${leg(570,763,40)}${leg(684,763,40)}${lamp}${plant}${rect(773,605,73,19,'#c5b79b',2)}`;
 if(r.kind==='console')furniture=`${leg(365,655,129)}${leg(832,655,129)}${rect(335,598,530,62,r.wood,5)}${rect(355,619,490,1,'#0003')}<path d="M393 598Q357 541 391 511Q425 508 413 598Z" fill="${r.accent}"/>${rect(729,580,86,18,'#b6a188',2)}${rect(740,564,73,15,'#e2d6c2',2)}${plant}<ellipse cx="178" cy="737" rx="57" ry="16" fill="${r.wood}"/>${leg(152,730,64)}${leg(190,730,64)}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><linearGradient id="light" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient><linearGradient id="ground" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".14"/></filter></defs>${rect(0,0,1200,900,r.wall)}${rect(0,760,1200,140,r.floor)}${rect(0,760,1200,140,'url(#ground)')}<path d="M0 751H1200V760H0Z" fill="#000" opacity=".07"/>${r.kind==='sofa'?'<path d="M40 0H155V750H40Z" fill="#fff" opacity=".15"/>':''}${r.kind==='bench'?'<path d="M160 80H1040V640H160Z" stroke="#000" fill="none" opacity=".045"/>':''}${rect(0,0,1200,900,'url(#light)')}${furniture}<path d="M0 895H1200" stroke="#fff" opacity=".2"/></svg>`;
}
rooms.forEach((r,i)=>{const b=document.createElement('button');b.className='room-dot';b.setAttribute('aria-label',r.name);b.style.setProperty('--room-color',r.wall);b.onclick=()=>showRoom(i);document.querySelector('#room-dots').append(b)});
function showRoom(i){roomIndex=(i+rooms.length)%rooms.length;const r=rooms[roomIndex];document.querySelector('#room-background').innerHTML=roomSvg(r);document.querySelector('#room-name').textContent=r.name;document.querySelector('#room-count').textContent=String(roomIndex+1).padStart(2,'0')+' / 10';document.querySelectorAll('.room-dot').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===roomIndex)));}
function openWall(){if(!activeWork?.widthCm)return;const image=document.querySelector('#wall-art');image.src=activeWork.asset||`assets/work-${activeWork.id}.webp`;image.alt=activeWork.title+' в интерьере';image.style.width=(activeWork.widthCm/400*100)+'%';image.style.height=(activeWork.heightCm/300*100)+'%';image.style.borderRadius=activeWork.round?'50%':'0';document.querySelector('#wall-title').textContent=activeWork.title;document.querySelector('#wall-size').textContent=activeWork.size;showRoom(roomIndex);wallView.showModal()}
function closeWall(){wallView.close();document.querySelector('#on-wall').focus({preventScroll:true})}
document.querySelector('#on-wall').onclick=openWall;document.querySelector('#wall-close').onclick=closeWall;document.querySelector('#room-prev').onclick=()=>showRoom(roomIndex-1);document.querySelector('#room-next').onclick=()=>showRoom(roomIndex+1);
wallView.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showRoom(roomIndex+(e.key==='ArrowRight'?1:-1))}});
let touchStart=null;scene.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX},{passive:true});scene.addEventListener('touchend',e=>{if(touchStart===null)return;const d=e.changedTouches[0].clientX-touchStart;if(Math.abs(d)>45)showRoom(roomIndex+(d<0?1:-1));touchStart=null},{passive:true});
