// Transfer only the validated demo state between the two same-origin editions.
if(!APP_PREVIEW_PLATFORM){
 document.querySelectorAll('[data-edition-link]').forEach(link=>link.addEventListener('click',()=>{try{sessionStorage.setItem('annual-edition-transfer',JSON.stringify({state:previewMode==='app'?previewState:previewSnapshot(),mode:previewMode,platform:previewPlatform}))}catch{}}));
 try{const raw=sessionStorage.getItem('annual-edition-transfer');sessionStorage.removeItem('annual-edition-transfer');if(raw){const saved=JSON.parse(raw);if(validPreviewState(saved.state)){applyPreviewState(saved.state);if(PREVIEW_PLATFORMS[saved.platform])setPreviewPlatform(saved.platform);if(saved.mode==='app')setPreviewMode('app')}}}catch{}
}
