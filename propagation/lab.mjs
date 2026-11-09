import {buildGeometryNetwork,sourceLayout,sourceMatches,sourceProfiles,physicalDimensions} from './solver.mjs';
const $ = id => document.getElementById(id);
const layerDisplayScale = 5;
const layerDefaults = {pcm: 2, fr: 1};
function materialDimensions(thickness) {
  return {w: thickness * layerDisplayScale, h: 140, thickness, axis: 'x', displayScale: layerDisplayScale};
}
const types = {
  cell: {w: 40, h: 140},
  pcm: materialDimensions(layerDefaults.pcm),
  fr: materialDimensions(layerDefaults.fr),
};
let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'zh';
const tr = (zh,en) => lang === 'zh' ? zh : en;
const s = {parts:[],selected:null,tool:null,mode:'build',next:1,undo:[],view:{x:80,y:90,z:1},result:null,frame:0,playing:false,worker:null};
let gesture=null, candidate=null, playback=0;
let chartResult, chartNode, chartLanguage;
const canvas=$('canvas'), world=$('world');
const label=p=>{const group=s.parts.filter(q=>q.type===p.type),index=group.findIndex(q=>q.id===p.id);return `${p.type==='cell'?tr('电芯','Cell'):p.type.toUpperCase()} ${index<0?group.length+1:index+1}`;};
const selected=()=>s.parts.find(p=>p.id===s.selected);
function persist(){try{localStorage.setItem('propagation-freeform-v1',JSON.stringify(s.parts));}catch{}}
function remember(){s.undo.push(JSON.stringify(s.parts));if(s.undo.length>40)s.undo.shift();}
function cancel(){s.worker?.terminate();s.worker=null;s.result=null;s.playing=false;cancelAnimationFrame(playback);s.mode='build';s.frame=0;$('status').textContent='';}
function commit(){if(s.profile&&!sourceMatches(s.parts,s.profile))s.profile=null;persist();render();}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-s.view.x)/s.view.z,y:(e.clientY-r.top-s.view.y)/s.view.z};}
function inside(e){const r=canvas.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;}
function overlap(p,q){return Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x)>.01&&Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y)>.01;}
function valid(p){return !s.parts.some(q=>q.id!==p.id&&overlap(p,q));}
function snap(raw){
  const threshold=24/s.view.z, candidates=[];
  for(const q of s.parts){if(q.id===raw.id)continue;
    for(const side of ['left','right','top','bottom']){
      const p={...raw};const vertical=side==='left'||side==='right';
      if(p.type!=='cell'){
        const thickness=raw.thickness??Math.min(raw.w,raw.h);p.thickness=thickness;p.axis=vertical?'x':'y';p.anchor=q.id;p.side=side;
        const displayThickness = thickness * (raw.displayScale ?? 1);
        p.w = vertical ? displayThickness : q.w;
        p.h = vertical ? q.h : displayThickness;
      }
      if(vertical){p.x=side==='left'?q.x-p.w:q.x+q.w;p.y=raw.type==='cell'?raw.y:q.y;
        if(raw.type==='cell'&&Math.abs(raw.y-q.y)<threshold)p.y=q.y;
        if(Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y)<=0)continue;
      }else{p.y=side==='top'?q.y-p.h:q.y+q.h;p.x=raw.type==='cell'?raw.x:q.x;
        if(raw.type==='cell'&&Math.abs(raw.x-q.x)<threshold)p.x=q.x;
        if(Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x)<=0)continue;
      }
      // Compare pointer-centred shapes, including automatic layer orientation changes.
      const centerX=raw.x+raw.w/2,centerY=raw.y+raw.h/2;
      const dist=vertical?Math.abs(centerX-(p.x+p.w/2)):Math.abs(centerY-(p.y+p.h/2));
      const along=vertical?Math.abs(centerY-(q.y+q.h/2)):Math.abs(centerX-(q.x+q.w/2));
      const reach=(vertical?q.h:q.w)/2+threshold;
      if(dist<=threshold&&along<reach&&valid(p))candidates.push({p,score:dist+along*.01});
    }
  }
  candidates.sort((a,b)=>a.score-b.score);
  if(candidates.length)return {...candidates[0].p,snapped:true};const free={...raw,snapped:false};delete free.anchor;delete free.side;return free;
}
function transform(){world.style.transform=`translate(${s.view.x}px,${s.view.y}px) scale(${s.view.z})`;$('zoom').textContent=`${Math.round(s.view.z*100)}%`;}
function fit(){if(!s.parts.length){s.view={x:80,y:90,z:1};transform();return;}
  const minx=Math.min(...s.parts.map(p=>p.x)),miny=Math.min(...s.parts.map(p=>p.y));
  const w=Math.max(...s.parts.map(p=>p.x+p.w))-minx,h=Math.max(...s.parts.map(p=>p.y+p.h))-miny;
  const z=Math.max(.15,Math.min(1.5,(canvas.clientWidth-100)/w,(canvas.clientHeight-100)/h));
  s.view={z,x:(canvas.clientWidth-w*z)/2-minx*z,y:(canvas.clientHeight-h*z)/2-miny*z};transform();}
function zoom(factor,cx=canvas.clientWidth/2,cy=canvas.clientHeight/2){const old=s.view.z,z=Math.max(.15,Math.min(3,old*factor));s.view.x=cx-(cx-s.view.x)*z/old;s.view.y=cy-(cy-s.view.y)*z/old;s.view.z=z;transform();}
const thermalColors=[[24,20,49],[57,26,95],[102,35,111],[151,47,105],[199,67,82],[233,105,61],[249,155,55],[249,205,94],[249,242,184]];
function shade(k){const t=Math.max(0,Math.min(1,(k-298.15)/775))*(thermalColors.length-1),i=Math.min(thermalColors.length-2,Math.floor(t));return `rgb(${thermalColors[i].map((v,j)=>Math.round(v+(thermalColors[i+1][j]-v)*(t-i))).join(',')})`;}

function drawPart(p,ghost=false){const el=document.createElement('div');el.className=`block ${p.type} ${p.type!=='cell'?'material':''} ${(p.type === 'cell' ? p.w > p.h : p.axis === 'y') ? 'horizontal' : ''}`;el.dataset.id=p.id;
  Object.assign(el.style,{left:p.x+'px',top:p.y+'px',width:p.w+'px',height:p.h+'px'});
  if(p.type==='cell'){const shell=document.createElement('div');shell.className='cell-detail';shell.setAttribute('aria-hidden','true');shell.innerHTML='<div class="case-seam"></div><div class="terminal positive"><i></i></div><div class="vent"></div><div class="terminal negative"><i></i></div>';el.append(shell);el.classList.toggle('slender',Math.min(p.w,p.h)/Math.max(p.w,p.h)<.45);}
  const text=document.createElement('span');text.className='block-label';text.textContent=p.type==='cell'?label(p):p.type.toUpperCase();
  if (p.type === 'fr' && (p.axis === 'y' ? p.h : p.w) < 10) {
    text.hidden = true;
    el.title = 'FR';
  }
  el.append(text);
  if(ghost){el.classList.add('ghost');if(p.snapped)el.classList.add('snapped');if(!valid(p))el.classList.add('invalid');}
  else{el.classList.toggle('selected',s.selected===p.id);el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',label(p));
    const i=s.result?.nodes.findIndex(n=>n.id===p.id);if(i!==undefined&&i>=0){const t=s.result.frames[s.frame][i];el.style.background=shade(t);el.style.color=t<850?'white':'#29202b';if(p.type==='cell'){const out=document.createElement('small');out.textContent=(t-273.15).toFixed(1)+' °C';el.append(out);}el.classList.toggle('hot',s.result.events[i]!==null&&s.result.events[i]<=s.result.times[s.frame]);}}
  world.append(el);return el;}
function render(){world.replaceChildren();s.parts.forEach(p=>drawPart(p));if(candidate)drawPart(candidate,true);transform();$('empty').hidden=s.parts.length>0||!!candidate;
  document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('active',s.tool===b.dataset.part));
  $('loadExample').disabled = !$('example').value || s.mode === 'running';
  $('duration').disabled = s.mode === 'running';
  $('edit').classList.toggle('active',s.mode==='build');$('arm').classList.toggle('active',s.mode==='arm');$('arm').disabled=!s.parts.some(p=>p.type==='cell')||s.mode==='running';$('undo').disabled=!s.undo.length||s.mode!=='build';
  $('instruction').textContent={build:'',arm:tr('点击一颗电芯，开始模拟。','Click a cell to start simulation.'),running:tr('正在计算，可点击搭建取消。','Computing. Click Build to cancel.'),view:tr('拖动时间轴，查看温度与传播过程。','Scrub the timeline to explore propagation.')}[s.mode];
  let links=[];try{links=buildGeometryNetwork(s.parts).links;}catch{}
  const convectionInput = $('convection');
  const defaultConvection = String((sourceProfiles[s.profile] ?? sourceProfiles.trn25).h);
  if (convectionInput.defaultValue !== defaultConvection) {
    if (convectionInput.value === convectionInput.defaultValue) convectionInput.value = defaultConvection;
    convectionInput.defaultValue = defaultConvection;
  }
  convectionInput.disabled = s.mode === 'running';
  $('count').textContent=tr(`${s.parts.length} 个组件 · ${links.length} 处接触`,`${s.parts.length} parts · ${links.length} contacts`);
  const p=selected();$('selection').textContent=p?label(p):tr('点选一个组件，查看或编辑。','Select a component to inspect or edit.');$('properties').hidden=!p;
  if(p){const dimensions=physicalDimensions(p);$('width').value=dimensions.w;$('height').value=dimensions.h;$('width').disabled=$('height').disabled=s.mode!=='build'||p.type!=='cell';$('thicknessField').hidden=p.type==='cell';$('thickness').value=p.thickness??Math.min(dimensions.w,dimensions.h);$('thickness').min=4/(p.displayScale??1);$('thickness').max=600/(p.displayScale??1);$('thickness').disabled=s.mode!=='build';$('rotate').disabled=$('remove').disabled=s.mode!=='build';const i=s.parts.indexOf(p);$('contacts').textContent=tr(`接触邻居：${links.filter(l=>l.a===i||l.b===i).length}`,`Touching neighbours: ${links.filter(l=>l.a===i||l.b===i).length}`);}
  renderTime();}
function drawHistory(result, node) {
  if (chartResult === result && chartNode === node && chartLanguage === lang) return;
  chartResult = result;
  chartNode = node;
  chartLanguage = lang;
  const chart = $('history');
  chart.replaceChildren();
  if (!result || node < 0) return;

  const {frames, times} = result;
  const temperatures = frames.map(frame => frame[node] - 273.15);
  const duration = times.at(-1);
  const maxTemperature = Math.max(50, ...temperatures);
  const tickStep = Math.ceil(maxTemperature / 200) * 50;
  const x = time => 46 + 181 * time / duration;
  const y = temperature => 117 - 104 * temperature / (4 * tickStep);
  const grid = Array.from({length: 5}, (_, index) => {
    const temperature = index * tickStep;
    const time = duration * index / 4;
    const timeLabel = Number(time.toFixed(duration < 4 ? 3 : 1));
    return `<path d="M46 ${y(temperature)}H227" stroke="#d7e2e9"/>
      <path d="M42 ${y(temperature)}H46 M${x(time)} 117v4" stroke="#7993a6"/>
      <text x="39" y="${y(temperature) + 3}" text-anchor="end">${temperature}</text>
      <text x="${x(time)}" y="133" text-anchor="middle">${timeLabel}</text>`;
  }).join('');
  const points = temperatures.map((temperature, index) =>
    `${x(times[index]).toFixed(2)},${y(temperature).toFixed(2)}`).join(' ');
  chart.setAttribute('aria-label', tr('温度随时间变化曲线', 'Temperature over time'));
  chart.innerHTML = `<g fill="#405f73" font-size="9">${grid}
    <text x="137" y="150" text-anchor="middle">${tr('时间 (s)', 'Time (s)')}</text>
    <text transform="translate(12 65) rotate(-90)" text-anchor="middle">${tr('温度 (°C)', 'Temperature (°C)')}</text></g>
    <path d="M46 13V117H227" fill="none" stroke="#7993a6"/>
    <polyline fill="none" stroke="#1c83af" stroke-width="1.8" points="${points}"/>`;
}
function renderTime() {
  const result = s.result;
  const time = result?.times[s.frame] ?? 0;
  $('clock').textContent = time.toFixed(1) + ' s';
  $('scrub').disabled = $('play').disabled = !result;
  $('scrub').max = result ? result.times.length - 1 : 0;
  $('scrub').value = s.frame;
  $('play').textContent = s.playing ? '❚❚' : '▶';
  const node = result?.nodes.findIndex(n => n.id === s.selected) ?? -1;
  $('temperature').textContent = node >= 0 ? (result.frames[s.frame][node] - 273.15).toFixed(1) + ' °C' : '';
  drawHistory(result, node);
  if (result) $('status').textContent = '';
}
function language(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-en]').forEach(el=>el.textContent=el.dataset[lang]);$('language').textContent=lang==='zh'?'EN':'中文';render();}
function startDrag(e,part){if(e.button!==0||s.mode!=='build')return;e.preventDefault();const p=typeof part==='string'?{...types[part],type:part,id:s.next}:part;gesture={kind:'part',pointer:e.pointerId,source:typeof part==='string'?'library':'world',p:{...p},sx:e.clientX,sy:e.clientY,offset:typeof part==='string'?{x:p.w/2,y:p.h/2}:{x:point(e).x-p.x,y:point(e).y-p.y},moved:false};}
for(const button of document.querySelectorAll('[data-part]')){button.onpointerdown=e=>{if(s.mode!=='build')cancel();s.tool=button.dataset.part;startDrag(e,s.tool);};button.onclick=e=>{if(e.detail===0){cancel();s.tool=button.dataset.part;render();}};button.ondragstart=e=>e.preventDefault();}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const id=Number(e.target.closest('[data-id]')?.dataset.id),p=s.parts.find(p=>p.id===id);
  if(p){s.selected=id;if(s.mode==='arm'&&p.type==='cell'){run(id);return;}if(s.mode==='build'){s.tool=null;startDrag(e,p);}else render();return;}
  if(s.mode!=='build')return;e.preventDefault();gesture={kind:s.tool?'place':'pan',pointer:e.pointerId,sx:e.clientX,sy:e.clientY,view:{...s.view},moved:false};});
window.addEventListener('pointermove',e=>{if(!gesture||gesture.pointer!==e.pointerId)return;e.preventDefault();if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>4)gesture.moved=true;
  if(gesture.kind==='pan'||gesture.kind==='place'){if(gesture.moved){s.view.x=gesture.view.x+e.clientX-gesture.sx;s.view.y=gesture.view.y+e.clientY-gesture.sy;transform();}return;}
  if(!gesture.moved)return;const pt=point(e);candidate=inside(e)?snap({...gesture.p,x:pt.x-gesture.offset.x,y:pt.y-gesture.offset.y}):null;$('dropHint').textContent=candidate?(candidate.snapped?tr('已吸附 · 松开放置','Snapped · Release to place'):valid(candidate)?tr('松开放置','Release to place'):tr('组件重叠，请移至空白处','Overlap · Move to free space')):'';render();},{passive:false});
window.addEventListener('pointerup',e=>{if(!gesture||gesture.pointer!==e.pointerId)return;const g=gesture;gesture=null;$('dropHint').textContent='';
  if(g.kind==='part'){
    if(g.moved&&candidate&&inside(e)&&valid(candidate)){
      if(g.source==='library'&&s.parts.length>=80){$('status').textContent=tr('当前最多支持 80 个组件。','This version supports up to 80 components.');candidate=null;render();return;}
      remember();const p={id:candidate.id,type:candidate.type,x:candidate.x,y:candidate.y,w:candidate.w,h:candidate.h,...(candidate.type!=='cell'?{thickness:candidate.thickness??Math.min(candidate.w,candidate.h),axis:candidate.axis??(candidate.w<candidate.h?'x':'y'),anchor:candidate.anchor,side:candidate.side,displayScale:candidate.displayScale}:{})};
      if(g.source==='library'){s.parts.push(p);s.next++;}else s.parts[s.parts.findIndex(q=>q.id===p.id)]=p;s.selected=p.id;s.tool=null;
    }else if(!g.moved){if(g.source==='world'){s.selected=g.p.id;s.tool=null;}else s.tool=g.p.type;}
  }else if(g.kind==='place'&&!g.moved&&s.tool&&inside(e)){
    const pt=point(e),d=types[s.tool],p=snap({...d,id:s.next,type:s.tool,x:pt.x-d.w/2,y:pt.y-d.h/2});
    if(valid(p)&&s.parts.length<80){remember();delete p.snapped;s.parts.push(p);s.selected=p.id;s.next++;s.tool=null;}
  }else if(!g.moved){s.selected=null;s.tool=null;}
  candidate=null;commit();});
window.addEventListener('pointercancel',()=>{gesture=null;candidate=null;$('dropHint').textContent='';render();});
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.001),e.clientX-r.left,e.clientY-r.top);},{passive:false});
world.addEventListener('keydown',e=>{if(e.key==='Enter'&&s.mode==='arm'){const p=s.parts.find(p=>p.id===Number(e.target.dataset.id));if(p?.type==='cell')run(p.id);}});
function rotate(){const p=selected();if(!p||s.mode!=='build')return;const q={...p,w:p.h,h:p.w,x:p.x+(p.w-p.h)/2,y:p.y+(p.h-p.w)/2};if(!valid(q)){$('status').textContent=tr('旋转后会重叠，请先把组件移到空白处。','Rotation would overlap. Move the component to free space first.');return;}if(q.type!=='cell'){q.axis=(p.axis??(p.w<p.h?'x':'y'))==='x'?'y':'x';delete q.anchor;delete q.side;}remember();Object.assign(p,q);commit();}
function remove(){if(!selected()||s.mode!=='build')return;remember();s.parts=s.parts.filter(p=>p.id!==s.selected);s.selected=null;commit();}
function undo(){if(s.mode!=='build'||!s.undo.length)return;s.parts=JSON.parse(s.undo.pop());s.selected=null;commit();}
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape'){gesture=null;candidate=null;s.tool=null;cancel();render();}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}if(e.key.toLowerCase()==='r')rotate();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}});
for(const id of ['width','height'])$(id).onchange=()=>{const p=selected();if(!p||s.mode!=='build')return;const w=+$('width').value,h=+$('height').value,q={...p,w,h};if(!Number.isFinite(w+h)||Math.min(w,h)<4||Math.max(w,h)>600||!valid(q)){$('status').textContent=tr('尺寸无效或与相邻组件重叠。','Invalid dimensions or overlapping geometry.');render();return;}remember();Object.assign(p,q);commit();};
function createWorker() {
  return new Worker(new URL('./worker.mjs', import.meta.url), {type: 'module'});
}
function run(ignition){const duration=$('duration').valueAsNumber;if(!$('duration').reportValidity() || !$('convection').reportValidity())return;cancel();s.tool=null;s.mode='running';render();let w;try{w=createWorker();}catch(e){cancel();$('status').textContent=e.message;render();return;}s.worker=w;
  w.onerror=e=>{cancel();render();$('status').textContent=tr('计算启动失败：','Calculation failed: ')+e.message;};
  w.onmessage=({data})=>{if(s.worker!==w)return;if(data.error){cancel();render();$('status').textContent=data.error;return;}if(!data.result){$('status').textContent=tr(`已计算 ${Math.round(data.time)} s`,`Computed ${Math.round(data.time)} s`);return;}w.terminate();s.worker=null;s.result=data.result;s.frame=0;s.mode='view';render();play();};
  w.postMessage({parts:s.parts,ignition,duration,profile:s.profile,convectionCoefficient:$('convection').valueAsNumber});}
function play(){if(!s.result)return;s.playing=!s.playing;cancelAnimationFrame(playback);if(s.playing){if(s.frame===s.result.times.length-1)s.frame=0;let last=performance.now(),time=s.result.times[s.frame];const tick=now=>{if(!s.playing)return;time+=(now-last)/1000*+$('speed').value;last=now;while(s.frame<s.result.times.length-1&&s.result.times[s.frame+1]<=time)s.frame++;if(s.frame===s.result.times.length-1)s.playing=false;render();if(s.playing)playback=requestAnimationFrame(tick);};playback=requestAnimationFrame(tick);}renderTime();}
$('play').onclick=play;$('scrub').oninput=()=>{s.playing=false;cancelAnimationFrame(playback);s.frame=+$('scrub').value;render();};$('edit').onclick=()=>{cancel();s.tool=null;render();};$('arm').onclick=()=>{cancel();s.tool=null;s.mode='arm';render();};$('clear').onclick=()=>{cancel();remember();s.parts=[];s.selected=null;s.tool=null;commit();};$('undo').onclick=undo;$('rotate').onclick=rotate;$('remove').onclick=remove;$('fit').onclick=fit;$('zoomin').onclick=()=>zoom(1.2);$('zoomout').onclick=()=>zoom(1/1.2);$('language').onclick=()=>{lang=lang==='zh'?'en':'zh';language();};$('duration').onchange=$('convection').onchange=()=>{cancel();render();};
$('save').onclick=()=>{const blob=new Blob([JSON.stringify({version:3,parts:s.parts,profile:s.profile??null},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='battery-pack-layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};$('load').onclick=()=>$('file').click();
$('example').onchange = () => { $('loadExample').disabled = !$('example').value || s.mode === 'running'; };
$('loadExample').onclick = () => {
  const key=$('example').value, isSource=key==='trn6'||key==='trn25';
  if ((!isSource && key !== 'hybrid') || s.mode === 'running') return;
  if (s.parts.length && !confirm(tr('载入示例会替换当前布局，可以用撤销恢复。继续？', 'Load this example and replace your current layout? You can undo this change.'))) return;

  cancel();
  remember();
  const sequence = ['cell'];
  for (let index = 1; index < 6; index++) sequence.push('pcm', 'fr', 'cell');
  let x = 0;
  s.next=1;
  s.parts = sequence.map(type => {
    const dimensions = type === 'cell' ? {w:40, h:140} : materialDimensions(layerDefaults[type]);
    const part = {type, id:s.next++, x, y:0, ...dimensions};
    x += part.w;
    return part;
  });
  s.profile=isSource?key:null;
  $('convection').value = (sourceProfiles[s.profile] ?? sourceProfiles.trn25).h;
  if(isSource){s.parts=sourceLayout(key);s.next=s.parts.length+1;$('duration').value=key==='trn6'?1500:4000;}
  if (!isSource) $('duration').value = 4000;
  s.tool = null;
  s.selected = s.parts[0].id;
  $('example').value = '';
  commit();
  fit();
};
$('file').onchange=async()=>{try{const data=JSON.parse(await $('file').files[0].text()),parts=data.parts;if(!Array.isArray(parts)||parts.length>80)throw Error('Invalid layout');const ids=new Set();for(const p of parts){if(!types[p.type]||!Number.isInteger(p.id)||p.id<1||ids.has(p.id)||![p.x,p.y,p.w,p.h].every(Number.isFinite)||Math.min(p.w,p.h)<4||Math.max(p.w,p.h)>600||Math.max(Math.abs(p.x),Math.abs(p.y))>100000)throw Error('Invalid component');ids.add(p.id);}buildGeometryNetwork(parts);cancel();remember();s.parts=parts.map(({id,type,x,y,w,h,axis,displayScale})=>{
  const part={id,type,x,y,w,h};
  if(type==='cell')return part;
  part.axis=axis==='x'||axis==='y'?axis:(w<h?'x':'y');
  part.displayScale=data.version===3&&displayScale===layerDisplayScale?layerDisplayScale:1;
  part.thickness=(part.axis==='y'?h:w)/part.displayScale;
  return part;
});s.next=Math.max(0,...parts.map(p=>p.id))+1;s.profile=sourceMatches(s.parts,data.profile)?data.profile:null;s.selected=null;commit();fit();}catch(e){$('status').textContent=tr('无法导入：','Import failed: ')+e.message;}$('file').value='';};
for(const id of ['defaultWidth','defaultHeight'])$(id).onchange=()=>{const w=+$('defaultWidth').value,h=+$('defaultHeight').value;if(Number.isFinite(w+h)&&Math.min(w,h)>=4&&Math.max(w,h)<=600){types.cell.w=w;types.cell.h=h;$('cellSize').textContent=`${w} × ${h}`;}else{$('defaultWidth').value=types.cell.w;$('defaultHeight').value=types.cell.h;}};
for (const type of ['pcm', 'fr']) {
  const input = $(type + 'Thickness');
  input.onchange = () => {
    const thickness = input.valueAsNumber;
    if (Number.isFinite(thickness) && input.checkValidity()) {
      Object.assign(types[type], materialDimensions(thickness));
    } else {
      input.value = types[type].thickness;
    }
  };
}
$('thickness').onchange = () => {
  const part = selected();
  const input = $('thickness');
  const thickness = input.valueAsNumber;
  if (!part || part.type === 'cell' || s.mode !== 'build') return;
  const axis = part.axis ?? (part.w < part.h ? 'x' : 'y');
  const displayThickness = thickness * (part.displayScale ?? 1);
  const next = {...part, axis, thickness, [axis === 'x' ? 'w' : 'h']: displayThickness};
  const anchor = s.parts.find(node => node.id === part.anchor);
  if (anchor && part.side === 'left') next.x = anchor.x - displayThickness;
  if (anchor && part.side === 'top') next.y = anchor.y - displayThickness;
  if (!Number.isFinite(thickness) || !input.checkValidity() || !valid(next)) {
    input.value = part.thickness;
    input.animate([{borderColor: '#b64c36'}, {borderColor: '#c9d7e3'}], {duration: 450});
    return;
  }
  remember();
  Object.assign(part, next);
  commit();
};
language();fit();$('startup').hidden=true;
