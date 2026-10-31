// A second presentation of the same report engine, including its PNG renderer.
(() => {
 const oldCover=annualCoverPanel;
 annualCoverPanel=()=>'<div class="ink-cover">'+identity('cover')+'<small class="ink-volume">彩云小译 · 二〇二六年度卷</small><h2>为热爱<br>跨越语言</h2><svg class="ink-landscape" viewBox="0 0 600 230" aria-hidden="true"><defs><linearGradient id="inkMist" x2="0" y2="1"><stop stop-color="#6c7664" stop-opacity=".1"/><stop offset="1" stop-color="#6c7664" stop-opacity=".6"/></linearGradient></defs><path d="M0 170L70 100 108 132 170 40 240 122 290 71 370 158 435 104 520 164 600 113V230H0Z" fill="url(#inkMist)"/><path d="M0 218L70 175 122 193 185 128 230 167 270 145 356 213 400 170 458 191 520 151 600 210V230H0Z" fill="#56634b" opacity=".23"/><path d="M0 224Q170 201 300 222T600 214" fill="none" stroke="#65715c" stroke-width=".7"/><circle cx="100" cy="65" r="23" fill="none" stroke="#6b785e" stroke-width=".7"/><path d="M76 100l10-3m4 2l8-4m49 7l8-3" stroke="#52604b" fill="none"/></svg><div class="ink-cover-foot"><span><img src="'+BRAND_LOGO_DATA+'" alt="彩云小译 Logo">For fandom, beyond language</span><em>2026</em></div></div>';
 const baseAppearance=cardAppearance;
 cardAppearance=()=>({...baseAppearance(),bg:'#f3f4e9',panel:'#e6eadb',ink:'#293025',gold:'#737d65',line:'#bec6b2'});
 const oldPaint=paintShareCard;
 paintShareCard=canvas=>{const result=oldPaint(canvas),ctx=result.getContext('2d');if(ctx.filter!==undefined){const copy=document.createElement('canvas');copy.width=result.width;copy.height=result.height;copy.getContext('2d').drawImage(result,0,0);ctx.filter='grayscale(1)';ctx.drawImage(copy,0,0);ctx.filter='none'}return result};
 const baseGo=go;let turn=null,turnFrame=0,turnTimer=0;
 function finishTurn(){cancelAnimationFrame(turnFrame);clearTimeout(turnTimer);if(turn){turn.stage.remove();turn.book.classList.remove('ink-turning');turn=null}}
 function sheetClone(node,w,h){const clone=node.cloneNode(true);clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));clone.removeAttribute('id');clone.setAttribute('aria-hidden','true');clone.inert=true;Object.assign(clone.style,{position:'absolute',left:'0',top:'0',width:w+'px',height:h+'px',minHeight:'0',margin:'0',transform:'none',animation:'none'});return clone}
 go=(n,focus=true)=>{
  finishTurn();const previous=page,book=document.querySelector('.book'),current=book?.querySelector('.page');
  const old=current?.cloneNode(true),w=book?.clientWidth,h=book?.clientHeight;
  baseGo(n,focus);if(!book||!old||!w||!h||previous===page||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const forward=page>previous,newPage=book.querySelector('.page'),height=Math.max(h,book.clientHeight),stage=document.createElement('div');stage.className='ink-paper-turn';stage.setAttribute('aria-hidden','true');stage.inert=true;stage.style.height=height+'px';
  if(!forward){const under=sheetClone(old,w,height);under.classList.add('ink-turn-under');stage.appendChild(under)}
  const face=document.createElement('div'),back=document.createElement('div'),bleed=document.createElement('div'),shade=document.createElement('div');face.className='ink-turn-face';back.className='ink-turn-back';bleed.className='ink-turn-bleed';shade.className='ink-turn-shade';
  const target=forward?old:newPage;face.appendChild(sheetClone(target,w,height));bleed.appendChild(sheetClone(target,w,height));back.appendChild(bleed);stage.append(face,shade,back);
  const ns='http://www.w3.org/2000/svg',curl=document.createElementNS(ns,'svg');curl.setAttribute('viewBox','0 0 '+w+' '+height);curl.setAttribute('preserveAspectRatio','none');curl.classList.add('ink-curl-band');
  curl.innerHTML='<defs><linearGradient id="inkFoldTone"><stop stop-color="#000" stop-opacity=".16"/><stop offset=".28" stop-color="#fff" stop-opacity=".48"/><stop offset=".62" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient></defs><path fill="url(#inkFoldTone)"/>';
  const band=curl.querySelector('path'),gradient=curl.querySelector('linearGradient');gradient.setAttribute('gradientUnits','userSpaceOnUse');stage.appendChild(curl);book.appendChild(stage);book.classList.add('ink-turning');turn={stage,book};
  const started=performance.now(),duration=1050;
  function draw(now){if(!turn||turn.stage!==stage)return;const t=Math.min(1,(now-started)/duration),ease=t*t*(3-2*t),p=forward?ease:1-ease,f=InkPaperFold.frame(w,height,p);face.style.clipPath=InkPaperFold.polygon(f.stationary);back.style.clipPath=InkPaperFold.polygon(f.back);bleed.style.transform='matrix('+f.matrix.join(',')+')';
   const angle=Math.atan2(f.n.y,f.n.x)*180/Math.PI+90;shade.style.background='linear-gradient('+angle+'deg,transparent '+Math.max(0,Math.min(100,f.c/w*100-12))+'%,#10180a22 '+Math.max(0,Math.min(100,f.c/w*100))+'%,transparent '+Math.max(0,Math.min(100,f.c/w*100+14))+'%)';shade.style.opacity=String(f.curl*.8);
   if(f.crease.length===2){const [a,b]=f.crease,r=Math.min(48,w*.10)*f.curl,dx=f.n.x*r,dy=f.n.y*r;band.setAttribute('d','M '+a.x+' '+a.y+' Q '+((a.x+b.x)/2-dx*.4)+' '+((a.y+b.y)/2-dy*.4)+' '+b.x+' '+b.y+' L '+(b.x-dx)+' '+(b.y-dy)+' Q '+((a.x+b.x)/2-dx*1.8)+' '+((a.y+b.y)/2-dy*1.8)+' '+(a.x-dx)+' '+(a.y-dy)+' Z');gradient.setAttribute('x1',a.x-dx);gradient.setAttribute('y1',a.y-dy);gradient.setAttribute('x2',a.x);gradient.setAttribute('y2',a.y);curl.style.opacity=String(f.curl)}else curl.style.opacity='0';
   if(t<1)turnFrame=requestAnimationFrame(draw);else finishTurn();
  }
  turnFrame=requestAnimationFrame(draw);turnTimer=setTimeout(finishTurn,duration+250);
 };
 document.querySelector('.edition').textContent='THE INK LIBRARY · VOL. 2026';
 const themeNames=['纸白 · 水墨','夜读 · 墨黑','护眼 · 青纸'];document.querySelectorAll('[data-theme]').forEach((b,i)=>{b.setAttribute('aria-label',themeNames[i]);b.title=themeNames[i]});
 document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('.modal')||annualCardLightbox||['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target.tagName))return;if(e.key==='ArrowRight'&&annualConsent&&page<7){e.preventDefault();go(page+1)}if(e.key==='ArrowLeft'&&page>=0){e.preventDefault();go(page-1)}});
 // A deliberate horizontal gesture turns pages; vertical movement remains untouched.
 let touch=null;const book=document.querySelector('.book');book?.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||e.target.closest('button,input,a,[data-egg],.app-afterword-interaction'))return;touch={x:e.clientX,y:e.clientY,t:e.timeStamp}});book?.addEventListener('pointercancel',()=>touch=null);book?.addEventListener('pointerup',e=>{const t=touch;touch=null;if(!t||e.timeStamp-t.t>650)return;const dx=e.clientX-t.x,dy=e.clientY-t.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*2){if(dx<0&&annualConsent&&page<7)go(page+1);else if(dx>0&&page>=0)go(page-1)}});
 baseGo(page,false);
})();
