/* Electromechanical (MEP) plant room — electrical, plumbing, HVAC. metres, camera from -z */
(function(){
var C={floor:'#BFC6CB',floorL:'#C4CACF',pad:'#D3D6D8',wall:'#E9ECEE',dado:'#D7DCE0',skirt:'#8D979F',
  panel:'#D9DCDE',panelD:'#C4C8CB',panelE:'#B2B7BB',dark:'#2B3136',screen:'#1C3440',lcd:'#7FD3A0',
  tray:'#A9B1B7',cblk:'#23282C',cgry:'#5A6168',cred:'#B23A2E',cyel:'#C9A227',cblu:'#2F5D8A',
  cold:'#2F7BC4',hot:'#D9762B',drain:'#8A9399',insul:'#C9CED2',band:'#9EA6AC',chw:'#3E86C8',
  ahu:'#E3E6E8',ahuD:'#CBD0D4',ahuE:'#9AA3AA',duct:'#C5CCD2',ductD:'#AEB6BD',
  pump:'#2F6FB0',ss:'#C9CFD4',vessel:'#2F6FB0',white:'#F4F5F6',yellow:'#F2B400',black:'#1F2427',steel:'#59636B',steelL:'#A7B0B7',green:'#2E9E5B',red:'#D23B30'};
function hex(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function nrm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function bx(s,x0,x1,y0,y1,z0,z1,col,o){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,o||{tile:0.6})}
function flat(s,x0,x1,z0,z1,y,col,layer){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],col,{layer:layer})}
function torus(s,c,u,v,R,r,a0,a1,col,seg,tseg){seg=seg||8;tseg=tseg||12;var w=cross(u,v),k=hex(col);
  function E(t){return [u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)]}
  function P(t,p){var e=E(t),rr=R+r*Math.cos(p);return [c[0]+e[0]*rr+w[0]*r*Math.sin(p),c[1]+e[1]*rr+w[1]*r*Math.sin(p),c[2]+e[2]*rr+w[2]*r*Math.sin(p)]}
  function N(t,p){var e=E(t);return nrm([e[0]*Math.cos(p)+w[0]*Math.sin(p),e[1]*Math.cos(p)+w[1]*Math.sin(p),e[2]*Math.cos(p)+w[2]*Math.sin(p)])}
  for(var i=0;i<seg;i++){var t0=a0+(a1-a0)*i/seg,t1=a0+(a1-a0)*(i+1)/seg;for(var j=0;j<tseg;j++){var p0=j/tseg*Math.PI*2,p1=(j+1)/tseg*Math.PI*2;
    s.faces.push({p:[P(t0,p0),P(t1,p0),P(t1,p1),P(t0,p1)],n:N((t0+t1)/2,(p0+p1)/2),c:k,l:1,a:1})}}}
function pipe(s,a,ax,L,r,col,n){var st=L<0?[a[0]+(ax==='x'?L:0),a[1]+(ax==='y'?L:0),a[2]+(ax==='z'?L:0)]:a;s.cyl(st[0],st[1],st[2],r,Math.abs(L),ax,col,{n:n||14})}
function elbow(s,k,A,B,r,col){var R=Math.max(r*1.5,0.06),c=[k[0]-A[0]*R+B[0]*R,k[1]-A[1]*R+B[1]*R,k[2]-A[2]*R+B[2]*R];torus(s,c,[-B[0],-B[1],-B[2]],A,R,r,0,Math.PI/2,col,6,12);return R}
function ipipe(s,a,ax,L,r,col){pipe(s,a,ax,L,r,col,16);var n=Math.floor(Math.abs(L)/0.9);for(var i=1;i<=n;i++){var d=Math.sign(L)*i*0.9;pipe(s,[a[0]+(ax==='x'?d-0.015:0),a[1]+(ax==='y'?d-0.015:0),a[2]+(ax==='z'?d-0.015:0)],ax,0.03,r*1.06,C.band,16)}}
function valve(s,p,ax,r,col){var e=0.05;s.cyl(p[0]-(ax==='x'?e:0),p[1]-(ax==='y'?e:0),p[2]-(ax==='z'?e:0),r*1.6,0.1,ax,col||C.dark,{n:14});
  s.box(p[0],p[1]+r*1.6,p[2],0.04,0.1,0.04,C.steelL);s.box(p[0],p[1]+r*1.6+0.1,p[2],ax==='x'?0.04:0.22,0.025,ax==='x'?0.22:0.04,C.red)}
function gauge(s,x,y,z){s.cyl(x,y,z,0.01,0.08,'y',C.steelL,{n:6});s.cyl(x,y+0.08,z-0.02,0.05,0.025,'z',C.black,{n:14});s.cyl(x,y+0.08,z-0.026,0.043,0.005,'z','#FAFAF7',{n:14})}
function duct(s,a,ax,L,w,h,col){var x0=a[0],y0=a[1],z0=a[2],sgn=L<0?-1:1,AL=Math.abs(L);
  if(ax==='x'){bx(s,Math.min(x0,x0+L),Math.max(x0,x0+L),y0-h/2,y0+h/2,z0-w/2,z0+w/2,col||C.duct,{tile:0.6});for(var d=0;d<=AL+1e-6;d+=1.2){var xx=x0+sgn*d;bx(s,xx-0.02,xx+0.02,y0-h/2-0.025,y0+h/2+0.025,z0-w/2-0.025,z0+w/2+0.025,C.ductD,{tile:1})}}
  else if(ax==='z'){bx(s,x0-w/2,x0+w/2,y0-h/2,y0+h/2,Math.min(z0,z0+L),Math.max(z0,z0+L),col||C.duct,{tile:0.6});for(d=0;d<=AL+1e-6;d+=1.2){var zz=z0+sgn*d;bx(s,x0-w/2-0.025,x0+w/2+0.025,y0-h/2-0.025,y0+h/2+0.025,zz-0.02,zz+0.02,C.ductD,{tile:1})}}
  else{bx(s,x0-w/2,x0+w/2,Math.min(y0,y0+L),Math.max(y0,y0+L),z0-h/2,z0+h/2,col||C.duct,{tile:0.6});for(d=0;d<=AL+1e-6;d+=1.2){var yy=y0+sgn*d;bx(s,x0-w/2-0.025,x0+w/2+0.025,yy-0.02,yy+0.02,z0-h/2-0.025,z0+h/2+0.025,C.ductD,{tile:1})}}}
function hanger(s,x,y,z,top){s.cyl(x,y,z,0.008,top-y,'y',C.steelL,{n:5})}

/* electrical: main distribution board lineup (faces +x) */
function mdb(s){var x0=-4.98,x1=-4.38,H=2.2,sec=[[0.15,0.95,'ACB'],[0.95,1.75,'F'],[1.75,2.55,'F'],[2.55,3.35,'M']];
  bx(s,x0,x1+0.02,0,0.1,0.1,3.4,C.dark,{tile:1});
  sec.forEach(function(q){var z0=q[0],z1=q[1],zc=(z0+z1)/2;
    bx(s,x0,x1,0.1,0.1+H,z0+0.005,z1-0.005,C.panel,{tile:0.5});
    bx(s,x1,x1+0.012,0.15,0.05+H,z0+0.04,z1-0.04,C.panelD,{tile:0.5});
    bx(s,x0,x1+0.03,0.1+H,0.18+H,z0,z1,C.panelE,{tile:0.5});
    s.cyl(x1+0.012,1.15,z1-0.1,0.012,0.05,'x',C.dark,{n:8});
    for(var v=0;v<3;v++)bx(s,x1+0.012,x1+0.016,0.25+v*0.015,0.26+v*0.015,z0+0.1,z0+0.25,C.panelE);
    if(q[2]==='ACB'){bx(s,x1+0.012,x1+0.03,0.9,1.5,zc-0.25,zc+0.25,C.dark,{tile:0.4});bx(s,x1+0.03,x1+0.035,1.25,1.4,zc-0.12,zc+0.05,C.screen);bx(s,x1+0.035,x1+0.04,1.29,1.36,zc-0.1,zc+0.02,C.lcd);
      s.cyl(x1+0.03,1.05,zc+0.12,0.03,0.02,'x',C.green,{n:10});s.cyl(x1+0.03,1.05,zc+0.02,0.03,0.02,'x',C.red,{n:10});
      for(var m=0;m<3;m++){bx(s,x1+0.012,x1+0.025,1.8,1.98,z0+0.1+m*0.22,z0+0.28+m*0.22,C.dark);bx(s,x1+0.025,x1+0.03,1.85,1.93,z0+0.12+m*0.22,z0+0.26+m*0.22,C.lcd)}}
    else if(q[2]==='F'){for(var r=0;r<5;r++){var y=0.45+r*0.33;bx(s,x1+0.012,x1+0.03,y,y+0.22,zc-0.28,zc+0.28,C.panelE,{tile:0.4});
        bx(s,x1+0.03,x1+0.05,y+0.06,y+0.16,zc-0.04,zc+0.04,C.dark);s.cyl(x1+0.03,y+0.11,zc+0.18,0.018,0.015,'x',r%2?C.green:C.red,{n:8})}}
    else{bx(s,x1+0.012,x1+0.03,1.2,1.75,zc-0.25,zc+0.25,C.dark,{tile:0.4});bx(s,x1+0.03,x1+0.035,1.3,1.6,zc-0.2,zc+0.2,C.screen);bx(s,x1+0.035,x1+0.04,1.4,1.52,zc-0.15,zc+0.1,C.lcd);
      ['#2E9E5B','#F2A900','#D23B30'].forEach(function(c,k){s.cyl(x1+0.03,1.0,zc-0.15+k*0.15,0.025,0.02,'x',c,{n:10})})}
  });
  s.text(x1+0.045,0.1+H-0.18,1.75,1.0,0.12,'+x','MDB-01  400V / 2500A',C.dark,{dir:'ltr',w:700});
  flat(s,-4.38,-3.4,0.1,3.4,0.004,C.black,0.3);
  bx(s,-4.82,-4.62,0.18+H,4.2,0.35,0.75,C.panelE,{tile:0.5});for(var b=2.6;b<4.2;b+=0.5)bx(s,-4.84,-4.6,b,b+0.04,0.33,0.77,C.dark);
}
/* ladder cable tray with cables */
function trayRun(s,a,ax,L,y,w){var dir=ax==='x'?[1,0,0]:[0,0,1],sgn=L<0?-1:1,AL=Math.abs(L);
  var sx=ax==='z'?[1,0,0]:[0,0,1];
  [-1,1].forEach(function(k){var o=[a[0]+sx[0]*w/2*k,y,a[2]+sx[2]*w/2*k];if(ax==='x')bx(s,Math.min(o[0],o[0]+L),Math.max(o[0],o[0]+L),y,y+0.1,o[2]-0.01,o[2]+0.01,C.tray,{tile:0.6});else bx(s,o[0]-0.01,o[0]+0.01,y,y+0.1,Math.min(o[2],o[2]+L),Math.max(o[2],o[2]+L),C.tray,{tile:0.6})});
  for(var d=0.15;d<AL;d+=0.3){var p=[a[0]+dir[0]*d*sgn,y,a[2]+dir[2]*d*sgn];if(ax==='x')bx(s,p[0]-0.015,p[0]+0.015,y,y+0.02,a[2]-w/2,a[2]+w/2,C.tray);else bx(s,a[0]-w/2,a[0]+w/2,y,y+0.02,p[2]-0.015,p[2]+0.015,C.tray)}
  var cols=[C.cblk,C.cblk,C.cred,C.cyel,C.cblu,C.cgry,C.cblk];
  cols.forEach(function(c,i){var off=-w/2+0.05+i*(w-0.1)/(cols.length-1),r=i%3===0?0.028:0.022;
    if(ax==='x')s.cyl(Math.min(a[0],a[0]+L),y+0.02+r,a[2]+off,r,AL,'x',c,{n:8});else s.cyl(a[0]+off,y+0.02+r,Math.min(a[2],a[2]+L),r,AL,'z',c,{n:8})});
  for(d=0.6;d<AL;d+=1.5){var q=[a[0]+dir[0]*d*sgn,y,a[2]+dir[2]*d*sgn];hanger(s,q[0]+sx[0]*w/2,y,q[2]+sx[2]*w/2,4.2);hanger(s,q[0]-sx[0]*w/2,y,q[2]-sx[2]*w/2,4.2)}}

/* plumbing */
function booster(s,x0,z){var n=3,sp=0.65;
  bx(s,x0-0.3,x0+sp*(n-1)+0.3,0,0.12,z-0.45,z+0.45,C.pad);bx(s,x0-0.25,x0+sp*(n-1)+0.25,0.12,0.18,z-0.38,z+0.38,C.steel);
  pipe(s,[x0-0.3,0.4,z+0.3],'x',sp*(n-1)+0.6,0.075,C.cold,16);pipe(s,[x0-0.3,1.55,z-0.28],'x',sp*(n-1)+0.6,0.07,C.cold,16);
  for(var i=0;i<n;i++){var x=x0+i*sp;
    s.cyl(x,0.18,z,0.12,0.08,'y',C.ss,{n:18});s.cyl(x,0.26,z,0.09,0.68,'y',C.ss,{n:18});for(var k=0.32;k<0.92;k+=0.08)s.cyl(x,k,z,0.095,0.012,'y','#B4BBC1',{n:18});
    s.cyl(x,0.94,z,0.11,0.06,'y',C.ss,{n:18});s.cyl(x,1.0,z,0.14,0.38,'y',C.pump,{n:20});for(k=1.04;k<1.36;k+=0.06)s.cyl(x,k,z,0.15,0.012,'y','#285F98',{n:20});
    s.sphere(x,1.38,z,0.13,0.06,0.13,'#285F98',{n:16,m:6,half:1});
    pipe(s,[x,0.4,z],'z',0.3,0.045,C.cold);valve(s,[x,0.4,z+0.18],'z',0.045,C.dark);
    pipe(s,[x,0.62,z-0.28],'y',0.93,0.045,C.cold);pipe(s,[x,0.62,z],'z',-0.28,0.045,C.cold);valve(s,[x,1.15,z-0.28],'y',0.045,'#0F3D66');}
  gauge(s,x0+sp*(n-1)+0.2,1.62,z-0.3);
  bx(s,x0+sp*n-0.05,x0+sp*n+0.45,0.18,1.5,z-0.15,z+0.25,C.panel,{tile:0.4});bx(s,x0+sp*n+0.05,x0+sp*n+0.35,1.1,1.3,z-0.155,z-0.15,C.screen);
  s.text(x0+sp,1.75,z-0.36,1.4,0.1,'-z','BOOSTER PUMP SET',C.dark,{dir:'ltr',w:700});}
function vessel(s,x,z){s.cyl(x,0.1,z,0.28,0.95,'y',C.vessel,{n:24});s.sphere(x,1.05,z,0.28,0.18,0.28,C.vessel,{n:24,m:8,half:1});s.sphere(x,0.12,z,0.28,0.1,0.28,C.vessel,{n:24,m:8});
  [0,1,2].forEach(function(i){var a=i/3*Math.PI*2+0.4;s.cyl(x+Math.cos(a)*0.22,0,z+Math.sin(a)*0.22,0.02,0.15,'y',C.steel,{n:6})});}
function heater(s,x,z){s.cyl(x,0.05,z,0.32,1.55,'y',C.white,{n:26});s.sphere(x,1.6,z,0.32,0.14,0.32,C.white,{n:26,m:8,half:1});
  bx(s,x-0.12,x+0.12,0.95,1.2,z-0.33,z-0.3,C.dark);s.cyl(x+0.05,1.1,z-0.34,0.02,0.01,'z',C.red,{n:8});
  [0,1,2].forEach(function(i){var a=i/3*Math.PI*2;s.cyl(x+Math.cos(a)*0.25,0,z+Math.sin(a)*0.25,0.025,0.08,'y',C.steel,{n:6})});
  s.text(x,1.35,z-0.33,0.5,0.08,'-z','HWH-01',C.dark,{dir:'ltr'});}

/* HVAC: air handling unit */
function ahu(s,x0,x1,z0,z1){var H=1.45,y0=0.15;
  bx(s,x0-0.1,x1+0.1,0,y0,z0-0.1,z1+0.1,C.pad,{tile:0.8});
  bx(s,x0,x1,y0,y0+0.12,z0,z1,C.ahuE,{tile:0.8});
  var secs=[0,0.22,0.48,0.7,1];
  for(var i=0;i<secs.length-1;i++){var a=x0+(x1-x0)*secs[i],b=x0+(x1-x0)*secs[i+1];
    bx(s,a+0.005,b-0.005,y0+0.12,y0+H,z0,z1,C.ahu,{tile:0.5});
    bx(s,a+0.08,b-0.08,y0+0.25,y0+H-0.12,z0-0.012,z0,C.ahuD,{tile:0.5});
    bx(s,b-0.16,b-0.12,y0+0.85,y0+1.05,z0-0.04,z0-0.012,C.dark);bx(s,b-0.16,b-0.12,y0+0.4,y0+0.5,z0-0.03,z0-0.012,C.steelL);bx(s,b-0.16,b-0.12,y0+H-0.4,y0+H-0.3,z0-0.03,z0-0.012,C.steelL);
    if(i<secs.length-2)bx(s,b-0.006,b+0.006,y0+0.12,y0+H,z0-0.02,z0,C.ahuE,{tile:0.6});}
  var ca=x0+(x1-x0)*0.22,cb=x0+(x1-x0)*0.48;bx(s,ca+0.15,cb-0.15,y0+0.5,y0+0.62,z0-0.016,z0-0.01,'#3E86C8');
  s.text((x0+x1)/2,y0+H-0.33,z0-0.03,1.2,0.16,'-z','AHU-01',C.dark,{dir:'ltr',w:700});
  s.text((x0+x1)/2,y0+H-0.48,z0-0.03,1.8,0.08,'-z','12,000 CFM  |  CHW 6/12°C',C.dark,{dir:'ltr',w:600});
  pipe(s,[(ca+cb)/2,y0+0.18,z0],'z',-0.25,0.025,C.drain);pipe(s,[(ca+cb)/2,0.02,z0-0.25],'y',y0+0.16,0.025,C.drain);
  return {y0:y0,H:H,ca:ca,cb:cb}}

window.buildMepPro=function(s){
  s.clear();
  var XL=-5,XR=5,ZF=-3.6,ZB=3.5,WH=4.2;
  flat(s,XL,XR,ZF,ZB,0,C.floor,0.1);for(var i=0;i<10;i++)flat(s,XL+i,XL+i+0.5,ZF,ZB,0.001,C.floorL,0.12);
  function wallZ(x0,x1,y0,y1,z,col,st,zb){var k=hex(col);for(var x=x0;x<x1-1e-6;x+=st)for(var y=y0;y<y1-1e-6;y+=st){var xa=Math.min(x+st,x1),ya=Math.min(y+st,y1);
    s.faces.push({p:[[xa,y,z],[x,y,z],[x,ya,z],[xa,ya,z]],n:[0,0,-1],c:k,l:1,a:1,zb:zb||0})}}
  function wallX(z0,z1,y0,y1,x,col,st,zb){var k=hex(col);for(var z=z0;z<z1-1e-6;z+=st)for(var y=y0;y<y1-1e-6;y+=st){var za=Math.min(z+st,z1),ya=Math.min(y+st,y1);
    s.faces.push({p:[[x,y,z],[x,y,za],[x,ya,za],[x,ya,z]],n:[1,0,0],c:k,l:1,a:1,zb:zb||0})}}
  wallZ(XL,XR,0.12,1.2,ZB,C.wall,0.8);wallZ(XL,XR,1.2,1.25,ZB-0.002,C.dado,0.8,0.3);wallZ(XL,XR,1.25,WH,ZB,C.wall,0.8);wallZ(XL,XR,0,0.12,ZB-0.004,C.skirt,0.8,0.3);
  wallX(ZF,ZB,0.12,1.2,XL,C.wall,0.8);wallX(ZF,ZB,1.2,1.25,XL+0.002,C.dado,0.8,0.3);wallX(ZF,ZB,1.25,WH,XL,C.wall,0.8);wallX(ZF,ZB,0,0.12,XL+0.004,C.skirt,0.8,0.3);
  wallZ(-3.9,-0.9,2.0,2.55,ZB-0.01,'#2B3540',3,1.2);
  s.text(-2.4,2.24,ZB-0.035,2.7,0.24,'-z','غرفة الأنظمة الكهروميكانيكية',C.white);
  s.text(-2.4,2.08,ZB-0.035,2.0,0.11,'-z','MEP PLANT ROOM',C.yellow,{dir:'ltr',w:600});
  wallX(-0.75,-0.25,1.45,1.95,XL+0.01,C.yellow,1,1.2);s.text(XL+0.03,1.55,-0.5,0.46,0.14,'+x','خطر كهرباء',C.black);s.text(XL+0.03,1.74,-0.5,0.2,0.16,'+x','⚡',C.black,{dir:'ltr'});

  mdb(s);
  [[-1.4,'DB-L1'],[-2.3,'DB-P1']].forEach(function(d){var z=d[0];bx(s,-4.98,-4.8,1.0,1.9,z-0.3,z+0.3,C.panel,{tile:0.4});bx(s,-4.8,-4.79,1.05,1.85,z-0.26,z+0.26,C.panelD,{tile:0.4});
    s.text(-4.785,1.7,z,0.4,0.08,'+x',d[1],C.dark,{dir:'ltr'});s.cyl(-4.89,1.9,z,0.04,4.2-1.9,'y','#8E979F',{n:8})});
  trayRun(s,[-4.5,0,3.3],'z',-6.6,3.0,0.45);
  trayRun(s,[-4.3,0,3.15],'x',8.6,3.55,0.4);
  for(var c=0;c<5;c++)s.cyl(-4.55+c*0.05,2.38,2.9,0.022,0.62,'y',c%2?C.cblk:C.cgry,{n:8});

  booster(s,1.3,2.55);vessel(s,3.75,2.6);heater(s,0.2,2.75);
  pipe(s,[3.4,0.4,2.85],'z',ZB-2.85,0.075,C.cold,16);
  pipe(s,[1.0,1.55,2.27],'x',-0.5,0.07,C.cold);elbow(s,[0.5,1.55,2.27],[-1,0,0],[0,1,0],0.07,C.cold);pipe(s,[0.5,1.66,2.27],'y',3.3-1.66,0.07,C.cold);
  pipe(s,[3.75,1.12,2.6],'y',0.43,0.04,C.cold);pipe(s,[3.75,1.55,2.6],'z',-0.33,0.04,C.cold);pipe(s,[3.0,1.55,2.27],'x',0.75,0.04,C.cold);
  pipe(s,[0.2,1.74,2.75],'y',3.3-1.74,0.04,C.hot);pipe(s,[0.45,0.3,2.75],'y',3.15-0.3,0.035,C.cold);pipe(s,[0.2,0.3,2.75],'x',0.25,0.035,C.cold);
  pipe(s,[-4.4,3.3,2.27],'x',4.9,0.07,C.cold);
  pipe(s,[-4.4,3.3,2.75],'x',4.6,0.04,C.hot);pipe(s,[-4.4,3.15,2.87],'x',4.85,0.035,C.cold);
  for(var hx=-4.0;hx<0.6;hx+=1.5){bx(s,hx-0.02,hx+0.02,3.2,3.22,2.15,3.0,C.steel);hanger(s,hx,3.22,2.2,4.2);hanger(s,hx,3.22,2.95,4.2)}
  for(var k=0;k<6;k++){var xa=4.6-k*0.75;s.cyl(xa-0.75,0.32-k*0.03,3.3,0.06,0.76,'x',C.drain,{n:12})}
  pipe(s,[0.1,0.05,3.3],'y',0.15,0.07,C.drain);flat(s,-0.1,0.3,3.1,3.45,0.003,C.dark,0.3);

  var A=ahu(s,0.6,3.9,-3.1,-1.9),AZ=-2.5;
  var dx=3.9-0.45;duct(s,[dx,A.y0+A.H,AZ],'y',4.2-(A.y0+A.H),0.6,0.55);
  duct(s,[0.6,0.95,AZ],'x',-1.3,0.55,0.6);bx(s,-0.74,-0.7,0.6,1.3,AZ-0.33,AZ+0.33,C.ductD);for(var gy=0.67;gy<1.25;gy+=0.08)bx(s,-0.75,-0.72,gy,gy+0.03,AZ-0.28,AZ+0.28,C.white);
  [A.ca+0.2,A.ca+0.55].forEach(function(x,i){var zc=-1.65;
    pipe(s,[x,0.55+i*0.3,-1.9],'z',0.25,0.06,C.insul,14);
    ipipe(s,[x,0.55+i*0.3,zc],'y',4.2-(0.55+i*0.3),0.085,C.insul);
    valve(s,[x,1.75+i*0.1,zc],'y',0.07,C.chw);
    bx(s,x-0.06,x+0.06,2.3,2.4,zc-0.09,zc-0.085,i?'#2A5F9E':'#4C9BE0');});
  bx(s,3.95,4.12,0.6,1.3,-2.85,-2.15,C.panel,{tile:0.4});bx(s,4.12,4.13,0.95,1.15,-2.7,-2.3,C.screen);
  s.cyl(-3.9,0,-0.6,0.09,0.6,'y','#B71C1C',{n:16});s.sphere(-3.9,0.6,-0.6,0.09,0.06,0.09,'#B71C1C',{n:14,m:6,half:1});s.cyl(-3.9,0.65,-0.6,0.02,0.08,'y',C.black,{n:8});
  s.yaw=2.55;s.pitch=0.5;s.ty=1.6;s.dist=15.5;
};
})();
