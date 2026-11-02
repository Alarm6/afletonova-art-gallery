const works=[
{id:'0758',title:'Поле',size:'Ø 30 см',round:true},
{id:'0757',title:'Маяк',size:'20 × 30 см'},
{id:'0754',title:'Аист',size:'Размер уточняется',note:'Размер и форма этой работы уточняются.'},
{id:'0752',title:'На юг',size:'Размер уточняется'},
{id:'0748',title:'Лодка',size:'100 × 50 см'},
{id:'0750',title:'Цапля',size:'80 × 50 см'},
{id:'0756',title:'Круглый маяк',size:'Ø 30 см',round:true},
{id:'0753',title:'Полёт',size:'Размер уточняется'}];
const track=document.querySelector('#track'),viewport=document.querySelector('.viewport'),dialog=document.querySelector('dialog');
works.forEach((work,i)=>{const b=document.createElement('button');b.className='art'+(work.round?' round':'');b.innerHTML=`<span class="label"><h2>${work.title}</h2><span class="size">${work.size}</span></span><img src="assets/work-${work.id}.webp" alt="Картина ${work.title}" loading="lazy">`;b.addEventListener('click',()=>openWork(work));track.append(b)});
function openWork(w){document.querySelector('#detail-img').src=`assets/art-${w.id}.webp`;document.querySelector('#detail-img').alt=w.title;document.querySelector('#detail-title').textContent=w.title;document.querySelector('#detail-size').textContent=w.size;document.querySelector('#detail-note').textContent=w.note||'Авторская картина. Фотография оригинальной работы.';document.querySelector('#copy').textContent='Скопировать название';dialog.showModal()}
document.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelector('#copy').onclick=async()=>{const title=document.querySelector('#detail-title').textContent;try{await navigator.clipboard.writeText(title+' — Afletonova Art');document.querySelector('#copy').textContent='Название скопировано ✓'}catch{document.querySelector('#copy').textContent=title}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function move(direction){viewport.scrollBy({left:direction*viewport.clientWidth*.65,behavior:reduced?'instant':'smooth'})}
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
viewport.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const rect=viewport.getBoundingClientRect();if(rect.top>innerHeight*.5||rect.bottom<innerHeight*.25)return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),max=viewport.scrollWidth-viewport.clientWidth;if((d>0&&viewport.scrollLeft<max-2)||(d<0&&viewport.scrollLeft>2)){e.preventDefault();viewport.scrollLeft+=d}},{passive:false});
viewport.addEventListener('scroll',()=>{const p=viewport.scrollLeft/(viewport.scrollWidth-viewport.clientWidth||1);document.querySelector('#progress').style.width=(15+p*85)+'%';document.querySelector('#count').textContent=String(Math.min(8,1+Math.round(p*7))).padStart(2,'0')+' — 08'});
const brand=document.querySelector('.brand'),film=document.querySelector('.film');
function update(){const mobile=innerWidth<=700;const p=Math.min(1,Math.max(0,scrollY/(innerHeight*.8)));const s=p*p*(3-2*p);brand.style.top=((mobile?innerHeight*.19:innerHeight*.42-30)*(1-s)+26*s)+'px';brand.style.width=((mobile?innerWidth*.78:innerWidth*.37)*(1-s)+(mobile?135:155)*s)+'px';film.style.opacity=1-p;brand.style.pointerEvents='auto'}
addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
const video=document.querySelector('video'),play=document.querySelector('#play');if(reduced){video.pause();play.textContent='▶'}play.onclick=()=>{if(video.paused){video.play().catch(()=>{});play.textContent='Ⅱ';play.setAttribute('aria-label','Приостановить видео')}else{video.pause();play.textContent='▶';play.setAttribute('aria-label','Воспроизвести видео')}};
