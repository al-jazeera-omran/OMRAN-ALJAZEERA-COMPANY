/* Hero — high-rise RC building under construction with a realistic tower crane. metres */
(function(){
var C={ground:'#DCD2BE',conc:'#CDD0D2',concD:'#B9BDC0',concE:'#C2C6C9',glass:'#7FA3BB',glassD:'#6A8EA8',mull:'#3A444D',clad:'#E8EAEC',
  ply:'#C9A066',h20:'#E2B33C',prop:'#E0A21A',block:'#B9B6AF',rail:'#F2B400',net:'#2F3A40',craneY:'#F2B01E',craneD:'#C88A0C',white:'#F4F5F6',dark:'#2B3136',cab:'#E9EBED',
  weight:'#9EA4A8',hook:'#F2B01E',rope:'#3A3F44',cabin:'#F1F3F4',cabinB:'#2F6FB0',rebar:'#8A5235',steel:'#7D868E',acc:'#F2A900'};
function hex(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function nrm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function bx(s,x0,x1,y0,y1,z0,z1,col,o){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,o||{tile:1.2})}
function flat(s,x0,x1,z0,z1,y,col,layer){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],col,{layer:layer})}
/* square prism between two arbitrary points (lattice members, ties, ropes) */
function beam(s,a,b,r,col,g){var d=nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),t=Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],u=nrm(cross(d,t)),v=cross(d,u),k=hex(col);
  var o=[[u[0]+v[0],u[1]+v[1],u[2]+v[2]],[u[0]-v[0],u[1]-v[1],u[2]-v[2]],[-u[0]-v[0],-u[1]-v[1],-u[2]-v[2]],[-u[0]+v[0],-u[1]+v[1],-u[2]+v[2]]];
  function P(p,i){return [p[0]+o[i][0]*r,p[1]+o[i][1]*r,p[2]+o[i][2]*r]}
  for(var i=0;i<4;i++){var j=(i+1)%4,n=nrm([o[i][0]+o[j][0],o[i][1]+o[j][1],o[i][2]+o[j][2]]);s.faces.push({p:[P(a,i),P(a,j),P(b,j),P(b,i)],n:n,c:k,l:1,a:1,g:g})}}
function gbox(s,x0,x1,y0,y1,z0,z1,col,g){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,{tile:1.5,g:g})}

/* tower crane */
function crane(s,mx,mz,H){var a=0.8,g='jib',Y=C.craneY,D=C.craneD;
  bx(s,mx-2.4,mx+2.4,0,0.9,mz-2.4,mz+2.4,C.concD,{tile:1.2});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){bx(s,mx+q[0]*a-0.2,mx+q[0]*a+0.2,0.9,1.2,mz+q[1]*a-0.2,mz+q[1]*a+0.2,C.dark)});
  var ch=[[mx-a,mz-a],[mx+a,mz-a],[mx+a,mz+a],[mx-a,mz+a]];
  ch.forEach(function(c){s.cyl(c[0],1.2,c[1],0.07,H-1.2,'y',Y,{n:6})});
  for(var y=1.2;y<H-0.1;y+=1.6){var y1=Math.min(y+1.6,H);
    for(var i=0;i<4;i++){var p=ch[i],q=ch[(i+1)%4];beam(s,[p[0],y,p[1]],[q[0],y,q[1]],0.04,Y);beam(s,[p[0],y,p[1]],[q[0],y1,q[1]],0.035,D)}}
  for(y=6;y<H;y+=8)bx(s,mx-a-0.05,mx+a+0.05,y,y+0.06,mz-a-0.05,mz+a+0.05,C.dark,{tile:2});
  // slewing part (rotates)
  var T=H;gbox(s,mx-1.1,mx+1.1,T,T+0.5,mz-1.1,mz+1.1,Y,g);
  s.cyl(mx,T+0.5,mz,1.0,0.25,'y',C.dark,{n:18,g:g});
  gbox(s,mx-1.2,mx+1.2,T+0.75,T+1.35,mz-1.2,mz+1.2,Y,g);
  // operator cab
  gbox(s,mx+0.4,mx+2.0,T+0.6,T+2.4,mz+1.2,mz+2.6,C.cab,g);gbox(s,mx+1.98,mx+2.02,T+1.2,T+2.3,mz+1.3,mz+2.5,C.glass,g);gbox(s,mx+0.5,mx+1.9,T+1.25,T+2.25,mz+2.58,mz+2.62,C.glass,g);
  gbox(s,mx+0.35,mx+2.05,T+2.4,T+2.5,mz+1.15,mz+2.65,C.dark,g);
  // apex
  var A=T+1.35,AH=6.5,ap=[mx,A+AH,mz];
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q,i,arr){var b=[mx+q[0]*0.9,A,mz+q[1]*0.9];beam(s,b,ap,0.06,Y,g);var n=arr[(i+1)%4];
    for(var k=1;k<4;k++){var f=k/4,p1=[b[0]+(ap[0]-b[0])*f,A+AH*f,b[2]+(ap[2]-b[2])*f],nb=[mx+n[0]*0.9,A,mz+n[1]*0.9],p2=[nb[0]+(ap[0]-nb[0])*f,A+AH*f,nb[2]+(ap[2]-nb[2])*f];beam(s,p1,p2,0.03,D,g)}});
  gbox(s,mx-0.3,mx+0.3,A+AH-0.1,A+AH+0.4,mz-0.3,mz+0.3,Y,g);
  // jib (triangular lattice)
  var L=30,jh=1.3,jw=0.8,y0=A,x0=mx+1.2;
  var b1=function(x){return [x,y0,mz-jw]},b2=function(x){return [x,y0,mz+jw]},tp=function(x){return [x,y0+jh,mz]};
  s.cyl(x0,y0,mz-jw,0.06,L,'x',Y,{n:6,g:g});s.cyl(x0,y0,mz+jw,0.06,L,'x',Y,{n:6,g:g});s.cyl(x0,y0+jh,mz,0.06,L-0.6,'x',Y,{n:6,g:g});
  for(var x=x0;x<x0+L-0.05;x+=1.5){var xn=Math.min(x+1.5,x0+L);
    beam(s,b1(x),b2(x),0.03,D,g);beam(s,b1(x),tp(xn),0.03,Y,g);beam(s,b2(x),tp(xn),0.03,Y,g);beam(s,b1(xn),tp(xn),0.03,Y,g);beam(s,b2(xn),tp(xn),0.03,Y,g)}
  beam(s,b1(x0+L),b2(x0+L),0.05,Y,g);
  beam(s,ap,tp(x0+12),0.035,C.dark,g);beam(s,ap,tp(x0+22),0.035,C.dark,g);
  // counter-jib with walkway and counterweights
  var cl=11,cx0=mx-1.2;
  gbox(s,cx0-cl,cx0,y0-0.05,y0+0.25,mz-0.9,mz-0.7,Y,g);gbox(s,cx0-cl,cx0,y0-0.05,y0+0.25,mz+0.7,mz+0.9,Y,g);
  for(x=cx0-cl;x<cx0;x+=1.2)gbox(s,x,x+0.08,y0-0.05,y0+0.2,mz-0.9,mz+0.9,D,g);
  gbox(s,cx0-cl+0.2,cx0-0.2,y0+0.25,y0+0.3,mz-0.7,mz+0.7,C.steel,g);
  gbox(s,cx0-cl,cx0-1,y0+0.3,y0+1.3,mz-0.95,mz-0.92,C.rail,g);gbox(s,cx0-cl,cx0-1,y0+0.3,y0+1.3,mz+0.92,mz+0.95,C.rail,g);
  for(var w=0;w<4;w++)gbox(s,cx0-cl+0.1+w*0.95,cx0-cl+0.95+w*0.95,y0-2.2,y0-0.05,mz-0.85,mz+0.85,C.weight,g);
  gbox(s,cx0-6.5,cx0-3.8,y0+0.3,y0+1.6,mz-0.8,mz+0.8,C.dark,g);gbox(s,cx0-6.4,cx0-3.9,y0+1.6,y0+1.7,mz-0.75,mz+0.75,Y,g);
  beam(s,ap,[cx0-cl+0.5,y0+0.25,mz-0.8],0.035,C.dark,g);beam(s,ap,[cx0-cl+0.5,y0+0.25,mz+0.8],0.035,C.dark,g);
  // company banner on counter-jib (both sides)
  gbox(s,cx0-9.6,cx0-1.4,y0+0.35,y0+1.25,mz-0.98,mz-0.96,C.white,g);gbox(s,cx0-9.6,cx0-1.4,y0+0.35,y0+1.25,mz+0.96,mz+0.98,C.white,g);
  var tx=cx0-5.5,nm='عمران الجزيرة للمقاولات',fnt='"Readex Pro",Tajawal,Tahoma,sans-serif';
  s.faces.push({p:[[tx+4,y0+0.45,mz-1.0],[tx-4,y0+0.45,mz-1.0],[tx-4,y0+1.15,mz-1.0],[tx+4,y0+1.15,mz-1.0]],n:[0,0,-1],c:[0,0,0],l:1,a:1,zb:1.5,g:g,txt:{s:nm,col:'#1A1A1A',r:0.7/8,font:fnt}});
  s.faces.push({p:[[tx-4,y0+0.45,mz+1.0],[tx+4,y0+0.45,mz+1.0],[tx+4,y0+1.15,mz+1.0],[tx-4,y0+1.15,mz+1.0]],n:[0,0,1],c:[0,0,0],l:1,a:1,zb:1.5,g:g,txt:{s:nm,col:'#1A1A1A',r:0.7/8,font:fnt}});
  // trolley, ropes, hook block, rebar load
  var trx=x0+19,hy=y0-15;
  gbox(s,trx-0.6,trx+0.6,y0-0.45,y0-0.05,mz-1.0,mz+1.0,C.dark,g);
  beam(s,[trx-0.15,y0-0.45,mz],[trx-0.15,hy+0.9,mz],0.012,C.rope,g);beam(s,[trx+0.15,y0-0.45,mz],[trx+0.15,hy+0.9,mz],0.012,C.rope,g);
  gbox(s,trx-0.35,trx+0.35,hy+0.3,hy+0.95,mz-0.18,mz+0.18,C.hook,g);gbox(s,trx-0.05,trx+0.05,hy,hy+0.3,mz-0.05,mz+0.05,C.dark,g);
  beam(s,[trx,hy,mz],[trx-1.2,hy-1.4,mz],0.012,C.rope,g);beam(s,[trx,hy,mz],[trx+1.2,hy-1.4,mz],0.012,C.rope,g);
  for(var rb=0;rb<9;rb++)s.cyl(trx-1.8,hy-1.45-(rb%3)*0.06,mz-0.1+Math.floor(rb/3)*0.08,0.025,3.6,'x',C.rebar,{n:5,g:g});
}

/* building */
var BX0=-6,BX1=6,BZ0=-4.5,BZ1=4.5,FH=3.3,NF=6;
function bldg(s){var XS=[-6,-2,2,6],ZS=[-4.5,-1.5,1.5,4.5],top=NF*FH;
  bx(s,BX0-0.6,BX1+0.6,0,0.35,BZ0-0.6,BZ1+0.6,C.concD,{tile:1.5});
  for(var f=0;f<NF;f++){var y=0.35+f*FH;
    XS.forEach(function(x){ZS.forEach(function(z){if(x>-3&&x<3&&z>0)return;bx(s,x-0.25,x+0.25,y,y+FH-0.3,z-0.25,z+0.25,C.conc,{tile:1})})});
    bx(s,BX0-0.15,BX1+0.15,y+FH-0.3,y+FH,BZ0-0.15,BZ1+0.15,f<4?C.concE:C.conc,{tile:1.5});
    if(f<3){ // finished floors: curtain wall + spandrels
      var gy0=y+0.15,gy1=y+FH-0.45;
      bx(s,BX0+0.05,BX1-0.05,gy0,gy1,BZ0+0.05,BZ0+0.15,C.glass,{tile:1});bx(s,BX0+0.05,BX1-0.05,gy0,gy1,BZ1-0.15,BZ1-0.05,C.glass,{tile:1});
      bx(s,BX0+0.05,BX0+0.15,gy0,gy1,BZ0+0.05,BZ1-0.05,C.glassD,{tile:1});bx(s,BX1-0.15,BX1-0.05,gy0,gy1,BZ0+0.05,BZ1-0.05,C.glassD,{tile:1});
      for(var mx=BX0+1.2;mx<BX1;mx+=1.2){bx(s,mx-0.04,mx+0.04,gy0,gy1,BZ0,BZ0+0.06,C.mull);bx(s,mx-0.04,mx+0.04,gy0,gy1,BZ1-0.06,BZ1,C.mull)}
      for(var mz=BZ0+1.2;mz<BZ1;mz+=1.2){bx(s,BX0,BX0+0.06,gy0,gy1,mz-0.04,mz+0.04,C.mull);bx(s,BX1-0.06,BX1,gy0,gy1,mz-0.04,mz+0.04,C.mull)}
      bx(s,BX0-0.2,BX1+0.2,y+FH-0.5,y+FH+0.05,BZ0-0.2,BZ0-0.12,C.clad,{tile:1.2});bx(s,BX0-0.2,BX1+0.2,y+FH-0.5,y+FH+0.05,BZ1+0.12,BZ1+0.2,C.clad,{tile:1.2});
      bx(s,BX0-0.2,BX0-0.12,y+FH-0.5,y+FH+0.05,BZ0-0.2,BZ1+0.2,C.clad,{tile:1.2});bx(s,BX1+0.12,BX1+0.2,y+FH-0.5,y+FH+0.05,BZ0-0.2,BZ1+0.2,C.clad,{tile:1.2});
    } else { // frame floors: edge protection + debris netting
      var ry=y+FH;[[BX0-0.15,BX1+0.15,BZ0-0.18,BZ0-0.15],[BX0-0.15,BX1+0.15,BZ1+0.15,BZ1+0.18]].forEach(function(r){bx(s,r[0],r[1],ry+0.95,ry+1.0,r[2],r[3],C.rail,{tile:1.5});bx(s,r[0],r[1],ry+0.5,ry+0.55,r[2],r[3],C.rail,{tile:1.5});
          s.faces.push({p:[[r[0],ry,r[2]],[r[1],ry,r[2]],[r[1],ry+1.0,r[2]],[r[0],ry+1.0,r[2]]],n:[0,0,-1],c:hex(C.net),l:1,a:0.28,ds:1})});
      for(var px=BX0;px<=BX1;px+=2)[BZ0-0.16,BZ1+0.16].forEach(function(z){bx(s,px-0.03,px+0.03,ry,ry+1.0,z-0.03,z+0.03,C.rail)});
      if(f===3){bx(s,BX0+0.3,-2.3,y,y+FH-0.3,BZ1-0.25,BZ1-0.05,C.block,{tile:0.8});bx(s,2.3,BX1-0.3,y,y+1.6,BZ1-0.25,BZ1-0.05,C.block,{tile:0.8})}
    }
  }
  // core with jump-form platform
  bx(s,-2.6,2.6,0.35,top+3.3,0.6,4.4,C.concD,{tile:1.5});
  bx(s,-2.9,2.9,top+2.4,top+3.6,0.3,4.7,C.craneY,{tile:1});bx(s,-2.95,2.95,top+3.6,top+4.6,0.25,0.3,C.rail,{tile:1.2});
  // top level: columns in formwork + slab formwork on props with rebar
  var y=0.35+NF*FH;
  XS.forEach(function(x){ZS.forEach(function(z){if(x>-3&&x<3&&z>0)return;var form=z<0;bx(s,x-(form?0.32:0.25),x+(form?0.32:0.25),y,y+(form?2.9:FH-0.3),z-(form?0.32:0.25),z+(form?0.32:0.25),form?C.ply:C.conc,{tile:1});
    if(!form)for(var i=0;i<4;i++)s.cyl(x+(i%2?0.15:-0.15),y+FH-0.3,z+(i<2?0.15:-0.15),0.02,1.2,'y',C.rebar,{n:4})})});
  for(var x=BX0+0.6;x<BX1;x+=1.2)for(var z=-0.4;z<BZ1;z+=1.2){if(x>-3&&x<3&&z>0.3)continue;s.cyl(x,y,z,0.035,FH-0.55,'y',C.prop,{n:5})}
  bx(s,BX0,BX1,y+FH-0.55,y+FH-0.4,-0.6,BZ1+0.1,C.h20,{tile:1.2});
  bx(s,BX0-0.1,BX1+0.1,y+FH-0.4,y+FH-0.35,-0.6,BZ1+0.1,C.ply,{tile:1.2});
  for(z=-0.5;z<BZ1;z+=0.25)s.cyl(BX0,y+FH-0.3,z,0.012,6,'x',C.rebar,{n:4});
  for(x=BX0;x<0;x+=0.25)s.cyl(x,y+FH-0.28,-0.5,0.012,BZ1+0.5,'z',C.rebar,{n:4});
}

/* material/passenger hoist */
function hoist(s,x,z,H){var a=0.45;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){s.cyl(x+q[0]*a,0.35,z+q[1]*a,0.04,H,'y',C.craneY,{n:5})});
  for(var y=0.35;y<H;y+=1.5){beam(s,[x-a,y,z+a],[x+a,y+1.5,z+a],0.025,C.craneD);beam(s,[x-a,y,z-a],[x+a,y+1.5,z-a],0.025,C.craneD)}
  for(y=4;y<H;y+=6.6)beam(s,[x,y,z-a],[x,y,BZ1+0.2],0.04,C.dark);
  bx(s,x-1.6,x-0.5,8.0,10.4,z-0.8,z+0.8,C.white,{tile:0.8});bx(s,x-1.62,x-1.58,8.6,9.8,z-0.6,z+0.6,C.glass);bx(s,x-0.55,x-0.45,8.0,10.4,z-0.8,z+0.8,C.craneY);
  bx(s,x-2,x+1,0.35,0.6,z-1.2,z+1.2,C.dark,{tile:1})}

/* site cabins */
function cabins(s,x0,z0){for(var lv=0;lv<2;lv++)for(var i=0;i<2;i++){var x=x0+i*3.1,y=lv*2.75,z=z0;
    bx(s,x,x+3.0,y,y+2.65,z,z+6.0,C.cabin,{tile:1});bx(s,x-0.02,x+3.02,y+2.4,y+2.65,z-0.02,z+6.02,C.cabinB,{tile:1.5});
    for(var w=z+0.8;w<z+5.5;w+=1.8){bx(s,x+3.0,x+3.03,y+1.0,y+2.0,w,w+1.0,C.glass)}
    bx(s,x+3.0,x+3.03,y+0.1,y+2.1,z+5.0,z+5.8,'#8E979F')}
  bx(s,x0+6.2,x0+7.4,2.65,2.75,z0+4.5,z0+6.0,C.steel);for(var st=0;st<8;st++)bx(s,x0+6.2,x0+7.4,st*0.33,st*0.33+0.05,z0+4.5-st*0.32,z0+4.8-st*0.32,C.steel);
  s.text(x0+6.22,3.5,z0+3,4.0,0.42,'+x','مكتب الموقع — عمران الجزيرة','#1A1A1A',{w:700})}

window.buildHeroPro=function(s){
  s.clear();
  var SX0=-16,SX1=13,SZ0=-12,SZ1=11,HH=2.4;
  flat(s,SX0,SX1,SZ0,SZ1,0,C.ground,0.1);
  // hoarding with branding (one-sided inner faces)
  var kW=hex(C.white),kR=hex('#E3E6E8'),kB=hex('#2B3540'),kA=hex(C.acc),kK=hex('#6B747C');
  function seg(a,b,y0,y1,side,col,zb){var p;
    if(side==='B')p=[[b,y0,SZ1],[a,y0,SZ1],[a,y1,SZ1],[b,y1,SZ1]];else if(side==='F')p=[[a,y0,SZ0],[b,y0,SZ0],[b,y1,SZ0],[a,y1,SZ0]];
    else if(side==='R')p=[[SX0,y0,a],[SX0,y0,b],[SX0,y1,b],[SX0,y1,a]];else p=[[SX1,y0,b],[SX1,y0,a],[SX1,y1,a],[SX1,y1,b]];
    var n=side==='B'?[0,0,-1]:side==='F'?[0,0,1]:side==='R'?[1,0,0]:[-1,0,0];s.faces.push({p:p,n:n,c:col,l:1,a:1,zb:zb||0})}
  function run(side,a0,a1){for(var a=a0;a<a1-1e-6;a+=1.2){var b=Math.min(a+1.2,a1);
      seg(a,b,0,0.3,side,kK);seg(a,b,0.3,HH-0.32,side,kW);seg(a,b,HH-0.32,HH-0.06,side,kB);seg(a,b,HH-0.06,HH,side,kA);
      for(var r=a+0.1;r<b-0.01;r+=0.3)seg(r,Math.min(r+0.1,b),0.32,HH-0.34,side,kR,0.2)}}
  run('B',SX0,SX1);run('F',SX0,SX1);run('R',SZ0,SZ1);run('L',SZ0,SZ1);
  var nm='عمران الجزيرة للمقاولات',fnt='"Readex Pro",Tajawal,Tahoma,sans-serif';
  [-9,5].forEach(function(x){s.text(x,0.95,SZ0+0.01,8,0.9,'+z',nm,'#1A1A1A',{font:fnt,zb:2});s.text(x,0.95,SZ1-0.01,8,0.9,'-z',nm,'#1A1A1A',{font:fnt,zb:2})});
  [-5,5].forEach(function(z){s.text(SX0+0.01,0.95,z,8,0.9,'+x',nm,'#1A1A1A',{font:fnt,zb:2});s.text(SX1-0.01,0.95,z,8,0.9,'-x',nm,'#1A1A1A',{font:fnt,zb:2})});
  bldg(s);
  hoist(s,3.5,BZ1+1.2,NF*FH+3);
  var mx=-11,mz=-6.5;crane(s,mx,mz,NF*FH+10);
  s.group('jib',mx,mz,function(t){return Math.sin(t*0.35)*0.55+0.25});
  cabins(s,-15.5,1.0);
  // rebar & formwork storage
  for(var k=0;k<12;k++)s.cyl(7.5,0.12+(k%3)*0.1,-9.5+Math.floor(k/3)*0.12,0.04,4.5,'x',C.rebar,{n:5});
  [[7.4,-9.7],[7.4,-8.9],[11.6,-9.7],[11.6,-8.9]].forEach(function(q){bx(s,q[0]-0.1,q[0]+0.1,0,0.1,q[1]-0.3,q[1]+0.3,C.dark)});
  for(k=0;k<6;k++)bx(s,7.5,10.5,k*0.05,k*0.05+0.04,-6.5,-5.3,C.ply,{tile:1.5});
  s.dist=62;s.ty=12;s.pitch=0.33;
};
})();
