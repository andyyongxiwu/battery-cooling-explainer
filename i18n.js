let language='en';
const dictionary={
 'Battery Intelligence':'电池智能预测','Battery Thermal Explorer':'电池热管理预测平台',
 'Model notes':'模型说明','Validation':'模型验证','Play sweep':'播放扫描','Pause sweep':'暂停扫描',
 'Inputs':'输入参数','Features':'特征','Gaussian RBF':'高斯 RBF','Coefficients':'POD 系数','Spatial modes':'空间模态','Battery in vehicle':'电池温度场',
 'Coolant mass flow':'冷却液质量流量','Coolant inlet temperature':'冷却液入口温度','Initial state of charge':'初始荷电状态','Charging rate':'充电倍率','Ambient / initial temperature':'环境／初始温度',
 'log flow':'对数流量','inlet':'入口温度','initial SOC':'初始 SOC','C-rate':'充电倍率','ambient':'环境温度','Normalized':'归一化','to [−1, 1]':'至 [−1, 1]',
 'STARTING POINT':'预设工况','Custom inputs':'自定义参数','Balanced cooling':'均衡冷却','Cool inlet / high flow':'低入口温度／高流量','Warm inlet / low flow':'高入口温度／低流量',
 'RBF centers · 77 shown':'个 RBF 中心 · 展示 77 个','Positive contribution':'正贡献','Negative':'负贡献','modes':'个模态',
 'Predicted for your':'根据当前','current inputs':'输入实时预测','LIVE PREDICTION':'实时预测','TRUNCATED RECONSTRUCTION':'截断模态重建',
 'Fixed scale':'固定温标','Adaptive scale':'自适应温标','Upper':'上切面','Lower':'下切面','Inspect field':'查看温度场','FRONT ↑':'车头 ↑',
 'Move over the battery to inspect temperature':'将鼠标移至电池包查看温度','Upper peak':'上切面最高温度','Lower peak':'下切面最高温度','Upper mean':'上切面平均温度','Lower mean':'下切面平均温度',
 'Temperature CSV':'温度 CSV','Field image':'温度场图片','Share state':'分享当前工况','INDEPENDENT VALIDATION':'独立测试验证',
 'Physics, prediction & the difference.':'物理仿真、模型预测与误差',
 'Compare with COMSOL on cases excluded from fitting, mean-field construction and POD basis generation.':'与独立 COMSOL 工况对比；这些工况未参与拟合、均值场计算及 POD 基生成。',
 'Held-out condition':'独立测试工况','Use these inputs':'使用此工况','Current case RMSE':'当前工况 RMSE','Current case MAE':'当前工况 MAE','Largest point error':'最大单点误差','Reconstruction':'模态重建',
 'Error':'误差','POD + RBF prediction':'POD＋RBF 预测','Absolute error':'绝对误差','Upper cut plane':'上切面','Lower cut plane':'下切面','Overall test RMSE':'测试集总体 RMSE','Overall largest point error':'测试集最大单点误差','Training / validation / test cases':'训练／验证／测试工况数',
 'Benchmark figures use the full 24-mode model. Temperature panels share the current temperature scale. Error panels share the displayed error scale. For custom conditions without a COMSOL solution, only a prediction is available.':'基准指标使用完整的 24 模态模型。温度图共用温标，误差图共用误差标尺。未提供 COMSOL 解的自定义工况只能显示预测结果。',
 'Five-input endpoint model':'五输入充电终点预测模型','Inputs and endpoint':'输入与充电终点','Prediction':'预测方法','Data and validation':'数据与验证','Scope':'适用范围',
 'Flow: 0.005–0.020 kg/s. Inlet temperature: 25–35°C. Initial SOC: 10–60%. Charging rate: 1–5C. Ambient temperature: 10–40°C. Battery initial temperature equals ambient. The endpoint is SOC 100%, at t = 3600 × (1 − SOC₀) / C-rate seconds. This is a charging endpoint, not steady state.':'质量流量：0.005–0.020 kg/s；入口温度：25–35℃；初始 SOC：10–60%；充电倍率：1–5C；环境温度：10–40℃。电池初始温度等于环境温度，充电终点为 SOC 100%，对应时间 t = 3600 × (1 − SOC₀) / 充电倍率（秒）。这是充电终点温度，不能视为稳态温度。',
 'The model learns temperature rise above the coolant inlet. A training-only mean rise, the current inlet temperature and 24 POD mode contributions reconstruct two 161 × 129 fields. Gaussian RBF uses 230 centers, ε = 0.25, ridge = 0.0001 and an affine term. The fan draws 77 representative centers; all 230 are evaluated. Five modes are displayed at a time; all 24 are used by default.':'模型学习相对于冷却液入口温度的温升。仅由训练集计算的平均温升、当前入口温度和 24 个 POD 模态共同重建两个 161 × 129 温度场。高斯 RBF 包含 230 个中心，ε = 0.25，正则化参数为 0.0001，并含仿射项。连线图展示 77 个代表中心，计算时使用全部 230 个中心。每页展示 5 个模态，默认使用全部 24 个模态进行预测。',
 '304 complete cases: 230 training, 34 validation and 40 independent test cases. The planned GTR011–GTR020 and GVA005–GVA010 exports are missing and excluded. Actual endpoint SOC was audited for all included cases. Model selection used validation only. Test RMSE: 0.07784 K; largest point error: 0.26598 K.':'共有 304 个完整工况：训练 230 个、验证 34 个、独立测试 40 个。计划中的 GTR011–GTR020 和 GVA005–GVA010 导出缺失，未纳入模型。所有有效工况均核对了实际终点 SOC。模型选择仅使用验证集。测试 RMSE 为 0.07784 K，最大单点误差为 0.26598 K。',
 'Geometry and nominal cell capacity are fixed. Predictions accept new continuous combinations in the stated ranges. Reported errors compare against COMSOL, not experiments, and do not guarantee accuracy at every new input. Peak and mean values describe the internal cut planes, not the entire battery volume. Upper: z = 86.5 mm. Lower: z = 8.5 mm.':'几何结构与电芯额定容量固定，支持范围内新的连续参数组合。误差基于与 COMSOL 的对比，尚未经过实验验证，也不代表所有新工况的误差保证。最高温度与平均温度仅针对内部采样切面。上切面 z = 86.5 mm，下切面 z = 8.5 mm。',
 'Five continuous inputs':'五个连续输入','Choose flow, inlet temperature, initial SOC, charging rate and ambient temperature. The initial battery temperature equals ambient. Each update predicts both fields at 100% SOC.':'选择质量流量、入口温度、初始 SOC、充电倍率和环境温度。电池初始温度等于环境温度，每次更新预测充电至 SOC 100% 时的上下切面温度场。',
 'Gaussian radial basis model':'高斯径向基模型','Five normalized inputs drive 230 Gaussian centers and an affine term to predict 24 POD coefficients. The fan shows 77 evenly selected centers and the five currently displayed modes; every prediction uses all 230 centers.':'五个归一化输入通过 230 个高斯中心及仿射项预测 24 个 POD 系数。连线图展示均匀选取的 77 个中心与当前页的 5 个模态；实际预测使用全部 230 个中心。',
 '24 coefficients reconstruct the field':'24 个系数重建温度场','All 24 modes are used by default. The selector changes which five modes are displayed; it does not change the prediction. The minus and plus buttons control truncation.':'默认使用全部 24 个模态。下拉框切换展示的 5 个模态，不改变预测结果；减号与加号控制参与重建的模态数量。',
 'Charging-endpoint fields':'充电终点温度场','Upper and lower internal cut planes are at 86.5 and 8.5 mm. The endpoint is SOC 100%, with t = 3600 × (1 − initial SOC) / C-rate. Peak and mean values describe these sampled planes.':'上下内部切面分别位于 86.5 和 8.5 mm。充电终点为 SOC 100%，对应时间 t = 3600 × (1 − 初始 SOC) / 充电倍率。最高温度与平均温度描述的是采样切面。',
 'Mean temperature rise + inlet temperature':'平均温升＋入口温度','The baseline is the training-set mean temperature rise above the inlet, plus your current inlet temperature. All 24 POD contributions complete the field.':'基准场等于训练集相对入口的平均温升，加上当前入口温度，再叠加 24 个 POD 模态贡献形成完整温度场。',
 'This fixed spatial pattern was extracted from the training temperature fields. Its current coefficient determines the strength and sign of its contribution. Red and blue indicate opposite signed values, not hot and cold temperatures.':'此固定空间形状由训练温度场提取。当前系数决定其贡献的强度与正负；红蓝表示数值符号相反，不直接代表温度高低。',
 'Predicted internal cut-plane temperatures':'内部切面温度预测','Both cut-plane fields exported.':'已导出上下切面温度场。','Link with current inputs copied.':'已复制包含当前参数的链接。','Copy this page URL after updating your inputs.':'当前参数已写入地址栏，请复制网页链接。',
 'Loading COMSOL reference…':'正在加载 COMSOL 参考解…','Full model reconstruction':'完整模型重建','Truncated reconstruction; benchmark below remains the full model':'截断模态重建；下方基准指标仍对应完整模型',
 'Visitors around the world':'全球访客','Country / region statistics · Powered by Flag Counter':'国家／地区访问统计 · 由 Flag Counter 提供',
 'About model inputs':'关于输入参数','About radial basis functions':'关于径向基函数','About POD coefficients':'关于 POD 系数','About the predicted temperature fields':'关于预测温度场',
 'Choose internal cut plane':'选择内部切面','Spatial modes to display':'选择展示的空间模态','Use one fewer POD mode':'减少一个 POD 模态','Use one more POD mode':'增加一个 POD 模态','Switch between a fixed and adaptive temperature scale':'切换固定与自适应温标','Copy a link with the current input parameters':'复制包含当前输入参数的链接',
 'Close validation':'关闭验证','Close model notes':'关闭模型说明','Close explanation':'关闭说明','Prediction pipeline':'预测流程','Switch language':'切换语言',
 'Transparent top-down sedan illustration with a longitudinal battery enclosure':'带纵向电池包的透明车辆俯视图','Transparent underside chassis with a longitudinal battery enclosure':'带纵向电池包的透明车辆底盘图','Live battery temperature in an illustrative vehicle installation':'车辆示意图中的实时电池温度','Visitors by country and region':'按国家和地区统计的访客',
 'Five-input Gaussian RBF responses connected to the displayed POD coefficients':'五输入高斯 RBF 响应与当前展示的 POD 系数连线'
};
const phrases=[
 ['Sweeping conditions · separate endpoint predictions','扫描工况 · 各次更新均为独立终点预测'],['New parameter combination · field calculated live','新参数组合 · 温度场实时计算'],['Training condition · field reconstructed live','训练工况 · 温度场实时重建'],
 ['Held-out condition ','独立测试工况 '],[' · open Validation to compare',' · 打开模型验证进行对比'],[' · Independent test condition · ',' · 独立测试工况 · '],['Could not load this reference: ','无法加载参考数据：'],[' Refresh to retry.',' 请刷新重试。'],['Could not load model assets','无法加载模型数据'],['Choose five inputs within the displayed ranges.','请在所显示的范围内输入五个参数。'],['Invalid mode count','模态数量无效'],
 ['Predicted internal cut-plane temperatures','内部切面温度预测'],['Upper · error scale ','上切面 · 误差范围 '],['Lower · error scale ','下切面 · 误差范围 '],['Upper · z','上切面 · z'],['Lower · z','下切面 · z'],['Upper cut plane','上切面'],['Lower cut plane','下切面'],['POD spatial mode ','POD 空间模态 '],[' · a',' · a'],['Ambient ','环境温度 '],['Inlet ','入口温度 '],['Flow ','流量 '],['Initial SOC ','初始 SOC '],['Initial / ambient ','初始／环境温度 '],['Endpoint ','终点时间 '],['Rate ','倍率 '],['Peak ','最高温度 '],['Sample mean ','切面平均温度 '],['Shared color scale: ','共用温标：'],[' to ',' 至 '],['Internal cut-plane fields; simulation-validated five-input model v2.0.','内部切面温度场；经仿真验证的五输入模型 v2.0。'],['Battery cooling · POD + RBF prediction','电池冷却 · POD＋RBF 预测']
].sort((a,b)=>b[0].length-a[0].length);
export function tr(text){
 if(language!=='zh')return text;
 const leading=text.match(/^\s*/)[0],trailing=text.match(/\s*$/)[0],clean=text.trim();
 if(dictionary[clean])return leading+dictionary[clean]+trailing;
 let value=text;
 if(/^Modes \d+–\d+$/.test(clean))return text.replace(/Modes (\d+–\d+)/,'模态 $1');
 if(/^\d+( \/ \d+)? modes$/.test(clean))return text.replace(' modes',' 个模态');
 if(/^Enter /.test(clean))return text.replace('Enter ','请输入 ');
 if(/^Applied /.test(clean))return text.replace('Applied ','已将 ').replace(' to the live model.',' 应用于实时预测。');
 if(/^Inspect coefficient /.test(clean))return text.replace('Inspect coefficient ','查看系数 ');
 if(/^Inspect POD mode /.test(clean))return text.replace('Inspect POD mode ','查看 POD 模态 ');
 if(clean==='Inspect mean field')return '查看均值场';
 for(const [en,zh] of phrases)value=value.split(en).join(zh);
 for(const [en,zh] of Object.entries(dictionary).sort((a,b)=>b[0].length-a[0].length))value=value.split(en).join(zh);
 // Match combined status text without altering scientific symbols or numeric values.
 for(const key of ['Full model reconstruction','Truncated reconstruction; benchmark below remains the full model'])value=value.replace(key,dictionary[key]);
 return value;
}
export function getLanguage(){return language;}
export function installI18n(onChange){
 const originals=new WeakMap(),attributeOriginals=new WeakMap();
 function translate(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   if(['SCRIPT','STYLE'].includes(node.parentElement?.tagName)||node.parentElement?.closest('[data-no-i18n]'))continue;
   const previous=originals.get(node),current=node.nodeValue;
   const source=previous&&current===previous.last?previous.source:current;
   const last=tr(source);originals.set(node,{source,last});if(current!==last)node.nodeValue=last;
  }
  for(const element of document.querySelectorAll('[aria-label],[title],img[alt]')){
   const prior=attributeOriginals.get(element)??{};
   for(const attr of ['aria-label','title','alt'])if(element.hasAttribute(attr)){
    const current=element.getAttribute(attr),old=prior[attr],source=old&&current===old.last?old.source:current,last=tr(source);prior[attr]={source,last};if(current!==last)element.setAttribute(attr,last);
   }
   attributeOriginals.set(element,prior);
  }
  document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=language==='zh'?'电池热管理预测平台 — 电池智能预测':'Battery Thermal Explorer — Battery Intelligence';
  const toggle=document.getElementById('languageToggle'),label=language==='zh'?'中文':'EN';if(toggle.textContent!==label)toggle.textContent=label;
 }
 function localizeNavigation(){
  for(const link of document.querySelectorAll('.suite-links a,.suite-brand')){
   const url=new URL(link.href);url.searchParams.set('lang',language);link.href=url.href;
  }
 }
 function setLanguage(next){language=next==='zh'?'zh':'en';try{localStorage.setItem('batteryLanguage',language);}catch{}localizeNavigation();translate();onChange?.();}
 const params=new URLSearchParams(location.search);let saved;try{saved=localStorage.getItem('batteryLanguage');}catch{}
 language=params.get('lang')==='zh'?'zh':params.get('lang')==='en'?'en':saved==='zh'?'zh':'en';
 localizeNavigation();
 document.getElementById('languageToggle').onclick=()=>setLanguage(language==='en'?'zh':'en');
 new MutationObserver(translate).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
 translate();
}
