/* Fire protection — fire pump room (NFPA 20 style), metres. Camera looks from -z. */
(function(){
var C={floor:'#BCC3C8',floorL:'#C0C7CC',pad:'#D3D6D8',wall:'#E9ECEE',dado:'#D7DCE0',skirt:'#8D979F',
  red:'#C62828',redD:'#9E1C1C',redL:'#D84040',yellow:'#F2B400',steel:'#59636B',steelL:'#A7B0B7',ss:'#C9CFD4',motor:'#55636E',motorD:'#47535C',
  black:'#1F2427',white:'#F4F5F6',gauge:'#FAFAF7',green:'#2E9E5B',amber:'#F2A900',engine:'#B3261E',rad:'#2D3338',grate:'#4A5056',ink:'#1A1A1A'};
function hex(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function nrm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function bx(s,x0,x1,y0,y1,z0,z1,col,o){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,o||{tile:0.6})}
function flat(s,x0,x1,z0,z1,y,col,layer){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],col,{layer:layer})}
/* torus arc: centre c, unit axes u,v (plane of bend), R bend radius, r tube radius, angles a0..a1 */
function torus(s,c,u,v,R,r,a0,a1,col,seg,tseg){seg=seg||10;tseg=tseg||10;var w=cross(u,v),k=hex(col);
  function P(t,p){var e=[u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)];
    var rr=R+r*Math.cos(p);return [c[0]+e[0]*rr+w[0]*r*Math.sin(p),c[1]+e[1]*rr+w[1]*r*Math.sin(p),c[2]+e[2]*rr+w[2]*r*Math.sin(p)]}
  function N(t,p){var e=[u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)];
    return nrm([e[0]*Math.cos(p)+w[0]*Math.sin(p),e[1]*Math.cos(p)+w[1]*Math.sin(p),e[2]*Math.cos(p)+w[2]*Math.sin(p)])}
  for(var i=0;i<seg;i++){var t0=a0+(a1-a0)*i/seg,t1=a0+(a1-a0)*(i+1)/seg;
    for(var j=0;j<tseg;j++){var p0=j/tseg*Math.PI*2,p1=(j+1)/tseg*Math.PI*2;
      s.faces.push({p:[P(t0,p0),P(t1,p0),P(t1,p1),P(t0,p1)],n:N((t0+t1)/2,(p0+p1)/2),c:k,l:1,a:1})}}}
var AX={x:[1,0,0],y:[0,1,0],z:[0,0,1]};
/* straight pipe from point a along axis by length L (can be negative) */
function pipe(s,a,ax,L,r,col,o){o=o||{};var st=L<0?[a[0]+(ax==='x'?L:0),a[1]+(ax==='y'?L:0),a[2]+(ax==='z'?L:0)]:a;s.cyl(st[0],st[1],st[2],r,Math.abs(L),ax,col,{n:o.n||14})}
function flange(s,p,ax,r,col){pipe(s,[p[0]-(ax==='x'?0.025:0),p[1]-(ax==='y'?0.025:0),p[2]-(ax==='z'?0.025:0)],ax,0.05,r*1.55,col||C.redD,{n:16})}
/* 90deg elbow: corner point k, pipe arriving along dirA leaving along dirB */
function elbow(s,k,dirA,dirB,r,col){var R=r*1.6;var c=[k[0]-dirA[0]*R+dirB[0]*R,k[1]-dirA[1]*R+dirB[1]*R,k[2]-dirA[2]*R+dirB[2]*R];
  var u=[-dirB[0],-dirB[1],-dirB[2]],v=dirA;torus(s,c,u,v,R,r,0,Math.PI/2,col||C.red,8,12);return R}
function gauge(s,x,y,z,face){
  s.cyl(x,y,z,0.012,0.1,'y',C.steelL,{n:6});
  if(face==='+x'){s.cyl(x,y+0.1,z,0.065,0.03,'x',C.black,{n:16});s.cyl(x+0.028,y+0.1,z,0.056,0.006,'x',C.gauge,{n:16})}
  else{s.cyl(x,y+0.1,z-0.03,0.065,0.03,'z',C.black,{n:16});s.cyl(x,y+0.1,z-0.036,0.056,0.006,'z',C.gauge,{n:16})}}
/* OS&Y gate valve on a pipe along 'ax' through centre p; stem along 'stem' axis */
function osy(s,p,ax,stem,r){var L=r*3.2;
  flange(s,[p[0]-(ax==='x'?L/2:0),p[1]-(ax==='y'?L/2:0),p[2]-(ax==='z'?L/2:0)],ax,r);flange(s,[p[0]+(ax==='x'?L/2:0),p[1]+(ax==='y'?L/2:0),p[2]+(ax==='z'?L/2:0)],ax,r);
  s.sphere(p[0],p[1],p[2],ax==='x'?L*0.45:r*1.45,ax==='y'?L*0.45:r*1.45,ax==='z'?L*0.45:r*1.45,C.redD,{n:16,m:10});
  var sd=AX[stem],h=r*4.2;
  s.cyl(p[0],p[1],p[2],r*0.85,h*0.55,stem,C.redD,{n:14});
  var top=[p[0]+sd[0]*h*0.55,p[1]+sd[1]*h*0.55,p[2]+sd[2]*h*0.55];
  var side=stem==='y'?(ax==='x'?[0,0,1]:[1,0,0]):[0,1,0];
  [-1,1].forEach(function(k){var q=[top[0]+side[0]*r*0.6*k,top[1]+side[1]*r*0.6*k,top[2]+side[2]*r*0.6*k];s.cyl(q[0],q[1],q[2],0.012,h*0.45,stem,C.redD,{n:6})});
  var yt=[top[0]+sd[0]*h*0.45,top[1]+sd[1]*h*0.45,top[2]+sd[2]*h*0.45];
  s.cyl(yt[0],yt[1],yt[2],r*0.35,0.03,stem,C.redD,{n:10});
  s.cyl(yt[0],yt[1],yt[2],0.012,r*1.4,stem,C.steelL,{n:6});
  var u=stem==='y'?[1,0,0]:[0,1,0],v=cross(sd,u),Rw=r*1.7;
  torus(s,[yt[0]+sd[0]*0.05,yt[1]+sd[1]*0.05,yt[2]+sd[2]*0.05],u,v,Rw,0.018,0,Math.PI*2,C.red,20,6);
  [0,1,2].forEach(function(i){var a=i/3*Math.PI*2,e=[u[0]*Math.cos(a)+v[0]*Math.sin(a),u[1]*Math.cos(a)+v[1]*Math.sin(a),u[2]*Math.cos(a)+v[2]*Math.sin(a)];
    for(var k=0;k<5;k++){var t=(k+0.5)/5*Rw;s.sphere(yt[0]+sd[0]*0.05+e[0]*t,yt[1]+sd[1]*0.05+e[1]*t,yt[2]+sd[2]*0.05+e[2]*t,0.014,0.014,0.014,C.red,{n:6,m:4})}});
  s.sphere(yt[0]+sd[0]*0.05,yt[1]+sd[1]*0.05,yt[2]+sd[2]*0.05,0.035,0.035,0.035,C.redD,{n:8,m:5});}
/* swing check valve on vertical pipe */
function checkV(s,x,y,z,r){flange(s,[x,y-r*1.4,z],'y',r);flange(s,[x,y+r*1.4,z],'y',r);
  s.cyl(x,y-r*1.4,z,r*1.35,r*2.8,'y',C.redD,{n:16});s.box(x,y-r*0.6,z-r*1.35,r*1.5,r*1.2,0.12,C.redD);s.cyl(x,y,z-r*1.35-0.12,0.02,0.04,'z',C.steelL,{n:6})}
function butterfly(s,x,y,z,r,ax){flange(s,[x,y,z],ax,r);s.cyl(x,y,z,r*1.3,0.09,ax,C.redD,{n:16});s.box(x,y+r*1.3,z,0.12,0.18,0.12,C.redD);s.box(x,y+r*1.3+0.18,z,0.22,0.12,0.16,C.yellow);s.cyl(x+0.11,y+r*1.3+0.24,z,0.08,0.03,'x',C.red,{n:14})}

/* end-suction fire pump with electric motor */
function elecPump(s,x,z){var y=0.62;
  bx(s,x-0.62,x+0.62,0,0.15,z-2.25,z+0.45,C.pad,{tile:0.6});
  bx(s,x-0.45,x+0.45,0.15,0.25,z-2.15,z+0.35,C.steel,{tile:0.6});
  bx(s,x-0.45,x+0.45,0.25,0.27,z-2.15,z+0.35,'#6B757D',{tile:0.6});
  s.cyl(x,y,z-0.14,0.4,0.28,'z',C.red,{n:24});s.cyl(x,y,z-0.17,0.33,0.03,'z',C.redD,{n:24});s.cyl(x,y,z+0.14,0.33,0.03,'z',C.redD,{n:24});
  bx(s,x-0.18,x+0.18,0.27,y-0.25,z-0.12,z+0.12,C.redD);
  pipe(s,[x,y+0.36,z],'y',0.28,0.12,C.red);flange(s,[x,y+0.66,z],'y',0.12);
  pipe(s,[x,y,z+0.14],'z',0.3,0.13,C.red);flange(s,[x,y,z+0.44],'z',0.13);
  s.cyl(x,y,z-0.6,0.13,0.46,'z',C.redD,{n:14});bx(s,x-0.14,x+0.14,0.27,y-0.1,z-0.55,z-0.2,C.redD);
  s.cyl(x,y,z-1.05,0.2,0.45,'z',C.yellow,{n:16});bx(s,x-0.2,x+0.2,0.27,y,z-1.05,z-0.6,C.yellow);
  var mz0=z-2.05,mz1=z-1.05;s.cyl(x,y+0.04,mz0,0.34,mz1-mz0,'z',C.motor,{n:24});
  for(var f=mz0+0.12;f<mz1-0.08;f+=0.09)s.cyl(x,y+0.04,f,0.36,0.03,'z',C.motorD,{n:24});
  s.cyl(x,y+0.04,mz1-0.02,0.3,0.06,'z',C.motorD,{n:24});
  s.sphere(x,y+0.04,mz0,0.32,0.32,0.12,C.motorD,{n:20,m:8});
  bx(s,x-0.18,x+0.18,y+0.34,y+0.55,z-1.7,z-1.35,C.motorD);bx(s,x-0.16,x+0.16,y+0.55,y+0.58,z-1.68,z-1.37,C.motor);
  bx(s,x-0.36,x-0.26,0.27,y-0.18,mz0+0.1,mz1-0.1,C.motorD);bx(s,x+0.26,x+0.36,0.27,y-0.18,mz0+0.1,mz1-0.1,C.motorD);
  return {sx:x,sy:y,sz:z+0.44,dx:x,dy:y+0.66,dz:z}}

/* diesel-driven pump */
function dieselPump(s,x,z){var y=0.62;
  bx(s,x-0.75,x+0.75,0,0.15,z-3.0,z+0.45,C.pad,{tile:0.6});
  bx(s,x-0.55,x+0.55,0.15,0.25,z-2.9,z+0.35,C.steel,{tile:0.6});
  s.cyl(x,y,z-0.14,0.4,0.28,'z',C.red,{n:24});s.cyl(x,y,z-0.17,0.33,0.03,'z',C.redD,{n:24});s.cyl(x,y,z+0.14,0.33,0.03,'z',C.redD,{n:24});
  bx(s,x-0.18,x+0.18,0.27,y-0.25,z-0.12,z+0.12,C.redD);
  pipe(s,[x,y+0.36,z],'y',0.28,0.12,C.red);flange(s,[x,y+0.66,z],'y',0.12);
  pipe(s,[x,y,z+0.14],'z',0.3,0.13,C.red);flange(s,[x,y,z+0.44],'z',0.13);
  s.cyl(x,y,z-0.6,0.13,0.46,'z',C.redD,{n:14});
  s.cyl(x,y,z-1.0,0.22,0.4,'z',C.yellow,{n:16});bx(s,x-0.22,x+0.22,0.27,y,z-1.0,z-0.6,C.yellow);
  var e0=z-2.35,e1=z-1.0;
  bx(s,x-0.36,x+0.36,0.27,0.55,e0,e1,C.black,{tile:0.5});
  bx(s,x-0.4,x+0.4,0.55,1.15,e0,e1,C.engine,{tile:0.4});
  bx(s,x-0.3,x+0.3,1.15,1.32,e0+0.08,e1-0.08,'#8E959B',{tile:0.4});
  for(var c=0;c<4;c++)s.cyl(x+0.06,1.32,e0+0.2+c*0.3,0.03,0.05,'y',C.black,{n:8});
  bx(s,x+0.4,x+0.5,0.75,1.0,e0+0.2,e1-0.2,'#7A2018',{tile:0.4});
  s.cyl(x-0.55,1.05,e0+0.55,0.14,0.3,'z',C.black,{n:14});
  s.cyl(x+0.62,0.95,e1-0.5,0.12,0.25,'x',C.steelL,{n:12});
  bx(s,x-0.48,x+0.48,0.27,1.35,e0-0.32,e0-0.12,C.rad,{tile:0.5});
  for(var g=0.4;g<1.3;g+=0.08)bx(s,x-0.44,x+0.44,g,g+0.02,e0-0.335,e0-0.32,'#5C656C',{tile:1});
  s.cyl(x,0.82,e0-0.12,0.32,0.12,'z','#3A4147',{n:20});
  s.cyl(x-0.2,1.32,e1-0.35,0.07,0.25,'y','#9AA1A6',{n:12});
  s.cyl(x-0.2,1.57,e1-0.35,0.065,1.6,'y','#7D858B',{n:12});
  return {sx:x,sy:y,sz:z+0.44,dx:x,dy:y+0.66,dz:z,ex:[x-0.2,3.17,e1-0.35]}}

function jockey(s,x,z){
  bx(s,x-0.3,x+0.3,0,0.15,z-0.3,z+0.3,C.pad);bx(s,x-0.2,x+0.2,0.15,0.2,z-0.2,z+0.2,C.steel);
  s.cyl(x,0.2,z,0.13,0.1,'y',C.ss,{n:18});s.cyl(x,0.3,z,0.1,0.62,'y',C.ss,{n:18});
  for(var k=0.36;k<0.9;k+=0.09)s.cyl(x,k,z,0.106,0.015,'y','#B4BBC1',{n:18});
  s.cyl(x,0.92,z,0.12,0.06,'y',C.ss,{n:18});s.cyl(x,0.98,z,0.15,0.42,'y',C.motor,{n:20});
  for(k=1.02;k<1.36;k+=0.06)s.cyl(x,k,z,0.16,0.015,'y',C.motorD,{n:20});
  s.sphere(x,1.42,z,0.14,0.07,0.14,C.motorD,{n:16,m:6,half:1});
  pipe(s,[x,0.25,z],'z',0.42,0.04,C.red);pipe(s,[x,0.25,z],'z',-0.38,0.04,C.red);
  return {x:x,z:z}}

function controller(s,z,h,title){var x=-4.97,w=0.75;
  bx(s,x,x+0.32,0.35,0.35+h,z-w/2,z+w/2,C.red,{tile:0.4});bx(s,x+0.32,x+0.335,0.4,0.3+h,z-w/2+0.04,z+w/2-0.04,C.redD,{tile:0.4});
  bx(s,x+0.335,x+0.345,0.35+h*0.62,0.35+h*0.86,z-0.2,z+0.2,C.white);
  bx(s,x+0.338,x+0.35,0.35+h*0.70,0.35+h*0.80,z-0.15,z+0.1,'#1C3440');
  ['#2E9E5B','#F2A900','#E5483A'].forEach(function(c,i){s.cyl(x+0.335,0.35+h*0.55,z-0.12+i*0.12,0.022,0.02,'x',c,{n:10})});
  s.cyl(x+0.335,0.35+h*0.4,z+0.22,0.02,0.05,'x',C.steelL,{n:8});
  s.text(x+0.352,0.35+h*0.89,z,0.6,0.07,'+x',title,C.white,{w:700});
  s.cyl(x+0.16,0.35+h,z,0.025,4.2-0.35-h,'y','#8E979F',{n:8});
}
function extinguisher(s,x,z,col){s.cyl(x,0.02,z,0.09,0.55,'y',col||C.red,{n:16});s.sphere(x,0.57,z,0.09,0.06,0.09,col||C.red,{n:14,m:6,half:1});
  s.cyl(x,0.62,z,0.02,0.07,'y',C.black,{n:8});s.box(x,0.69,z,0.12,0.03,0.04,C.black);s.cyl(x+0.06,0.3,z,0.012,0.35,'y',C.black,{n:6})}

window.buildFirePro=function(s){
  s.clear();
  var XL=-5,XR=5,ZF=-3.6,ZB=3.5,WH=4.2;
  flat(s,XL,XR,ZF,ZB,0,C.floor,0.1);
  for(var i=0;i<10;i++)flat(s,XL+i,XL+i+0.5,ZF,ZB,0.001,C.floorL,0.12);
  // walls as one-sided faces (inner side only) so they vanish when the model turns
  function wallZ(x0,x1,y0,y1,z,col,st,zb){var k=hex(col);for(var x=x0;x<x1-1e-6;x+=st)for(var y=y0;y<y1-1e-6;y+=st){var xa=Math.min(x+st,x1),ya=Math.min(y+st,y1);
    s.faces.push({p:[[xa,y,z],[x,y,z],[x,ya,z],[xa,ya,z]],n:[0,0,-1],c:k,l:1,a:1,zb:zb||0})}}
  function wallX(z0,z1,y0,y1,x,col,st){var k=hex(col);for(var z=z0;z<z1-1e-6;z+=st)for(var y=y0;y<y1-1e-6;y+=st){var za=Math.min(z+st,z1),ya=Math.min(y+st,y1);
    s.faces.push({p:[[x,y,z],[x,y,za],[x,ya,za],[x,ya,z]],n:[1,0,0],c:k,l:1,a:1})}}
  wallZ(XL,XR,0.12,1.2,ZB,C.wall,0.8);wallZ(XL,XR,1.2,1.25,ZB-0.002,C.dado,0.8,0.3);wallZ(XL,XR,1.25,WH,ZB,C.wall,0.8);wallZ(XL,XR,0,0.12,ZB-0.004,C.skirt,0.8,0.3);
  wallX(ZF,ZB,0.12,1.2,XL,C.wall,0.8);wallX(ZF,ZB,1.2,1.25,XL+0.002,C.dado,0.8);wallX(ZF,ZB,1.25,WH,XL,C.wall,0.8);wallX(ZF,ZB,0,0.12,XL+0.004,C.skirt,0.8);
  // room sign
  wallZ(-4.0,-1.4,2.95,3.6,ZB-0.01,C.red,3,1.2);
  s.text(-2.7,3.22,ZB-0.035,2.4,0.3,'-z','غرفة مضخات الحريق',C.white);
  s.text(-2.7,3.03,ZB-0.035,1.7,0.13,'-z','FIRE PUMP ROOM',C.white,{dir:'ltr',w:600});
  // floor drain trench
  flat(s,-4.6,4.6,ZB-0.42,ZB-0.12,0.002,C.grate,0.2);for(var g=-4.55;g<4.6;g+=0.1)flat(s,g,g+0.03,ZB-0.42,ZB-0.12,0.003,'#6A7177',0.21);

  // pumps
  var pe=elecPump(s,-2.4,1.15), pd=dieselPump(s,0.6,1.15), pj=jockey(s,2.7,1.6);
  [[-3.12,-1.68,-1.3,1.8],[-0.25,1.45,-2.05,1.8]].forEach(function(r){var t=0.05;flat(s,r[0],r[1],r[2],r[2]+t,0.004,C.yellow,0.3);flat(s,r[0],r[1],r[3]-t,r[3],0.004,C.yellow,0.3);flat(s,r[0],r[0]+t,r[2],r[3],0.004,C.yellow,0.3);flat(s,r[1]-t,r[1],r[2],r[3],0.004,C.yellow,0.3)});

  // suction header fed from tank through back wall
  var SY=0.62,SZ=2.45,R1=0.15;
  pipe(s,[-3.0,SY,SZ],'x',4.2,R1,C.red);
  s.sphere(-3.0,SY,SZ,R1,R1,R1,C.red,{n:14,m:8});s.cyl(-3.05,SY,SZ,R1*1.5,0.06,'x',C.redD,{n:16});
  s.cyl(1.2,SY,SZ,R1*1.5,0.06,'x',C.redD,{n:16});
  pipe(s,[-0.9,SY,SZ],'z',ZB-SZ+0.2,R1,C.red);osy(s,[-0.9,SY,2.95],'z','y',R1);
  [pe,pd].forEach(function(p){pipe(s,[p.sx,SY,p.sz],'z',SZ-p.sz,0.13,C.red);s.sphere(p.sx,SY,SZ,0.16,0.16,0.16,C.red,{n:14,m:8});osy(s,[p.sx,SY,p.sz+0.42],'z','y',0.13);gauge(s,p.sx+0.2,SY+0.12,p.sz+0.15,'-z')});
  pipe(s,[pj.x,0.25,pj.z+0.42],'z',SZ-pj.z-0.42,0.04,C.red);pipe(s,[pj.x,0.25,SZ],'y',SY-0.25-0.14,0.04,C.red);

  // discharge: check + OS&Y on each, to header
  var DY=2.55,DZ=1.15,R2=0.13;
  [pe,pd].forEach(function(p){
    pipe(s,[p.dx,p.dy,p.dz],'y',DY-p.dy,R2,C.red);
    checkV(s,p.dx,1.55,p.dz,R2);osy(s,[p.dx,2.05,p.dz],'y','z',R2);
    s.sphere(p.dx,DY,p.dz,0.16,0.16,0.16,C.red,{n:14,m:8});
    gauge(s,p.dx+0.2,1.2,p.dz-0.05,'-z');pipe(s,[p.dx,1.2,p.dz],'x',0.2,0.02,C.steelL);
  });
  pipe(s,[pj.x,0.25,pj.z-0.38],'y',DY-0.25,0.04,C.red);butterfly(s,pj.x,1.3,pj.z-0.38,0.045,'y');
  pipe(s,[pj.x,DY,pj.z-0.38],'z',DZ-(pj.z-0.38),0.04,C.red);
  pipe(s,[-2.4,DY,DZ],'x',5.6,0.17,C.red);flange(s,[-0.9,DY,DZ],'x',0.17);flange(s,[1.8,DY,DZ],'x',0.17);
  // riser to sprinkler network with alarm check valve
  var RX=3.47;elbow(s,[RX,DY,DZ],[1,0,0],[0,1,0],0.17);
  pipe(s,[RX,DY+0.27,DZ],'y',WH-DY-0.27+0.2,0.17,C.red);
  var ay=3.25;flange(s,[RX,ay-0.25,DZ],'y',0.17);flange(s,[RX,ay+0.25,DZ],'y',0.17);s.sphere(RX,ay,DZ,0.28,0.3,0.28,C.redD,{n:18,m:12});
  s.cyl(RX-0.3,ay-0.1,DZ,0.05,0.25,'y','#BFC6CC',{n:10});pipe(s,[RX-0.27,ay,DZ],'x',0.1,0.02,C.steelL);
  gauge(s,RX+0.3,ay+0.2,DZ-0.02,'-z');gauge(s,RX+0.3,ay-0.45,DZ-0.02,'-z');
  // sprinkler main along back wall with pendant heads
  elbow(s,[RX,WH-0.25,DZ],[0,1,0],[0,0,1],0.12);
  pipe(s,[RX,WH-0.25,DZ+0.19],'z',ZB-DZ-0.25,0.1,C.red);
  pipe(s,[-4.5,WH-0.25,ZB-0.32],'x',RX+4.5,0.08,C.red);
  [-4.5,-0.9,0.7,2.3].forEach(function(hx){pipe(s,[hx,WH-0.25,ZB-0.32],'y',-0.2,0.02,C.red);s.cyl(hx,WH-0.5,ZB-0.32,0.03,0.05,'y','#C9A227',{n:10});s.cyl(hx,WH-0.53,ZB-0.32,0.05,0.012,'y','#C9A227',{n:12})});
  // test header line with flow meter
  elbow(s,[-2.67,DY,DZ],[-1,0,0],[0,0,-1],0.17);
  pipe(s,[-2.67,DY,DZ-0.27],'z',-1.6,0.12,C.red);
  s.cyl(-2.67,DY,DZ-1.05,0.17,0.35,'z',C.redD,{n:16});bx(s,-2.75,-2.59,DY+0.17,DY+0.36,DZ-0.95,DZ-0.75,C.black);bx(s,-2.74,-2.6,DY+0.22,DY+0.32,DZ-0.951,DZ-0.94,'#7FD3A0');
  osy(s,[-2.67,DY,DZ-1.55],'z','y',0.12);
  elbow(s,[-2.67,DY,DZ-2.06],[0,0,-1],[-1,0,0],0.12);
  pipe(s,[-2.86,DY,DZ-2.06],'x',-2.14,0.12,C.red);
  // diesel exhaust + silencer
  var ex=pd.ex;elbow(s,[ex[0],ex[1]+0.1,ex[2]],[0,1,0],[0,0,1],0.065);
  pipe(s,[ex[0],ex[1]+0.1,ex[2]+0.1],'z',0.6,0.065,'#7D858B');s.cyl(ex[0],ex[1]+0.1,ex[2]+0.7,0.22,1.3,'z','#6E767C',{n:20});
  pipe(s,[ex[0],ex[1]+0.1,ex[2]+2.0],'z',ZB-ex[2]-2.0,0.065,'#7D858B');
  // diesel fuel tank
  bx(s,1.6,2.8,0.45,1.4,2.75,3.3,'#B02A20',{tile:0.4});[[1.65,2.8],[2.75,2.8],[1.65,3.25],[2.75,3.25]].forEach(function(q){bx(s,q[0]-0.03,q[0]+0.03,0,0.45,q[1]-0.03,q[1]+0.03,C.steel)});
  s.cyl(2.75,0.5,2.73,0.015,0.85,'y','#DDE3E7',{n:6});s.text(2.2,1.0,2.74,0.9,0.14,'-z','DIESEL',C.white,{dir:'ltr'});
  pipe(s,[1.7,0.6,2.75],'z',-0.4,0.015,C.black);
  // batteries
  bx(s,-0.55,-0.25,0.15,0.4,-1.7,-1.35,C.black);bx(s,-0.55,-0.25,0.15,0.4,-1.3,-0.95,C.black);
  // controllers
  controller(s,2.45,1.7,'FIRE PUMP');controller(s,1.4,1.7,'DIESEL PUMP');controller(s,0.45,1.1,'JOCKEY');
  // extinguishers, sign, hose reel cabinet
  extinguisher(s,-4.75,-2.6);extinguisher(s,-4.75,-2.95,'#B71C1C');
  bx(s,-4.985,-4.97,1.0,1.3,-2.95,-2.6,C.red);s.text(-4.965,1.08,-2.775,0.32,0.12,'+x','طفاية',C.white);
  bx(s,-4.97,-4.7,0.9,1.9,-1.4,-0.6,C.red,{tile:0.4});bx(s,-4.7,-4.69,0.97,1.83,-1.35,-0.65,'#FFD9D4');
  s.cyl(-4.69,1.4,-1.0,0.3,0.02,'x',C.red,{n:20});
  s.yaw=2.55;s.pitch=0.5;s.ty=1.5;s.dist=15.5;
};
})();
