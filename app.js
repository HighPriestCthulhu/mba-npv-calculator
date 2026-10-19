'use strict';
let CH={},CURR='£',DUR=1;
const SCHOOLS={
  custom: {badge:'MBA',      school:'Your Business School',                prog:'MBA · click to edit programme details',        tuition:100000, dur:1,currency:'£'},
  said:   {badge:'OXFORD',   school:'Saïd Business School',                prog:'MBA · 1-year programme · 2026 entry',          tuition:88800,  dur:1,currency:'£'},
  lbs:    {badge:'LBS',      school:'London Business School',               prog:'MBA · 15–21 month programme · 2026 intake',    tuition:123950, dur:1,currency:'£'},
  judge:  {badge:'CAMBRIDGE',school:'Cambridge Judge Business School',      prog:'MBA · 1-year programme · Sept 2026',           tuition:80000,  dur:1,currency:'£'},
  warwick:{badge:'WARWICK',  school:'Warwick Business School',              prog:'MBA · 1-year programme · Sept 2026',           tuition:59500,  dur:1,currency:'£'},
  insead: {badge:'INSEAD',   school:'INSEAD',                               prog:'MBA · 10-month programme · Aug 2026/Jan 2027', tuition:109860, dur:1,currency:'€'},
  hbs:    {badge:'HBS',      school:'Harvard Business School',              prog:'MBA · 2-year programme · Class of 2027',       tuition:163460, dur:2,currency:'$'},
  wharton:{badge:'WHARTON',  school:'The Wharton School',                   prog:'MBA · 2-year programme · 2026-27',             tuition:186016, dur:2,currency:'$'},
  stanford:{badge:'GSB',     school:'Stanford Graduate School of Business', prog:'MBA · 2-year programme · 2025-26',             tuition:171510, dur:2,currency:'$'},
  hec:    {badge:'HEC',      school:'HEC Paris',                            prog:'MBA · 16-month programme · Jan/Sept 2026',     tuition:102000, dur:1,currency:'€'},
};
const SCEN={
  base:  {pre_salary:75000,post_salary:120000,growth:5,  no_growth:3.5,years:25,scholarship:0,living:25000,loan:60000,loan_rate:6,  loan_term:10,disc:8, tax:40,age:30,retire_age:60,spend:30000,spend_growth:2.5,save_rate:25,inv_ret:6,withdraw:4},
  bull:  {pre_salary:80000,post_salary:160000,growth:8,  no_growth:4,  years:25,scholarship:0,living:25000,loan:60000,loan_rate:5,  loan_term:10,disc:8, tax:40,age:30,retire_age:60,spend:35000,spend_growth:2.5,save_rate:30,inv_ret:7,withdraw:4},
  bear:  {pre_salary:60000,post_salary:95000, growth:3,  no_growth:3,  years:25,scholarship:0,living:30000,loan:60000,loan_rate:8,  loan_term:10,disc:10,tax:40,age:32,retire_age:60,spend:30000,spend_growth:3,  save_rate:15,inv_ret:5,withdraw:3.5},
  noLift:{pre_salary:75000,post_salary:75000, growth:3.5,no_growth:3.5,years:25,scholarship:0,living:25000,loan:0,    loan_rate:6,  loan_term:10,disc:8, tax:40,age:30,retire_age:60,spend:30000,spend_growth:2.5,save_rate:25,inv_ret:6,withdraw:4},
};
const g=id=>parseFloat(document.getElementById(id).value);
const gb=id=>document.getElementById(id).checked;
const sv=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
function fmt(n,d){
  const a=Math.abs(n),s=n<0?'-':'';
  if(a>=1e6)return s+CURR+(a/1e6).toFixed(d??2)+'m';
  if(a>=1e3)return s+CURR+(d!=null?(a/1e3).toFixed(d):Math.round(a/1e3))+'k';
  return s+CURR+Math.round(a);
}
function ann(P,r,y){
  if(!P||!y)return 0;if(!r)return P/y;
  const m=r/100/12,n=y*12;
  return P*m*Math.pow(1+m,n)/(Math.pow(1+m,n)-1)*12;
}
function irr(cfs){
  if(!cfs.some(v=>v>0)||!cfs.some(v=>v<0))return null;
  let lo=-0.99,hi=50,mid;
  for(let i=0;i<400;i++){mid=(lo+hi)/2;const v=cfs.reduce((s,c,t)=>s+c/Math.pow(1+mid,t),0);if(Math.abs(v)<0.5)break;v>0?lo=mid:hi=mid;}
  return mid;
}
function loadSchool(k,btn){
  const s=SCHOOLS[k];
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');
  document.getElementById('hdr_badge').textContent=s.badge;
  document.getElementById('school_name').value=s.school;
  document.getElementById('prog_name').value=s.prog;
  document.getElementById('tuition').value=s.tuition;
  document.getElementById('currency').value=s.currency;
  document.getElementById('scholarship').max=s.tuition;
  document.querySelectorAll('#dur_pills .pill').forEach((p,i)=>p.classList.toggle('on',i+1===s.dur));
  DUR=s.dur;CURR=s.currency;update();
}
function loadScenario(k,btn){
  document.querySelectorAll('.sc-btn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  Object.entries(SCEN[k]).forEach(([id,v])=>{const e=document.getElementById(id);if(e&&e.type!=='checkbox')e.value=v;});
  update();
}
function setDur(y,el){DUR=y;document.querySelectorAll('#dur_pills .pill').forEach((p,i)=>p.classList.toggle('on',i+1===y));update();}
function update(){
  const T=g('tuition'),SC=Math.min(g('scholarship'),T),LV=g('living'),LN=g('loan'),LR=g('loan_rate'),LT=g('loan_term');
  const PS=g('pre_salary'),OS=g('post_salary'),GR=g('growth')/100,NG=g('no_growth')/100,YR=g('years');
  const DR=g('disc')/100,TR=g('tax')/100,OC=gb('opp_cost'),AT=gb('after_tax'),SI=gb('signing'),SA=g('signing_amt');
  const CA=g('age'),RA=g('retire_age'),SP=g('spend'),SG=g('spend_growth')/100,SR=g('save_rate')/100,IR=g('inv_ret')/100,WR=g('withdraw')/100;
  CURR=document.getElementById('currency').value;
  document.getElementById('scholarship').max=T;
  document.getElementById('sa_ctrl').style.display=SI?'':'none';
  const lmap={lbl_tuition:fmt(T),lbl_pre:fmt(PS),lbl_post:fmt(OS),lbl_growth:g('growth')+'%',lbl_no_growth:g('no_growth')+'%',lbl_years:YR,
    lbl_scholarship:fmt(SC),lbl_living:fmt(LV),lbl_loan:fmt(LN),lbl_rate:g('loan_rate')+'%',lbl_term:LT,lbl_disc:g('disc')+'%',lbl_tax:g('tax')+'%',
    lbl_sa:fmt(SA),lbl_age:CA,lbl_retire_age:RA,lbl_spend:fmt(SP),lbl_sg:g('spend_growth')+'%',lbl_sr:g('save_rate')+'%',lbl_ir:g('inv_ret')+'%',lbl_wr:g('withdraw')+'%'};
  Object.entries(lmap).forEach(([id,v])=>sv(id,v));
  const NT=Math.max(0,T-SC),LP=ann(LN,LR,LT),TI=Math.max(0,LP*LT-LN);
  const tpY=NT/DUR,lpY=LN/DUR;
  const mY=[],nY=[];
  for(let y=0;y<DUR;y++){
    mY.push(-(tpY+LV)+lpY);
    const ns=PS*Math.pow(1+NG,y);
    nY.push(OC?(AT?ns*(1-TR):ns):0);
  }
  for(let y=1;y<=YR;y++){
    let ms=OS*Math.pow(1+GR,y-1);if(y===1&&SI)ms+=SA;
    let mc=AT?ms*(1-TR):ms;const cy=DUR+y-1;if(cy<=LT)mc-=LP;mY.push(mc);
    const ns=PS*Math.pow(1+NG,DUR+y-1);nY.push(AT?ns*(1-TR):ns);
  }
  const inc=mY.map((v,i)=>v-(nY[i]||0));
  const npv=inc.reduce((s,c,t)=>s+c/Math.pow(1+DR,t),0);
  const r=irr(inc);
  let cum=0,pb=null;inc.forEach((v,i)=>{cum+=v;if(cum>=0&&pb===null)pb=i;});
  const TC=NT+LV*DUR+TI;
  const ytr=RA-CA;
  const mP=[],nP=[];let mp=0,np=0;
  for(let y=0;y<=ytr;y++){
    let mn;
    if(y<DUR){mn=-(tpY+LV)+lpY;}
    else{const cy=y-DUR+1;let ms=OS*Math.pow(1+GR,cy-1);if(cy===1&&SI)ms+=SA;mn=AT?ms*(1-TR):ms;const cr=DUR+cy-1;if(cr<=LT)mn-=LP;}
    const ms2=SP*Math.pow(1+SG,y);mp=mp*(1+IR)+Math.max(0,(mn-ms2)*SR*(mn>ms2?1:0));mP.push(Math.max(0,mp));
    const ns=PS*Math.pow(1+NG,y),nn=AT?ns*(1-TR):ns,ns2=SP*Math.pow(1+SG,y);
    np=np*(1+IR)+Math.max(0,(nn-ns2)*SR*(nn>ns2?1:0));nP.push(Math.max(0,np));
  }
  const mPot=mP[ytr]??0,nPot=nP[ytr]??0,dPot=mPot-nPot;
  const bl=[],bt=[],bl2=[],bs=[],bsv=[];
  for(let y=0;y<DUR;y++){bl.push(DUR===1?'MBA Yr':'Study Y'+(y+1));bt.push(0);bl2.push(0);bs.push(Math.round(LV));bsv.push(0);}
  for(let y=1;y<=YR;y++){
    bl.push('Y'+y);let ms=OS*Math.pow(1+GR,y-1);if(y===1&&SI)ms+=SA;
    const tx=AT?ms*TR:0,ni=AT?ms*(1-TR):ms,cr=DUR+y-1,lp2=cr<=LT?LP:0,sp=SP*Math.pow(1+SG,y),dsp=ni-lp2-sp;
    bt.push(Math.round(tx));bl2.push(Math.round(lp2));bs.push(Math.round(sp));bsv.push(Math.round(dsp>0?dsp*SR:0));
  }
  sv('m_npv',fmt(npv));sv('m_irr',r!=null?(r*100).toFixed(1)+'%':'N/A');
  const pbY=pb!=null?pb-DUR+1:null;
  sv('m_payback',pbY!=null&&pbY>=0?pbY+' yrs':'>'+YR+' yrs');
  sv('m_cost',fmt(TC));
  sv('r_mba',fmt(mPot));sv('r_nm',fmt(nPot));
  sv('r_mba_s',fmt(mPot*WR,1)+'/yr · '+(WR*100)+'% SWR');
  sv('r_nm_s',fmt(nPot*WR,1)+'/yr · '+(WR*100)+'% SWR');
  sv('r_diff',(dPot>=0?'+':'')+fmt(dPot));
  sv('r_inc',fmt(mPot*WR/12));
  sv('r_inc_s','MBA path · '+(WR*100)+'% SWR');
  sv('ret_lbl','Retirement at '+RA);
  sv('hdr_meta','Tuition: '+fmt(T)+' · Net after scholarship: '+fmt(NT));
  sv('ct2','Retirement Portfolio Growth to Age '+RA);
  const sL=[...Array.from({length:DUR},(_,i)=>DUR===1?'MBA Year':'Study Y'+(i+1)),...Array.from({length:YR},(_,i)=>'Y'+(i+1))];
  const mC=[],nC=[];let ms2=0,ns2=0;
  mY.forEach((v,i)=>{ms2+=v/Math.pow(1+DR,i);ns2+=nY[i]/Math.pow(1+DR,i);mC.push(ms2);nC.push(ns2);});
  const aCF=inc.map((v,i)=>v/Math.pow(1+DR,i));
  const mSal=[...Array.from({length:DUR},()=>0),...Array.from({length:YR},(_,i)=>OS*Math.pow(1+GR,i))];
  const nSal=Array.from({length:DUR+YR},(_,i)=>PS*Math.pow(1+NG,i));
  const lPr=[],lIn=[];let rm=LN;const mr=LR/100/12;
  const mp2=LN>0&&mr>0?LN*mr*Math.pow(1+mr,LT*12)/(Math.pow(1+mr,LT*12)-1):LN/(LT*12||1);
  for(let y=0;y<LT;y++){let yi=0,yp=0;for(let m=0;m<12;m++){const ip=rm*mr,pp=Math.min(mp2-ip,rm);yi+=ip;yp+=pp;rm=Math.max(0,rm-pp);}lPr.push(yp);lIn.push(yi);}
  const rL=Array.from({length:ytr+1},(_,i)=>'Age '+(CA+i));
  dCumul(sL,mC,nC);dRetire(rL,mP,nP);dCF(sL,aCF);dBkd(bl,bt,bl2,bs,bsv);dLoan(Array.from({length:LT},(_,i)=>'Y'+(i+1)),lPr,lIn);dSal(sL,mSal,nSal);
  const s5m=fmt(OS*Math.pow(1+GR,4)),s5n=fmt(PS*Math.pow(1+NG,DUR+4));
  const dg=document.getElementById('dg');
  dg.replaceChildren(...[
    ['Net tuition',fmt(NT)],['Total study cost',fmt(NT+LV*DUR)],['Total programme cost',fmt(TC)],['Salary lift',(((OS-PS)/PS)*100).toFixed(0)+'%'],
    ['Annual loan pmt',fmt(LP)],['Total interest',fmt(TI)],['MBA salary yr 5',s5m],['No-MBA salary yr 5',s5n],
    ['No-MBA retire pot',fmt(nPot)],['No-MBA mo. income',fmt(nPot*WR/12)],['Study duration',DUR===1?'1 year':'2 years'],['Baseline growth',(NG*100).toFixed(1)+'%'],
  ].map(([k,v])=>{
    const d=document.createElement('div'),dk=document.createElement('div'),dv=document.createElement('div');
    d.className='di';dk.className='k';dv.className='v';dk.textContent=k;dv.textContent=v;d.append(dk,dv);return d;
  }));
}
function cd(){
  return{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:'#555',font:{size:11},boxWidth:12}},tooltip:{backgroundColor:'#fff',borderColor:'#ccc',borderWidth:1,titleColor:'#111',bodyColor:'#555',callbacks:{label:c=>' '+fmt(c.raw)}}},
    scales:{x:{ticks:{color:'#888',font:{size:10},maxTicksLimit:12},grid:{color:'#ebebeb'}},y:{ticks:{color:'#888',font:{size:10},callback:v=>fmt(v)},grid:{color:'#ebebeb'}}}};
}
function mk(id,cfg){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),cfg);}
function dCumul(l,a,b){mk('cumulChart',{type:'line',data:{labels:l,datasets:[
  {label:'MBA path (cumul. PV)',data:a,borderColor:'#444',backgroundColor:'rgba(70,70,70,.07)',tension:.05,pointRadius:0,fill:true},
  {label:'No-MBA baseline (cumul. PV)',data:b,borderColor:'#aaa',backgroundColor:'rgba(170,170,170,.04)',tension:.05,pointRadius:0,fill:true,borderDash:[5,4]}
]},options:cd()});}
function dRetire(l,a,b){mk('retireChart',{type:'line',data:{labels:l,datasets:[
  {label:'MBA portfolio',data:a,borderColor:'#444',backgroundColor:'rgba(70,70,70,.07)',tension:.05,pointRadius:0,fill:true},
  {label:'No-MBA portfolio',data:b,borderColor:'#aaa',backgroundColor:'rgba(170,170,170,.05)',tension:.05,pointRadius:0,fill:true,borderDash:[5,4]}
]},options:cd()});}
function dCF(l,d){
  const c=d.map(v=>v>=0?'rgba(50,50,50,.85)':'rgba(175,175,175,.85)');
  mk('cashflowChart',{type:'bar',data:{labels:l,datasets:[{label:'Incremental discounted CF',data:d,backgroundColor:c,borderRadius:0}]},options:cd()});
}
function dBkd(l,tx,ln,sp,sv){
  const o=cd();o.scales.x={...o.scales.x,stacked:true};o.scales.y={...o.scales.y,stacked:true};
  mk('breakdownChart',{type:'bar',data:{labels:l,datasets:[
    {label:'Tax',data:tx,backgroundColor:'rgba(40,40,40,.8)'},
    {label:'Loan repayment',data:ln,backgroundColor:'rgba(100,100,100,.75)'},
    {label:'Living spend',data:sp,backgroundColor:'rgba(155,155,155,.7)'},
    {label:'Invested',data:sv,backgroundColor:'rgba(205,205,205,.85)'},
  ]},options:o});
}
function dLoan(l,p,i){
  if(!p.length){if(CH.loanChart){CH.loanChart.destroy();delete CH.loanChart;}return;}
  const o=cd();o.scales.x={...o.scales.x,stacked:true};o.scales.y={...o.scales.y,stacked:true};
  mk('loanChart',{type:'bar',data:{labels:l,datasets:[
    {label:'Principal',data:p,backgroundColor:'rgba(55,55,55,.85)',borderRadius:0},
    {label:'Interest',data:i,backgroundColor:'rgba(155,155,155,.8)',borderRadius:0}
  ]},options:o});
}
function dSal(l,a,b){mk('salaryChart',{type:'line',data:{labels:l,datasets:[
  {label:'MBA salary',data:a,borderColor:'#444',tension:.05,pointRadius:0,fill:false},
  {label:'No-MBA salary',data:b,borderColor:'#aaa',tension:.05,pointRadius:0,fill:false,borderDash:[5,4]}
]},options:cd()});}
// Event wiring (no inline handlers, so the CSP can omit 'unsafe-inline' for scripts)
const badge=document.getElementById('hdr_badge');
badge.addEventListener('click',()=>{badge.contentEditable='true';badge.focus();});
badge.addEventListener('blur',()=>{badge.contentEditable='false';update();});
document.querySelectorAll('#school_name,#prog_name,input[type=range]').forEach(e=>e.addEventListener('input',update));
document.querySelectorAll('#currency,input[type=checkbox]').forEach(e=>e.addEventListener('change',update));
document.querySelectorAll('.chip[data-school]').forEach(c=>c.addEventListener('click',()=>loadSchool(c.dataset.school,c)));
document.querySelectorAll('.sc-btn[data-scenario]').forEach(b=>b.addEventListener('click',()=>loadScenario(b.dataset.scenario,b)));
document.querySelectorAll('#dur_pills .pill[data-dur]').forEach(p=>p.addEventListener('click',()=>setDur(Number(p.dataset.dur),p)));
update();
