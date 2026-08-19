const DB={
role:null,user:null,
employees:Array.from({length:65},(_,i)=>({id:`EMP-${String(i+1).padStart(3,'0')}`,name:`Employee ${String(i+1).padStart(2,'0')}`,email:`employee${i+1}@medibyte.com`,phone:`+91 90000 ${String(10000+i).slice(-5)}`,department:'Medical Coding',designation:'Medical Coder',joined:'12 Jan 2026',img:`https://i.pravatar.cc/160?img=${(i%70)+1}`,status:i===64?'Inactive':'Active',assigned:50,completed:18+(i%4)*8,accuracy:(91.5+(i%6)*.8).toFixed(1)})),
charts:[
{id:'CH-1001',coder:'EMP-001',status:'Pending',date:'17 Aug 2026',ref:'Synthetic Chart 001'},
{id:'CH-1002',coder:'EMP-001',status:'Under Audit',date:'17 Aug 2026',ref:'Synthetic Chart 002'},
{id:'CH-1003',coder:'EMP-002',status:'Completed',date:'16 Aug 2026',ref:'Synthetic Chart 003'},
{id:'CH-1004',coder:'EMP-003',status:'Returned',date:'16 Aug 2026',ref:'Synthetic Chart 004'},
{id:'CH-1005',coder:'EMP-004',status:'Pending',date:'16 Aug 2026',ref:'Synthetic Chart 005'},
{id:'CH-1006',coder:'EMP-005',status:'Completed',date:'15 Aug 2026',ref:'Synthetic Chart 006'}],
submissions:{
'CH-1002':[
{attempt:1,status:'Under Audit',submitted:'17 Aug 2026',solutions:['ICD-10-CM: E11.9 — Type 2 diabetes mellitus without complications','ICD-10-CM: I10 — Essential (primary) hypertension','ICD-10-CM: J45.909 — Unspecified asthma, uncomplicated'],score:null,comment:''}],
'CH-1004':[
{attempt:1,status:'Returned',submitted:'16 Aug 2026',solutions:['ICD-10-CM: E11.9 — Type 2 diabetes mellitus without complications','ICD-10-CM: I10 — Essential (primary) hypertension','ICD-10-CM: J45.909 — Unspecified asthma, uncomplicated'],score:null,comment:'Solution 2 requires correction. Please review the chart documentation and submit a new solution.'}]
},
audits:[
{id:'CH-1002',coder:'EMP-001',score:null,status:'Pending Review'},
{id:'CH-1004',coder:'EMP-003',score:null,status:'Returned'},
{id:'CH-1011',coder:'EMP-007',score:88,status:'Approved'}],
notifications:[
{id:1,to:'EMP-001',chart:'CH-1004',message:'CH-1004 was returned by the auditor. Please review the auditor comment and submit a new solution.',read:false}],
codes:[
'ICD-10-CM: E11.9 — Type 2 diabetes mellitus without complications',
'ICD-10-CM: I10 — Essential (primary) hypertension',
'ICD-10-CM: J45.909 — Unspecified asthma, uncomplicated',
'ICD-10-CM: M54.50 — Low back pain, unspecified',
'ICD-10-CM: K21.9 — Gastro-esophageal reflux disease without esophagitis',
'ICD-10-CM: Z00.00 — General adult medical examination without abnormal findings',
'ICD-10-CM: E78.5 — Hyperlipidemia, unspecified',
'ICD-10-CM: G43.909 — Migraine, unspecified, not intractable']
};

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function badge(status){let c=/Approved|Completed|Active/.test(status)?'green':/Pending|Under Audit|Submitted/.test(status)?'amber':/Returned|Inactive|Correction/.test(status)?'red':/Resubmitted/.test(status)?'purple':'blue';return `<span class="badge ${c}">${esc(status)}</span>`}
function employee(id){return DB.employees.find(e=>e.id===id)}

const NAV={
admin:[['dashboard','⌂','Dashboard'],['employees','♙','Employees'],['assign','↗','Chart Assignment'],['charts','▣','All Charts'],['audits','✓','Audit Queue'],['performance','◔','Performance'],['settings','⚙','Settings']],
employee:[['dashboard','⌂','Dashboard'],['mycharts','▣','My Charts'],['performance','◔','My Performance'],['profile','◉','My Profile']],
auditor:[['dashboard','⌂','Dashboard'],['audits','✓','Audit Queue'],['audit-history','▤','Audit History'],['profile','◉','My Profile']]
};

$('loginForm').addEventListener('submit',e=>{e.preventDefault();login($('loginRole').value)});
document.querySelectorAll('[data-demo]').forEach(b=>b.onclick=()=>{const r=b.dataset.demo;$('loginRole').value=r;$('loginId').value=r==='admin'?'admin@medibyte.com':r==='employee'?'EMP-001':'auditor@medibyte.com';$('loginPassword').value='demo123'});
$('logout').onclick=()=>{DB.role=null;DB.user=null;$('app').classList.add('hidden');$('loginPage').classList.remove('hidden');$('loginForm').reset()};
$('menuBtn').onclick=()=>$('sidebar').classList.toggle('open');
$('notificationBtn').onclick=showNotifications;

function login(role){
 DB.role=role;
 DB.user=role==='admin'?{id:'ADM-001',name:'Admin User'}:role==='employee'?{id:'EMP-001',name:'Employee 01'}:{id:'AUD-001',name:'Clinical Auditor'};
 $('loginPage').classList.add('hidden');$('app').classList.remove('hidden');renderShell();go('dashboard');
}
function renderShell(){
 $('nav').innerHTML=NAV[DB.role].map(n=>`<button class="nav-item" data-page="${n[0]}">${n[1]} &nbsp; ${n[2]}</button>`).join('');
 document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{go(b.dataset.page);$('sidebar').classList.remove('open')});
 const initials=DB.user.name.split(' ').map(x=>x[0]).join('').slice(0,2);
 $('currentUser').innerHTML=`<div class="avatar">${initials}</div><span>${esc(DB.user.name)}</span>`;
 updateNotificationDot();
}
function updateNotificationDot(){
 const n=DB.notifications.some(x=>x.to===DB.user.id&&!x.read);
 $('notificationDot').classList.toggle('off',!n);
}
function showNotifications(){
 const mine=DB.notifications.filter(n=>n.to===DB.user.id&&!n.read);
 if(!mine.length){toast('No new notifications.');return}
 mine.forEach(n=>n.read=true);
 updateNotificationDot();
 openSimpleModal('Notifications',mine.map(n=>`<div class="notice"><b>${esc(n.chart)}</b><br>${esc(n.message)}</div>`).join(''));
}
function go(page){
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 const item=NAV[DB.role].find(x=>x[0]===page)||NAV[DB.role][0];
 $('pageTitle').textContent=item[2];
 $('sectionKicker').textContent=DB.role==='admin'?'ADMINISTRATION':DB.role==='employee'?'CODER WORKSPACE':'AUDIT OPERATIONS';
 $('content').innerHTML=(PAGES[page]||PAGES.dashboard)();
 bindPage();
 updateNotificationDot();
}

function adminDashboard(){return `<div class="welcome"><div><span class="eyebrow">ADMINISTRATION</span><h1>Operations overview</h1><p>Monitor production, assignments, audits and all employee performance.</p></div><div class="actions"><button class="btn primary" data-go="assign">＋ Assign charts</button><button class="btn secondary" id="addEmployeeBtn">＋ Add employee</button></div></div>
<div class="stats">${[['Employees','65','64 active'],['Charts Assigned','3,250','50 per employee'],['Completed','2,416','74.3% completion'],['Pending Audit','126','Needs review']].map(x=>`<div class="card stat"><div class="stat-top">${x[0]}<span class="stat-icon">●</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('')}</div>
<div class="grid2"><div class="card"><div class="head"><h3>Recent chart activity</h3><button class="link" data-go="charts">View all</button></div><div class="table"><table><thead><tr><th>Chart</th><th>Coder</th><th>Status</th><th>Date</th></tr></thead><tbody>${DB.charts.map(c=>`<tr><td><b>${c.id}</b></td><td>${c.coder}</td><td>${badge(c.status)}</td><td>${c.date}</td></tr>`).join('')}</tbody></table></div></div>
<div class="card"><div class="head"><h3>Production snapshot</h3></div><div class="body">${[['Completed','74%'],['Under audit','11%'],['Pending','15%']].map(x=>`<div style="margin-bottom:17px"><div class="stat-top">${x[0]}<b>${x[1]}</b></div><div class="progress"><i style="width:${x[1]}"></i></div></div>`).join('')}<div class="kpi"><span class="muted">Average employee accuracy</span><strong>93.8%</strong></div></div></div></div>`}

function employeeDashboard(){const mine=DB.charts.filter(c=>c.coder===DB.user.id);const returned=mine.filter(c=>c.status==='Returned').length;return `<div class="welcome"><div><span class="eyebrow">CODER WORKSPACE</span><h1>Welcome back, ${esc(DB.user.name)}</h1><p>Your assigned medical coding workload and notifications.</p></div></div>${returned?`<div class="notice"><b>Correction required:</b> You have ${returned} returned chart. Open it to review the previous submission and create a new solution.</div>`:''}
<div class="stats">${[['Assigned','50','Current batch'],['Completed','38','76% complete'],['Under Audit','7','Awaiting review'],['Accuracy','94.2%','Your current score']].map(x=>`<div class="card stat"><div class="stat-top">${x[0]}<span class="stat-icon">●</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('')}</div>
<div class="card"><div class="head"><h3>My assigned charts</h3><button class="link" data-go="mycharts">Open all</button></div><div class="table"><table><thead><tr><th>Chart</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>${mine.map(c=>`<tr><td><b>${c.id}</b></td><td>${badge(c.status)}</td><td>${c.date}</td><td><button class="btn primary" style="padding:7px 10px;font-size:10px" data-chart="${c.id}">${c.status==='Returned'?'Correct & Resubmit':'Open'}</button></td></tr>`).join('')}</tbody></table></div></div>`}

function auditorDashboard(){return `<div class="welcome"><div><span class="eyebrow">AUDIT OPERATIONS</span><h1>Audit control center</h1><p>Review submitted coding solutions and maintain quality.</p></div><button class="btn primary" data-go="audits">Review queue</button></div><div class="stats">${[['Awaiting Review','126','Across all coders'],['Reviewed Today','42','Today'],['Average Score','92.6%','This month'],['Corrections','18','Returned']].map(x=>`<div class="card stat"><div class="stat-top">${x[0]}<span class="stat-icon">●</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('')}</div><div class="card"><div class="head"><h3>Priority audit queue</h3></div>${auditTable()}</div>`}

function auditTable(){return `<div class="table"><table><thead><tr><th>Chart</th><th>Coder</th><th>Score</th><th>Status</th><th>Action</th></tr></thead><tbody>${DB.audits.map(a=>`<tr><td><b>${a.id}</b></td><td>${a.coder}</td><td>${a.score??'—'}</td><td>${badge(a.status)}</td><td><button class="link" data-audit="${a.id}">Review →</button></td></tr>`).join('')}</tbody></table></div>`}

const PAGES={
dashboard:()=>DB.role==='admin'?adminDashboard():DB.role==='employee'?employeeDashboard():auditorDashboard(),
employees:()=>`<div class="welcome"><div><span class="eyebrow">USER MANAGEMENT</span><h1>Employees</h1><p>Manage all 65 coder accounts and access.</p></div><button class="btn primary" id="addEmployeeBtn">＋ Add employee</button></div><div class="card"><div class="body search"><input id="employeeSearch" placeholder="Search employee..."><select id="employeeFilter"><option>All</option><option>Active</option><option>Inactive</option></select></div><div class="table"><table><thead><tr><th>Employee</th><th>ID</th><th>Email</th><th>Assigned</th><th>Completed</th><th>Accuracy</th><th>Status</th><th>Action</th></tr></thead><tbody id="employeeRows"></tbody></table></div></div>`,
assign:()=>`<div class="welcome"><div><span class="eyebrow">WORK DISTRIBUTION</span><h1>Chart assignment</h1><p>Upload/import a batch and distribute it equally across employees.</p></div></div><div class="grid2"><div class="card"><div class="head"><h3>Create chart batch</h3></div><div class="body"><div class="formgrid"><div><label>Batch name</label><input id="batchName" placeholder="August Batch 01"></div><div><label>Total charts</label><input id="batchCount" type="number" value="3250"></div><div class="fullrow"><label>Source file</label><input type="file" accept=".xlsx,.xls,.csv"></div><div class="fullrow"><button class="btn primary full" id="distributeBtn">Distribute equally across 65 employees</button></div></div></div></div><div class="card"><div class="head"><h3>Distribution preview</h3></div><div class="body"><div class="kpi"><span class="muted">Employees</span><strong>65</strong></div><br><div class="kpi"><span class="muted">Charts per employee</span><strong id="chartsPerEmployee">50</strong></div><p class="muted">Example: 3,250 ÷ 65 = 50 charts per employee. In production, Excel/CSV processing will happen on the backend.</p></div></div></div>`,
charts:()=>`<div class="welcome"><div><span class="eyebrow">PRODUCTION</span><h1>All charts</h1><p>Central view of chart workflow and submission status.</p></div></div><div class="card"><div class="body search"><input id="chartSearch" placeholder="Search chart ID or coder..."><select id="chartFilter"><option>All</option><option>Pending</option><option>Under Audit</option><option>Returned</option><option>Completed</option></select></div><div class="table"><table><thead><tr><th>Chart</th><th>Coder</th><th>Reference</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody id="chartRows"></tbody></table></div></div>`,
mycharts:()=>{const mine=DB.charts.filter(c=>c.coder===DB.user.id);return `<div class="welcome"><div><span class="eyebrow">MY WORK</span><h1>My assigned charts</h1><p>Each chart requires three selected coding solutions.</p></div></div><div class="card"><div class="head"><h3>Current assignment · 50 charts</h3>${badge('Active Batch')}</div><div class="table"><table><thead><tr><th>Chart</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>${mine.length?mine.map(c=>`<tr><td><b>${c.id}</b></td><td>${badge(c.status)}</td><td>${c.date}</td><td><button class="btn primary" style="padding:7px 10px;font-size:10px" data-chart="${c.id}">${c.status==='Returned'?'Correct & Resubmit':'Open'}</button></td></tr>`).join(''):`<tr><td colspan="4"><div class="empty">No charts assigned.</div></td></tr>`}</tbody></table></div></div>`},
audits:()=>`<div class="welcome"><div><span class="eyebrow">QUALITY ASSURANCE</span><h1>Audit queue</h1><p>Review the latest submission attempt without deleting previous attempts.</p></div></div><div class="card">${auditTable()}</div>`,
'audit-history':()=>`<div class="welcome"><div><span class="eyebrow">QUALITY HISTORY</span><h1>Audit history</h1><p>Completed audit decisions and scores.</p></div></div><div class="card"><div class="table"><table><thead><tr><th>Chart</th><th>Coder</th><th>Score</th><th>Decision</th></tr></thead><tbody>${DB.audits.filter(a=>a.status==='Approved').map(a=>`<tr><td>${a.id}</td><td>${a.coder}</td><td>${a.score}%</td><td>${badge('Approved')}</td></tr>`).join('')}</tbody></table></div></div>`,
performance:()=>DB.role==='employee'?`<div class="welcome"><div><span class="eyebrow">MY PERFORMANCE</span><h1>My performance</h1><p>Only your own production and audit results are displayed.</p></div></div><div class="stats">${[['Assigned Charts','50','Current batch'],['Completed','38','76% complete'],['Audit Score','94.2%','Your accuracy'],['Returned','2','Needs correction']].map(x=>`<div class="card stat"><div class="stat-top">${x[0]}<span class="stat-icon">★</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('')}</div><div class="grid2"><div class="card"><div class="head"><h3>Your progress</h3></div><div class="body">${[['Completion','76%'],['Accuracy','94.2%'],['Audit approval','91%']].map(x=>`<div style="margin-bottom:17px"><div class="stat-top">${x[0]}<b>${x[1]}</b></div><div class="progress"><i style="width:${x[1]}"></i></div></div>`).join('')}</div></div><div class="card"><div class="head"><h3>Your recent audit results</h3></div><div class="body">${DB.audits.filter(a=>a.coder===DB.user.id).map(a=>`<div class="kpi" style="margin-bottom:10px"><b>${a.id}</b> · ${a.score??'—'}% <span style="float:right">${badge(a.status)}</span></div>`).join('')||'<div class="empty">No audit results yet.</div>'}</div></div></div>`:`<div class="welcome"><div><span class="eyebrow">ADMIN ANALYTICS</span><h1>Performance dashboard</h1><p>Admin-only view of employee performance.</p></div><button class="btn secondary" onclick="toast('Demo report prepared for export.')">⇩ Export report</button></div><div class="stats">${[['Average Accuracy','93.8%','All employees'],['Charts Completed','2,416','of 3,250'],['Average Audit Score','92.6%','Reviewed charts'],['Corrections','18','Returned to coders']].map(x=>`<div class="card stat"><div class="stat-top">${x[0]}<span class="stat-icon">★</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('')}</div><div class="card"><div class="head"><h3>Employee performance</h3></div><div class="table"><table><thead><tr><th>Employee</th><th>Completed</th><th>Accuracy</th><th>Status</th></tr></thead><tbody>${DB.employees.slice(0,12).map(e=>`<tr><td><b>${e.name}</b><br><span class="muted">${e.id}</span></td><td>${e.completed}</td><td>${e.accuracy}%</td><td>${badge(e.status)}</td></tr>`).join('')}</tbody></table></div></div>`,
profile:()=>{const e=employee(DB.user.id)||{id:DB.user.id,name:DB.user.name,email:'employee1@medibyte.com',phone:'+91 90000 10001',department:'Medical Coding',designation:'Medical Coder',joined:'12 Jan 2026',img:'https://i.pravatar.cc/160?img=12',status:'Active'};return `<div class="welcome"><div><span class="eyebrow">MY ACCOUNT</span><h1>My profile</h1><p>Your employee photo and account details.</p></div></div><div class="grid2"><div class="card"><div class="body profile-card"><img class="profile-img" src="${e.img}" alt="Employee photo"><h2>${esc(e.name)}</h2><span class="badge blue">${esc(e.designation)}</span><p class="muted">${esc(e.id)} · ${esc(e.department)}</p></div></div><div class="card"><div class="head"><h3>Employee details</h3></div><div class="body"><div class="formgrid">${[['Employee ID',e.id],['Full name',e.name],['Email',e.email],['Phone',e.phone],['Department',e.department],['Designation',e.designation],['Date joined',e.joined],['Account status',e.status]].map(x=>`<div><label>${x[0]}</label><input value="${esc(x[1])}" readonly></div>`).join('')}</div></div></div></div>`},
settings:()=>`<div class="welcome"><div><span class="eyebrow">SYSTEM</span><h1>Settings</h1><p>Demo security and workflow controls.</p></div></div><div class="grid2"><div class="card"><div class="head"><h3>Security controls</h3></div><div class="body">${['Multi-factor authentication','Device registration','Session timeout','Audit logging','HTTPS / secure API'].map(x=>`<p style="display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0;font-size:11px">${x}${badge('Enabled')}</p>`).join('')}</div></div><div class="card"><div class="head"><h3>Work allocation</h3></div><div class="body"><label>Default charts per employee</label><input value="50"><button class="btn primary full" onclick="toast('Settings saved.')">Save changes</button></div></div></div>`
};

function bindPage(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
 document.querySelectorAll('[data-chart]').forEach(b=>b.onclick=()=>openChart(b.dataset.chart,DB.role==='auditor'));
 document.querySelectorAll('[data-audit]').forEach(b=>b.onclick=()=>openAudit(b.dataset.audit));
 if($('addEmployeeBtn'))$('addEmployeeBtn').onclick=openAddEmployee;
 if($('employeeSearch')){renderEmployees();$('employeeSearch').oninput=renderEmployees;$('employeeFilter').onchange=renderEmployees}
 if($('chartSearch')){renderCharts();$('chartSearch').oninput=renderCharts;$('chartFilter').onchange=renderCharts}
 if($('batchCount'))$('batchCount').oninput=()=>{$('chartsPerEmployee').textContent=Math.floor((Number($('batchCount').value)||0)/65)}
 if($('distributeBtn'))$('distributeBtn').onclick=()=>toast('Demo: charts distributed equally across 65 employees.');
}

function renderEmployees(){
 const q=($('employeeSearch').value||'').toLowerCase(),f=$('employeeFilter').value;
 $('employeeRows').innerHTML=DB.employees.filter(e=>(f==='All'||e.status===f)&&`${e.name}${e.id}${e.email}`.toLowerCase().includes(q)).map(e=>`<tr><td><b>${e.name}</b></td><td>${e.id}</td><td>${e.email}</td><td>${e.assigned}</td><td>${e.completed}</td><td>${e.accuracy}%</td><td>${badge(e.status)}</td><td><button class="link" data-toggle="${e.id}">${e.status==='Active'?'Revoke':'Activate'}</button></td></tr>`).join('');
 document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const e=employee(b.dataset.toggle);e.status=e.status==='Active'?'Inactive':'Active';toast(`${e.name} is now ${e.status.toLowerCase()}.`);renderEmployees()});
}
function renderCharts(){
 const q=($('chartSearch').value||'').toLowerCase(),f=$('chartFilter').value;
 $('chartRows').innerHTML=DB.charts.filter(c=>(f==='All'||c.status===f)&&`${c.id}${c.coder}`.toLowerCase().includes(q)).map(c=>`<tr><td><b>${c.id}</b></td><td>${c.coder}</td><td>${c.ref}</td><td>${badge(c.status)}</td><td>${c.date}</td><td><button class="link" data-chart="${c.id}">View</button></td></tr>`).join('');
 document.querySelectorAll('[data-chart]').forEach(b=>b.onclick=()=>openChart(b.dataset.chart,DB.role==='auditor'));
}

function openSimpleModal(title,body){
 const m=document.createElement('div');m.className='modal-bg';m.innerHTML=`<div class="modal"><div class="head"><h3>${title}</h3><button class="close">×</button></div><div class="body">${body}</div></div>`;document.body.appendChild(m);m.querySelector('.close').onclick=()=>m.remove();
}

function openChart(id,auditorMode=false){
 const c=DB.charts.find(x=>x.id===id);if(!c)return;
 const history=DB.submissions[id]||[];
 const latest=history[history.length-1];
 const returned=c.status==='Returned';
 const options=DB.codes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
 const previous=history.map(a=>`<div class="attempt ${a.status==='Returned'?'returned':a.status==='Completed'?'approved':''}">
   <h4>Attempt ${a.attempt} · ${badge(a.status)} <span class="muted">${a.submitted}</span></h4>
   <div class="attempt-grid">${a.solutions.map((s,i)=>`<div><b>Solution ${i+1}</b><p>${esc(s)}</p></div>`).join('')}</div>
   ${a.score!==null?`<p><b>Audit score:</b> ${a.score}%</p>`:''}
   ${a.comment?`<p><b>Auditor comment:</b> ${esc(a.comment)}</p>`:''}
 </div>`).join('');
 const newForm=!auditorMode?`<div class="${returned?'notice':'success'}"><b>${returned?'Correction required':'New submission'}</b><br>${returned?'The previous attempt is preserved below. Select new solutions and resubmit.':'Select one coding option for each of the three required solutions.'}</div>
 ${returned?`<h3>New corrected solution</h3>`:''}
 ${[1,2,3].map(i=>`<div class="solution"><h4>Solution ${i}</h4><select class="new-solution"><option value="">Select a coding solution...</option>${options}</select></div>`).join('')}
 <div class="actions" style="justify-content:flex-end"><button class="btn secondary" id="saveDraft">Save draft</button><button class="btn primary" id="submitChart">${returned?'Resubmit for Audit':'Submit for Audit'}</button></div>`:
 `<div class="success"><b>Audit review</b><br>Previous submissions remain in history. Review the latest attempt and either approve or return it.</div>
 <h3>Submission history</h3>${previous||'<div class="empty">No submission history.</div>'}
 <label>Performance score</label><input id="auditScore" type="number" min="0" max="100" placeholder="0–100">
 <label>Auditor comments</label><textarea id="auditComment" placeholder="Enter approval or correction comments..."></textarea>
 <div class="actions" style="justify-content:flex-end;margin-top:15px"><button class="btn secondary" id="returnChart">Return to coder</button><button class="btn primary" id="approveChart">Approve & save</button></div>`;
 const m=document.createElement('div');m.className='modal-bg';m.innerHTML=`<div class="modal"><div class="head"><div><span class="eyebrow">CHART WORKSPACE</span><h3>${c.id}</h3></div><button class="close">×</button></div><div class="body"><div class="kpi"><b>Chart:</b> ${c.id}<br><b>Coder:</b> ${c.coder}<br><b>Current status:</b> ${badge(c.status)}</div>${!auditorMode&&history.length?`<h3 style="margin-top:20px">Previous submission history</h3>${previous}`:''}${newForm}</div></div>`;
 document.body.appendChild(m);m.querySelector('.close').onclick=()=>m.remove();

 if(!auditorMode){
   $('saveDraft').onclick=()=>toast('Draft saved locally for this demo.');
   $('submitChart').onclick=()=>{
     const values=[...m.querySelectorAll('.new-solution')].map(x=>x.value);
     if(values.some(v=>!v))return toast('Please select all 3 coding solutions.');
     const attempt={attempt:history.length+1,status:'Under Audit',submitted:'17 Aug 2026',solutions:values,score:null,comment:''};
     DB.submissions[id]=(history||[]).concat(attempt);
     c.status='Under Audit';
     let a=DB.audits.find(x=>x.id===id);
     if(!a){a={id,coder:c.coder,score:null,status:'Pending Review'};DB.audits.push(a)}else{a.status='Pending Review';a.score=null}
     toast(`${id} submitted. Status is now Under Audit.`);m.remove();go('mycharts');
   };
 }else{
   $('approveChart').onclick=()=>{
     const score=Number($('auditScore').value);if(!Number.isFinite(score)||score<0||score>100)return toast('Enter a score from 0 to 100.');
     const a=DB.audits.find(x=>x.id===id);if(!a)return;
     a.score=score;a.status='Approved';c.status='Completed';
     if(history.length){history[history.length-1].status='Completed';history[history.length-1].score=score;history[history.length-1].comment=$('auditComment').value.trim()}
     toast(`${id} approved. Score saved.`);m.remove();go('audits');
   };
   $('returnChart').onclick=()=>{
     const a=DB.audits.find(x=>x.id===id)||{id,coder:c.coder};a.status='Returned';a.score=null;
     const comment=$('auditComment').value.trim()||'Please review the submitted coding solution and correct it.';
     if(history.length){history[history.length-1].status='Returned';history[history.length-1].comment=comment}
     c.status='Returned';
     DB.notifications.push({id:Date.now(),to:c.coder,chart:id,message:`${id} was returned by the auditor. ${comment}`,read:false});
     toast(`${id} returned. Notification sent to ${c.coder}.`);m.remove();go('audits');
   };
 }
}

function openAudit(id){openChart(id,true)}

function openAddEmployee(){
 const m=document.createElement('div');m.className='modal-bg';m.innerHTML=`<div class="modal"><div class="head"><h3>Add employee</h3><button class="close">×</button></div><div class="body"><div class="formgrid"><div><label>Name</label><input id="newName"></div><div><label>Employee ID</label><input id="newId" placeholder="EMP-066"></div><div><label>Email</label><input id="newEmail"></div><div><label>Phone</label><input id="newPhone"></div><div class="fullrow"><label>Profile image URL</label><input id="newImg" placeholder="https://..."></div></div><button class="btn primary full" id="createEmployee">Create employee</button></div></div>`;
 document.body.appendChild(m);m.querySelector('.close').onclick=()=>m.remove();
 $('createEmployee').onclick=()=>{if(!$('newName').value.trim())return toast('Enter employee name.');const id=$('newId').value.trim()||`EMP-${String(DB.employees.length+1).padStart(3,'0')}`;DB.employees.push({id,name:$('newName').value,email:$('newEmail').value||id.toLowerCase()+'@medibyte.com',phone:$('newPhone').value||'+91 90000 00000',department:'Medical Coding',designation:'Medical Coder',joined:'17 Aug 2026',img:$('newImg').value||`https://i.pravatar.cc/160?img=${DB.employees.length+1}`,status:'Active',assigned:50,completed:0,accuracy:'0.0'});m.remove();toast('Employee created successfully.');go('employees')}
}
