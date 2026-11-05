export class ThermalModel {
  async load(){
    const [meta,buffer]=await Promise.all([fetch('./assets/model.json').then(check).then(r=>r.json()),fetch('./assets/model.bin').then(check).then(r=>r.arrayBuffer())]);
    this.meta=meta;let offset=0;const data=new Float64Array(buffer);
    for(const item of meta.layout){this[item.key==='centers'?'centers':item.key]=data.subarray(offset,offset+item.length);offset+=item.length;}
    if(offset!==data.length)throw Error('Model asset has an unexpected length.');
    return this;
  }
  predict(flow,tin,count=5){
    if(!Number.isFinite(flow)||!Number.isFinite(tin)||flow<.005||flow>.02||tin<25||tin>35)throw Error('Choose a flow from 0.005–0.020 kg/s and an inlet temperature from 25–35°C.');
    const start=performance.now(),u=[2*Math.log(flow/.005)/Math.log(4)-1,2*(tin-25)/10-1];
    const kernel=new Float64Array(77),coeff=new Float64Array(5);
    for(let j=0;j<77;j++){const dx=u[0]-this.centers[j*2],dy=u[1]-this.centers[j*2+1];kernel[j]=Math.exp(-this.meta.epsilon*(dx*dx+dy*dy));for(let k=0;k<5;k++)coeff[k]+=kernel[j]*this.weights[j*5+k];}
    const n=this.meta.pointsPerSide*2,field=new Float64Array(this.mean);
    for(let k=0;k<count;k++){const a=coeff[k],base=k*n;for(let p=0;p<n;p++)field[p]+=a*this.modes[base+p];}
    return {field,coeff,kernel,u,milliseconds:performance.now()-start};
  }
  async truth(id){
    if(!this.meta.testCases.some(c=>c.id===id))throw Error('Unknown validation case');
    this.cache??=new Map();if(!this.cache.has(id))this.cache.set(id,fetch('./assets/'+id+'.bin').then(check).then(r=>r.arrayBuffer()).then(b=>new Float32Array(b)));
    return this.cache.get(id);
  }
}
function check(r){if(!r.ok)throw Error('Could not load model assets ('+r.status+').');return r;}
export function statistics(field){let min=Infinity,max=-Infinity,sum=0,hot=0;for(let i=0;i<field.length;i++){const v=field[i];sum+=v;if(v<min)min=v;if(v>max){max=v;hot=i;}}return {min,max,mean:sum/field.length,hot};}
export function errors(pred,truth){let sum=0,abs=0,max=0;for(let i=0;i<pred.length;i++){const e=Math.abs(pred[i]-truth[i]);sum+=e*e;abs+=e;max=Math.max(max,e);}return {rmse:Math.sqrt(sum/pred.length),mae:abs/pred.length,max};}
