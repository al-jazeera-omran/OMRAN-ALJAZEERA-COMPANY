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
    var c0=P[0];if(nx*(0-c0[0])+ny*(0-c0[1])+nz*(D-c0[2])<=0&&fc.l>=1)continue;
    var dl=Math.max(0,n[0]*L[0]+n[1]*L[1]+n[2]*L[2]),sh=fc.flat?1:0.6+0.42*dl;
    var col='rgba('+Math.min(255,fc.c[0]*sh|0)+','+Math.min(255,fc.c[1]*sh|0)+','+Math.min(255,fc.c[2]*sh|0)+','+fc.a+')';
    out.push({P:P,z:zs,l:fc.l,col:col})}
  out.sort(function(a,b){return a.l-b.l||a.z-b.z});
  ctx.lineJoin='round';
  for(i=0;i<out.length;i++){var o=out[i];ctx.beginPath();for(j=0;j<o.P.length;j++){var p=o.P[j],Z=D-p[2],X=cx+f*p[0]/Z,Y=cyy-f*p[1]/Z;if(j)ctx.lineTo(X,Y);else ctx.moveTo(X,Y)}
    ctx.closePath();ctx.fillStyle=o.col;ctx.fill();ctx.strokeStyle=o.col;ctx.lineWidth=0.7;ctx.stroke()}
};
window.Mini3D=Scene;
})();
