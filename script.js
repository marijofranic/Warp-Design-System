let msgCount=0,resizing=null,startX=0,startWidth=0,tipTimer;
const $=id=>document.getElementById(id);
const convo=$('convo'),empty=$('empty-state'),seed=$('seed-block'),sendBtn=$('send-btn'),ta=$('chat-input'),tip=$('tip');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

setTimeout(()=>{empty.style.display='none';seed.style.display='block';msgCount=1;convo.scrollTop=convo.scrollHeight},400);

ta.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,160)+'px';sendBtn.disabled=!this.value.trim()});
ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!sendBtn.disabled)submitMsg()}});

function submitMsg(){
  const text=ta.value.trim();if(!text)return;
  empty.style.display='none';msgCount++;
  const b=document.createElement('div');b.className='msg-block';
  b.innerHTML=`<div class="msg-header"><div class="msg-header__left"><div class="avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><span class="msg-prompt">${esc(text)}</span></div><button class="more-btn" onclick="openCtx(event,'ctx-main')">&#8942;</button></div><div class="thinking-row"><span class="thinking-label" id="think-${msgCount}">Thinking&hellip;</span></div>`;
  convo.appendChild(b);convo.scrollTop=convo.scrollHeight;
  ta.value='';ta.style.height='';sendBtn.disabled=true;
  simulateResponse(b,msgCount);
}

function simulateResponse(block,idx){
  const el=$('think-'+idx);let s=0;
  const t=setInterval(()=>{s++;if(el)el.textContent='Thinking… '+s+'s'},1000);
  setTimeout(()=>{
    clearInterval(t);if(el)el.textContent='Thought for '+(s+1)+' seconds ›';
    const tg=document.createElement('div');tg.className='task-group';
    tg.innerHTML=`<div class="task-hdr" aria-expanded="true" onclick="toggleSteps(this)"><div class="task-hdr__left"><span class="task-label">Task</span></div><svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div><div class="step-list open"><div class="step-row step-row--pending"><div class="step-row__left"><span class="step-icon">○</span><span class="step-text">Analyzing request…</span></div></div></div><div class="contin-row">Planning steps…</div>`;
    block.appendChild(tg);convo.scrollTop=convo.scrollHeight;
  },1800);
}

function toggleDir(node){
  const open=node.getAttribute('aria-expanded')==='true';
  node.setAttribute('aria-expanded',String(!open));
  let el=node.nextElementSibling;
  while(el&&!el.classList.contains('tree-group'))el=el.nextElementSibling;
  if(el)el.classList.toggle('closed',open);
}
function setActive(node){document.querySelectorAll('.tree-node').forEach(n=>n.classList.remove('active'));node.classList.add('active')}

function togglePanel(panelId,btnId,splitterId){
  const hidden=$(panelId).classList.toggle('hidden');
  $(btnId).classList.toggle('active',!hidden);
  $(splitterId).style.display=hidden?'none':'';
}

function startResize(e,id){
  e.preventDefault();resizing=id;startX=e.clientX;
  startWidth=(id==='splitter-a'?$('sidebar'):$('diff-pane')).offsetWidth;
  $('drag-overlay').classList.add('active');$(id).classList.add('dragging');
  document.addEventListener('mousemove',onResize);document.addEventListener('mouseup',stopResize);
}
function onResize(e){
  if(!resizing)return;const d=e.clientX-startX;
  if(resizing==='splitter-a')$('sidebar').style.width=clamp(startWidth+d,120,400)+'px';
  else $('diff-pane').style.width=clamp(startWidth-d,180,600)+'px';
}
function stopResize(){
  $('drag-overlay').classList.remove('active');
  if(resizing)$(resizing).classList.remove('dragging');
  resizing=null;
  document.removeEventListener('mousemove',onResize);document.removeEventListener('mouseup',stopResize);
}

function switchTab(btn,bodyId){
  document.querySelectorAll('.diff-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  ['diff-body','output-body'].forEach(id=>{$(id).style.display=id===bodyId?'':'none'});
}

function stageAll(){const m=$('git-msg');if(!m.value.trim())m.value="feat: scaffold Conway's Game of Life"}
function doCommit(){
  const msg=$('git-msg').value.trim();if(!msg)return;
  const t=$('git-toast');t.textContent='✓ '+(msg.length>26?msg.slice(0,26)+'…':msg);
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);
}

function toggleModel(e){
  e.stopPropagation();
  const dd=$('model-dd'),btn=$('model-btn'),wasOpen=dd.classList.contains('open');
  closeAll();
  if(!wasOpen){
    const r=btn.getBoundingClientRect();
    dd.style.left=Math.max(8,r.right-220)+'px';
    if(window.innerHeight-r.bottom<260){dd.style.top='auto';dd.style.bottom=(window.innerHeight-r.top+4)+'px'}
    else{dd.style.bottom='auto';dd.style.top=(r.bottom+4)+'px'}
    dd.classList.add('open');btn.classList.add('open');
  }
}
function pickModel(name,el){
  $('model-label').textContent=name;
  document.querySelectorAll('.model-opt').forEach(o=>{o.classList.remove('active');const c=o.querySelector('.model-opt__check');if(c)c.remove()});
  el.classList.add('active');
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','model-opt__check');
  [['width','12'],['height','12'],['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','2.5']].forEach(([k,v])=>svg.setAttribute(k,v));
  const pl=document.createElementNS(ns,'polyline');pl.setAttribute('points','20 6 9 17 4 12');
  svg.appendChild(pl);el.appendChild(svg);closeAll();
}

function openCtx(e,id){
  e.stopPropagation();
  const m=$(id),wasOpen=m.classList.contains('open');closeAll();
  if(!wasOpen){
    const r=e.currentTarget.getBoundingClientRect();
    m.style.top=(r.bottom+4)+'px';m.style.left='0px';m.classList.add('open');
    requestAnimationFrame(()=>{const w=m.offsetWidth;m.style.left=clamp(r.right-w,8,window.innerWidth-w-8)+'px'});
  }
}
function removeChip(e,btn){e.stopPropagation();btn.closest('.chip').remove()}
function toggleSteps(h){
  const open=h.getAttribute('aria-expanded')==='true';
  h.setAttribute('aria-expanded',String(!open));
  h.nextElementSibling.classList.toggle('open',!open);
}

document.querySelectorAll('[data-tip]').forEach(el=>{
  el.addEventListener('mouseenter',()=>{
    clearTimeout(tipTimer);const r=el.getBoundingClientRect();
    tip.textContent=el.dataset.tip;
    tip.style.left=(r.left+r.width/2)+'px';tip.style.top=(r.top-8)+'px';
    tip.style.transform='translate(-50%,-100%)';tip.classList.add('show');
  });
  el.addEventListener('mouseleave',()=>{tipTimer=setTimeout(()=>tip.classList.remove('show'),80)});
});

function closeAll(){
  $('model-dd').classList.remove('open');$('model-btn').classList.remove('open');
  document.querySelectorAll('.ctx-menu').forEach(m=>m.classList.remove('open'));
}
document.addEventListener('click',closeAll);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
