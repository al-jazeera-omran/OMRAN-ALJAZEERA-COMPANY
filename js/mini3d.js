/* mini3d — tiny flat-shaded canvas 3D engine (no dependencies) */
(function(){
function V(x,y,z){return [x,y,z]}
function hex(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function Scene(canvas,o){
  o=o||{};this.c=canvas;this.ctx=canvas.getContext('2d');this.faces=[];this.groups={};
  this.yaw=o.yaw!=null?o.yaw:0.7;this.pitch=o.pitch!=null?o.pitch:0.45;this.dist=o.dist||22;this.ty=o.ty||2;this.zoom=o.zoom||1;
  this.auto=o.auto!==false;this.speed=o.speed||0.12;this.t=0;this.L=norm([-0.45,1,0.55]);this.idle=0;this.visible=true;this.last=0;
  var s=this;this._bind();this.resize();
  if(window.ResizeObserver){new ResizeObserver(function(){s.resize();s.draw()}).observe(canvas)}
  if(window.IntersectionObserver){new IntersectionObserver(function(e){s.visible=e[0].isIntersecting;if(s.visible)s._loop()}).observe(canvas)}
  this.reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function norm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
Scene.prototype.clear=function(){this.faces=[];this.groups={}};
Scene.prototype.group=function(id,px,pz,fn){this.groups[id]={px:px,pz:pz,fn:fn,a:0}};
Scene.prototype.quad=function(pts,n,col,o){
  o=o||{};var tile=o.tile||1.3,a=pts[0],b=pts[1],d=pts[3];
  var lu=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),lv=Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2]);
  var nu=o.nosub?1:Math.max(1,Math.ceil(lu/tile)),nv=o.nosub?1:Math.max(1,Math.ceil(lv/tile));
  var U=[(b[0]-a[0])/nu,(b[1]-a[1])/nu,(b[2]-a[2])/nu],W=[(d[0]-a[0])/nv,(d[1]-a[1])/nv,(d[2]-a[2])/nv];
  for(var i=0;i<nu;i++)for(var j=0;j<nv;j++){
    var p=[a[0]+U[0]*i+W[0]*j,a[1]+U[1]*i+W[1]*j,a[2]+U[2]*i+W[2]*j];
    this.faces.push({p:[p,[p[0]+U[0],p[1]+U[1],p[2]+U[2]],[p[0]+U[0]+W[0],p[1]+U[1]+W[1],p[2]+U[2]+W[2]],[p[0]+W[0],p[1]+W[1],p[2]+W[2]]],n:n,c:hex(col),l:o.layer||1,g:o.g,a:o.a==null?1:o.a,flat:o.flat});
  }
};
/* box: x,z = center, y = bottom */
Scene.prototype.box=function(x,y,z,w,h,d,col,o){
  var x0=x-w/2,x1=x+w/2,y0=y,y1=y+h,z0=z-d/2,z1=z+d/2,s=this;o=o||{};
  var tc=o.top||col;
  s.quad([V(x0,y1,z1),V(x1,y1,z1),V(x1,y1,z0),V(x0,y1,z0)],[0,1,0],tc,o);
  if(!o.nobottom)s.quad([V(x0,y0,z0),V(x1,y0,z0),V(x1,y0,z1),V(x0,y0,z1)],[0,-1,0],col,o);
  s.quad([V(x0,y0,z1),V(x1,y0,z1),V(x1,y1,z1),V(x0,y1,z1)],[0,0,1],col,o);
  s.quad([V(x1,y0,z0),V(x0,y0,z0),V(x0,y1,z0),V(x1,y1,z0)],[0,0,-1],col,o);
  s.quad([V(x1,y0,z1),V(x1,y0,z0),V(x1,y1,z0),V(x1,y1,z1)],[1,0,0],col,o);
  s.quad([V(x0,y0,z0),V(x0,y0,z1),V(x0,y1,z1),V(x0,y1,z0)],[-1,0,0],col,o);
};
/* cylinder starting at (x,y,z) along axis */
Scene.prototype.cyl=function(x,y,z,r,len,axis,col,o){
  o=o||{};var n=o.n||10,s=this,ring0=[],ring1=[];
  for(var i=0;i<n;i++){var t=i/n*Math.PI*2,u=Math.cos(t)*r,v=Math.sin(t)*r,p0,p1;
    if(axis==='y'){p0=V(x+u,y,z+v);p1=V(x+u,y+len,z+v)}else if(axis==='x'){p0=V(x,y+u,z+v);p1=V(x+len,y+u,z+v)}else{p0=V(x+u,y+v,z);p1=V(x+u,y+v,z+len)}
    ring0.push(p0);ring1.push(p1)}
  for(i=0;i<n;i++){var j=(i+1)%n,t2=(i+.5)/n*Math.PI*2,c=Math.cos(t2),sn=Math.sin(t2),nn=axis==='y'?[c,0,sn]:axis==='x'?[0,c,sn]:[c,sn,0];
    s.faces.push({p:[ring0[i],ring0[j],ring1[j],ring1[i]],n:nn,c:hex(col),l:o.layer||1,g:o.g,a:1})}
  var ax=axis==='y'?[0,1,0]:axis==='x'?[1,0,0]:[0,0,1];
  s.faces.push({p:ring1.slice().reverse(),n:ax,c:hex(col),l:o.layer||1,g:o.g,a:1,cap:1});
  s.faces.push({p:ring0.slice(),n:[-ax[0],-ax[1],-ax[2]],c:hex(col),l:o.layer||1,g:o.g,a:1,cap:1});
};
Scene.prototype.disc=function(x,y,z,r,col,o){o=o||{};var n=o.n||40,pts=[];for(var i=0;i<n;i++){var t=-i/n*Math.PI*2;pts.push(V(x+Math.cos(t)*r,y,z+Math.sin(t)*r))}this.faces.push({p:pts,n:[0,1,0],c:hex(col),l:o.layer==null?0:o.layer,a:o.a==null?1:o.a})};
function jit(c,k,amt){var h=Math.sin(k*12.9898)*43758.5453;h=h-Math.floor(h);var f=1+(h-0.5)*2*amt;return [Math.min(255,c[0]*f|0),Math.min(255,c[1]*f|0),Math.min(255,c[2]*f|0)]}
Scene.prototype.sphere=function(x,y,z,rx,ry,rz,col,o){o=o||{};var n=o.n||12,m=o.m||8,base=hex(col),s=this,k0=(x*7.1+z*3.3+y);
  for(var i=0;i<m;i++){var a0=-Math.PI/2+Math.PI*i/m,a1=-Math.PI/2+Math.PI*(i+1)/m;if(o.half&&a1<=0)continue;
    for(var j=0;j<n;j++){var b0=j/n*Math.PI*2,b1=(j+1)/n*Math.PI*2,P=function(a,b){return [x+Math.cos(a)*Math.cos(b)*rx,y+Math.sin(a)*ry,z+Math.cos(a)*Math.sin(b)*rz]};
      var am=(a0+a1)/2,bm=(b0+b1)/2,nn=norm([Math.cos(am)*Math.cos(bm)/rx,Math.sin(am)/ry,Math.cos(am)*Math.sin(bm)/rz]);
      s.faces.push({p:[P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1)],n:nn,c:o.jit?jit(base,k0+i*31+j,o.jit):base,l:o.layer||1,a:1})}}};
Scene.prototype.strip=function(pts,widths,side,col,o){o=o||{};var c=hex(col);
  for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],wa=widths[i]/2,wb=widths[i+1]/2;
    var q=[[a[0]-side[0]*wa,a[1]-side[1]*wa,a[2]-side[2]*wa],[a[0]+side[0]*wa,a[1]+side[1]*wa,a[2]+side[2]*wa],[b[0]+side[0]*wb,b[1]+side[1]*wb,b[2]+side[2]*wb],[b[0]-side[0]*wb,b[1]-side[1]*wb,b[2]-side[2]*wb]];
    var d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],nn=norm([d[1]*side[2]-d[2]*side[1],d[2]*side[0]-d[0]*side[2],d[0]*side[1]-d[1]*side[0]]);if(nn[1]<0)nn=[-nn[0],-nn[1],-nn[2]];
    this.faces.push({p:q,n:nn,c:o.jit?jit(c,i*7+(o.seed||0),o.jit):c,l:1,a:1,ds:1})}};
/* text on a vertical plane. face: '-z','+z','-x','+x'. (x,y,z)=centre-bottom */
Scene.prototype.text=function(x,y,z,w,h,face,str,col,o){o=o||{};var hw=w/2,p,n;
  if(face==='-z'){p=[[x+hw,y,z],[x-hw,y,z],[x-hw,y+h,z],[x+hw,y+h,z]];n=[0,0,-1]}
  else if(face==='+z'){p=[[x-hw,y,z],[x+hw,y,z],[x+hw,y+h,z],[x-hw,y+h,z]];n=[0,0,1]}
  else if(face==='-x'){p=[[x,y,z-hw],[x,y,z+hw],[x,y+h,z+hw],[x,y+h,z-hw]];n=[-1,0,0]}
  else{p=[[x,y,z+hw],[x,y,z-hw],[x,y+h,z-hw],[x,y+h,z+hw]];n=[1,0,0]}
  this.faces.push({p:p,n:n,c:[0,0,0],l:1,a:1,zb:(o.zb==null?2.5:o.zb),txt:{s:str,col:col,r:h/w,w:o.w,font:o.font,dir:o.dir}})};
Scene.prototype.poly=function(pts,col,o){o=o||{};this.faces.push({p:pts,n:[0,1,0],c:hex(col),l:o.layer==null?0.5:o.layer,a:o.a==null?1:o.a,flat:o.flat})};
Scene.prototype.resize=function(){var r=this.c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);this.W=r.width;this.H=r.height;this.c.width=Math.max(1,r.width*d);this.c.height=Math.max(1,r.height*d);this.ctx.setTransform(d,0,0,d,0,0)};
Scene.prototype._bind=function(){
  var s=this,down=null;
  this.c.addEventListener('pointerdown',function(e){down=[e.clientX,e.clientY,s.yaw,s.pitch];s.idle=1e9;try{s.c.setPointerCapture(e.pointerId)}catch(_){}});
  this.c.addEventListener('pointermove',function(e){if(!down)return;s.yaw=down[2]-(e.clientX-down[0])*0.008;s.pitch=Math.max(0.12,Math.min(1.1,down[3]+(e.clientY-down[1])*0.005));s.draw()});
  var up=function(){if(down){down=null;s.idle=performance.now()+2500;s._loop()}};
  this.c.addEventListener('pointerup',up);this.c.addEventListener('pointercancel',up);
};
Scene.prototype._loop=function(){var s=this;if(s._raf)return;var f=function(ts){s._raf=0;if(!s.visible)return;var dt=s.last?Math.min(0.05,(ts-s.last)/1000):0;s.last=ts;
  if(s.auto&&!s.reduced&&ts>s.idle){s.yaw+=dt*s.speed;s.t+=dt}s.draw();if(s.auto&&!s.reduced)s._raf=requestAnimationFrame(f);else s.last=0};s._raf=requestAnimationFrame(f)};
Scene.prototype.start=function(){this.draw();this._loop()};
Scene.prototype.draw=function(){
  var ctx=this.ctx,W=this.W,H=this.H;if(!W||!H)return;ctx.clearRect(0,0,W,H);
  var cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),D=this.dist,ty=this.ty;
  var f=Math.min(W,H*1.25)*1.05*this.zoom,cx=W/2,cyy=H*0.55,L=this.L,t=this.t,G=this.groups;
  for(var k in G){G[k].a=G[k].fn(t)}
  function tr(p,g){var x=p[0],y=p[1]-ty,z=p[2];if(g){var gg=G[g],c=Math.cos(gg.a),s=Math.sin(gg.a),dx=x-gg.px,dz=z-gg.pz;x=gg.px+dx*c-dz*s;z=gg.pz+dx*s+dz*c}
    var x1=x*cy-z*sy,z1=x*sy+z*cy,y2=y*cp-z1*sp,z2=y*sp+z1*cp;return [x1,y2,z2]}
  var out=[],F=this.faces;
  for(var i=0;i<F.length;i++){var fc=F[i],P=[],zs=0,n=fc.n;
    if(fc.g){var gg=G[fc.g],c=Math.cos(gg.a),s=Math.sin(gg.a);n=[n[0]*c-n[2]*s,n[1],n[0]*s+n[2]*c]}
    for(var j=0;j<fc.p.length;j++){var q=tr(fc.p[j],fc.g);P.push(q);zs+=q[2]}
    zs/=P.length;
    var nx=n[0]*cy-n[2]*sy,nz1=n[0]*sy+n[2]*cy,ny=n[1]*cp-nz1*sp,nz=n[1]*sp+nz1*cp;
    var c0=P[0];if(!fc.ds&&nx*(0-c0[0])+ny*(0-c0[1])+nz*(D-c0[2])<=0&&fc.l>=1)continue;
    var dd=n[0]*L[0]+n[1]*L[1]+n[2]*L[2],dl=fc.ds?Math.abs(dd):Math.max(0,dd),sh=fc.flat?1:0.6+0.42*dl;
    if(fc.txt){out.push({P:P,z:zs+(fc.zb||0),l:fc.l,txt:fc.txt});continue}
    var col='rgba('+Math.min(255,fc.c[0]*sh|0)+','+Math.min(255,fc.c[1]*sh|0)+','+Math.min(255,fc.c[2]*sh|0)+','+fc.a+')';
    out.push({P:P,z:zs+(fc.zb||0),l:fc.l,col:col})}
  out.sort(function(a,b){return a.l-b.l||a.z-b.z});
  ctx.lineJoin='round';
  for(i=0;i<out.length;i++){var o=out[i];
    if(o.txt){var Q=o.P.map(function(p){var Z=D-p[2];return [cx+f*p[0]/Z,cyy-f*p[1]/Z]}),T=o.txt,tw=1000,th=1000*T.r;
      ctx.save();ctx.transform((Q[2][0]-Q[3][0])/tw,(Q[2][1]-Q[3][1])/tw,(Q[0][0]-Q[3][0])/th,(Q[0][1]-Q[3][1])/th,Q[3][0],Q[3][1]);
      ctx.fillStyle=T.col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=T.dir||'rtl';
      ctx.font=(T.w||700)+' '+(th*0.82)+'px '+(T.font||'Tajawal,"Segoe UI",Tahoma,sans-serif');
      var m=ctx.measureText(T.s).width;if(m>tw*0.98){ctx.font=(T.w||700)+' '+(th*0.82*tw*0.98/m)+'px '+(T.font||'Tajawal,"Segoe UI",Tahoma,sans-serif')}
      ctx.fillText(T.s,tw/2,th*0.54);ctx.restore();continue}
    ctx.beginPath();for(j=0;j<o.P.length;j++){var p=o.P[j],Z=D-p[2],X=cx+f*p[0]/Z,Y=cyy-f*p[1]/Z;if(j)ctx.lineTo(X,Y);else ctx.moveTo(X,Y)}
    ctx.closePath();ctx.fillStyle=o.col;ctx.fill();ctx.strokeStyle=o.col;ctx.lineWidth=0.7;ctx.stroke()}
};
window.Mini3D=Scene;
})();

/* Walls & finishes — professional scene (metres). Street at -z, plot at +z. */
(function(){
var P={
  ground:'#E4DDCF',asphalt:'#4B5259',lineW:'#F2F3F4',curb:'#E9EBEC',walk:'#D2D0CB',walkJ:'#BDBAB3',apron:'#C6C3BC',
  plinth:'#B3A082',plinthT:'#C9B898',body:'#F1ECE2',reveal:'#D2C9B9',coping:'#FAF8F4',st1:'#D6C6A7',st2:'#CBB995',cap:'#FAF8F4',
  metal:'#262E35',light:'#FFE3A3',gate:'#22292F',gateBar:'#323B43',
  b1:'#8F979E',b2:'#868E95',plaster:'#C8C4BC',primer:'#FFFFFF',paint:'#E2C796',
  lawn:'#7FA857',lawn2:'#76A052',pave:'#CFC8BA',paveD:'#BDB5A6',drive:'#B9B4AB',
  bStone:'#D9CBB0',bStone2:'#CDBD9F',bPlaster:'#F3EFE8',glass:'#7F9FB4',glass2:'#6E8FA6',frame:'#2A3239',parapet:'#F7F6F3',band:'#2E363D',
  leaf1:'#5E8F4A',leaf2:'#4F7F3F',leaf3:'#6B9C55',trunk:'#7A6248',shrub:'#5A8A47',
  ink:'#111111',shadow:'#1E2A33'};
var NAME_AR='عمران الجزيرة للمقاولات',NAME_EN='OMRAN AL-JAZEERA CONTRACTING';

function bx(s,x0,x1,y0,y1,z0,z1,col,o){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,o||{tile:0.8})}
function flat(s,x0,x1,z0,z1,y,col,layer,a){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],col,{layer:layer,a:a})}
function hull(pts){pts=pts.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});function cr(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])}
  var lo=[],up=[];pts.forEach(function(p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)});
  pts.slice().reverse().forEach(function(p){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)});return lo.slice(0,-1).concat(up.slice(0,-1))}
var SH=[0.45,-0.55];
function boxShadow(s,x0,x1,z0,z1,h,a){var dx=SH[0]*h,dz=SH[1]*h,c=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  var pts=hull(c.concat(c.map(function(p){return [p[0]+dx,p[1]+dz]})));
  s.poly(pts.map(function(p){return [p[0],0.012,p[1]]}).reverse(),P.shadow,{layer:0.45,a:a,flat:1})}
function blob(s,x,z,r,h,a){var pts=[],cx=x+SH[0]*h*0.6,cz=z+SH[1]*h*0.6;for(var i=0;i<20;i++){var t=-i/20*Math.PI*2;pts.push([cx+Math.cos(t)*r*1.25,0.013,cz+Math.sin(t)*r])}s.poly(pts,P.shadow,{layer:0.46,a:a,flat:1})}
function tree(s,x,z,sc){sc=sc||1;var h=2.2*sc;
  s.cyl(x,0,z,0.12*sc,h,'y',P.trunk,{n:14});
  s.sphere(x,h+0.5*sc,z,1.15*sc,0.95*sc,1.15*sc,P.leaf2,{n:18,m:12,jit:0.035});
  s.sphere(x-0.45*sc,h+0.85*sc,z+0.25*sc,0.8*sc,0.7*sc,0.8*sc,P.leaf1,{n:16,m:10,jit:0.035});
  s.sphere(x+0.4*sc,h+1.05*sc,z-0.2*sc,0.75*sc,0.65*sc,0.75*sc,P.leaf3,{n:16,m:10,jit:0.035});
  blob(s,x,z,1.15*sc,h+0.6*sc,0.13)}
function bush(s,x,z,r,col){s.sphere(x,r*0.55,z,r,r*0.8,r,col||P.shrub,{n:16,m:10,jit:0.04,half:1})}
function hedgeRow(s,x0,x1,z,r){for(var x=x0;x<=x1+0.01;x+=r*1.3)bush(s,x,z,r,(Math.round(x*3)%2)?P.shrub:P.leaf1)}
function street(s,Z){
  var sw0=Z-0.05,sw1=Z-1.75,c0=sw1,c1=sw1-0.18,r0=c1,r1=r0-5.2,fc0=r1,fc1=r1-0.18;
  flat(s,-12,12,-14,9,-0.001,P.ground,0.1);
  flat(s,-12,12,r1,r0,0.0,P.asphalt,0.2);
  for(var x=-11.5;x<11.5;x+=2.2)flat(s,x,x+1.2,(r0+r1)/2-0.06,(r0+r1)/2+0.06,0.002,P.lineW,0.25);
  flat(s,-12,12,r0-0.35,r0-0.25,0.002,P.lineW,0.25);flat(s,-12,12,r1+0.25,r1+0.35,0.002,P.lineW,0.25);
  bx(s,-12,12,0,0.16,c1,c0,P.curb,{tile:1.5});bx(s,-12,12,0,0.16,fc1,fc0,P.curb,{tile:1.5});
  flat(s,-12,12,fc1-1.6,fc1,0.16,P.walk,0.3);
  bx(s,-12,12,0,0.15,sw1,sw0,P.walk,{tile:1.5,nobottom:1});
  for(x=-11.5;x<12;x+=1.5)flat(s,x-0.015,x+0.015,sw1,sw0,0.152,P.walkJ,0.5);
}
function streetLamp(s,x,z){s.cyl(x,0.15,z,0.07,5.2,'y','#5B646C',{n:10});s.box(x,5.25,z-0.55,0.08,0.08,1.1,'#5B646C');
  s.box(x,5.12,z-1.05,0.24,0.14,0.42,'#3A4249');s.box(x,5.08,z-1.05,0.18,0.04,0.34,P.light)}
window.buildWallPro=function(s){
  s.clear();
  var Z=-4.2,XL=-6,XR=6,ZB=4.6,T=0.25,H=2.0;
  street(s,Z);
  var VG0=-3.9,VG1=-0.3,PG0=0.45,PG1=1.45;
  function stdWall(a,b,dir,c){
    function pc(y0,y1,t,col){dir==='x'?bx(s,a,b,y0,y1,c-t/2,c+t/2,col):bx(s,c-t/2,c+t/2,y0,y1,a,b,col)}
    pc(0,0.5,T+0.1,P.plinth);pc(0.5,0.55,T+0.12,P.plinthT);pc(0.55,1.1,T,P.body);pc(1.1,1.14,T-0.05,P.reveal);
    pc(1.14,1.6,T,P.body);pc(1.6,1.64,T-0.05,P.reveal);pc(1.64,H,T,P.body);pc(H,H+0.09,T+0.16,P.coping)}
  function post(x,z,w,h){for(var i=0,y=0;y<h-0.01;y+=0.36,i++){var ww=i%2?w-0.04:w;s.box(x,y,z,ww,Math.min(0.36,h-y),ww,i%2?P.st2:P.st1,{tile:0.6})}
    s.box(x,h,z,w+0.12,0.07,w+0.12,P.cap);s.box(x,h+0.07,z,w+0.02,0.06,w+0.02,P.cap)}
  function lamp(x,y,z){s.box(x,y,z,0.18,0.05,0.18,P.metal);s.cyl(x,y+0.05,z,0.07,0.2,'y',P.light,{n:10});s.box(x,y+0.25,z,0.22,0.05,0.22,P.metal)}
  stdWall(XL,VG0-0.35,'x',Z);post(XL,Z,0.5,2.3);post((XL+VG0-0.35)/2,Z,0.5,2.3);
  stdWall(VG1+0.35,PG0-0.25,'x',Z);
  var RX0=PG1+0.25,RX1=XR,L=RX1-RX0,e1=RX0+L*0.76,e2=RX0+L*0.52,e3=RX0+L*0.28,bz=Z+T/2;
  function slab(a,b,ext,col){bx(s,a,b,0,H,Z-T/2-ext,bz,col,{tile:0.5})}
  slab(RX0,e3,0.09,P.paint);slab(e3,e2,0.06,P.primer);slab(e2,e1,0.035,P.plaster);
  for(var r=0,yb=0;yb<H-0.01;yb+=0.2,r++){var off=r%2?0.2:0,cuts=[e1];for(var xb=e1+0.4-off;xb<RX1;xb+=0.4)cuts.push(xb);cuts.push(RX1);
    for(var c=0;c<cuts.length-1;c++)bx(s,cuts[c],cuts[c+1],yb,yb+0.2,Z-T/2,Z+T/2,(c+r)%2?P.b1:P.b2,{nosub:1})}
  bx(s,RX0,RX1,H,H+0.09,Z-T/2-0.12,Z+T/2+0.04,P.coping);
  post(XR,Z,0.5,2.3);
  [XL,XR].forEach(function(x){stdWall(Z,ZB,'z',x);post(x,(Z+ZB)/2,0.5,2.3);post(x,ZB,0.5,2.3)});
  stdWall(XL,XR,'x',ZB);
  [VG0-0.35,VG1+0.35,PG1+0.25].forEach(function(x,i){var w=i<2?0.7:0.5;post(x,Z,w,2.6);lamp(x,2.73,Z)});
  post(PG0-0.25,Z,0.5,2.6);lamp(PG0-0.25,2.73,Z);
  var px=VG1+0.35;s.box(px,1.05,Z-0.36,0.62,0.9,0.03,'#F4F1EA');
  s.text(px,1.55,Z-0.38,0.56,0.24,'-z',NAME_AR,P.ink,{font:'"Readex Pro",Tajawal,Tahoma,sans-serif'});
  s.text(px,1.3,Z-0.38,0.56,0.12,'-z','عمران الجزيرة',P.ink,{w:600});
  s.box(px,1.2,Z-0.38,0.44,0.012,0.01,'#F2A900');
  function frameGate(a,b,top){bx(s,a,b,0.06,0.14,Z-0.05,Z+0.05,P.gate,{tile:1});bx(s,a,b,top-0.08,top,Z-0.05,Z+0.05,P.gate,{tile:1});
    bx(s,a,a+0.08,0.06,top,Z-0.05,Z+0.05,P.gate);bx(s,b-0.08,b,0.06,top,Z-0.05,Z+0.05,P.gate);
    for(var y=0.22;y<top-0.12;y+=0.15)bx(s,a+0.08,b-0.08,y,y+0.1,Z-0.03,Z+0.03,P.gateBar,{tile:1})}
  frameGate(VG0,VG1,1.95);
  bx(s,VG0-0.6,VG1+0.6,0,0.04,Z-0.04,Z+0.04,'#7D868E');
  frameGate(PG0,PG1,2.1);
  flat(s,VG0-0.3,VG1+0.3,Z-1.75,Z-0.05,0.153,P.apron,0.55);
  var YZ0=Z+T/2,YZ1=ZB-T/2,YX0=XL+T/2,YX1=XR-T/2;
  flat(s,YX0,YX1,YZ0,YZ1,0.005,P.lawn,0.3);
  for(var lx=YX0;lx<YX1;lx+=1.2)flat(s,lx,Math.min(lx+0.6,YX1),YZ0,YZ1,0.006,P.lawn2,0.31);
  flat(s,VG0,VG1,YZ0,0.9,0.01,P.drive,0.35);for(var dzz=YZ0+0.6;dzz<0.9;dzz+=0.6)flat(s,VG0,VG1,dzz-0.02,dzz+0.02,0.012,P.paveD,0.36);
  flat(s,PG0+0.05,PG1-0.05,YZ0,0.9,0.01,P.pave,0.35);
  for(var k=YZ0+0.5;k<0.9;k+=0.5)flat(s,PG0+0.05,PG1-0.05,k-0.015,k+0.015,0.012,P.paveD,0.36);
  flat(s,-3.9,3.9,0.5,0.95,0.011,P.pave,0.35);
  var X0=-3.6,X1=3.6,F=0.95,B=4.0,G=3.4,TOP=6.7;
  boxShadow(s,X0,X1,F,B,TOP+0.7,0.12);
  bx(s,X0,X1,0,0.45,F-0.05,B,P.bStone2,{tile:1});
  bx(s,X0+0.05,X1-0.05,0.45,G,F+0.25,B,P.glass2,{tile:0.6});
  var piers=[[X0,X0+0.7],[-1.15,-0.65],[0.35,0.45],[1.7,2.2],[X1-0.7,X1]];
  piers.forEach(function(p){bx(s,p[0],p[1],0.45,G,F,B,P.bStone,{tile:0.5})});
  bx(s,X0,X1,G-0.45,G,F,B,P.bStone,{tile:0.8});
  bx(s,X0+0.7,-1.15,0.45,0.85,F,B,P.bStone,{tile:0.6});bx(s,1.7,2.2,0.45,0.85,F,B,P.bStone,{tile:0.6});bx(s,2.2,X1-0.7,0.45,0.85,F,B,P.bStone,{tile:0.6});
  [[X0+0.7,-1.15,0.85],[2.2,X1-0.7,0.85],[-0.65,0.35,0.45],[0.45,1.7,0.45]].forEach(function(w,i){
    var y0=w[2],y1=G-0.45;bx(s,w[0],w[1],y0,y0+0.06,F+0.17,F+0.25,P.frame,{tile:1});bx(s,w[0],w[1],y1-0.06,y1,F+0.17,F+0.25,P.frame,{tile:1});
    var n=Math.max(1,Math.round((w[1]-w[0])/0.9));for(var m=1;m<n;m++){var mx=w[0]+(w[1]-w[0])*m/n;bx(s,mx-0.03,mx+0.03,y0,y1,F+0.17,F+0.25,P.frame,{tile:1})}
    if(i<2)bx(s,w[0],w[1],1.9,1.95,F+0.17,F+0.25,P.frame,{tile:1})});
  bx(s,-0.65,1.7,0.45,2.6,F+0.24,F+0.28,P.glass,{tile:0.6});bx(s,0.5,0.56,0.45,2.6,F+0.18,F+0.3,P.frame);
  bx(s,-1.0,2.05,2.95,3.12,F-1.5,F+0.02,P.parapet,{tile:0.6});bx(s,-1.0,2.05,2.9,2.95,F-1.5,F-1.45,P.band);
  bx(s,-0.7,1.75,0.3,0.45,F-1.0,F,P.bStone2,{tile:0.6});
  bx(s,-0.5,1.55,0.15,0.3,F-1.3,F-1.0,P.bStone2,{tile:0.6});
  bx(s,X0-0.08,X1+0.08,G,G+0.32,F-0.12,B+0.08,P.band,{tile:1});
  bx(s,X0,X1,G+0.32,G+0.95,F,B,P.bPlaster,{tile:0.6});bx(s,X0,X1,G+2.45,TOP,F,B,P.bPlaster,{tile:0.6});
  bx(s,X0,X0+0.45,G+0.95,G+2.45,F,B,P.bPlaster,{tile:0.6});bx(s,X1-0.45,X1,G+0.95,G+2.45,F,B,P.bPlaster,{tile:0.6});
  bx(s,X0+0.45,X1-0.45,G+0.95,G+2.45,F+0.3,B,P.glass,{tile:0.6});
  for(var fx=X0+0.45+0.96;fx<X1-0.5;fx+=0.96)bx(s,fx-0.05,fx+0.05,G+0.95,G+2.45,F+0.05,F+0.3,P.frame,{tile:0.6});
  bx(s,X0+0.45,X1-0.45,G+1.7,G+1.75,F+0.22,F+0.3,P.frame,{tile:0.6});
  [X0,X1].forEach(function(xe){for(var wz=1.8;wz<B-0.5;wz+=1.3){bx(s,xe-0.02,xe+0.02,G+1.0,G+2.4,wz,wz+0.8,P.glass);bx(s,xe-0.02,xe+0.02,1.0,2.7,wz,wz+0.8,P.glass2)}});
  bx(s,X0-0.1,X1+0.1,TOP,TOP+0.85,F-0.1,B+0.1,P.parapet,{tile:1});
  bx(s,X0-0.12,X1+0.12,TOP+0.85,TOP+0.92,F-0.12,B+0.12,'#E3E5E7',{tile:1});bx(s,X0-0.12,X1+0.12,TOP+0.8,TOP+0.85,F-0.13,F-0.11,P.band,{tile:1});
  s.text(0,TOP+0.33,F-0.13,5.6,0.5,'-z',NAME_AR,P.ink,{font:'"Readex Pro",Tajawal,Tahoma,sans-serif'});
  s.text(0,TOP+0.1,F-0.13,3.6,0.18,'-z',NAME_EN,'#3A444D',{w:600,dir:'ltr',font:'"IBM Plex Sans",Arial,sans-serif'});
  hedgeRow(s,X0+0.3,-1.3,F-0.35,0.32);hedgeRow(s,2.3,X1-0.3,F-0.35,0.32);
  hedgeRow(s,YX0+0.4,VG0-0.6,YZ0+0.4,0.35);hedgeRow(s,RX0+0.2,YX1-0.4,YZ0+0.4,0.35);
  tree(s,-5.0,-2.6,1);tree(s,4.9,-1.6,1.05);tree(s,-5.1,2.8,0.9);tree(s,5.0,3.0,0.85);
  bush(s,3.0,-2.6,0.55,P.leaf3);bush(s,3.7,-2.9,0.4);bush(s,-0.1,-2.8,0.45,P.leaf1);
  bush(s,-1.4,-1.0,0.5,P.leaf3);bush(s,2.2,-0.4,0.45);
  streetLamp(s,-7.8,Z-1.5);streetLamp(s,7.8,Z-1.5);
  tree(s,-9.5,Z-0.95,0.75);tree(s,9.5,Z-0.95,0.75);
  s.yaw=2.6;s.pitch=0.42;s.ty=2.5;s.dist=27;
};
})();

/* site hook: route models to detailed scenes; extra scenes load on demand (missing file -> original model) */
(function(){var _bm,EXT={fire:['buildFirePro','js/fire-pro.js?v=1'],mep:['buildMepPro','js/mep-pro.js?v=1'],struct:['buildStructPro','js/struct-pro.js?v=1']},st={};
  function load(k,cb){var e=EXT[k];if(!e)return;if(window[e[0]])return cb();if(st[k]==='fail')return;(st[k+'_q']=st[k+'_q']||[]).push(cb);if(st[k])return;st[k]='loading';
    var t=document.createElement('script');t.src=e[1];t.onload=function(){st[k]='ok';(st[k+'_q']||[]).forEach(function(f){f()})};t.onerror=function(){st[k]='fail'};document.head.appendChild(t)}
  try{Object.defineProperty(window,'buildModel',{configurable:true,get:function(){return _bm},
  set:function(f){_bm=function(s,k){s._kind=k;
    if(k==='wall'&&window.buildWallPro){window.buildWallPro(s);return}
    var e=EXT[k];if(e&&window[e[0]]){window[e[0]](s);return}
    s.pitch=0.5;f(s,k);if(e)load(k,function(){if(s._kind===k&&window[e[0]]){window[e[0]](s);s.draw()}})}}})}catch(e){}
  window.addEventListener('load',function(){setTimeout(function(){for(var k in EXT)load(k,function(){})},600)});})();
