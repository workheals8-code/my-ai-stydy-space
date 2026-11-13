const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='study-space-v1';
let data=JSON.parse(localStorage.getItem(KEY)||'{"tasks":[],"notes":[],"files":[],"quizzes":[]}');
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function go(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));$('#pageCrumb').textContent=({home:'Overview',whiteboard:'Whiteboard',library:'My library',notes:'My notes',quizzes:'Quiz studio',tasks:'My tasks'})[page];$('#sidebar').classList.remove('open');window.scrollTo(0,0)}
$$('.nav').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
$('#today').textContent=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}).format(new Date());

$('#taskForm').addEventListener('submit',e=>{e.preventDefault();data.tasks.unshift({id:crypto.randomUUID(),title:$('#taskInput').value.trim(),subject:$('#taskSubject').value,date:$('#taskDate').value,done:false});e.target.reset();save();toast('Task added')});
function renderTasks(){
 const rows=data.tasks.map(t=>`<div class="task-item ${t.done?'done':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><div class="task-main"><b>${esc(t.title)}</b><small>${esc(t.subject)}${t.date?' · Due '+esc(t.date):''}</small></div><button class="delete-btn" data-del-task="${t.id}" aria-label="Delete task">×</button></div>`).join('');
 $('#taskList').innerHTML=rows||'<div class="empty">Your tasks will appear here.</div>';
 $('#homeTasks').innerHTML=data.tasks.slice(0,4).map(t=>`<div class="task-item ${t.done?'done':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><div class="task-main"><b>${esc(t.title)}</b><small>${esc(t.subject)}</small></div></div>`).join('')||'No tasks yet. Add your first task.';
 $('#taskCount').textContent=data.tasks.length+' tasks';
 $$('[data-task]').forEach(c=>c.onchange=()=>{let t=data.tasks.find(x=>x.id===c.dataset.task);if(t)t.done=c.checked;save()});
 $$('[data-del-task]').forEach(b=>b.onclick=()=>{data.tasks=data.tasks.filter(t=>t.id!==b.dataset.delTask);save()});
}
$('#fileInput').addEventListener('change',async e=>{for(const f of [...e.target.files]){if(f.size>15*1024*1024){toast(f.name+' is over 15 MB; skipped');continue}try{const blob=await f.arrayBuffer();data.files.unshift({id:crypto.randomUUID(),name:f.name,type:f.type||'Unknown file',size:f.size,blob:Array.from(new Uint8Array(blob)),kind:'file'});}catch(err){toast('Could not add '+f.name)}}e.target.value='';save();toast('Materials added to this browser')});
$('#linkForm').addEventListener('submit',e=>{e.preventDefault();const url=$('#resourceUrl').value.trim();if(!url)return;data.files.unshift({id:crypto.randomUUID(),name:$('#resourceName').value.trim()||url, url,kind:'link'});e.target.reset();save();toast('Link saved')});
function renderFiles(){
 $('#fileList').innerHTML=data.files.map(f=>`<div class="file-item"><span class="file-icon">${f.kind==='link'?'↗':'▤'}</span><div class="file-info"><b>${esc(f.name)}</b><small>${f.kind==='link'?'Saved link':'Local file · '+(f.size/1024/1024).toFixed(2)+' MB'}</small>${f.url?`<a href="${esc(f.url)}" target="_blank" rel="noopener">Open link ↗</a>`:''}</div>${f.kind==='file'?`<button class="text-btn" data-open-file="${f.id}">Open</button>`:''}<button class="delete-btn" data-del-file="${f.id}">×</button></div>`).join('')||'<div class="empty">Your uploaded materials and saved links will appear here.</div>';
 $('#fileCount').textContent=data.files.length+' items';
 $$('[data-del-file]').forEach(b=>b.onclick=()=>{data.files=data.files.filter(f=>f.id!==b.dataset.delFile);save()});
 $$('[data-open-file]').forEach(b=>b.onclick=()=>{const f=data.files.find(x=>x.id===b.dataset.openFile);if(!f)return;const bytes=new Uint8Array(f.blob);const blob=new Blob([bytes],{type:f.type});const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(!w)toast('Allow pop-ups to open this file');setTimeout(()=>URL.revokeObjectURL(url),60000)});
}
$('#noteForm').addEventListener('submit',e=>{e.preventDefault();data.notes.unshift({id:crypto.randomUUID(),title:$('#noteTitle').value.trim(),subject:$('#noteSubject').value,body:$('#noteBody').value.trim(),created:new Date().toLocaleDateString()});e.target.reset();save();toast('Note saved')});
function renderNotes(){$('#noteList').innerHTML=data.notes.map(n=>`<div class="note-item"><div class="note-content"><b>${esc(n.title)}</b><small>${esc(n.subject)} · ${esc(n.created)}</small><p>${esc(n.body)}</p></div><button class="delete-btn" data-del-note="${n.id}">×</button></div>`).join('')||'<div class="empty">Your saved notes will appear here.</div>';$('#noteCount').textContent=data.notes.length+' notes';$$('[data-del-note]').forEach(b=>b.onclick=()=>{data.notes=data.notes.filter(n=>n.id!==b.dataset.delNote);save()})}

let draftQuestions=[];
function readQuestion(){const opts=$$('.answer-option').map(x=>x.value.trim());const q=$('#questionText').value.trim();if(!q||opts.some(x=>!x)){toast('Add a question and all four options');return null}return {q,opts,correct:Number($('#correctAnswer').value)}}
function clearQuestion(){ $('#questionText').value='';$$('.answer-option').forEach(x=>x.value='');$('#correctAnswer').value='0'}
function renderDraft(){$('#questionPreview').innerHTML=draftQuestions.map((q,i)=>`<div class="preview-chip">Question ${i+1}: ${esc(q.q)}</div>`).join('')}
$('#addQuestion').onclick=()=>{const q=readQuestion();if(!q)return;draftQuestions.push(q);clearQuestion();renderDraft();toast('Question added')};
$('#quizForm').addEventListener('submit',e=>{e.preventDefault();const q=readQuestion();if(!q)return;const questions=[...draftQuestions,q];data.quizzes.unshift({id:crypto.randomUUID(),title:$('#quizTitle').value.trim(),subject:$('#quizSubject').value,questions});draftQuestions=[];e.target.reset();renderDraft();save();toast('Quiz saved')});
function renderQuizzes(){$('#quizList').innerHTML=data.quizzes.map(q=>`<div class="quiz-item"><div><b>${esc(q.title)}</b><small>${esc(q.subject)} · ${q.questions.length} question(s)</small></div><button class="secondary" data-start-quiz="${q.id}">Start quiz</button><button class="delete-btn" data-del-quiz="${q.id}">×</button></div>`).join('')||'<div class="empty">Your quizzes will appear here.</div>';$('#quizCount').textContent=data.quizzes.length+' quizzes';$$('[data-del-quiz]').forEach(b=>b.onclick=()=>{data.quizzes=data.quizzes.filter(q=>q.id!==b.dataset.delQuiz);save()});$$('[data-start-quiz]').forEach(b=>b.onclick=()=>startQuiz(b.dataset.startQuiz))}
function startQuiz(id){const qz=data.quizzes.find(q=>q.id===id);if(!qz)return;let i=0,answers=[];const box=$('#quizRunner');box.classList.remove('hidden');function show(){const q=qz.questions[i];box.innerHTML=`<div class="eyebrow">QUESTION ${i+1} OF ${qz.questions.length}</div><h3>${esc(q.q)}</h3>${q.opts.map((o,j)=>`<button class="quiz-choice ${answers[i]===j?'selected':''}" data-choice="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}<div style="display:flex;justify-content:space-between;margin-top:14px"><button class="secondary" id="quitQuiz">Close</button><button class="primary" id="nextQuiz">${i===qz.questions.length-1?'Finish':'Next →'}</button></div>`;$$('[data-choice]').forEach(b=>b.onclick=()=>{answers[i]=Number(b.dataset.choice);show()});$('#quitQuiz').onclick=()=>box.classList.add('hidden');$('#nextQuiz').onclick=()=>{if(answers[i]===undefined){toast('Choose an answer first');return}if(i<qz.questions.length-1){i++;show()}else{let score=answers.reduce((s,a,k)=>s+(a===qz.questions[k].correct?1:0),0);box.innerHTML=`<h3>Quiz complete ✦</h3><p>You scored <b>${score} / ${qz.questions.length}</b>.</p>${qz.questions.map((q,k)=>`<div class="preview-chip">${esc(q.q)}<br><b>${answers[k]===q.correct?'Correct':'Review'}:</b> ${esc(q.opts[q.correct])}</div>`).join('')}<button class="primary" id="closeResult">Done</button>`;$('#closeResult').onclick=()=>box.classList.add('hidden')}}}show();box.scrollIntoView({behavior:'smooth',block:'nearest'})}

function renderAll(){renderTasks();renderFiles();renderNotes();renderQuizzes();$('#statTasks').textContent=data.tasks.filter(t=>!t.done).length;$('#statNotes').textContent=data.notes.length;$('#statQuizzes').textContent=data.quizzes.length;$('#statFiles').textContent=data.files.length}
renderAll();

// Whiteboard canvas: pointer events support mouse, stylus and touch.
const canvas=$('#board'),ctx=canvas.getContext('2d');let drawing=false,last=null,tool='pen',history=[];
function resizeCanvas(){const rect=canvas.getBoundingClientRect();const old=document.createElement('canvas');old.width=canvas.width;old.height=canvas.height;old.getContext('2d').drawImage(canvas,0,0);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(old.width&&old.height)ctx.drawImage(old,0,0,old.width,old.height,0,0,rect.width,rect.height);else restoreBoard()}
function snapshot(){history.push(canvas.toDataURL());if(history.length>15)history.shift()}
function restoreBoard(){const saved=localStorage.getItem('study-board-v1');if(saved){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,canvas.clientWidth,canvas.clientHeight);img.src=saved}}
function saveBoard(){try{localStorage.setItem('study-board-v1',canvas.toDataURL())}catch(e){toast('Board is too large to save')}}
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();snapshot();drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(last.x,last.y)});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=tool==='erase'?Number($('#inkSize').value)*5:Number($('#inkSize').value);ctx.strokeStyle=tool==='erase'?'#fffefa':$('#inkColor').value;ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
function endDraw(){if(!drawing)return;drawing=false;ctx.closePath();saveBoard()}canvas.addEventListener('pointerup',endDraw);canvas.addEventListener('pointercancel',endDraw);
$('#penTool').onclick=()=>{tool='pen';$('#penTool').classList.add('active');$('#eraseTool').classList.remove('active')};$('#eraseTool').onclick=()=>{tool='erase';$('#eraseTool').classList.add('active');$('#penTool').classList.remove('active')};
$('#undoBoard').onclick=()=>{const prev=history.pop();if(!prev){toast('Nothing to undo');return}const img=new Image();img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.clientWidth,canvas.clientHeight);saveBoard()};img.src=prev};
$('#clearBoard').onclick=()=>{if(confirm('Clear your whole whiteboard?')){snapshot();ctx.clearRect(0,0,canvas.width,canvas.height);saveBoard()}};
$('#downloadBoard').onclick=()=>{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='my-study-whiteboard.png';a.click()};
const ro=new ResizeObserver(()=>resizeCanvas());ro.observe(canvas.parentElement);resizeCanvas();
