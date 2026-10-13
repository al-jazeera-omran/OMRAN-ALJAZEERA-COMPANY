(function(){
var C={teal:'#2E3B47',tealL:'#9AA6B2',glass:'#A9C2D3',amber:'#F2A900',ochre:'#F1D3A1',pil:'#E3983A',conc:'#D8DEE3',concD:'#B9C3CC',white:'#F6F8F9',steel:'#AAB6C2',red:'#E5483A',blue:'#2F86D6',sand:'#EBDCC0',sand2:'#E2CFAB',grey:'#8E9AA6',dark:'#4A5A66',green:'#5DBB7A'};
window.C3=C;

function wallRun(s,x0,z0,x1,z1,h,o){o=o||{};var len=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(len/(o.bay||1.3))),dx=(x1-x0)/n,dz=(z1-z0)/n,alongX=Math.abs(dx)>Math.abs(dz);
  for(var i=0;i<n;i++){var cx=x0+dx*(i+.5),cz=z0+dz*(i+.5);
    if(o.gap&&o.gap(cx,cz))continue;
    s.box(cx,0,cz,alongX?Math.abs(dx):0.14,h,alongX?0.14:Math.abs(dz),C.ochre,{tile:2});}
  for(i=0;i<=n;i++){var px=x0+dx*i,pz=z0+dz*i;if(o.gap&&o.gap(px,pz)&&o.gap(px+dx*.3,pz+dz*.3)&&o.gap(px-dx*.3,pz-dz*.3))continue;s.box(px,0,pz,0.26,h+0.12,0.26,C.pil,{tile:2})}}

/* HERO: tower under construction inside walled site */
window.buildHero=function(s){
  s.clear();
  s.disc(0,0,0,10.5,C.sand,{layer:0});
  s.disc(0,0.01,0,10.5,C.sand2,{layer:0,a:0});
  s.box(0,0,0,9.6,0.05,9.6,'#E7ECEF',{layer:0.5,nobottom:1,tile:9});
  // shadow of tower
  s.faces.push({p:[[-1.8,0.06,1.9],[1.8,0.06,1.9],[4.4,0.06,4.2],[0.8,0.06,4.2]].map(function(p){return p}),n:[0,1,0],c:[30,50,60],l:0.6,a:0.10,flat:1});
  // boundary wall (their speciality)
  var H=0.75,R=6.4,gate=function(x,z){return z>R-0.3&&Math.abs(x)<1.4};
  wallRun(s,-R,R,R,R,H,{gap:gate});wallRun(s,R,R,R,-R,H);wallRun(s,R,-R,-R,-R,H);wallRun(s,-R,-R,-R,R,H);
  // gate leaf
  for(var g=-1.2;g<=1.21;g+=0.2)s.box(g,0,R,0.05,0.7,0.05,C.grey);
  s.box(0,0.66,R,2.5,0.06,0.07,C.dark);
  // tower
  var fh=0.62,W=3.6,done=7,tot=11;
  for(var i=0;i<tot;i++){var y=i*fh;
    s.box(0,y,0,W+0.2,0.1,W+0.2,i<done?C.white:C.conc,{tile:0.9});
    if(i<done){s.box(0,y+0.1,0,W-0.1,fh-0.1,W-0.1,C.glass,{tile:0.9});
      for(var m=-1;m<=1;m+=1){var p=m*1.15;
        s.box(p,y+0.1,W/2-0.02,0.07,fh-0.1,0.08,C.white);s.box(p,y+0.1,-W/2+0.02,0.07,fh-0.1,0.08,C.white);
        s.box(W/2-0.02,y+0.1,p,0.08,fh-0.1,0.07,C.white);s.box(-W/2+0.02,y+0.1,p,0.08,fh-0.1,0.07,C.white);}
    }else if(i<tot-1){for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++)s.box(a*1.65,y+0.1,b*1.65,0.18,fh-0.1,0.18,C.concD);}
    else{for(a=-1;a<=1;a++)for(b=-1;b<=1;b++){s.box(a*1.65,y+0.1,b*1.65,0.18,0.25,0.18,C.concD);s.box(a*1.65+0.05,y+0.35,b*1.65,0.03,0.35,0.03,C.amber);s.box(a*1.65-0.05,y+0.35,b*1.65,0.03,0.35,0.03,C.amber)}}
  }
  // roof parapet band teal on top completed floor
  s.box(0,done*fh,0,W+0.24,0.12,W+0.24,C.teal,{tile:0.9});
  // tower crane
  var mx=3.6,mz=-3.4,mh=9.2;
  s.box(mx,0,mz,0.9,0.3,0.9,C.conc);
  for(var k=0;k<mh;k+=0.8){s.box(mx,k+0.3,mz,0.34,0.72,0.34,C.amber);s.box(mx,k+1.02,mz,0.4,0.08,0.4,'#D98A10')}
  s.group('jib',mx,mz,function(t){return Math.sin(t*0.6)*0.5+0.4});
  var top=mh+0.3;
  s.box(mx,top,mz,0.5,0.45,0.5,C.white,{g:'jib'});
  s.box(mx-3.4,top+0.1,mz,6.4,0.22,0.22,C.amber,{g:'jib'});
  s.box(mx+1.4,top+0.1,mz,2.4,0.22,0.3,C.amber,{g:'jib'});
  s.box(mx+2.3,top-0.25,mz,0.6,0.5,0.55,C.grey,{g:'jib'});
  s.box(mx,top+0.45,mz,0.18,0.9,0.18,C.amber,{g:'jib'});
  s.box(mx-4.6,top-2.8,mz,0.03,2.9,0.03,C.dark,{g:'jib'});
  s.box(mx-4.6,top-3.15,mz,0.5,0.32,0.5,C.teal,{g:'jib'});
  // site cabins + palms
  s.box(-4.6,0,-4.8,1.8,0.7,0.9,C.white);s.box(-4.6,0.7,-4.8,1.9,0.08,1.0,C.teal);
  s.box(-4.6,0,-3.6,1.8,0.7,0.9,C.white);s.box(-4.6,0.7,-3.6,1.9,0.08,1.0,C.teal);
  function palm(x,z){s.cyl(x,0,z,0.09,1.6,'y','#9B7A52',{n:6});for(var q=0;q<5;q++){var an=q/5*Math.PI*2;s.box(x+Math.cos(an)*0.42,1.55,z+Math.sin(an)*0.42,0.8,0.06,0.24,C.green)}}
  palm(4.9,4.9);palm(-4.9,4.9);palm(5.2,1.5);
  // trucks
  s.box(2.2,0,4.2,1.4,0.5,0.6,C.white);s.box(1.3,0,4.2,0.5,0.62,0.6,C.teal);
  s.cyl(3.0,0.55,4.2,0.32,-1.2,'x',C.steel,{n:10});
};

/* capability models */
window.buildModel=function(s,kind){
  s.clear();
  if(kind==='struct'){
    s.box(0,-1.4,0,8,0.05,7,C.sand,{layer:0,nobottom:1,tile:8});
    var xs=[-2.4,0,2.4],zs=[-2,0,2],fl=1.5;
    xs.forEach(function(x){zs.forEach(function(z){s.box(x,-1.35,z,1.1,0.45,1.1,C.concD);s.box(x,-0.9,z,0.45,0.9,0.45,C.conc);
      for(var r=-0.4;r<=0.41;r+=0.2)s.box(x+r,-1.08,z,0.03,0.03,1.0,C.amber)})});
    for(var f=0;f<3;f++){var y=f*fl;
      xs.forEach(function(x){zs.forEach(function(z){s.box(x,y,z,0.3,fl,0.3,C.conc)})});
      if(f<2){s.box(0,y+fl-0.18,0,5.3,0.18,4.5,C.white,{tile:0.8});
        xs.forEach(function(x){s.box(x,y+fl-0.4,0,0.3,0.22,4.3,C.concD)});zs.forEach(function(z){s.box(0,y+fl-0.4,z,5.1,0.22,0.3,C.concD)});}
    }
    s.box(0,-0.02,0,5.3,0.18,4.5,C.white,{tile:0.8});
    xs.forEach(function(x){zs.forEach(function(z){for(var a=-1;a<=1;a+=2)for(var b=-1;b<=1;b+=2)s.box(x+a*0.08,3*fl,z+b*0.08,0.03,0.5,0.03,C.amber)})});
    // block infill on ground floor back
    s.box(-1.2,0.16,-2,2.1,1.1,0.2,C.ochre);s.box(1.2,0.16,-2,2.1,1.1,0.2,C.ochre);
    s.ty=1.1;s.dist=19;
  }
  if(kind==='mep'){
    s.box(0,-0.2,0,7,0.2,5.6,C.conc,{layer:0.5,tile:1});
    s.box(0,0,-2.8,7,3.2,0.2,C.white,{tile:1.2});s.box(-3.5,0,0,0.2,3.2,5.6,C.white,{tile:1.2});
    // cable tray + cables
    s.box(0.2,2.6,-2.0,6.4,0.06,0.6,C.amber);s.box(0.2,2.66,-2.27,6.4,0.12,0.04,C.amber);s.box(0.2,2.66,-1.73,6.4,0.12,0.04,C.amber);
    ['#222','#333','#C0392B','#2F5D8A'].forEach(function(c,i){s.cyl(-3.0,2.72,-2.15+i*0.1,0.035,6.4,'x',c,{n:6})});
    s.box(-3.2,0.4,-1.5,0.06,2.2,0.5,C.amber);
    // panel
    s.box(-3.25,0.7,-0.6,0.28,1.5,1.0,C.steel);s.box(-3.1,0.75,-0.6,0.02,1.4,0.9,'#C9D2DA');s.box(-3.08,1.9,-0.6,0.02,0.12,0.9,C.amber);
    for(var c=0;c<3;c++)s.cyl(-3.25,2.2,-0.9+c*0.3,0.04,0.45,'y',C.grey,{n:6});
    // water pipes
    s.cyl(-3.3,2.15,-2.55,0.08,6.6,'x',C.blue,{n:10});s.cyl(-3.3,1.92,-2.55,0.07,6.6,'x','#E86A2E',{n:10});
    s.cyl(-3.3,0.35,-2.5,0.14,6.6,'x',C.grey,{n:10});
    for(var v=-2;v<=2;v+=2){s.cyl(v,0.35,-2.55,0.06,1.6,'y',C.grey,{n:8})}
    // duct
    s.box(1.6,2.55,0.4,0.8,0.42,5.0,'#CFD8E0',{tile:1});
    for(var d=-1.2;d<=2.2;d+=1.7){s.box(1.6,2.32,d,0.5,0.13,0.5,C.white)}
    // water heater + pump
    s.cyl(2.9,0,-2.2,0.35,1.3,'y',C.white,{n:14});s.box(2.9,1.3,-2.2,0.3,0.1,0.3,C.teal);
    s.box(-1.4,0,-1.9,1.0,0.25,0.6,C.dark);s.cyl(-1.75,0.45,-1.9,0.2,0.7,'x',C.blue,{n:12});
    s.ty=1.3;s.dist=13.5;
  }
  if(kind==='fire'){
    s.box(0,-0.2,0,7,0.2,5.6,C.conc,{layer:0.5,tile:1});
    s.cyl(-3.0,0,-2.3,0.12,2.9,'y',C.red,{n:10});
    s.box(-3.0,0.9,-2.3,0.35,0.45,0.35,C.red);s.cyl(-3.0,1.1,-2.1,0.09,0.25,'z',C.amber,{n:8});
    s.cyl(-3.0,2.8,-2.3,0.1,6.0,'x',C.red,{n:10});
    for(var bx=-2.2;bx<=2.4;bx+=1.15){s.cyl(bx,2.8,-2.3,0.06,4.6,'z',C.red,{n:8});
      for(var bz=-1.6;bz<=2.0;bz+=1.15){s.cyl(bx,2.62,bz,0.035,0.18,'y',C.amber,{n:6});s.cyl(bx,2.6,bz,0.09,0.02,'y','#C9A227',{n:8})}}
    // pump skid
    s.box(2.0,0,1.4,2.6,0.15,1.6,C.dark);
    [[1.3,'#E5483A'],[2.1,'#E5483A'],[2.85,'#C33A2E']].forEach(function(p,i){s.cyl(p[0],0.45,0.9,0.22,1.0,'z',p[1],{n:12});s.box(p[0],0.15,1.6,0.42,0.42,0.5,C.grey)});
    s.cyl(1.0,0.45,0.7,0.09,2.2,'x',C.red,{n:8});
    // hose reel cabinet + extinguishers
    s.box(-1.0,0.8,-2.7,0.9,1.1,0.25,C.red);s.box(-1.0,0.85,-2.56,0.75,0.95,0.02,'#FFD9D4');
    s.cyl(0.2,0,-2.5,0.1,0.55,'y',C.red,{n:10});s.cyl(0.5,0,-2.5,0.1,0.55,'y',C.red,{n:10});
    s.ty=1.2;s.dist=13.5;
  }
  if(kind==='wall'){
    s.box(0,-0.05,0,9,0.05,6.4,C.sand,{layer:0,nobottom:1,tile:9});
    s.box(0,0,0.3,8.4,0.02,1.2,'#D9DEE3',{layer:0.5,nobottom:1,tile:9});
    var H=1.9,gate=function(x,z){return z<-2.3&&Math.abs(x-0.6)<1.0};
    wallRun(s,-4.2,-2.6,4.2,-2.6,H,{bay:1.4,gap:gate});wallRun(s,-4.2,-2.6,-4.2,2.8,H,{bay:1.35});
    for(var g=-0.35;g<=1.56;g+=0.15)s.box(g,0,-2.6,0.04,1.65,0.04,C.grey);
    s.box(0.6,1.55,-2.6,1.95,0.07,0.07,C.dark);s.box(0.6,0.1,-2.6,1.95,0.07,0.07,C.dark);
    [[3.6,-1.9],[-3.5,1.8]].forEach(function(p){s.cyl(p[0],0,p[1],0.05,3.0,'y',C.steel,{n:6});s.box(p[0]-0.15,2.95,p[1],0.45,0.08,0.14,C.dark)});
    // pickup truck
    s.box(1.6,0.12,1.4,2.2,0.55,1.0,C.white);s.box(1.1,0.67,1.4,1.0,0.45,0.95,C.white);s.box(1.1,0.72,1.4,1.02,0.3,0.97,'#5C7F92');
    s.box(2.2,0.42,1.4,1.0,0.05,1.02,C.teal);
    [[0.9,0.92],[0.9,1.88],[2.3,0.92],[2.3,1.88]].forEach(function(w){s.cyl(w[0],0.22,w[1]-0.12,0.22,0.24,'z','#2B3238',{n:10})});
    // palms
    [[-2.6,1.2],[3.4,1.6]].forEach(function(p){s.cyl(p[0],0,p[1],0.08,1.7,'y','#9B7A52',{n:6});for(var q=0;q<5;q++){var an=q/5*Math.PI*2;s.box(p[0]+Math.cos(an)*0.4,1.65,p[1]+Math.sin(an)*0.4,0.8,0.06,0.24,C.green)}});
    s.ty=1.0;s.dist=15;
  }
};
})();
