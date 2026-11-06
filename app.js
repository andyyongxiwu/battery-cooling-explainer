import {installI18n,tr,getLanguage} from './i18n.js?v=7';
import {ThermalModel,statistics,errors} from './model.js?v=6';
const $=id=>document.getElementById(id), model=new ThermalModel();
const state={flow:.0115,tin:29.3,soc:35,crate:3,ambient:25,page:0,count:24,autoScale:true,activeSide:0,focused:-1,result:null,ready:false,playing:false,validationToken:0};
const controls={flow:[.005,.02,6],tin:[25,35,2],soc:[10,60,2],crate:[1,5,2],ambient:[10,40,2]};
const inputKeys=Object.keys(controls);
const visibleMode=slot=>state.page*5+slot;
const currentPredict=()=>model.predict(state.flow,state.tin,state.soc/100,state.crate,state.ambient,state.count);
const baseline=()=>Float64Array.from(model.mean,v=>v+state.tin);
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
function scale(){if(!state.autoScale||!state.result)return [10,50];const s=statistics(state.result.field);return [Math.floor(s.min),Math.ceil(s.max)];}
function format(v,digits=2){return v.toFixed(digits);}
function signed(v,d=1){return (v>=0?'+':'−')+Math.abs(v).toFixed(d);}
function temperatureHTML(v){return v.toFixed(1)+'<small>°C</small>';}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
function openDialog(id){if(!$(id).open)$(id).showModal();}
function stopSweep(){state.playing=false;$('sweepButton').innerHTML='<span>▶</span> Play sweep';}
function updateControls(){
 for(const id of inputKeys){const [min,max,digits]=controls[id];$(id).value=state[id];$(id+'Number').value=state[id].toFixed(digits);$(id+'Number').removeAttribute('aria-invalid');const p=(state[id]-min)/(max-min)*100;$(id).style.background=`linear-gradient(to right,#3388bd ${p}%,#dceaf2 ${p}%)`;}
}
let scheduled=false;
function scheduleRender(){if(!state.ready||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render();});}
function render(){
 const result=currentPredict();state.result=result;
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
 for(let i=0;i<5;i++)$('u'+(i+1)).textContent=signed(result.u[i],3);
 $('scaleMax').textContent=max.toFixed(1)+'°C';$('scaleMid').textContent=((min+max)/2).toFixed(1);$('scaleMin').textContent=min.toFixed(1)+'°C';
 $('modeCount').textContent=state.count;$('lessModes').disabled=state.count===1;$('moreModes').disabled=state.count===model.meta.modes;
 const absmax=Math.max(...Array.from(result.coeff).map(Math.abs),1);
 for(let slot=0;slot<5;slot++){
  const k=visibleMode(slot);const el=$('coefficient'+slot),v=result.coeff[k]??0,bar=el.querySelector('.bar');el.style.visibility=k<model.meta.modes?'visible':'hidden';el.querySelector('.index').textContent='a'+(k+1);
  el.classList.toggle('disabled',k>=state.count);el.classList.toggle('focused',state.focused===k);
  el.querySelector('.number').textContent=signed(v,1);el.title=`a${k+1} = ${v.toPrecision(8)}${k>=state.count?' · excluded from current reconstruction':''}`;
  const width=Math.max(2,Math.sqrt(Math.abs(v)/absmax)*45);bar.style.width=width+'px';bar.style.transform=v<0?'translateX(-100%)':'none';bar.style.background=v>=0?'#9a6be4':'#249d9e';
  $('modeTile'+slot).classList.toggle('disabled',k>=state.count);
 }
 for(let slot=-1;slot<5;slot++){
  const k=slot<0?-1:visibleMode(slot),tile=slot<0?$('meanTile'):$('modeTile'+slot);
  tile.style.visibility=k<model.meta.modes?'visible':'hidden';if(k>=model.meta.modes)continue;
  if(slot>=0)tile.querySelector('span').textContent='φ'+(k+1);
  const values=k<0?baseline().subarray(state.activeSide*n,(state.activeSide+1)*n):model.modes.subarray(k*n*2+state.activeSide*n,k*n*2+(state.activeSide+1)*n);
  let amplitude=0;if(k>=0)for(const v of values)amplitude=Math.max(amplitude,Math.abs(v));
  drawField($('modeCanvas'+(slot+1)),values,k<0?min:-amplitude,k<0?max:amplitude,k<0?'temperature':'mode');
 }
 drawNetwork();
 $('boundaryNote').hidden=true;
 const known=model.meta.testCases.find(c=>inputKeys.every(id=>Math.abs((id==='soc'?c.soc*100:c[id])-state[id])<1e-8));
 const trained=Array.from({length:model.meta.centers},(_,j)=>result.u.every((v,i)=>Math.abs(model.centers[j*5+i]-v)<1e-8)).some(Boolean);
 $('inputMessage').textContent=state.playing?'Sweeping conditions · separate endpoint predictions':known?'Held-out condition '+known.id+' · open Validation to compare':trained?'Training condition · field reconstructed live':'New parameter combination · field calculated live';
 $('inputMessage').style.color='';
 $('predictionBadge').innerHTML='<span class="live-dot"></span>'+(state.count<model.meta.modes?'TRUNCATED RECONSTRUCTION':'LIVE PREDICTION');
}
function drawNetwork(){
 const canvas=$('network'),rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const samples=Array.from({length:77},(_,j)=>Math.round(j*(model.meta.centers-1)/76)),centerX=w*.42,ys=Array.from({length:77},(_,j)=>30+(h-53)*j/76),r=state.result;
 const inputs=[...document.querySelectorAll('.feature-pill')].map(el=>{const q=el.getBoundingClientRect();return q.top+q.height/2-rect.top;});
 for(let j=0;j<77;j++){
  const a=r.kernel[samples[j]];
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,inputs[i]);ctx.bezierCurveTo(w*.18,inputs[i],w*.2,ys[j],centerX,ys[j]);ctx.strokeStyle=`rgba(25,153,157,${.025+.18*a})`;ctx.lineWidth=.7;ctx.stroke();}
 }
 let max=0;for(let j=0;j<77;j++)for(let k=0;k<5;k++)if(visibleMode(k)<model.meta.modes)max=Math.max(max,Math.abs(r.kernel[samples[j]]*model.weights[samples[j]*model.meta.modes+visibleMode(k)]));
 for(let k=0;k<5;k++){
  if(visibleMode(k)>=model.meta.modes)continue;
  const q=$('coefficient'+k).querySelector('.bar-track').getBoundingClientRect(),end=q.top+q.height/2-rect.top;
  for(let j=0;j<77;j++){
   const contribution=r.kernel[samples[j]]*model.weights[samples[j]*model.meta.modes+visibleMode(k)],importance=Math.sqrt(Math.abs(contribution)/(max||1));
   const dim=visibleMode(k)>=state.count?.08:state.focused>=0&&state.focused!==visibleMode(k)?.2:1;
   ctx.beginPath();ctx.moveTo(centerX,ys[j]);ctx.bezierCurveTo(w*.7,ys[j],w*.7,end,w,end);
   ctx.strokeStyle=contribution>=0?`rgba(157,111,225,${(.015+.25*importance)*dim})`:`rgba(28,157,158,${(.015+.25*importance)*dim})`;ctx.lineWidth=.45+.5*importance;ctx.stroke();
  }
 }
 for(let j=0;j<77;j++){ctx.beginPath();ctx.arc(centerX,ys[j],2.4+1.25*r.kernel[samples[j]],0,Math.PI*2);ctx.fillStyle=`rgba(83,157,167,${.18+.8*r.kernel[samples[j]]})`;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=.6;ctx.stroke();}
}
function modeExplanation(k){
 if(!state.ready)return;
 state.focused=k;scheduleRender();
 $('helpTitle').textContent=k<0?'Mean temperature rise + inlet temperature':'POD spatial mode '+(k+1);
 $('helpBody').replaceChildren();
 const p=document.createElement('p');p.textContent=k<0?'The baseline is the training-set mean temperature rise above the inlet, plus your current inlet temperature. All 24 POD contributions complete the field.':'This fixed spatial pattern was extracted from the training temperature fields. Its current coefficient determines the strength and sign of its contribution. Red and blue indicate opposite signed values, not hot and cold temperatures.';
 $('helpBody').append(p);
 const n=model.meta.pointsPerSide;
 for(let side=0;side<2;side++){
  const title=document.createElement('p');title.className='mode-description';title.textContent=(side===0?'Upper':'Lower')+' cut plane'+(k<0?'':` · a${k+1} = ${signed(state.result.coeff[k],3)}`);$('helpBody').append(title);
  const c=document.createElement('canvas');c.width=483;c.height=387;
  const data=k<0?baseline().subarray(side*n,(side+1)*n):model.modes.subarray(k*n*2+side*n,k*n*2+(side+1)*n);
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
  const pred=model.predict(c.flow,c.tin,c.soc,c.crate,c.ambient,state.count).field,err=errors(pred,truth),n=model.meta.pointsPerSide;
  const abs=new Float64Array(pred.length);for(let i=0;i<pred.length;i++)abs[i]=Math.abs(pred[i]-truth[i]);
  const errorMax=Math.max(.1,Math.ceil(err.max*100)/100);const st=statistics(truth),ps=statistics(pred),range=state.autoScale?[Math.floor(Math.min(st.min,ps.min)),Math.ceil(Math.max(st.max,ps.max))]:[10,50];
  for(const [side,offset] of [['Upper',0],['Lower',n]]){
   drawField($('v'+side+'True'),truth.subarray(offset,offset+n),...range);
   drawField($('v'+side+'Pred'),pred.subarray(offset,offset+n),...range);
   drawField($('v'+side+'Error'),abs.subarray(offset,offset+n),0,errorMax,'error');
  }
  $('caseRmse').textContent=err.rmse.toFixed(4)+' K';$('caseMae').textContent=err.mae.toFixed(4)+' K';$('caseMax').textContent=err.max.toFixed(4)+' K';$('validationModes').textContent=state.count+' / '+model.meta.modes+' modes';
  $('validationValues').textContent=c.flow.toFixed(6)+' kg/s  ·  '+c.tin.toFixed(2)+'°C · SOC '+(c.soc*100).toFixed(2)+'% · '+c.crate.toFixed(2)+'C · Ambient '+c.ambient.toFixed(2)+'°C';
  $('upperErrorScale').textContent='Upper · error scale 0–'+errorMax.toFixed(2)+' K';$('lowerErrorScale').textContent='Lower · error scale 0–'+errorMax.toFixed(2)+' K';
  $('validationStatus').textContent=c.id+' · Independent test condition · '+(state.count===model.meta.modes?'Full model reconstruction':'Truncated reconstruction; benchmark below remains the full model');
 }catch(e){$('validationStatus').textContent='Could not load this reference: '+e.message;}
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function exportCSV(){
 if(!state.ready)return;const n=model.meta.pointsPerSide,lines=[`# POD + RBF v2.0; initial SOC ${state.soc/100}; rate ${state.crate} C; endpoint SOC 1; t=${3600*(1-state.soc/100)/state.crate} s; initial and ambient ${state.ambient} degC`,
  '# M_flow_in='+state.flow+' kg/s; T_cool_in='+state.tin+' degC; retained modes='+state.count,'side,x_m,y_m,z_m,temperature_degC'];
 for(let side=0;side<2;side++)for(let p=0;p<n;p++)lines.push([(side?'lower':'upper'),(-.3+(p%161)*.00375).toFixed(5),(Math.floor(p/161)*.00375).toFixed(5),side?.0085:.0865,state.result.field[side*n+p].toFixed(7)].join(','));
 download(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}),`battery_${state.flow.toFixed(6)}_${state.tin.toFixed(2)}_SOC${state.soc}_C${state.crate}_amb${state.ambient}.csv`);toast('Both cut-plane fields exported.');
}
function paintText(ctx,text,x,y){ctx.fillText(tr(text),x,y);}
function exportPNG(){
 if(!state.ready)return;const c=document.createElement('canvas');c.width=1400;c.height=760;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#263b4d';ctx.font='bold 25px Arial';paintText(ctx,'Battery cooling · POD + RBF prediction',35,45);ctx.font='16px Arial';ctx.fillStyle='#627788';paintText(ctx,`Flow ${state.flow.toFixed(6)} kg/s  |  Inlet ${state.tin.toFixed(2)}°C  |  Initial SOC ${state.soc.toFixed(2)}% → 100%`,35,77);paintText(ctx,`Rate ${state.crate.toFixed(2)}C  |  Initial / ambient ${state.ambient.toFixed(2)}°C  |  Endpoint ${(3600*(1-state.soc/100)/state.crate).toFixed(1)} s  |  ${state.count}/${model.meta.modes} modes`,35,101);
 for(let side=0;side<2;side++){const x=35+side*690;ctx.fillStyle='#263b4d';ctx.font='bold 18px Arial';paintText(ctx,(side?'Lower · z=8.5 mm':'Upper · z=86.5 mm'),x,120);ctx.drawImage($(side?'lower':'upper'),x,140,620,497);const stats=statistics(state.result.field.subarray(side*20769,(side+1)*20769));ctx.font='15px Arial';paintText(ctx,`Peak ${stats.max.toFixed(2)}°C  |  Sample mean ${stats.mean.toFixed(2)}°C`,x,669);}
 ctx.font='13px Arial';ctx.fillStyle='#8395a2';const [min,max]=scale();paintText(ctx,`Shared color scale: ${min.toFixed(1)} to ${max.toFixed(1)}°C. Internal cut-plane fields; simulation-validated five-input model v2.0.`,35,720);c.toBlob(b=>download(b,'battery_cooling_prediction.png'),'image/png');
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
 for(let k=0;k<5;k++){$('coefficient'+k).onclick=()=>modeExplanation(visibleMode(k));$('modeTile'+k).onclick=()=>modeExplanation(visibleMode(k));}$('meanTile').onclick=()=>modeExplanation(-1);
 for(const id of inputKeys){
  $(id).addEventListener('input',()=>{stopSweep();state[id]=Number($(id).value);$('preset').value='custom';updateControls();scheduleRender();});
  $(id+'Number').addEventListener('input',()=>{const v=$(id+'Number').valueAsNumber,min=controls[id][0],max=controls[id][1];if(!Number.isFinite(v)||v<min||v>max){$(id+'Number').setAttribute('aria-invalid','true');$('inputMessage').textContent=`Enter ${min}–${max}${({flow:' kg/s',tin:'°C',soc:'%',crate:'C',ambient:'°C'})[id]}.`;$('inputMessage').style.color='#b24935';return;}stopSweep();state[id]=v;$(id).value=v;$('preset').value='custom';scheduleRender();});
  $(id+'Number').addEventListener('change',()=>updateControls());
 }
 $('lessModes').onclick=()=>{state.count=Math.max(1,state.count-1);scheduleRender();};$('moreModes').onclick=()=>{state.count=Math.min(model.meta.modes,state.count+1);scheduleRender();};
 $('modePage').onchange=()=>{state.page=Number($('modePage').value);state.focused=-1;scheduleRender();};
 $('scaleToggle').onclick=()=>{state.autoScale=!state.autoScale;$('scaleToggle').textContent=state.autoScale?'Adaptive scale':'Fixed scale';scheduleRender();};
 $('validationButton').onclick=showValidation;
 $('notesButton').onclick=()=>openDialog('notesDialog');
 for(const el of document.querySelectorAll('[data-close]'))el.onclick=()=>el.closest('dialog').close();
 for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 $('helpDialog').addEventListener('close',()=>{state.focused=-1;scheduleRender();});
 const help={inputs:['Five continuous inputs','Choose flow, inlet temperature, initial SOC, charging rate and ambient temperature. The initial battery temperature equals ambient. Each update predicts both fields at 100% SOC.'],rbf:['Gaussian radial basis model','Five normalized inputs drive 230 Gaussian centers and an affine term to predict 24 POD coefficients. The fan shows 77 evenly selected centers and the five currently displayed modes; every prediction uses all 230 centers.'],coefficients:['24 coefficients reconstruct the field','All 24 modes are used by default. The selector changes which five modes are displayed; it does not change the prediction. The minus and plus buttons control truncation.'],fields:['Charging-endpoint fields','Upper and lower internal cut planes are at 86.5 and 8.5 mm. The endpoint is SOC 100%, with t = 3600 × (1 − initial SOC) / C-rate. Peak and mean values describe these sampled planes.']};
 for(const b of document.querySelectorAll('[data-help]'))b.onclick=()=>{$('helpTitle').textContent=help[b.dataset.help][0];$('helpBody').textContent=help[b.dataset.help][1];openDialog('helpDialog');};
 $('validationCase').onchange=updateValidation;
 $('applyCase').onclick=()=>{const c=model.meta.testCases.find(c=>c.id===$('validationCase').value);stopSweep();for(const id of inputKeys)state[id]=id==='soc'?c.soc*100:c[id];updateControls();scheduleRender();$('validationDialog').close();toast('Applied '+c.id+' to the live model.');};
 $('preset').onchange=()=>{stopSweep();const p={balanced:[.0115,29.3,35,3,25],cool:[.02,25,35,3,25],warm:[.006,35,35,3,25]};if(p[$('preset').value]){inputKeys.forEach((id,i)=>state[id]=p[$('preset').value][i]);updateControls();scheduleRender();}};
 $('csvButton').onclick=exportCSV;$('pngButton').onclick=exportPNG;
 $('shareButton').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('flow',state.flow.toFixed(6));url.searchParams.set('tin',state.tin.toFixed(2));for(const id of ['soc','crate','ambient'])url.searchParams.set(id,state[id]);url.searchParams.set('modes',state.count);url.searchParams.set('lang',getLanguage());try{await navigator.clipboard.writeText(url.toString());toast('Link with current inputs copied.');}catch{toast('Copy this page URL after updating your inputs.');history.replaceState(null,'',url.toString());}};
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
installI18n(()=>{if(state.ready){render();if($('validationDialog').open)updateValidation();}});
for(const id of ['sweepButton','validationButton','csvButton','pngButton','lessModes','moreModes'])$(id).disabled=true;
model.load().then(()=>{
 state.ready=true;for(const id of ['sweepButton','validationButton','csvButton','pngButton','lessModes','moreModes'])$(id).disabled=false;
 $('validationCase').innerHTML=model.meta.testCases.map(c=>`<option value="${c.id}">${c.id} · ${c.flow.toFixed(6)} kg/s</option>`).join('');
 const params=new URLSearchParams(location.search);
 for(const id of inputKeys){const v=Number(params.get(id)),[min,max]=controls[id];if(params.has(id)&&Number.isFinite(v)&&v>=min&&v<=max)state[id]=v;}
 const k=Number(params.get('modes'));if(Number.isInteger(k)&&k>=1&&k<=model.meta.modes)state.count=k;
 updateControls();render();
}).catch(e=>{$('loadError').hidden=false;$('loadError').textContent=e.message+' Refresh to retry.';});
