// Fold a sheet across a moving diagonal crease. Coordinates stay in page pixels.
const InkPaperFold=(()=>{
 function clip(points,n,c,keepLeft){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=a.x*n.x+a.y*n.y-c,db=b.x*n.x+b.y*n.y-c,inside=keepLeft?da<=0:da>=0,next=keepLeft?db<=0:db>=0;if(inside)out.push(a);if(inside!==next){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}}return out}
 function frame(w,h,progress){const p=Math.max(0,Math.min(1,progress)),angle=(-.14+.23*p),n={x:Math.cos(angle),y:Math.sin(angle)},rect=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}],dots=rect.map(a=>a.x*n.x+a.y*n.y),hi=Math.max(...dots)+2,lo=Math.min(...dots)-w*.55,c=hi+(lo-hi)*p;
 const stationary=clip(rect,n,c,true),folded=clip(rect,n,c,false),back=folded.map(a=>{const d=a.x*n.x+a.y*n.y-c;return{x:a.x-2*n.x*d,y:a.y-2*n.y*d}}),intersections=[];
 for(let i=0;i<4;i++){const a=rect[i],b=rect[(i+1)%4],da=a.x*n.x+a.y*n.y-c,db=b.x*n.x+b.y*n.y-c;if(da*db<0){const t=da/(da-db);intersections.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}}
 return {stationary,back,crease:intersections,n,c,matrix:[1-2*n.x*n.x,-2*n.x*n.y,-2*n.x*n.y,1-2*n.y*n.y,2*c*n.x,2*c*n.y],curl:Math.sin(Math.PI*p)};
 }
 const polygon=points=>points.length<3?'polygon(0 0,0 0,0 0)':'polygon('+points.map(a=>a.x.toFixed(2)+'px '+a.y.toFixed(2)+'px').join(',')+')';
 return {frame,polygon};
})();
