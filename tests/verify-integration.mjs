import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../source/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function environment(platform='',entryQuery='',authorized=true){
 const nodes=new Map(),events=new Map(),messages=[],downloads=[],urls=[],revoked=[],appended=[],timers=new Map();let timer=0,blobFail=false,imageFail=false;
 const element=(selector='')=>{const classes=new Set();let cls='',content='',src='';const el={dataset:{},attrs:{},disabled:false,isConnected:true,offsetWidth:40,naturalWidth:1080,complete:false,scrollTop:0,style:{props:{},setProperty(k,v){this.props[k]=v}},classList:{add(...xs){xs.forEach(x=>classes.add(x))},remove(...xs){xs.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)},toggle(x,v){if(v===undefined)v=!classes.has(x);v?classes.add(x):classes.delete(x)}},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k];if(k==='src')src=''},appendChild(){},remove(){this.isConnected=false},focus(){},scrollIntoView(){},querySelector(){return element()},querySelectorAll(){return []},getBoundingClientRect(){return {height:58,width:393,left:0,top:0}},click(){downloads.push({href:this.href,download:this.download});this.onclick?.()}};
 Object.defineProperty(el,'className',{get(){return [...classes].join(' ')},set(v){classes.clear();v.split(/\s+/).filter(Boolean).forEach(c=>classes.add(c));cls=v}});
 Object.defineProperty(el,'innerHTML',{get(){return content},set(v){content=v;if(selector==='#modalRoot'){for(const [k,n] of nodes)if(['#cardPreviewBody','#savePng','#exportStatus','#annualCardImage','#cardPreviewFallback','#retryCard'].includes(k))n.isConnected=!!v}}});
 Object.defineProperty(el,'src',{get(){return src},set(v){src=v;if(selector==='#annualCardImage'){el.complete=true;el.naturalWidth=imageFail?0:1080;queueMicrotask(()=>imageFail?el.onerror?.():el.onload?.())}}});
 return el;
 };
 const get=s=>{if(!nodes.has(s))nodes.set(s,element(s));return nodes.get(s)};
 const lists={'[data-preview-mode]':['web','app'].map(v=>{const e=element();e.dataset.previewMode=v;return e}),'[data-platform]':['ios','android','harmony'].map(v=>{const e=element();e.dataset.platform=v;return e})};
 const body=element();body.appendChild=el=>appended.push(el);body.className='theme-paper';const parent={postMessage(m){messages.push({to:'parent',m})}};
 const w={location:{href:'file:///annual.html'+(platform?'?appPreview='+platform:entryQuery?'?'+entryQuery:'')},addEventListener(n,f){if(!events.has(n))events.set(n,[]);events.get(n).push(f)},postMessage(){}};w.parent=platform?parent:w;
 const frameWindow={postMessage(m){messages.push({to:'frame',m})}};get('#appPreviewFrame').contentWindow=frameWindow;get('#coverArt').innerHTML='<svg></svg>';
 const ctx=new Proxy({measureText:t=>({width:t.length*36})},{get(o,k){return k in o?o[k]:(()=>{})},set(o,k,v){o[k]=v;return true}});
 const URLClass=class extends URL{static createObjectURL(b){const url='blob:preview-'+urls.length;urls.push({url,b});return url}static revokeObjectURL(url){revoked.push(url)}};
 const sandbox={window:w,document:{querySelector:get,querySelectorAll:s=>lists[s]||[],body,activeElement:element(),addEventListener(){},createElement(tag){if(tag==='canvas')return {getContext(){return ctx},toBlob(fn){queueMicrotask(()=>fn(blobFail?null:new Blob(['png'],{type:'image/png'})))}};return element()}},URL:URLClass,Blob,FileReader:class{readAsDataURL(){this.result='data:image/png;base64,cG5n';queueMicrotask(()=>this.onload())}},Image:class{set src(v){queueMicrotask(()=>this.onload?.())}},ResizeObserver:class{constructor(fn){this.fn=fn}observe(target){this.fn([{target}])}},localStorage:{getItem(){return null},setItem(){}},matchMedia:()=>({matches:true}),getComputedStyle:()=>({getPropertyValue:()=>''}),setTimeout(fn,ms){const n=++timer;timers.set(n,{fn,ms});return n},clearTimeout(n){timers.delete(n)},console};
 vm.createContext(sandbox);vm.runInContext(code,sandbox);if(authorized)vm.runInContext('annualConsent=true;go(0,false)',sandbox);const run=s=>vm.runInContext(s,sandbox),send=(data,source=platform?parent:frameWindow)=>events.get('message').forEach(f=>f({source,data}));
 return {get,run,sandbox,w,parent,frameWindow,messages,downloads,urls,revoked,appended,send,lists,timers,setBlobFail(v){blobFail=v},setImageFail(v){imageFail=v}};
}
const entry=environment('','preview=app&platform=harmony');assert.equal(entry.run('previewMode'),'app');assert.equal(entry.run('previewPlatform'),'harmony');assert(entry.get('#appPreviewFrame').src.includes('appPreview=harmony'));
const tick=()=>new Promise(r=>setImmediate(r));
const web=environment();assert.equal(web.run('APP_PREVIEW_PLATFORM'),null);assert.equal(web.sandbox.document.body.style.props['--preview-tools-height'],'58px');
web.run("go(6,false);quoteIndex=0;activeProfile='new';data={...profiles.new};document.body.className='theme-midnight';eggSeen.add(2)");
assert(web.run("setPreviewMode('app')"));assert.equal(web.run('previewMode'),'app');assert(web.get('#appPreviewFrame').src.endsWith('?appPreview=ios'));assert(web.sandbox.document.body.dataset.previewMode==='app');assert(web.get('.shell').inert);web.get('#appPreviewFrame').onload();const sent=web.messages.at(-1).m;assert.equal(sent.state.page,6);assert.equal(sent.state.quoteIndex,0);assert.equal(sent.state.theme,'midnight');assert.equal(sent.state.activeProfile,'new');
for(const p of ['android','harmony','ios']){assert(web.run(`setPreviewPlatform('${p}')`));assert.equal(web.messages.at(-1).m.platform,p)}assert.equal(web.run("setPreviewPlatform('bad')"),false);
web.send({type:'lingocloud-annual:state',state:{...sent.state,page:7,quoteIndex:0}},{});assert.equal(web.run('previewState.page'),6);web.send({type:'lingocloud-annual:state',state:{...sent.state,page:7,quoteIndex:0}});assert.equal(web.run('previewState.page'),7);
web.send({type:'lingocloud-annual:state',state:{...sent.state,activeProfile:'__proto__'}});assert.equal(web.run('previewState.activeProfile'),'new');web.run("setPreviewMode('web')");assert.equal(web.run('page'),7);assert.equal(web.run('quoteIndex'),0);assert(!web.get('.shell').inert);assert.equal(web.get('#appPreviewFrame').src,'');
for(const platform of ['ios','android','harmony']){const child=environment(platform);assert.equal(child.run('APP_PREVIEW_PLATFORM'),platform);assert.equal(child.sandbox.document.body.dataset.appPlatform,platform);assert.equal(child.messages.length,0,'No default-state event before initialization');child.send({type:'lingocloud-annual:init',state:sent.state},{});assert.equal(child.run('page'),0);child.send({type:'lingocloud-annual:init',state:sent.state});assert.equal(child.run('page'),6);assert.equal(child.run('quoteIndex'),0);assert.equal(child.sandbox.document.body.className,'theme-midnight');assert.equal(child.messages.at(-1).m.state.page,6);assert.equal(child.run('chooseQuote(1)'),false);assert.equal(child.messages.at(-1).m.state.quoteIndex,0);child.send({type:'lingocloud-annual:platform',platform:'android'});assert.equal(child.sandbox.document.body.dataset.appPlatform,'android');child.run('go(1,false)');child.get('#modalRoot').innerHTML='';child.get('#appBack').onclick();assert.equal(child.run('page'),0);child.get('#appBack').onclick();assert.equal(child.run('page'),-1);child.get('#appBack').onclick();assert.equal(child.messages.at(-1).m.type,'lingocloud-annual:exit');}
// The PNG being previewed is the exact file used for downloads and native album save.
const card=environment();card.run("go(7,false);openShare()");let markup=card.get('#modalRoot').innerHTML;assert(markup.includes('我的年度卡'));assert(!/share-form|class="hint"|完整保存你的|不自动外发|示例数据|效果预演|陪伴截至/.test(markup));assert.equal((markup.match(/class="report-stat"/g)||[]).length,9);assert(!markup.includes('小译 Fusion'));await tick();await tick();assert(!card.get('#savePng').disabled);assert(card.get('#savePng').innerHTML.includes('保存到相册'));const key=card.run('annualCardKey()'),firstUrl=card.get('#annualCardImage').src;assert.equal(card.run('annualImageCache.size'),1);assert(firstUrl.startsWith('blob:'));assert(card.get('#cardPreviewFallback').classList.contains('hidden'));assert.equal(card.get('#cardPreviewBody').getAttribute('aria-busy'),'false');await card.run('savePng()');assert.equal(card.downloads.at(-1).href,firstUrl);assert(card.downloads.at(-1).download.endsWith('.png'));assert(card.get('#exportStatus').textContent.includes('下载记录'));assert(!card.get('#exportStatus').textContent.includes('已保存到相册'));
let hostPayload;card.w.LingoCloudAnnualHost={async saveImageToAlbum(payload){hostPayload=payload;return {status:'saved'}}};await card.run('savePng()');assert.equal(hostPayload.mimeType,'image/png');assert(hostPayload.dataUrl.startsWith('data:image/png;base64,'));assert.equal(card.get('#exportStatus').textContent,'已保存到相册');assert(!card.get('#savePng').disabled);
for(const status of ['cancelled','permission-denied','unexpected']){card.w.LingoCloudAnnualHost={async saveImageToAlbum(){return {status}}};await card.run('savePng()');assert(!card.get('#exportStatus').textContent.includes('已保存到相册'));assert(!card.get('#savePng').disabled)}
card.run('closeModal();openShare()');await tick();assert.equal(card.get('#annualCardImage').src,firstUrl);assert.equal(card.urls.length,1);card.get('#editAfterword').onclick();assert.equal(card.run('page'),6);assert(!card.sandbox.document.body.classList.contains('card-preview-open'));
// Changes regenerate, failed generation can retry, closing during save is safe.
card.run("installAfterwords(['字句远行者','故事微光留存者','表达世界探索者']);openShare()");await tick();assert.notEqual(card.get('#annualCardImage').src,firstUrl);assert.equal(card.run('annualImageCache.size'),2);const fail=environment();fail.setBlobFail(true);fail.run('openShare()');await tick();assert(fail.get('#savePng').disabled);assert.equal(fail.get('#exportStatus').textContent,'图片生成失败，请重试');assert(!fail.get('#retryCard').classList.contains('hidden'));fail.setBlobFail(false);fail.get('#retryCard').onclick();await tick();assert(!fail.get('#savePng').disabled);
let resolveHost;card.w.LingoCloudAnnualHost={saveImageToAlbum:()=>new Promise(r=>{resolveHost=r})};const saving=card.run('savePng()');await tick();card.run('closeModal()');resolveHost({status:'saved'});await saving;
// An open card remains open through web/app preview changes.
const switching=environment();switching.run('go(7,false);quoteIndex=0;openShare()');await tick();switching.run("setPreviewMode('app')");assert.equal(switching.run('previewState.cardOpen'),true);switching.get('#appPreviewFrame').onload();const cardState=switching.messages.at(-1).m.state;const inApp=environment('ios');inApp.send({type:'lingocloud-annual:init',state:cardState});await tick();assert(inApp.sandbox.document.body.classList.contains('card-preview-open'));assert.equal(inApp.run('quoteIndex'),0);switching.send({type:'lingocloud-annual:state',state:inApp.messages.at(-1).m.state});switching.run("setPreviewMode('web')");await tick();assert(switching.sandbox.document.body.classList.contains('card-preview-open'));switching.run('closeModal()');
const decode=environment();decode.setImageFail(true);decode.run('openShare()');await tick();assert(decode.get('#savePng').disabled);assert.equal(decode.run('annualImageCache.size'),0);decode.setImageFail(false);decode.get('#retryCard').onclick();await tick();assert(!decode.get('#savePng').disabled);
for(const p of ['ios','android','harmony'])assert(html.includes('data-platform="'+p+'"'));assert(html.includes('viewport-fit=cover'));assert(html.includes('var(--app-bottom-height)'));assert(html.includes('minmax(0,1fr)'));assert(!html.includes('V6 · 猫咪带路'));
console.log('PASS V20 integration: web/app mode and platform switches, validated frame messages and initial-state handshake, choices/theme/state preservation, three app chromes and back navigation, production-style card preview, exact PNG reuse, image cache/regenerate/retry, browser download vs native save/cancel/denial/error, safe dismissal during save.');
// Compact APP overview retains all content and all three actions.
for(const platform of ['ios','android','harmony']){const app=environment(platform);app.run('go(7,false)');const report=app.get('#book').innerHTML;assert(report.includes('class="ac-report-identity"'));assert(report.includes('squirrelRao'));assert(report.includes('2026我的彩云小译年度报告'));assert.equal((report.match(/class="ac-report-metric/g)||[]).length,9);for(const label of ['我的最佳翻译模型搭档','我的年度标签','查看标签','重看','生成我的年度卡'])assert(report.includes(label));app.run('go(3,false)');assert.equal((app.get('#book').innerHTML.match(/class="model-row/g)||[]).length,9);app.run('go(6,false)');assert.equal((app.get('#book').innerHTML.match(/data-quote=/g)||[]).length,0)}
// Layout fitting logic is exercised with synthetic geometry, not a browser renderer.
assert(html.includes('animation:none;will-change:auto'));
assert(html.includes('grid-template-rows:repeat(4,minmax(min-content,1fr))'));
assert(html.includes('min-height:28px;flex:1 0 auto'));
assert(html.includes('object-fit:contain;box-shadow:none'));
assert(!html.includes('repeat(9,minmax(22px,1fr))'));
const fitting=environment('ios');
const main=fitting.get('.main'),pageNode=fitting.get('.page');
let contentHeights={roomy:820,compact:700,tight:580};
Object.assign(main,{clientHeight:600,clientWidth:360,scrollTop:47,scrollLeft:9});
const cssSize=(value,fallback)=>typeof value==='string'&&value.endsWith('px')?Number.parseFloat(value):fallback;
Object.defineProperties(pageNode,{
 scrollHeight:{get(){return Math.max(cssSize(this.style.height,main.clientHeight),contentHeights[fitting.sandbox.document.body.dataset.appDensity])}},
 scrollWidth:{get(){return cssSize(this.style.width,main.clientWidth)}}
});
let fitted=fitting.run('fitCurrentAppPage()');
assert.equal(fitted.density,'tight');assert.equal(fitted.scale,1);assert.equal(fitted.overflow,0);assert.equal(main.scrollTop,0);assert.equal(main.scrollLeft,0);
// More space restores comfortable spacing; short screens calculate a complete-page fallback.
main.clientHeight=900;fitted=fitting.run('fitCurrentAppPage()');assert.equal(fitted.density,'roomy');assert.equal(fitted.scale,1);
main.clientHeight=436;fitted=fitting.run('fitCurrentAppPage()');assert(fitted.scale>.74&&fitted.scale<.76);assert(fitted.overflow<=1);assert.equal(pageNode.style.transform,'scale('+fitted.scale+')');
assert.equal(fitting.run('fitScaleSearch(s=>s<=.731)'),.7308);
assert.equal(fitting.run('fitScaleSearch(()=>true)'),1);
const beforeData=fitting.run('JSON.stringify(data)'),beforeQuote=fitting.run('quoteIndex');
let checkedSizes=0;
for(const [width,height] of [[320,436],[360,508],[375,535],[393,720],[412,790],[430,800]]){
 for(const profile of ['regular','heavy','new','empty','missing','light','textOnly','comicsOnly']){
  fitting.run('data={...profiles.'+profile+'}');
  for(let n=0;n<8;n++){
   fitting.run('go('+n+',false)');main.clientWidth=width;main.clientHeight=height;
   // Deliberately force content beyond the small viewport to test fit, not clipping.
   contentHeights={roomy:900+n*30,compact:810+n*25,tight:560+n*30};
   const snapshot=fitting.run('JSON.stringify(data)'),result=fitting.run('fitCurrentAppPage()');
   assert(result.overflow<=1);assert(result.scale>0&&result.scale<=1);
   assert.equal(fitting.run('JSON.stringify(data)'),snapshot);
   assert.equal(pageNode.dataset.fitWidth,String(width));assert.equal(pageNode.dataset.fitHeight,String(height));
   checkedSizes++;
  }
 }
}
// Fit queues coalesce and run after navigation, afterword changes and platform changes.
const frames=new Map();let nextFrame=0;
fitting.sandbox.requestAnimationFrame=fn=>{frames.set(++nextFrame,fn);return nextFrame};
fitting.sandbox.cancelAnimationFrame=id=>frames.delete(id);
fitting.run('go(6,false);chooseQuote(4);setAppPlatform("android")');assert.equal(frames.size,1);
for(const fn of frames.values())fn();frames.clear();assert.equal(pageNode.dataset.fitOverflow,'0');
assert.equal(fitting.run('quoteIndex'),0);
// Frame scaling preserves the logical phone screen at every outer-window size.
const devices=environment();devices.w.innerWidth=1280;devices.w.innerHeight=760;devices.get('#appPreviewStage').clientWidth=1280;
devices.run('setPreviewMode("app")');
for(const platform of ['ios','android','harmony']){
 devices.run('setPreviewPlatform("'+platform+'")');
 const result=devices.run('fitDevicePreview()'),logical=devices.run('PREVIEW_PLATFORMS[previewPlatform]');
 assert.equal(result.width,logical.width);assert.equal(result.height,logical.height);
 const box=devices.get('#deviceViewportBox');assert(Number.parseFloat(box.style.height)<=662.01);assert(result.scale<1);
 devices.w.innerWidth=360;devices.w.innerHeight=640;devices.get('#appPreviewStage').clientWidth=360;
 const small=devices.run('fitDevicePreview()');assert(Number.parseFloat(box.style.width)<=328.01);assert(Number.parseFloat(box.style.height)<=542.01);assert(small.scale>0);
 devices.w.innerWidth=1280;devices.w.innerHeight=760;devices.get('#appPreviewStage').clientWidth=1280;
}
console.log('PASS V20 fit: '+checkedSizes+' synthetic page/profile/viewport cases; density relaxation, fit search, zero vertical overflow, state preservation, queued updates, intrinsic list/grid safeguards, all three proportionate phone frames and full-image APP preview styles.');

// V20: content grows into the useful area instead of reserving an ornament/spacer section.
for(const platform of ['ios','android','harmony']){
 const app=environment(platform);assert(app.appended.some(el=>el.id==='appFarewellLayer'));
 const original=app.run('JSON.stringify(data)');
 for(const profile of ['regular','heavy','new','empty','missing','light','textOnly','comicsOnly']){
  app.run('data={...profiles.'+profile+'}');
  for(let n=0;n<8;n++){
   app.run('go('+n+',false)');const markup=app.get('#book').innerHTML;
   assert(markup.includes('ac-page'));assert.equal((markup.match(/data-egg=/g)||[]).length,1);
   assert(!markup.includes('app-visual-stage'));assert(!markup.includes('class="egg-scene visual-egg'));assert(!markup.includes('class="ac-spacer"'));
   if(n===0){for(const label of ['我们已相伴','注册至今','2026 年度翻译足迹','网页翻译字数','漫画/图片','热爱的足迹'])assert(markup.includes(label));assert(markup.includes('v20-totals'));assert(!markup.includes('ac-cover-panel'))}
   if(n===1){for(const label of ['翻译网页数'])assert(markup.includes(label));assert(markup.includes('ac-web-body'))}
   if(n===2){assert(markup.includes('ac-image-hero'));assert(markup.includes('漫画/图片'))}
   if(n===3){assert.equal((markup.match(/class="model-row/g)||[]).length,9)}
   if(n===4){assert.equal((markup.match(/class="ac-tool"/g)||[]).length,3);assert(markup.includes('自建术语词条'))}
   if(n===5){assert(markup.includes('收藏网页数'));assert(markup.includes('剪藏网页数'));assert.equal((markup.match(/class="ac-metric /g)||[]).length,2)}
   if(n===6){assert.equal((markup.match(/data-quote=/g)||[]).length,0);assert(markup.includes('ac-afterword-wrap'));assert(!markup.includes('id="farewellPrompt"'))}
   if(n===7){assert.equal((markup.match(/class="ac-report-metric/g)||[]).length,9);for(const label of ['我的最佳翻译模型搭档','我的年度标签','查看标签','重看','生成我的年度卡'])assert(markup.includes(label))}
  }
 }
 app.run('data={...profiles.regular};go(6,false)');const metrics=app.run('JSON.stringify(getReportStats())');
 const hit=app.get('[data-egg="6"]');hit.dataset.egg='6';hit.closest=()=>app.get('.page');app.sandbox.hit=hit;app.run('bindEgg(hit)');const onClick=hit.onclick;
 for(let q=0;q<3;q++){
  assert.equal(app.run('chooseQuote('+q+')'),false);assert.equal(hit.onclick,onClick);const preview=app.run('afterwordPreviewMarkup()');
  assert(preview.includes('viewBox="0 0 912 720"'));assert(preview.includes('annual-card-skin'));
  for(const hidden of ['squirrelRao','2026我的彩云小译年度报告','brand-logo'])assert(!preview.includes(hidden));
  assert(preview.includes('<text '));assert(!preview.includes('quiet-preview'));
  assert.equal(app.run('JSON.stringify(getReportStats())'),metrics);
 }
 hit.onpointerdown({button:0,pointerId:1,clientX:10,clientY:10});hit.onpointermove({pointerId:1,clientX:800,clientY:600});assert.equal(hit.style.transform,undefined);hit.onpointerup();assert(app.run('eggSeen.has(6)'));assert.equal(app.run('JSON.stringify(getReportStats())'),metrics);
 app.run('go(7,false);showFarewell()');assert.equal(app.get('#farewellPrompt').textContent,'2027新的旅程再会~');app.run('openShare()');assert(app.get('#farewellPrompt').classList.contains('hidden'));
}
assert(html.includes('--reader-width'));assert(html.includes('--ac-value-weight'));
assert(html.includes('.ac-report-actions>div{display:flex;justify-content:space-between;align-items:center}'));
const newCss=html.slice(html.indexOf('/* Each page gives its remaining height')).split('</style>')[0];
assert(!newCss.includes('margin-top:auto'));assert(!newCss.includes('app-visual-stage'));
assert(newCss.includes('.ac-tools{flex:1 0 auto'));assert(newCss.includes('.ac-web-body{flex:1 0 auto'));assert(newCss.includes('.ac-afterword-wrap{position:relative;flex:1 0 auto'));
assert.equal(fitting.get('.page').style.props['--reader-width'],'430px');assert.equal(fitting.get('.page').style.props['--reader-height'],'800px');
console.log('PASS V20 information layout: 8 pages × 8 data profiles × 3 APP platforms preserve content; one inline artwork, no ornament stage; nine overview metrics; one three-tag postcard, annual tags and identity exclusions; stable interaction/unchanged data; explicit flow footer and viewport-dependent number sizing.');
console.log('Verification uses DOM/Canvas stubs; it does not verify browser layout, true WebView or device album APIs.');

// Fresh contexts test the real default; legacy regressions above explicitly authorize their fixtures.
for(const platform of ['', 'ios','android','harmony']){
 const app=environment(platform,'',false);assert.equal(app.run('page'),-1);assert.equal(app.run('annualConsent'),false);
 const initial=app.get('#book').innerHTML;assert(initial.includes('00 / YOUR ANNUAL REPORT'));assert(initial.includes('ac-cover-panel'));assert(initial.includes('type="checkbox"'));assert(!initial.includes('v20-totals'));assert(!initial.includes('1,279'));assert(app.get('#start').disabled);assert.equal(app.get('#annualConsent').checked,false);
 for(const target of [0,1,2,3,4,5,6,7]){app.run('go('+target+',false)');assert.equal(app.run('page'),-1)}
 app.run('openShare()');assert.equal(app.run('annualImageCache.size'),0);assert.equal(app.run('page'),-1);
 app.get('#start').onclick();assert.equal(app.run('page'),-1);
 const unapproved=app.run('previewSnapshot()');assert.equal(unapproved.annualConsent,false);assert.equal(app.run('validPreviewState({...previewSnapshot(),page:7})'),false);assert.equal(app.run('validPreviewState({...previewSnapshot(),annualConsent:"true"})'),false);assert.equal(app.run('validPreviewState({...previewSnapshot(),cardOpen:true})'),false);
 const consent=app.get('#annualConsent');consent.checked=true;consent.onchange();assert.equal(app.get('#start').disabled,false);app.get('#start').onclick();assert.equal(app.run('page'),0);assert.equal(app.run('annualConsent'),true);
 let chapter=app.get('#book').innerHTML;assert(!chapter.includes('ac-cover-panel'));for(const label of ['我们已相伴','网页翻译字数','漫画/图片','翻开我的翻译足迹'])assert(chapter.includes(label));assert(chapter.includes('data-chapter="0"'));
 app.run('go(1,false)');chapter=app.get('#book').innerHTML;for(const label of ['翻译网页数'])assert(chapter.includes(label));assert(!chapter.includes('网页翻译字数'));assert(!chapter.includes('万字'));assert(chapter.includes('8,462'));
 app.run('go(5,false)');chapter=app.get('#book').innerHTML;assert(chapter.includes('收藏网页数'));assert(chapter.includes('剪藏网页数'));assert(!chapter.includes('网页收藏数'));assert(!chapter.includes('网页剪藏数'));
 app.run('go(7,false)');const cardHtml=app.run('annualCardMarkup()');assert(!cardHtml.includes('class="card-primary"'));assert(cardHtml.indexOf('card-afterword')<cardHtml.indexOf('card-secondary'));assert(cardHtml.indexOf('card-secondary')<cardHtml.indexOf('card-best'));assert(cardHtml.indexOf('card-best')<cardHtml.indexOf('share-models'));const unified=cardHtml.match(/<div class="card-secondary">([\s\S]*?)<div class="card-best">/)[1];assert.equal((unified.match(/class="report-stat"/g)||[]).length,9);assert(unified.includes('网页翻译字数'));assert(unified.includes('漫画/图片'));
 const snapshot=app.run('previewSnapshot()');assert(snapshot.annualConsent);const restored=environment(platform,'',false);assert(restored.run('applyPreviewState('+JSON.stringify(snapshot)+')'));assert.equal(restored.run('page'),7);assert.equal(restored.run('annualConsent'),true);
 app.get('#replay').onclick();assert.equal(app.run('page'),-1);assert.equal(app.get('#annualConsent').checked,true);app.get('#annualConsent').checked=false;app.get('#annualConsent').onchange();assert.equal(app.run('annualConsent'),false);assert(app.get('#start').disabled);app.run('go(5,false)');assert.equal(app.run('page'),-1);
}
console.log('PASS V20 consent and structure: 00 gate defaults unchecked in all four modes; button/nav/share guards; explicit consent and revocation; validated synchronized consent; 01 totals without cover; 02 webpage count only; 06 labels; one nine-metric saved block after afterword and before best partner.');

// The 07 control belongs to the rendered scene and survives every preview replacement.
for(const platform of ['', 'ios','android','harmony']){
 const app=environment(platform);app.run('go(6,false)');
 const markup=app.get('#book').innerHTML;
 assert.equal((markup.match(/data-egg="6"/g)||[]).length,1);
 assert(markup.includes('v20-afterword-canvas'));assert(!markup.includes('class="visual-egg'));
 for(let q=0;q<3;q++){
  const hit=app.get('.v20-afterword-hit');hit.classList.add('v20-afterword-hit');hit.dataset.egg='6';hit.closest=()=>app.get('.page');
  app.sandbox.cardHit=hit;app.run('bindEgg(cardHit)');assert.equal(app.run('chooseQuote('+q+')'),false);const preview=app.run('afterwordPreviewMarkup()');
  const kind=platform?'app-preview':'preview',svg=app.run('afterwordArtworkSvg('+JSON.stringify(kind)+')');
  const view=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/),scene=svg.match(/<svg x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  for(const [key,index,dimension] of [['left',1,1],['top',2,2],['width',3,1],['height',4,2]]){
   const value=+preview.match(new RegExp('--art-'+key+':([\\d.]+)%'))[1];
   assert(Math.abs(value-+scene[index]/+view[dimension]*100)<1e-9);
  }
  assert.equal(typeof hit.onclick,'function');const before=app.run('eggSeen.has(6)');hit.onclick();assert.equal(app.run('eggSeen.has(6)'),!before);
  hit.onpointerdown({button:0,pointerId:2,clientX:10,clientY:10});hit.onpointermove({pointerId:2,clientX:35,clientY:30});hit.onpointerup();assert.equal(hit.style.transform,undefined);
 }
}
console.log('PASS: 07 uses one card-local control; bounds match the composite SVG scene across web and three APP modes; replaced previews rebind click/drag without moving the target.');

for(const platform of ['', 'ios','android','harmony']){
 const app=environment(platform);
 for(const profile of ['regular','empty','missing','textOnly','comicsOnly']){
  app.run('activeProfile='+JSON.stringify(profile)+';data={...profiles[activeProfile]};go(7,false)');
  const report=app.get('#book').innerHTML;
  assert(!report.includes('>2026我的彩云小译年度报告<'));assert(report.includes('v20-report-theme'));assert(report.includes('为热爱，跨越语言'));assert(report.includes('For fandom, beyond language'));
  assert(!report.includes('从文字到画面，留下每一次想读懂的热爱'));assert(report.indexOf('v20-report-theme')<report.indexOf(platform?'ac-report-grid':'report-grid'));
 }
}
console.log('PASS: 08 bilingual campaign theme replaces the narrative across webpage, three APP modes and five profiles.');

// Three tags are auto-matched as one stable bundle; no shuffle/selection controls.
const generated=['跨语言故事旅人','篇页微光收藏者','字句与画格同行'];
const local=environment();local.run('go(6,false)');const initial=local.run('JSON.stringify(getAnnualTags())');
for(const hidden of ['generateAfterwords','data-quote=','radiogroup','留白','换一组'])assert(!local.get('#book').innerHTML.includes(hidden));
assert.equal(local.run('getAnnualTags().length'),3);assert.equal(local.run('chooseQuote(1)'),false);assert.equal(local.run('JSON.stringify(getAnnualTags())'),initial);
for(const kind of ['preview','report','share','export','app-preview','app-report']){const svg=local.run('afterwordArtworkSvg('+JSON.stringify(kind)+')');for(const tag of local.run('getAnnualTags()'))assert(svg.includes(tag));assert.equal((svg.match(/<text\b/g)||[]).length,3)}
const texts=new Set();for(const profile of ['regular','heavy','new','empty','missing','textOnly','comicsOnly']){local.run('data={...profiles.'+profile+'};go(6,false)');texts.add(local.run('JSON.stringify(getAnnualTags())'));assert(local.run('validAfterwordItems(getAnnualTags())'));assert.equal(local.run('getAnnualTags().length'),3)}
assert(texts.size>=5);assert(!local.run('JSON.stringify(afterwordDataPayload())').match(/squirrelRao|avatar|registeredAt|days/));
const ai=environment();let requestPayload,resolveAI,hostCalls=0;
ai.w.LingoCloudAnnualHost={generateAnnualTags(payload){hostCalls++;requestPayload=payload;return new Promise(resolve=>{resolveAI=resolve})}};
ai.run('go(6,false)');await tick();assert.equal(hostCalls,1);assert.equal(requestPayload.count,3);assert(requestPayload.instruction.includes('未知不能当零'));assert(!JSON.stringify(requestPayload).includes('avatar'));
resolveAI({tags:generated});await tick();await tick();assert.equal(ai.run('afterwordState.source'),'ai');assert.deepEqual(JSON.parse(ai.run('JSON.stringify(getAnnualTags())')),generated);
ai.run('go(7,false);go(6,false)');await tick();assert.equal(hostCalls,1);
const state=JSON.parse(ai.run('JSON.stringify(previewSnapshot())'));assert.equal(state.afterwords.source,'ai');assert.equal(state.quoteIndex,0);
const synced=environment('android');synced.send({type:'lingocloud-annual:init',state});assert.deepEqual(JSON.parse(synced.run('JSON.stringify(getAnnualTags())')),generated);
const malformed=JSON.parse(JSON.stringify(state));malformed.afterwords.items[0]='<script>alert(1)</script>';assert.equal(synced.run('validPreviewState('+JSON.stringify(malformed)+')'),false);
const badCount=JSON.parse(JSON.stringify(state));badCount.afterwords.items.push('额外的标签');assert.equal(synced.run('validPreviewState('+JSON.stringify(badCount)+')'),false);
// Invalid responses and timeout retain all three deterministic demo tags.
for(const mode of ['invalid','timeout','stale']){
 const current=environment();let resolveLater;
 current.w.LingoCloudAnnualHost={generateAnnualTags(){if(mode==='invalid')return Promise.resolve({tags:['invalid']});return new Promise(resolve=>{resolveLater=resolve})}};
 current.run('go(6,false)');const before=current.run('JSON.stringify(getAnnualTags())');await tick();
 if(mode==='timeout'){[...current.timers.values()].find(t=>t.ms===15000).fn()}
 if(mode==='stale'){current.run('go(7,false)');resolveLater({tags:generated})}
 await tick();await tick();assert.equal(current.run('JSON.stringify(getAnnualTags())'),before);assert.equal(current.run('afterwordBusy'),false);
}
const noConsent=environment('','',false);let unauthorizedCalls=0;noConsent.w.LingoCloudAnnualHost={async generateAnnualTags(){unauthorizedCalls++;return {tags:generated}}};assert.equal(await noConsent.run('generateAnnualTagsForUser()'),false);assert.equal(unauthorizedCalls,0);
// Text-aware export caching watches the entire three-tag bundle.
const artwork=environment();artwork.run('go(6,false)');let artworkLoads=0;artwork.sandbox.Image=class{set src(value){artworkLoads++;queueMicrotask(()=>this.onload())}};
await artwork.run('ensureCardArtwork()');const oldStamp=artwork.run('cardArtworkCache.get(cardAppearance().id).stamp'),oldKey=artwork.run('annualCardKey()');
artwork.sandbox.newTags=generated;artwork.run("installAfterwords(newTags,{source:'ai'})");await artwork.run('ensureCardArtwork()');assert.equal(artworkLoads,4);assert.notEqual(artwork.run('cardArtworkCache.get(cardAppearance().id).stamp'),oldStamp);assert.notEqual(artwork.run('annualCardKey()'),oldKey);
console.log('PASS: auto-matched three-tag bundle, no selection/shuffle/blank; three integrated SVG labels in all six surfaces; one automatic consent-gated AI request, stable mode/page sync and per-data reuse; invalid/timeout/stale results keep tags; export cache includes all three labels.');
for(const platform of ['', 'ios','android','harmony']){
 const current=environment(platform);
 for(const profile of ['regular','heavy','new','empty','missing','light','textOnly','comicsOnly']){
  current.run('activeProfile='+JSON.stringify(profile)+';data={...profiles[activeProfile]};go(1,false)');
  const webpage=current.get('#book').innerHTML;assert(webpage.includes('翻译网页数'));assert(!/原文语种|平均.*字数/.test(webpage));
  assert.equal(current.run('getReportStats().length'),9);assert(!current.run('JSON.stringify(getReportStats())').match(/语种|平均/));
  current.run('go(6,false)');const tags=current.get('#book').innerHTML;assert.equal((tags.match(/data-quote=/g)||[]).length,0);assert(!/留白|无字星笺|年度足迹灵感/.test(tags));assert(tags.includes('年度标签'));
  assert.equal(current.run('chooseQuote(5)'),false);assert.equal(current.run('validPreviewState({...previewSnapshot(),quoteIndex:5})'),false);
  assert(!current.run('JSON.stringify(afterwordDataPayload())').match(/languageCount|average|语种|平均/));
  current.run('go(7,false)');assert.equal((current.get('#book').innerHTML.match(/class="(?:ac-report-metric|report-stat)/g)||[]).length,9);
  const card=current.run('annualCardMarkup()');assert.equal((card.match(/class="report-stat"/g)||[]).length,9);assert(!/语种|平均|留白|无字星笺|我的年度后记/.test(card));assert(card.includes('我的年度标签'));
 }
}
console.log('PASS: unavailable language and derived averages are absent from current pages, AI payload and all nine report/card stats; three auto-matched annual tags across eight data profiles and four modes; blank selection and index rejected.');

// The three stamps have equal boxes, font sizes and alignment, in every card format.
const peers=environment();peers.run('go(6,false)');
for(const kind of ['preview','app-preview','report','app-report','share','export']){
 const svg=peers.run('afterwordArtworkSvg('+JSON.stringify(kind)+')');
 assert(!svg.includes('annual-tag-primary'));assert.equal((svg.match(/annual-tag-peer/g)||[]).length,3);
 const cells=[...svg.matchAll(/<g class="annual-tag-stamp annual-tag-peer"[^>]*><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)];assert.equal(cells.length,3);
 assert.equal(new Set(cells.map(m=>m.slice(2).join(','))).size,1);assert(new Set(cells.map(m=>m[1])).size===3);
 const fonts=[...svg.matchAll(/<text class="annual-tag-text"[^>]*font-size="([\d.]+)"/g)].map(m=>m[1]);assert.equal(fonts.length,3);assert.equal(new Set(fonts).size,1);
}
const interaction=(time,x=180,y=220)=>({timeStamp:time,clientX:x,clientY:y,preventDefault(){this.prevented=true},stopPropagation(){},pointerType:'touch',pointerId:1,isPrimary:true});
assert(!code.includes('cardZoomMore'));assert(!code.includes('cardZoomLess'));assert(!code.includes('card-view-tools'));
assert(html.includes('.annual-card-lightbox{position:fixed;inset:0;z-index:2147483000'));assert(html.includes('width:min(960px,100%);height:auto'));assert(html.includes('grid-template-rows:auto minmax(0,1fr)'));
for(const platform of ['', 'ios','android','harmony']){
 const viewer=environment(platform);viewer.run('go(7,false);openShare()');await tick();await tick();
 const img=viewer.get('#annualCardImage'),beforeUrl=img.src,cacheSize=viewer.run('annualImageCache.size'),downloads=viewer.downloads.length;
 img.ondblclick(interaction(100));assert.equal(viewer.run('cardZoomSnapshot()'),1);assert.equal(img.getAttribute('aria-expanded'),'true');assert.equal(img.src,beforeUrl);assert.equal(viewer.run('annualImageCache.size'),cacheSize);assert.equal(viewer.downloads.length,downloads);
 if(!platform){
  assert(viewer.run('annualCardLightbox!==null'));assert(viewer.sandbox.document.body.classList.contains('annual-lightbox-open'));assert.equal(viewer.get('#annualLightboxImage').src,beforeUrl);assert(viewer.get('#modalRoot').inert);assert(viewer.appended.includes(viewer.run('annualCardLightbox.layer')));
  viewer.get('#annualLightboxClose').onclick();assert.equal(viewer.run('cardZoomSnapshot()'),0);assert(!viewer.get('#modalRoot').inert);
 }else{
  await tick();const message=viewer.messages.findLast(x=>x.m.type==='lingocloud-annual:lightbox-open').m;
  assert(message.src.startsWith('data:image/png;base64,'));assert.equal(viewer.run('annualCardLightbox'),null,'Child must not create a clipped inline overlay');
  const host=environment();host.run("setPreviewMode('app')");const state=JSON.parse(viewer.run('JSON.stringify(previewSnapshot())'));host.send({type:'lingocloud-annual:state',state});
  host.send(message,{});assert.equal(host.run('annualCardLightbox'),null,'Reject wrong sender');host.send({...message,src:'https://example.com/private.png'});assert.equal(host.run('annualCardLightbox'),null,'Only PNG bytes from the active preview');
  host.send(message);assert(host.run('annualCardLightbox!==null'));assert(host.appended.includes(host.run('annualCardLightbox.layer')),'Overlay is appended to the outer body');assert.equal(host.get('#annualLightboxImage').src,message.src);assert(host.get('#appPreviewStage').inert);assert(host.get('#previewControls').inert);
  host.get('#annualLightboxImage').ondblclick(interaction(900));assert.equal(host.run('annualCardLightbox'),null);assert(!host.get('#appPreviewStage').inert);const closed=host.messages.at(-1).m;assert.equal(closed.type,'lingocloud-annual:lightbox-closed');viewer.send({...closed,id:closed.id+1});assert.equal(viewer.run('cardZoomSnapshot()'),1);viewer.send(closed);assert.equal(viewer.run('cardZoomSnapshot()'),0);
  // A consent/card closure also dismisses an already displayed outer image.
  viewer.run('setAnnualCardZoom(1)');await tick();host.send({type:'lingocloud-annual:state',state:JSON.parse(viewer.run('JSON.stringify(previewSnapshot())'))});host.send(viewer.messages.findLast(x=>x.m.type==='lingocloud-annual:lightbox-open').m);assert(host.run('annualCardLightbox!==null'));host.send({type:'lingocloud-annual:state',state:{...state,cardOpen:false,cardZoom:0}});assert.equal(host.run('annualCardLightbox'),null);viewer.run('setAnnualCardZoom(0)');
 }
 img.onpointerdown(interaction(1500));img.onpointerup(interaction(1510));img.onpointerdown(interaction(1700));img.onpointerup(interaction(1710));assert.equal(viewer.run('cardZoomSnapshot()'),1);img.ondblclick(interaction(1720));assert.equal(viewer.run('cardZoomSnapshot()'),1,'Synthetic dblclick must not toggle twice');
 const saved=JSON.parse(viewer.run('JSON.stringify(previewSnapshot())'));assert.equal(saved.cardZoom,1);assert.equal(viewer.run('validPreviewState({...previewSnapshot(),cardZoom:9})'),false);assert.equal(viewer.run('validPreviewState({...previewSnapshot(),cardOpen:false,cardZoom:1})'),false);
 const restored=environment(platform);assert(restored.run('applyPreviewState('+JSON.stringify(saved)+')'));await tick();await tick();assert.equal(restored.run('cardZoomSnapshot()'),1);
 const escape={key:'Escape',preventDefault(){},stopImmediatePropagation(){}};viewer.sandbox.escape=escape;assert.equal(viewer.run('handleCardViewerKeydown(escape)'),true);assert.equal(viewer.run('cardZoomSnapshot()'),0);assert(viewer.sandbox.document.body.classList.contains('card-preview-open'));
 img.onpointerdown(interaction(2500));img.onpointermove(interaction(2520,250,220));img.onpointerup(interaction(2550,250,220));assert.equal(viewer.run('cardZoomSnapshot()'),0,'Scrolling is not a double tap');
 await viewer.run('savePng()');assert.equal(viewer.downloads.at(-1).href,beforeUrl);assert.equal(viewer.run('annualImageCache.size'),cacheSize);assert.equal(viewer.downloads.length,downloads+1);
 viewer.run('closeModal()');assert.equal(viewer.run('annualCardViewer'),null);assert.equal(viewer.run('cardZoomSnapshot()'),0);assert.equal(viewer.run('annualCardLightbox'),null);
}
// Closing or retrying while image bytes are preparing cannot open a stale overlay.
const staleViewer=environment('ios');staleViewer.run('openShare()');await tick();staleViewer.run('setAnnualCardZoom(1);closeModal()');await tick();assert(!staleViewer.messages.some(x=>x.m.type==='lingocloud-annual:lightbox-open'));
const unavailable=environment();unavailable.setBlobFail(true);unavailable.run('openShare()');await tick();assert.equal(unavailable.run('setAnnualCardZoom(1)'),false);
console.log('PASS: no zoom buttons; desktop and mobile double tap open a top-window lightbox outside the APP iframe; full-width scrollable PNG, source/consent validation, close/double-click/Escape restore, state sync, stale-open prevention; no download or new image generation.');
