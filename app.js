// App core: simple stateful simulator
$('#channelInfoName').textContent = ch.name || '-';
$('#channelInfo').dataset.id = ch.id || '';
}


function showMemberPreview(m){
previewAvatar.src = m.avatarDataUrl || defaultAvatar(m.name);
previewName.textContent = m.name;
const role = state.roles.find(r=>r.id===m.roleId);
previewRoles.textContent = role ? `Rôles: ${role.name}` : 'Rôles: —';
}


// UI actions
$('#btnNewRole').addEventListener('click', ()=>{ state.roles.push({id:id(), name:'Nouveau rôle', color:'#9b9b9b', hoist:false}); saveAndRender(); });
$('#btnNewTextChannel').addEventListener('click', ()=>{ state.channels.push({id:id(), name:'nouveau-salon', type:'text'}); saveAndRender(); });
$('#btnNewVoiceChannel').addEventListener('click', ()=>{ state.channels.push({id:id(), name:'nouveau-voc', type:'voice'}); saveAndRender(); });
$('#btnNewMember').addEventListener('click', ()=>{ createMember({name:'Utilisateur', roleId: state.roles[1]?.id || state.roles[0]?.id}); saveAndRender(); });


$('#serverName').addEventListener('input',(e)=>{ state.serverName = e.target.value; $('#serverPreviewName').textContent = state.serverName; save(); });
$('#serverTag').addEventListener('input',(e)=>{ state.serverTag = e.target.value; $('#serverPreviewTag').textContent = state.serverTag; save(); });


$('#avatarInput').addEventListener('change',(e)=>{
const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ()=>{ $('#previewAvatar').src = reader.result; $('#avatarInput').dataset.last = reader.result; }; reader.readAsDataURL(f);
});
$('#createMemberBtn').addEventListener('click', ()=>{
const avatar = $('#avatarInput').dataset.last || null;
const name = $('#newMemberName').value || 'Membre';
const roleId = $('#newMemberRole').value || state.roles[0]?.id;
createMember({name, roleId, avatarDataUrl:avatar}); saveAndRender();
});


$('#sendMsg').addEventListener('click', sendMessage);
$('#messageInput').addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } });


$('#btnExport').addEventListener('click', ()=>{ const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='discord-sim.json'; a.click(); URL.revokeObjectURL(url); });
$('#btnImport').addEventListener('click', ()=>{ $('#importFile').click(); });
$('#importFile').addEventListener('change', (e)=>{ const file = e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=()=>{ try{ state = JSON.parse(r.result); saveAndRender(); alert('Import OK'); }catch(err){ alert('JSON invalide'); }}; r.readAsText(file); });
$('#btnReset').addEventListener('click', ()=>{ if(confirm('Reset le simulateur ?')){ localStorage.removeItem('discord_sim_v1'); state = defaultState; saveAndRender(); } });


// helpers
function createMember({name, roleId, avatarDataUrl}){
state.members.push({id:id(), name, roleId, avatarDataUrl, inVoice:false});
}


function sendMessage(){
const text = $('#messageInput').value.trim(); if(!text) return; const author = 'Vous';
state.messages.push({id:id(), channelId: currentChannelId, author, content: text, ts: Date.now()});
$('#messageInput').value=''; saveAndRender();
}


function defaultAvatar(name){
const c = name ? name[0].toUpperCase() : '?';
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='#1f2937'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#fff' font-size='56' font-family='Arial'>${c}</text></svg>`;
return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}


function save(){ localStorage.setItem('discord_sim_v1', JSON.stringify(state)); }
function load(){ try{ return JSON.parse(localStorage.getItem('discord_sim_v1')); }catch(e){ return null; } }
function saveAndRender(){ save(); render(); }


function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }


// initial render
render();


})();
