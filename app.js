'use strict';
const {problems, defaults, hand, lecture, run} = PSO;
const $ = id => document.getElementById(id);
const form = $('settings');
const explanations = {
  Initialize: 'Each particle starts at a candidate solution. Its starting position becomes its personal best. The cheapest starting point becomes the swarm best.',
  'Calculate velocity': 'Add the particle’s inertia, the pull toward its own best, and the pull toward the swarm best. The arrows show those three contributions for the selected particle.',
  'Move and evaluate': 'Add the new velocity to the old position and measure the cost. If a coordinate leaves the search square, stop its motion at the boundary.',
  'Update bests': 'Each particle remembers its new position if the cost improved. The cheapest personal best becomes the guide for the next iteration.'
};
const colors = ['#fbd483','#a895ff','#76edcf','#f395ca'];
const vectorNames = ['Inertia','Personal pull','Social pull','Proposed v'];
const keys = ['inertia','cognitive','social','proposed'];
let config, frames, index, timer, terrain;
const number = n => Math.abs(n) < 1e-12 ? '0' : Math.abs(n) < .001 || Math.abs(n) >= 10000 ? n.toExponential(2) : Number(n.toFixed(3)).toString();
const pair = v => '(' + v.map(number).join(', ') + ')';
function use(next, cursor=0) {
  stop();
  config = {...next};
  frames = run(config);
  index = cursor;
  Object.keys(defaults).forEach(key => form.elements[key].value = config[key]);
  $('particle').replaceChildren(...frames[0].particles.map((_,i)=>new Option('Particle '+(i+1), i)));
  $('scrub').max = frames.length-1;
  const problem=problems[config.problem];
  $('formula').textContent = 'f(x, y) = '+problem.formula;
  $('map-title').textContent = problem.name+' landscape';
  $('mode').textContent = config.example ? 'Fixed start and random factors. Apply parameters to start a seeded run.' : 'Same seed and parameters reproduce the same run.';
  terrain = makeTerrain(problem);
  render();
}
function makeTerrain({f,bound}) {
  const image=document.createElement('canvas');
  image.width=image.height=180;
  const ctx=image.getContext('2d');
  const data=ctx.createImageData(180,180);
  const max=Math.max(...Array.from({length:41*41},(_,i)=>f(((i%41)/20-1)*bound,(1-Math.floor(i/41)/20)*bound)));
  const stops=[[19,42,73],[43,65,125],[92,66,156],[170,72,151],[227,114,158]];
  for(let y=0;y<180;y++) for(let x=0;x<180;x++) {
    const v=f((x/179*2-1)*bound,(1-y/179*2)*bound);
    const t=Math.max(0,Math.min(3.9999,Math.log1p(v)/Math.log1p(max)*4));
    const lo=Math.floor(t), mix=t-lo;
    const contour=mix<.042 && lo>0 ? 1.20 : 1;
    const offset=(y*180+x)*4;
    for(let c=0;c<3;c++) data.data[offset+c]=(stops[lo][c]*(1-mix)+stops[lo+1][c]*mix)*contour;
    data.data[offset+3]=255;
  }
  ctx.putImageData(data,0,0);
  return image;
}
function context(id) {
  const canvas=$(id), {width,height}=canvas.getBoundingClientRect();
  const scale=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*scale);
  canvas.height=Math.round(height*scale);
  const ctx=canvas.getContext('2d');
  ctx.scale(scale,scale);
  return {ctx,width,height};
}
function line(ctx,a,b,color,width=1) {
  ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath();
  ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
}
function circle(ctx,[x,y],r,color,outline) {
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  if(outline){ctx.strokeStyle=outline;ctx.lineWidth=2;ctx.stroke();}
}
function arrow(ctx,a,b,color) {
  if(Math.hypot(b[0]-a[0],b[1]-a[1])<3) return;
  line(ctx,a,b,color,2);
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
  for(const side of [-1,1]) {
    const tip=angle+side*.55;
    line(ctx,b,[b[0]-8*Math.cos(tip),b[1]-8*Math.sin(tip)],color,2);
  }
}
function drawMap(frame,selected) {
  const {ctx,width,height}=context('map');
  const {bound,optimum}=problems[config.problem];
  const size=Math.min(width-62,height-49);
  if(size<=0) return;
  const left=(width-size)/2, top=15;
  const xy=([x,y])=>[left+(x/bound+1)*size/2, top+(1-y/bound)*size/2];
  ctx.drawImage(terrain,left,top,size,size);
  ctx.font='11px system-ui';ctx.fillStyle='#ccd1ec';ctx.textAlign='center';
  for(let i=0;i<=4;i++) {
    const p=i*size/4;
    line(ctx,[left+p,top],[left+p,top+size],'#ffffff35');
    line(ctx,[left,top+p],[left+size,top+p],'#ffffff35');
    ctx.fillText(number((i/2-1)*bound),left+p,top+size+17);
    ctx.fillText(number((1-i/2)*bound),left-17,top+p+4);
  }
  ctx.fillText('x',left+size/2,top+size+30);
  ctx.fillText('y',left-21,top-4);
  ctx.save();ctx.beginPath();ctx.rect(left,top,size,size);ctx.clip();
  if($('trails').checked) {
    frame.particles.forEach((_,i)=>{
      const points=frames.slice(Math.max(0,index-30),index+1).filter(f=>f.phase==='Initialize'||f.phase==='Move and evaluate').map(f=>xy(f.particles[i].pos));
      for(let j=1;j<points.length;j++) line(ctx,points[j-1],points[j],i===selected?'#e3d9ffad':'#cdbdff48',i===selected?2:1);
    });
  }
  const [ox,oy]=xy(optimum);
  line(ctx,[ox-7,oy],[ox+7,oy],'#fbd483',2);line(ctx,[ox,oy-7],[ox,oy+7],'#fbd483',2);
  const leader=xy(frame.leader.best);
  circle(ctx,leader,10,'#76edcf33','#76edcf');
  frame.particles.forEach((p,i)=>circle(ctx,xy(p.pos),i===selected?6:4,i===selected?'#f1eaff':'#b8a6ff','#292141'));
  const p=frame.particles[selected];
  if(frame.phase==='Calculate velocity') {
    let from=p.pos;
    keys.slice(0,3).forEach((key,i)=>{
      const to=from.map((x,j)=>x+p.trace[key][j]);
      arrow(ctx,xy(from),xy(to),colors[i]);from=to;
    });
  }
  ctx.restore();
}
function drawChart() {
  const {ctx,width,height}=context('chart');
  const left=42,right=width-15,top=20,bottom=height-29;
  const history=frames.slice(0,index+1).filter(f=>f.phase==='Initialize'||f.phase==='Update bests');
  const max=Math.max(.01,Math.log10(1+history[0].leader.bestScore));
  const at=f=>[left+f.iteration/config.iterations*(right-left),bottom-Math.log10(1+f.leader.bestScore)/max*(bottom-top)];
  ctx.font='11px system-ui';ctx.fillStyle='#aab1cb';ctx.textAlign='right';
  for(let i=0;i<=4;i++){
    const y=bottom-i*(bottom-top)/4;
    line(ctx,[left,y],[right,y],'#30384d');ctx.fillText(number(i*max/4),left-5,y+4);
  }
  const ticks=Math.min(4,config.iterations);
  ctx.textAlign='center';
  for(let i=0;i<=ticks;i++){
    const iteration=Math.round(i*config.iterations/ticks);
    ctx.fillText(iteration,left+iteration/config.iterations*(right-left),bottom+16);
  }
  for(let i=1;i<history.length;i++) line(ctx,at(history[i-1]),at(history[i]),'#76edcf',2.5);
  circle(ctx,at(history.at(-1)),4,'#76edcf');
}
function render() {
  const f=frames[index], i=Number($('particle').value), p=f.particles[i];
  $('phase-title').textContent=f.phase;
  $('explanation').textContent=explanations[f.phase]+(p.clamped&&f.phase==='Move and evaluate'?' This particle reached the boundary.':'');
  $('best-score').textContent=number(f.leader.bestScore);
  $('score').textContent=number(p.score);
  $('details').replaceChildren(...Object.entries({Position:pair(p.pos),Velocity:pair(p.vel),'Personal best':pair(p.best),'Personal best f':number(p.bestScore),'Swarm best':pair(f.leader.best)}).flatMap(([key,value])=>{
    const dt=document.createElement('dt'), dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;return [dt,dd];
  }));
  $('vector-note').textContent=p.trace ? 'r₁ '+pair(p.trace.r1)+' · r₂ '+pair(p.trace.r2) : 'Step to see how the three terms add up.';
  $('vectors').replaceChildren(...(p.trace?keys.map((key,i)=>{
    const row=document.createElement('div');row.className='vector';row.style.setProperty('--accent',colors[i]);
    const label=document.createElement('span'), value=document.createElement('b');label.textContent=vectorNames[i];value.textContent=pair(p.trace[key]);row.append(label,value);return row;
  }):[]));
  $('scrub').value=index;
  $('frame-label').textContent='Iteration '+f.iteration+' / '+config.iterations+' · Frame '+index+' / '+(frames.length-1);
  $('back').disabled=index===0;
  $('step').disabled=index===frames.length-1;
  document.querySelectorAll('#phases li').forEach(li=>li.classList.toggle('active',li.textContent===f.phase));
  drawMap(f,i);drawChart();
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ Play';}
function shift(by){index=Math.max(0,Math.min(frames.length-1,index+by));if(index===frames.length-1) stop();render();}
function play(){if(timer){stop();return;}if(index===frames.length-1){index=0;render();}$('play').textContent='Ⅱ Pause';timer=setInterval(()=>shift(1),Number($('speed').value));}
form.addEventListener('submit',e=>{e.preventDefault();use(Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,key==='problem'?value:Number(value)])));});
$('play').onclick=play;
$('speed').onchange=()=>{if(timer){stop();play();}};
$('step').onclick=()=>{stop();shift(1);};
$('back').onclick=()=>{stop();shift(-1);};
$('reset').onclick=()=>{stop();index=0;render();};
$('scrub').oninput=()=>{stop();index=Number($('scrub').value);render();};
$('particle').onchange=render;
$('trails').onchange=render;
$('load-lecture').onclick=()=>{use(lecture);$('lab').scrollIntoView();};
$('load-hand').onclick=()=>use(hand);
$('show-result').onclick=()=>{use(hand,3);$('lab').scrollIntoView();};
const example=run(hand)[3];
const check=JSON.stringify([example.particles[0].vel,example.particles[0].pos,example.particles[0].bestScore,example.leader.bestScore])==='[[0,-0.5],[2,0.5],4.25,1]';
$('check').textContent=check?'✓ Simulator matches the hand calculation for velocity, position, personal best cost, and swarm best cost.':'Simulator differs from the hand calculation.';
use(defaults);
new ResizeObserver(render).observe($('map'));
