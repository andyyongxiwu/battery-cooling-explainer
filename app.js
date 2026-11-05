import {ThermalModel,statistics,errors} from './model.js';
const $=id=>document.getElementById(id), model=new ThermalModel();
const state={flow:.0115,tin:29.3,count:5,autoScale:false,activeSide:0,focused:-1,result:null,ready:false,playing:false,validationToken:0};
const palette=[[0,48,18,59],[.13,69,102,223],[.25,35,173,234],[.4,55,215,136],[.55,164,227,56],[.7,246,196,54],[.82,249,121,30],[.93,211,59,19],[1,122,4,3]];
function color(t,kind='temperature'){
 t=Math.max(0,Math.min(1,t));
 if(kind==='mode'){const v=2*t-1,a=Math.abs(v);return v>=0?[255,Math.round(255-160*a),Math.round(255-165*a)]:[Math.round(255-205*a),Math.round(255-155*a),255];}
 if(kind==='error'){const stops=[[0,18,15,40],[.25,65,40,110],[.5,157,45,100],[.75,233,113,53],[1,249,242,133]];return interpolate(stops,t);}
 return interpolate(palette,t);
}
function interpolate(stops,t){let i=1;while(i<stops.length-1&&t>stops[i][0])i++;const a=stops[i-1],b=stops[i],f=(t-a[0])/(b[0]-a[0]);return a.slice(1).map((v,k)=>Math.round(v+(b[k+1]-v)*f));}
const scratch=document.createElement('canvas');scratch.width=161;scratch.height=129;const sx=scratch.getContext('2d');
function drawField(canvas,values,min,max,kind='temperature'){
 const image=sx.createImageData(161,129),span=max-min||1;
 for(let y=0;y<129;y++)for(let x=0;x<161;x++){const p=y*161+x,v=values[(128-y)*161+x],c=color((v-min)/span,kind);image.data[p*4]=c[0];image.data[p*4+1]=c[1];image.data[p*4+2]=c[2];image.data[p*4+3]=255;}
 sx.putImageData(image,0,0);const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.drawImage(scratch,0,0,canvas.width,canvas.height);
}
function scale(){if(!state.autoScale||!state.result)return [25,42];const s=statistics(state.result.field);return [Math.floor(s.min),Math.ceil(s.max)];}
function format(v,digits=2){return v.toFixed(digits);}
function signed(v,d=1){return (v>=0?'+':'−')+Math.abs(v).toFixed(d);}
function temperatureHTML(v){return v.toFixed(1)+'<small>°C</small>';}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
function openDialog(id){if(!$(id).open)$(id).showModal();}
function stopSweep(){state.playing=false;$('sweepButton').innerHTML='<span>▶</span> Play sweep';}
function updateControls(){
 $('flow').value=state.flow;$('tin').value=state.tin;$('flowNumber').value=state.flow.toFixed(6);$('tinNumber').value=state.tin.toFixed(2);
 for(const [id,p,accent,muted] of [['flow',(state.flow-.005)/.015,'#2e88b9','#dceaf2'],['tin',(state.tin-25)/10,'#178c9e','#e0edf0']])$(id).style.background=`linear-gradient(to right,${accent} ${p*100}%,${muted} ${p*100}%)`;
 $('flowNumber').removeAttribute('aria-invalid');$('tinNumber').removeAttribute('aria-invalid');
}
let scheduled=false;
function scheduleRender(){if(!state.ready||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render();});}
function render(){
 const result=model.predict(state.flow,state.tin,state.count);state.result=result;
 const n=model.meta.pointsPerSide,[min,max]=scale(),upper=result.field.subarray(0,n),lower=result.field.subarray(n);
 drawField($('upper'),upper,min,max);drawField($('lower'),lower,min,max);
 // Rotate only the installation view; model coordinates and exported fields stay unchanged.
 const vehicle=$('vehicleField'),vc=vehicle.getContext('2d');
 vc.clearRect(0,0,vehicle.width,vehicle.height);vc.save();vc.translate(vehicle.width,0);vc.rotate(Math.PI/2);
 vc.drawImage($(state.activeSide?'lower':'upper'),0,0,vehicle.height,vehicle.width);vc.restore();
 const outline=$('vehicleOutline');
 if(outline.dataset.side!==String(state.activeSide)){
  outline.src=state.activeSide?'./assets/vehicle-chassis-vertical.png':'./assets/vehicle-sedan-vertical.png';
  outline.alt=state.activeSide?'Transparent underside chassis with a longitudinal battery enclosure':'Transparent top-down sedan illustration with a longitudinal battery enclosure';
  outline.dataset.side=String(state.activeSide);
 }
 $('activeHeight').textContent=state.activeSide?'z = 8.5 mm':'z = 86.5 mm';
 for(const [id,side] of [['viewUpper',0],['viewLower',1]]){$(id).classList.toggle('active',state.activeSide===side);$(id).setAttribute('aria-pressed',String(state.activeSide===side));}
 const a=statistics(upper),b=statistics(lower);
 for(const [id,v] of [['upperMax',a.max],['lowerMax',b.max],['upperMean',a.mean],['lowerMean',b.mean]])$(id).innerHTML=temperatureHTML(v);
 $('u1').textContent=signed(result.u[0],3);$('u2').textContent=signed(result.u[1],3);
 $('scaleMax').textContent=max.toFixed(1)+'°C';$('scaleMid').textContent=((min+max)/2).toFixed(1);$('scaleMin').textContent=min.toFixed(1)+'°C';
 $('modeCount').textContent=state.count;$('lessModes').disabled=state.count===1;$('moreModes').disabled=state.count===5;
 const absmax=Math.max(...Array.from(result.coeff).map(Math.abs),1);
 for(let k=0;k<5;k++){
  const el=$('coefficient'+k),v=result.coeff[k],bar=el.querySelector('.bar');
  el.classList.toggle('disabled',k>=state.count);el.classList.toggle('focused',state.focused===k);
  el.querySelector('.number').textContent=signed(v,1);el.title=`a${k+1} = ${v.toPrecision(8)}${k>=state.count?' · excluded from current reconstruction':''}`;
  const width=Math.max(2,Math.sqrt(Math.abs(v)/absmax)*45);bar.style.width=width+'px';bar.style.transform=v<0?'translateX(-100%)':'none';bar.style.background=v>=0?'#9a6be4':'#249d9e';
  $('modeTile'+k).classList.toggle('disabled',k>=state.count);
 }
 for(let k=-1;k<5;k++){
  const values=k<0?model.mean.subarray(state.activeSide*n,(state.activeSide+1)*n):model.modes.subarray(k*n*2+state.activeSide*n,k*n*2+(state.activeSide+1)*n);
  let amplitude=0;if(k>=0)for(const v of values)amplitude=Math.max(amplitude,Math.abs(v));
  drawField($('modeCanvas'+(k+1)),values,k<0?min:-amplitude,k<0?max:amplitude,k<0?'temperature':'mode');
 }
 drawNetwork();
 const boundaryMin=state.flow<.006?26-(state.flow-.005)/.001:25,boundaryMax=state.flow<.006?34+(state.flow-.005)/.001:35;
 $('boundaryNote').hidden=state.tin>=boundaryMin-1e-8&&state.tin<=boundaryMax+1e-8;
 const known=model.meta.testCases.find(c=>Math.abs(c.flow-state.flow)<1e-9&&Math.abs(c.tin-state.tin)<1e-7);
 const trained=Array.from({length:77},(_,j)=>Math.abs(model.centers[j*2]-result.u[0])<1e-8&&Math.abs(model.centers[j*2+1]-result.u[1])<1e-8).some(Boolean);
 $('inputMessage').textContent=state.playing?'Sweeping conditions · separate endpoint predictions':known?'Held-out condition '+known.id+' · open Validation to compare':trained?'Training condition · field reconstructed live':'New parameter combination · field calculated live';
 $('inputMessage').style.color='';
 $('predictionBadge').innerHTML='<span class="live-dot"></span>'+(state.count<5?'TRUNCATED RECONSTRUCTION':'LIVE PREDICTION');
}
function drawNetwork(){
 const canvas=$('network'),rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const centerX=w*.42,ys=Array.from({length:77},(_,j)=>30+(h-53)*j/76),r=state.result;
 const inputs=[document.querySelector('.flow-feature'),document.querySelector('.tin-feature')].map(el=>{const q=el.getBoundingClientRect();return q.top+q.height/2-rect.top;});
 for(let j=0;j<77;j++){
  const a=r.kernel[j];
  for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(0,inputs[i]);ctx.bezierCurveTo(w*.18,inputs[i],w*.2,ys[j],centerX,ys[j]);ctx.strokeStyle=i===0?`rgba(92,174,53,${.025+.18*a})`:`rgba(25,153,157,${.025+.18*a})`;ctx.lineWidth=.7;ctx.stroke();}
 }
 let max=0;for(let j=0;j<77;j++)for(let k=0;k<5;k++)max=Math.max(max,Math.abs(r.kernel[j]*model.weights[j*5+k]));
 for(let k=0;k<5;k++){
  const q=$('coefficient'+k).querySelector('.bar-track').getBoundingClientRect(),end=q.top+q.height/2-rect.top;
  for(let j=0;j<77;j++){
   const contribution=r.kernel[j]*model.weights[j*5+k],importance=Math.sqrt(Math.abs(contribution)/(max||1));
   const dim=k>=state.count?.08:state.focused>=0&&state.focused!==k?.2:1;
   ctx.beginPath();ctx.moveTo(centerX,ys[j]);ctx.bezierCurveTo(w*.7,ys[j],w*.7,end,w,end);
   ctx.strokeStyle=contribution>=0?`rgba(157,111,225,${(.015+.25*importance)*dim})`:`rgba(28,157,158,${(.015+.25*importance)*dim})`;ctx.lineWidth=.45+.5*importance;ctx.stroke();
  }
 }
 for(let j=0;j<77;j++){ctx.beginPath();ctx.arc(centerX,ys[j],2.4+1.25*r.kernel[j],0,Math.PI*2);ctx.fillStyle=`rgba(83,157,167,${.18+.8*r.kernel[j]})`;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=.6;ctx.stroke();}
}
function modeExplanation(k){
 if(!state.ready)return;
 state.focused=k;scheduleRender();
 $('helpTitle').textContent=k<0?'The training-set mean':'POD spatial mode '+(k+1);
 $('helpBody').replaceChildren();
 const p=document.createElement('p');p.textContent=k<0?'The baseline field is the pointwise mean of the 77 training conditions. It is fixed; the predicted mode contributions adapt it to your inputs.':'This fixed spatial pattern was extracted from the training temperature fields. Its current coefficient determines the strength and sign of its contribution. Red and blue indicate opposite signed values, not hot and cold temperatures.';
 $('helpBody').append(p);
 const n=model.meta.pointsPerSide;
 for(let side=0;side<2;side++){
  const title=document.createElement('p');title.className='mode-description';title.textContent=(side===0?'Upper':'Lower')+' cut plane'+(k<0?'':` · a${k+1} = ${signed(state.result.coeff[k],3)}`);$('helpBody').append(title);
  const c=document.createElement('canvas');c.width=483;c.height=387;
  const data=k<0?model.mean.subarray(side*n,(side+1)*n):model.modes.subarray(k*n*2+side*n,k*n*2+(side+1)*n);
  let a=0;for(const v of data)a=Math.max(a,Math.abs(v));const range=scale();drawField(c,data,k<0?range[0]:-a,k<0?range[1]:a,k<0?'temperature':'mode');$('helpBody').append(c);
 }
 openDialog('helpDialog');
}
async function showValidation(){
 if(!state.ready)return;openDialog('validationDialog');await updateValidation();
}
async function updateValidation(){
 const token=++state.validationToken,c=model.meta.testCases.find(c=>c.id===$('validationCase').value);if(!c)return;
 $('validationStatus').textContent='Loading COMSOL reference…';
 try{
  const truth=await model.truth(c.id);if(token!==state.validationToken)return;
  const pred=model.predict(c.flow,c.tin,state.count).field,err=errors(pred,truth),n=model.meta.pointsPerSide;
  const abs=new Float64Array(pred.length);for(let i=0;i<pred.length;i++)abs[i]=Math.abs(pred[i]-truth[i]);
  const errorMax=Math.max(.1,Math.ceil(err.max*100)/100);const range=scale();
  for(const [side,offset] of [['Upper',0],['Lower',n]]){
   drawField($('v'+side+'True'),truth.subarray(offset,offset+n),...range);
   drawField($('v'+side+'Pred'),pred.subarray(offset,offset+n),...range);
   drawField($('v'+side+'Error'),abs.subarray(offset,offset+n),0,errorMax,'error');
  }
  $('caseRmse').textContent=err.rmse.toFixed(4)+' K';$('caseMae').textContent=err.mae.toFixed(4)+' K';$('caseMax').textContent=err.max.toFixed(4)+' K';$('validationModes').textContent=state.count+' / 5 modes';
  $('validationValues').textContent=c.flow.toFixed(6)+' kg/s  ·  '+c.tin.toFixed(2)+'°C';
  $('upperErrorScale').textContent='Upper · error scale 0–'+errorMax.toFixed(2)+' K';$('lowerErrorScale').textContent='Lower · error scale 0–'+errorMax.toFixed(2)+' K';
  $('validationStatus').textContent=c.id+' · Independent test condition · '+(state.count===5?'Full model reconstruction':'Truncated reconstruction; benchmark below remains the full model');
 }catch(e){$('validationStatus').textContent='Could not load this reference: '+e.message;}
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function exportCSV(){
 if(!state.ready)return;const n=model.meta.pointsPerSide,lines=['# POD + RBF v1.0; 4C; initial SOC 0.1; endpoint SOC 0.8; t=630 s; initial and ambient 35 degC',
  '# M_flow_in='+state.flow+' kg/s; T_cool_in='+state.tin+' degC; retained modes='+state.count,'side,x_m,y_m,z_m,temperature_degC'];
 for(let side=0;side<2;side++)for(let p=0;p<n;p++)lines.push([(side?'lower':'upper'),(-.3+(p%161)*.00375).toFixed(5),(Math.floor(p/161)*.00375).toFixed(5),side?.0085:.0865,state.result.field[side*n+p].toFixed(7)].join(','));
 download(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}),'battery_temperature_'+state.flow.toFixed(6)+'_'+state.tin.toFixed(2)+'.csv');toast('Both cut-plane fields exported.');
}
function exportPNG(){
 if(!state.ready)return;const c=document.createElement('canvas');c.width=1400;c.height=760;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#263b4d';ctx.font='bold 25px Arial';ctx.fillText('Battery cooling · POD + RBF prediction',35,45);ctx.font='16px Arial';ctx.fillStyle='#627788';ctx.fillText(`${state.flow.toFixed(6)} kg/s  |  Inlet ${state.tin.toFixed(2)}°C  |  4C · SOC 10–80% · 630 s  |  ${state.count}/5 modes`,35,77);
 for(let side=0;side<2;side++){const x=35+side*690;ctx.fillStyle='#263b4d';ctx.font='bold 18px Arial';ctx.fillText((side?'Lower · z=8.5 mm':'Upper · z=86.5 mm'),x,120);ctx.drawImage($(side?'lower':'upper'),x,140,620,497);const stats=statistics(state.result.field.subarray(side*20769,(side+1)*20769));ctx.font='15px Arial';ctx.fillText(`Peak ${stats.max.toFixed(2)}°C  |  Sample mean ${stats.mean.toFixed(2)}°C`,x,669);}
 ctx.font='13px Arial';ctx.fillStyle='#8395a2';const [min,max]=scale();ctx.fillText(`Shared color scale: ${min.toFixed(1)} to ${max.toFixed(1)}°C. Internal cut-plane fields; simulation-validated model v1.0.`,35,720);c.toBlob(b=>download(b,'battery_cooling_prediction.png'),'image/png');
}
function inspectPoint(e,side,rotated=false){
 if(!state.result)return;
 const rect=e.currentTarget.getBoundingClientRect(),screenX=(e.clientX-rect.left)/rect.width,screenY=(e.clientY-rect.top)/rect.height;
 // Invert the clockwise quarter-turn used by the vehicle canvas.
 const u=rotated?screenY:screenX,v=rotated?1-screenX:screenY;
 const x=Math.min(160,Math.max(0,Math.floor(u*161))),y=Math.min(128,Math.max(0,128-Math.floor(v*129)));
 const value=state.result.field[side*20769+y*161+x];
 $(side?'lowerReadout':'upperReadout').textContent=`x ${(-.3+x*.00375).toFixed(4)} m · y ${(y*.00375).toFixed(4)} m · ${value.toFixed(3)}°C`;
}
function setup(){
 $('coefficients').innerHTML=Array.from({length:5},(_,k)=>`<button id="coefficient${k}" class="coefficient" aria-label="Inspect coefficient ${k+1}"><span class="bar-track"><span class="bar"></span></span><span class="value"><span class="index">a${k+1}</span><span class="number">—</span></span></button>`).join('');
 $('modeTiles').innerHTML=Array.from({length:6},(_,j)=>`<button class="mode-tile" id="${j===0?'meanTile':'modeTile'+(j-1)}" aria-label="Inspect ${j===0?'mean field':'POD mode '+j}"><canvas id="modeCanvas${j}" width="161" height="129"></canvas><span>${j===0?'μ':'φ'+j}</span></button>`).join('');
 for(let k=0;k<5;k++){$('coefficient'+k).onclick=()=>modeExplanation(k);$('modeTile'+k).onclick=()=>modeExplanation(k);}$('meanTile').onclick=()=>modeExplanation(-1);
 for(const id of ['flow','tin']){
  $(id).addEventListener('input',()=>{stopSweep();state[id]=Number($(id).value);$('preset').value='custom';updateControls();scheduleRender();});
  $(id+'Number').addEventListener('input',()=>{const v=$(id+'Number').valueAsNumber,min=id==='flow'?.005:25,max=id==='flow'?.02:35;if(!Number.isFinite(v)||v<min||v>max){$(id+'Number').setAttribute('aria-invalid','true');$('inputMessage').textContent=`Enter ${min}–${max}${id==='flow'?' kg/s':'°C'}.`;$('inputMessage').style.color='#b24935';return;}stopSweep();state[id]=v;$(id).value=v;$('preset').value='custom';scheduleRender();});
  $(id+'Number').addEventListener('change',()=>updateControls());
 }
 $('lessModes').onclick=()=>{state.count=Math.max(1,state.count-1);scheduleRender();};$('moreModes').onclick=()=>{state.count=Math.min(5,state.count+1);scheduleRender();};
 $('scaleToggle').onclick=()=>{state.autoScale=!state.autoScale;$('scaleToggle').textContent=state.autoScale?'Adaptive scale':'Fixed scale';scheduleRender();};
 $('validationButton').onclick=showValidation;
 $('notesButton').onclick=()=>openDialog('notesDialog');
 for(const el of document.querySelectorAll('[data-close]'))el.onclick=()=>el.closest('dialog').close();
 for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 $('helpDialog').addEventListener('close',()=>{state.focused=-1;scheduleRender();});
 const help={inputs:['Continuous inputs, live predictions','Choose any supported mass-flow and inlet-temperature combination, including values that were never simulated. Each change evaluates the RBF model and reconstructs 41,538 temperatures. Presets are only starting points; they do not limit the inputs.'],rbf:['A smooth map from inputs to coefficients','Each of the 77 circles represents a training-case Gaussian radial basis center. Its response decreases with distance in normalized input space. Signed RBF weights combine these responses to predict the five POD coefficients. The lines show actual weighted contributions, not neural-network activations.'],coefficients:['Five numbers describe a field','The five coefficients are calculated from your current inputs. Their signs and magnitudes determine how the fixed spatial modes modify the mean. Reduce the mode count to explore reconstruction truncation. Validation benchmark figures apply to all five modes.'],fields:['Two internal temperature fields','The upper and lower views are internal XY cut planes at 86.5 mm and 8.5 mm. Both show the 630 s charging endpoint and share a color scale. The highest temperature and mean refer to sampled cut-plane nodes, not the whole three-dimensional battery volume.']};
 for(const b of document.querySelectorAll('[data-help]'))b.onclick=()=>{$('helpTitle').textContent=help[b.dataset.help][0];$('helpBody').textContent=help[b.dataset.help][1];openDialog('helpDialog');};
 $('validationCase').onchange=updateValidation;
 $('applyCase').onclick=()=>{const c=model.meta.testCases.find(c=>c.id===$('validationCase').value);stopSweep();state.flow=c.flow;state.tin=c.tin;updateControls();scheduleRender();$('validationDialog').close();toast('Applied '+c.id+' to the live model.');};
 $('preset').onchange=()=>{stopSweep();const p={balanced:[.0115,29.3],cool:[.02,25],warm:[.006,35],TE001:[.005148,30.9]};if(p[$('preset').value]){[state.flow,state.tin]=p[$('preset').value];updateControls();scheduleRender();}};
 $('csvButton').onclick=exportCSV;$('pngButton').onclick=exportPNG;
 $('shareButton').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('flow',state.flow.toFixed(6));url.searchParams.set('tin',state.tin.toFixed(2));url.searchParams.set('modes',state.count);try{await navigator.clipboard.writeText(url.toString());toast('Link with current inputs copied.');}catch{toast('Copy this page URL after updating your inputs.');history.replaceState(null,'',url.toString());}};
 $('upper').onpointermove=e=>inspectPoint(e,0);$('lower').onpointermove=e=>inspectPoint(e,1);
 $('vehicleField').onpointermove=e=>{inspectPoint(e,state.activeSide,true);$('vehicleReadout').textContent=$(state.activeSide?'lowerReadout':'upperReadout').textContent;};
 $('viewUpper').onclick=()=>{state.activeSide=0;scheduleRender();};$('viewLower').onclick=()=>{state.activeSide=1;scheduleRender();};
 $('inspectField').onclick=()=>{if(!state.ready)return;$('helpTitle').textContent='Predicted internal cut-plane temperatures';$('helpBody').replaceChildren();const range=scale();for(let side=0;side<2;side++){const p=document.createElement('p');p.textContent=(side?'Lower · z = 8.5 mm':'Upper · z = 86.5 mm')+' · shared scale '+range[0]+'–'+range[1]+'°C';const c=document.createElement('canvas');c.width=644;c.height=516;drawField(c,state.result.field.subarray(side*20769,(side+1)*20769),...range);$('helpBody').append(p,c);}openDialog('helpDialog');};
 $('sweepButton').onclick=()=>{
  if(!state.ready)return;if(state.playing){stopSweep();return;}state.playing=true;$('sweepButton').innerHTML='<span>Ⅱ</span> Pause sweep';const started=performance.now();let last=0;
  const step=now=>{if(!state.playing)return;if(now-last>65){last=now;const t=(now-started)/9000;state.flow=.005+.015*(.5-.5*Math.cos(t*Math.PI*2));state.tin=30+4.8*Math.sin(t*Math.PI*2*.7);updateControls();scheduleRender();}requestAnimationFrame(step);};requestAnimationFrame(step);
 };
 window.addEventListener('resize',()=>{if(state.ready)scheduleRender();});
}
setup();
for(const id of ['sweepButton','validationButton','csvButton','pngButton','lessModes','moreModes'])$(id).disabled=true;
model.load().then(()=>{
 state.ready=true;for(const id of ['sweepButton','validationButton','csvButton','pngButton','lessModes','moreModes'])$(id).disabled=false;
 $('validationCase').innerHTML=model.meta.testCases.map(c=>`<option value="${c.id}">${c.id} · ${c.flow.toFixed(6)} kg/s</option>`).join('');
 const params=new URLSearchParams(location.search);const f=Number(params.get('flow')),t=Number(params.get('tin')),k=Number(params.get('modes'));
 if(params.has('flow')&&params.has('tin')&&f>=.005&&f<=.02&&t>=25&&t<=35){state.flow=f;state.tin=t;}if(Number.isInteger(k)&&k>=1&&k<=5)state.count=k;
 updateControls();render();
}).catch(e=>{$('loadError').hidden=false;$('loadError').textContent=e.message+' Refresh to retry.';});
