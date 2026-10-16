/* Structural works — RC frame under construction, staged cut-away. metres, camera from -z */
(function(){
var C={ground:'#D9CDB4',soil:'#B59B74',soilD:'#9C8460',pit:'#C2AE8A',blind:'#B8B2A6',conc:'#C9CCCE',concD:'#B6BABD',concN:'#D5D7D8',bit:'#2E3033',
  rebar:'#8A5235',rebarD:'#6E3F28',ply:'#C9A066',plyD:'#B38A55',h20:'#E2B33C',prop:'#E0A21A',propD:'#B57F12',block:'#B9B6AF',block2:'#ADAAA3',
  scaf:'#C9CED2',board:'#B9884D',white:'#F4F5F6',dark:'#2B3136',acc:'#F2A900'};
function hex(c){c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function bx(s,x0,x1,y0,y1,z0,z1,col,o){s.box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,col,o||{tile:0.6})}
function flat(s,x0,x1,z0,z1,y,col,layer){s.poly([[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],col,{layer:layer})}
function bar(s,x,y,z,L,ax,r,col){s.cyl(x,y,z,r||0.012,L,ax,col||C.rebar,{n:5})}
var XS=[-4,0,4],ZS=[-3,0,3],CW=0.4;

/* pit faces: one-sided, visible only from inside */
function pitWalls(s,x0,x1,z0,z1,y0,y1){var k=hex(C.soil),kd=hex(C.soilD),st=1;
  function push(p,n,c){s.faces.push({p:p,n:n,c:c,l:1,a:1})}
  for(var x=x0;x<x1-1e-6;x+=st){var xa=Math.min(x+st,x1);push([[x,y0,z0],[xa,y0,z0],[xa,y1,z0],[x,y1,z0]],[0,0,1],k);push([[xa,y0,z1],[x,y0,z1],[x,y1,z1],[xa,y1,z1]],[0,0,-1],kd)}
  for(var z=z0;z<z1-1e-6;z+=st){var za=Math.min(z+st,z1);push([[x0,y0,za],[x0,y0,z],[x0,y1,z],[x0,y1,za]],[1,0,0],k);push([[x1,y0,z],[x1,y0,za],[x1,y1,za],[x1,y1,z]],[-1,0,0],k)}}

/* isolated footing: blinding + footing + neck; state 'done' | 'coated' | 'cage' */
function footing(s,x,z,state){var F=0.9,B=-1.6;
  bx(s,x-F-0.1,x+F+0.1,B,B+0.1,z-F-0.1,z+F+0.1,C.blind,{tile:0.6});
  if(state==='cage'){
    for(var i=-F+0.1;i<=F-0.09;i+=0.2){bar(s,x-F+0.05,B+0.17,z+i,2*F-0.1,'x');bar(s,x+i,B+0.2,z-F+0.05,2*F-0.1,'z')}
    for(i=-F+0.1;i<=F-0.09;i+=0.2){bar(s,x-F+0.05,B+0.52,z+i,2*F-0.1,'x');bar(s,x+i,B+0.55,z-F+0.05,2*F-0.1,'z')}
    for(i=-F+0.15;i<=F-0.1;i+=0.45){bar(s,x+i,B+0.15,z-F+0.06,0.45,'y');bar(s,x+i,B+0.15,z+F-0.06,0.45,'y')}
    bx(s,x-F-0.03,x+F+0.03,B+0.1,B+0.7,z+F,z+F+0.03,C.ply,{tile:0.5});bx(s,x-F-0.03,x-F,B+0.1,B+0.7,z-F,z+F,C.ply,{tile:0.5});bx(s,x+F,x+F+0.03,B+0.1,B+0.7,z-F,z+F,C.ply,{tile:0.5});
    for(i=0;i<4;i++){var dx=(i%2?1:-1)*0.12,dz=(i<2?1:-1)*0.12;bar(s,x+dx,B+0.15,z+dz,2.2,'y',0.016)}
    for(var yy=B+0.25;yy<B+2.2;yy+=0.15){bx(s,x-0.14,x+0.14,yy,yy+0.012,z-0.14,z-0.128,C.rebarD);bx(s,x-0.14,x+0.14,yy,yy+0.012,z+0.128,z+0.14,C.rebarD);bx(s,x-0.14,x-0.128,yy,yy+0.012,z-0.14,z+0.14,C.rebarD);bx(s,x+0.128,x+0.14,yy,yy+0.012,z-0.14,z+0.14,C.rebarD)}
    return}
  var col=state==='coated'?C.bit:C.conc;
  bx(s,x-F,x+F,B+0.1,B+0.7,z-F,z+F,col,{tile:0.5});
  bx(s,x-0.25,x+0.25,B+0.7,-0.3,z-0.25,z+0.25,col,{tile:0.4});
}
function tieBeam(s,x0,z0,x1,z1,col){var w=0.15;if(z0===z1)bx(s,Math.min(x0,x1)+0.25,Math.max(x0,x1)-0.25,-0.7,-0.2,z0-w,z0+w,col||C.conc,{tile:0.5});else bx(s,x0-w,x0+w,-0.7,-0.2,Math.min(z0,z1)+0.25,Math.max(z0,z1)-0.25,col||C.conc,{tile:0.5})}

/* RC column, optionally in formwork */
function column(s,x,z,y0,y1,form){if(!form){bx(s,x-CW/2,x+CW/2,y0,y1,z-CW/2,z+CW/2,C.concN,{tile:0.5});return}
  var W=CW/2+0.04;bx(s,x-W,x+W,y0,y1,z-W,z+W,C.ply,{tile:0.5});
  for(var y=y0+0.25;y<y1;y+=0.55){bx(s,x-W-0.05,x+W+0.05,y,y+0.08,z-W-0.04,z-W,C.dark);bx(s,x-W-0.05,x+W+0.05,y,y+0.08,z+W,z+W+0.04,C.dark);bx(s,x-W-0.04,x-W,y,y+0.08,z-W-0.05,z+W+0.05,C.dark);bx(s,x+W,x+W+0.04,y,y+0.08,z-W-0.05,z+W+0.05,C.dark)}
  s.cyl(x-0.9,y0,z,0.03,(y1-y0)*0.7,'y',C.prop,{n:6});bx(s,x-1.0,x-0.8,y0,y0+0.02,z-0.1,z+0.1,C.propD);bx(s,x-0.9,x-W,y0+(y1-y0)*0.7-0.04,y0+(y1-y0)*0.7,z-0.03,z+0.03,C.prop)}

/* slab + drop beams */
function slab(s,y,x0,x1,z0,z1){bx(s,x0,x1,y,y+0.2,z0,z1,C.conc,{tile:0.9});
  XS.forEach(function(x){bx(s,x-0.15,x+0.15,y-0.4,y,z0+0.05,z1-0.05,C.concD,{tile:0.7})});
  ZS.forEach(function(z){bx(s,x0+0.05,x1-0.05,y-0.4,y,z-0.15,z+0.15,C.concD,{tile:0.7})});}

/* block infill wall between two columns along x */
function blockWall(s,x0,x1,z,y0,y1,win){var bw=0.4,bh=0.2;for(var r=0,y=y0;y<y1-0.01;y+=bh,r++){var off=r%2?bw/2:0,cuts=[x0];for(var xb=x0+bw-off;xb<x1;xb+=bw)cuts.push(xb);cuts.push(x1);
    for(var c=0;c<cuts.length-1;c++){var a=cuts[c],b=cuts[c+1],m=(a+b)/2;if(win&&y>=win[2]&&y<win[3]&&m>win[0]&&m<win[1])continue;bx(s,a+0.004,b-0.004,y+0.004,y+bh-0.004,z-0.1,z+0.1,(c+r)%3?C.block:C.block2,{nosub:1})}}
  if(win){bx(s,win[0]-0.1,win[1]+0.1,win[3],win[3]+0.2,z-0.1,z+0.1,C.concN)}}

window.buildStructPro=function(s){
  s.clear();
  var X0=-4.4,X1=4.4,Z0=-3.4,Z1=3.4,F1=3.2,F2=6.4,PZ1=1.2;
  var px0=-5.2,px1=5.2,pz0=-4.3,pz1=PZ1;
  flat(s,-13,13,pz1,10,0,C.ground,0.1);
  // ground around the pit as depth-sorted tiles so buried parts stay hidden
  function gtiles(x0,x1,z0,z1){var k=hex(C.ground);for(var x=x0;x<x1-1e-6;x+=1)for(var z=z0;z<z1-1e-6;z+=1){var xa=Math.min(x+1,x1),za=Math.min(z+1,z1);s.faces.push({p:[[x,0,za],[xa,0,za],[xa,0,z],[x,0,z]],n:[0,1,0],c:k,l:1,a:1})}}
  gtiles(-13,13,-12,pz0);gtiles(-13,px0,pz0,pz1);gtiles(px1,13,pz0,pz1);
  flat(s,px0,px1,pz0,pz1,-1.6,C.pit,0.1);
  pitWalls(s,px0,px1,pz0,pz1,-1.6,0);
  // safety barrier at pit edge
  for(var bxp=px0;bxp<=px1+0.01;bxp+=1.3){s.cyl(bxp,0,pz0-0.25,0.03,1.0,'y',C.white,{n:6})}
  bx(s,px0,px1,0.85,0.92,pz0-0.28,pz0-0.22,C.acc,{tile:1});bx(s,px0,px1,0.45,0.52,pz0-0.28,pz0-0.22,C.white,{tile:1});

  // foundations
  ZS.forEach(function(z,zi){XS.forEach(function(x,xi){var st=zi===2?'coated':(zi===0&&xi===2?'cage':(zi===0?'done':'coated'));footing(s,x,z,st)})});
  tieBeam(s,-4,-3,0,-3);tieBeam(s,-4,0,0,0,C.bit);tieBeam(s,0,0,4,0,C.bit);tieBeam(s,-4,-3,-4,0);tieBeam(s,0,-3,0,0);tieBeam(s,4,-3,4,0,C.bit);
  bx(s,X0,X1,-0.15,0,PZ1,Z1,C.concD,{tile:1});

  // ground floor columns + block walls
  ZS.forEach(function(z){XS.forEach(function(x){column(s,x,z,z<PZ1?-0.3:0,F1-0.4)})});
  blockWall(s,-3.8,-0.2,3,0,F1-0.4,[-2.6,-1.4,0.9,2.1]);blockWall(s,0.2,3.8,3,0,F1-0.4,[1.4,2.6,0.9,2.1]);

  // first floor slab
  slab(s,F1,X0,X1,Z0,Z1);

  // second floor columns: back+middle cast, front row in formwork
  ZS.forEach(function(z,zi){XS.forEach(function(x){column(s,x,z,F1+0.2,F2-0.4,zi===0)})});

  // roof slab formwork: props, H20 beams, plywood deck, rebar
  var dz1=Z1,dz0=-1.2,y0=F1+0.2,ydeck=F2-0.05;
  for(var x=X0+0.4;x<=X1-0.3;x+=1.0)for(var z=dz0+0.3;z<=dz1-0.2;z+=1.0){
    if(Math.abs(x-Math.round(x/4)*4)<0.35&&Math.abs(z-Math.round(z/3)*3)<0.35)continue;
    s.cyl(x,y0,z,0.028,ydeck-0.36-y0,'y',C.prop,{n:6});bx(s,x-0.08,x+0.08,y0,y0+0.015,z-0.08,z+0.08,C.propD);bx(s,x-0.06,x+0.06,ydeck-0.38,ydeck-0.34,z-0.06,z+0.06,C.propD)}
  for(z=dz0+0.3;z<=dz1-0.2;z+=1.0)bx(s,X0,X1,ydeck-0.34,ydeck-0.18,z-0.04,z+0.04,C.h20,{tile:0.8});
  for(x=X0+0.2;x<=X1;x+=0.5)bx(s,x-0.04,x+0.04,ydeck-0.18,ydeck-0.02,dz0,dz1,C.h20,{tile:0.8});
  bx(s,X0,X1,ydeck-0.02,ydeck,dz0,dz1,C.ply,{tile:0.6});
  for(x=X0;x<X1;x+=1.22)bx(s,x-0.005,x+0.005,ydeck,ydeck+0.002,dz0,dz1,C.plyD,{tile:1});
  bx(s,X0-0.03,X1+0.03,ydeck,ydeck+0.25,dz1,dz1+0.03,C.ply,{tile:0.6});bx(s,X0-0.03,X0,ydeck,ydeck+0.25,dz0,dz1,C.ply,{tile:0.6});bx(s,X1,X1+0.03,ydeck,ydeck+0.25,dz0,dz1,C.ply,{tile:0.6});
  var mx0=X0+0.1,mx1=1.6;
  for(z=dz0+0.1;z<dz1-0.05;z+=0.2)bar(s,mx0,ydeck+0.04,z,mx1-mx0,'x',0.01);
  for(x=mx0;x<mx1;x+=0.2)bar(s,x,ydeck+0.06,dz0+0.05,dz1-dz0-0.1,'z',0.01);
  ZS.forEach(function(zz){if(zz<dz0)return;[[ydeck+0.08,-0.1],[ydeck+0.08,0.1],[ydeck+0.2,-0.1],[ydeck+0.2,0.1]].forEach(function(q){bar(s,mx0,q[0],zz+q[1],mx1-mx0,'x',0.016,C.rebarD)});
    for(var sx=mx0+0.1;sx<mx1;sx+=0.2){bx(s,sx,sx+0.012,ydeck+0.07,ydeck+0.22,zz-0.11,zz-0.1,C.rebarD);bx(s,sx,sx+0.012,ydeck+0.07,ydeck+0.22,zz+0.1,zz+0.11,C.rebarD)}});
  ZS.forEach(function(z){XS.forEach(function(x){if(z<dz0)return;for(var i=0;i<4;i++){var ox=(i%2?1:-1)*0.13,oz=(i<2?1:-1)*0.13;bar(s,x+ox,ydeck,z+oz,1.1,'y',0.016)}})});
  for(var rb=0;rb<8;rb++)bar(s,2.0,ydeck+0.03+(rb%2)*0.03,2.2+rb*0.04,2.2,'x',0.016);

  // scaffolding on back face
  var sz0=Z1+0.35,sz1=Z1+1.25;
  for(x=X0;x<=X1+0.01;x+=1.76){s.cyl(x,0,sz0,0.024,F2+1.0,'y',C.scaf,{n:6});s.cyl(x,0,sz1,0.024,F2+1.0,'y',C.scaf,{n:6});bx(s,x-0.08,x+0.08,0,0.02,sz0-0.08,sz0+0.08,C.dark);bx(s,x-0.08,x+0.08,0,0.02,sz1-0.08,sz1+0.08,C.dark)}
  for(var ly=1.0;ly<=F2+0.9;ly+=2.0){s.cyl(X0,ly,sz0,0.02,X1-X0,'x',C.scaf,{n:6});s.cyl(X0,ly,sz1,0.02,X1-X0,'x',C.scaf,{n:6});
    if(ly>1)bx(s,X0,X1,ly-1.0,ly-0.96,sz0,sz1,C.board,{tile:0.6});s.cyl(X0,ly+0.5,sz1,0.018,X1-X0,'x',C.acc,{n:6})}

  // site hoarding (2.4 m corrugated panels) with company branding; one-sided so the near side never hides the works
  var HX0=-7.4,HX1=7.4,HZ0=-5.8,HZ1=6.0,HH=2.4,kW=hex(C.white),kR=hex('#E3E6E8'),kB=hex('#2B3540'),kA=hex(C.acc),kK=hex('#6B747C');
  function seg(a,b,y0,y1,side,col,zb){var p;
    if(side==='B')p=[[b,y0,HZ1],[a,y0,HZ1],[a,y1,HZ1],[b,y1,HZ1]];else if(side==='F')p=[[a,y0,HZ0],[b,y0,HZ0],[b,y1,HZ0],[a,y1,HZ0]];
    else if(side==='R')p=[[HX0,y0,a],[HX0,y0,b],[HX0,y1,b],[HX0,y1,a]];else p=[[HX1,y0,b],[HX1,y0,a],[HX1,y1,a],[HX1,y1,b]];
    var n=side==='B'?[0,0,-1]:side==='F'?[0,0,1]:side==='R'?[1,0,0]:[-1,0,0];s.faces.push({p:p,n:n,c:col,l:1,a:1,zb:zb||0})}
  function run(side,a0,a1){for(var a=a0;a<a1-1e-6;a+=0.6){var b=Math.min(a+0.6,a1);
      seg(a,b,0,0.3,side,kK);seg(a,b,0.3,HH-0.32,side,kW);seg(a,b,HH-0.32,HH-0.06,side,kB);seg(a,b,HH-0.06,HH,side,kA);
      for(var r=a+0.075;r<b-0.01;r+=0.15)seg(r,Math.min(r+0.05,b),0.32,HH-0.34,side,kR,0.15)}
    for(var p=a0;p<=a1+1e-6;p+=2.4)seg(p-0.04,p+0.04,0,HH,side,kK,0.3)}
  run('B',HX0,HX1);run('F',HX0,HX1);run('R',HZ0,HZ1);run('L',HZ0,HZ1);
  var nm='عمران الجزيرة للمقاولات',fnt='"Readex Pro",Tajawal,Tahoma,sans-serif';
  [-4.2,3.2].forEach(function(x){s.text(x,1.15,HZ1-0.01,4.2,0.55,'-z',nm,'#1A1A1A',{font:fnt,zb:1.4});s.text(x,0.8,HZ1-0.01,3.2,0.24,'-z','OMRAN AL-JAZEERA CONTRACTING','#2B3540',{dir:'ltr',w:600,zb:1.4})});
  s.text(-0.5,1.45,HZ1-0.01,1.9,0.2,'-z','السلامة أولاً',C.white,{zb:1.4});
  [-2.6,3.0].forEach(function(z){s.text(HX0+0.01,1.15,z,4.0,0.5,'+x',nm,'#1A1A1A',{font:fnt,zb:1.4});s.text(HX0+0.01,0.8,z,3.2,0.22,'+x','موقع عمل — يمنع دخول غير المختصين','#B3261E',{w:700,zb:1.4})});
  [-2.6,3.0].forEach(function(z){s.text(HX1-0.01,1.15,z,4.0,0.5,'-x',nm,'#1A1A1A',{font:fnt,zb:1.4})});
  [-4.0,3.6].forEach(function(x){s.text(x,1.15,HZ0+0.01,4.0,0.5,'+z',nm,'#1A1A1A',{font:fnt,zb:1.4})});
  // safety sign on back hoarding
  var gx=-0.5;seg(gx-0.95,gx+0.95,1.35,1.75,'B',hex('#B3261E'),1.2);seg(gx-0.95,gx+0.95,0.55,1.3,'B',hex('#F2C230'),1.2);
  s.text(gx,0.95,HZ1-0.01,1.8,0.2,'-z','ارتدِ معدات الوقاية الشخصية','#1A1A1A',{w:700,zb:1.4});s.text(gx,0.66,HZ1-0.01,1.4,0.14,'-z','PPE REQUIRED','#1A1A1A',{dir:'ltr',w:700,zb:1.4});

  s.yaw=2.55;s.pitch=0.45;s.ty=2.2;s.dist=26;
};
})();
