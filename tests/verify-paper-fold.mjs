import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../source/ink-turn.js',import.meta.url),'utf8')+';this.fold=InkPaperFold;',ctx);const {frame}=ctx.fold;
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0))/2;
for(const [w,h] of [[320,540],[393,700],[610,900],[1080,1936]]){
 let previous=w*h;
 for(let i=0;i<=100;i++){const f=frame(w,h,i/100);for(const a of [...f.stationary,...f.back,...f.crease])assert(Number.isFinite(a.x)&&Number.isFinite(a.y));assert(Math.abs(f.matrix[0]*f.matrix[3]-f.matrix[1]*f.matrix[2]+1)<1e-9,'Backside is a reflection');const a=area(f.stationary);assert(a<=previous+1e-5,'Outgoing sheet progressively reveals the next page');previous=a;
  for(const p of f.crease)assert(Math.abs(p.x*f.n.x+p.y*f.n.y-f.c)<1e-6);
 }
 assert(Math.abs(area(frame(w,h,0).stationary)-w*h)<1e-5);assert.equal(frame(w,h,1).stationary.length,0);assert(frame(w,h,1).back.every(p=>p.x<0));
}
console.log('PASS paper fold: 404 moving crease frames, finite polygons, monotonic sheet reveal, true reflected backside and complete start/end states across desktop/APP dimensions.');
