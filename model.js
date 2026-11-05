export class ThermalModel {
  async load(){
    const meta=await fetch('./assets/model-five.json').then(check).then(r=>r.json());
    const parts=await Promise.all(meta.parts.map(name=>fetch('./assets/'+name).then(check).then(r=>r.arrayBuffer())));
    const bytes=new Uint8Array(parts.reduce((n,b)=>n+b.byteLength,0));let pos=0;for(const part of parts){bytes.set(new Uint8Array(part),pos);pos+=part.byteLength;}const buffer=bytes.buffer;
    this.meta=meta;let offset=0;const data=new Float64Array(buffer);
    for(const item of meta.layout){this[item.key==='centers'?'centers':item.key]=data.subarray(offset,offset+item.length);offset+=item.length;}
    if(offset!==data.length)throw Error('Model asset has an unexpected length.');
    return this;
  }
  predict(flow,tin,soc,crate,ambient,count=this.meta.modes){
    const values=[flow,tin,soc,crate,ambient],bounds=[[.005,.02],[25,35],[.1,.6],[1,5],[10,40]];
    if(values.some((v,i)=>!Number.isFinite(v)||v<bounds[i][0]||v>bounds[i][1]))throw Error('Choose five inputs within the displayed ranges.');
    if(!Number.isInteger(count)||count<1||count>this.meta.modes)throw Error('Invalid mode count');
    const start=performance.now(),u=[2*Math.log(flow/.005)/Math.log(4)-1,2*(tin-25)/10-1,2*(soc-.1)/.5-1,2*(crate-1)/4-1,2*(ambient-10)/30-1];
    const m=this.meta.modes,centers=this.meta.centers,kernel=new Float64Array(centers),coeff=new Float64Array(m);
    for(let j=0;j<centers;j++){let distance=0;for(let i=0;i<5;i++)distance+=(u[i]-this.centers[j*5+i])**2;kernel[j]=Math.exp(-this.meta.epsilon*distance);for(let k=0;k<m;k++)coeff[k]+=kernel[j]*this.weights[j*m+k];}
    for(let k=0;k<m;k++){coeff[k]+=this.affine[k];for(let i=0;i<5;i++)coeff[k]+=u[i]*this.affine[(i+1)*m+k];}
    const n=this.meta.pointsPerSide*2,field=new Float64Array(this.mean);
    for(let p=0;p<n;p++)field[p]+=tin;
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
