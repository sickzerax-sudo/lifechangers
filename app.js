const BASE_MISSIONS = [
  {id:"move",name:"Movimente seu corpo",desc:"Faça uma atividade física adequada ao seu dia.",category:"Treino e saúde",icon:"🏃",xp:30},
  {id:"food",name:"Alimentação equilibrada",desc:"Faça uma refeição variada e nutritiva.",category:"Alimentação",icon:"🥗",xp:20},
  {id:"study",name:"Sessão de estudos",desc:"Dedique 30 minutos a aprender algo.",category:"Estudos",icon:"📚",xp:25},
  {id:"routine",name:"Organize seu dia",desc:"Planeje suas tarefas e prioridades.",category:"Disciplina e rotina",icon:"🗓️",xp:20},
  {id:"social",name:"Conexão social",desc:"Converse ou passe um tempo com alguém.",category:"Social e comunicação",icon:"💬",xp:15},
  {id:"sleep",name:"Cuide do seu descanso",desc:"Prepare-se para ter uma boa noite de sono.",category:"Sono e descanso",icon:"🌙",xp:20},
  {id:"money",name:"Check-in financeiro",desc:"Registre um gasto ou revise sua meta de economia.",category:"Finanças e economia",icon:"🪙",xp:20},
  {id:"care",name:"Autocuidado & estilo",desc:"Reserve um momento para higiene, cuidados pessoais ou organizar seu visual.",category:"Autocuidado & estilo",icon:"✨",xp:20}
];
const ATTRIBUTES = [
  ["🏃","Treino e saúde","Movimento, energia e bem-estar."],["🥗","Alimentação","Hábitos alimentares equilibrados."],
  ["📚","Estudos","Aprendizado e conhecimento."],["🗓️","Disciplina e rotina","Organização e constância."],
  ["💬","Social e comunicação","Conexões e comunicação."],["🌙","Sono e descanso","Recuperação e descanso."],
  ["🪙","Finanças e economia","Organização financeira."],["✨","Autocuidado & estilo","Higiene, cuidados pessoais e expressão do seu estilo."]
];
const ACHIEVEMENTS = [
  ["🌱","Primeiro passo","Conclua sua primeira missão.",s=>s.completed>=1],
  ["⚡","Ganhando ritmo","Conclua 5 missões.",s=>s.completed>=5],
  ["🏅","Aventureiro dedicado","Conclua 15 missões.",s=>s.completed>=15],
  ["📈","Nível 5","Alcance o nível 5.",s=>s.level>=5],
  ["✨","Cuidando de si","Conclua uma missão de autocuidado.",s=>s.careDone]
];
const todayKey = () => new Date().toLocaleDateString("en-CA");
const freshState = () => ({date:todayKey(),xp:0,coins:0,completed:[],custom:[],rewards:[],careDone:false});
let state;
try { state = JSON.parse(localStorage.getItem("lifechangers-v1")) || freshState(); } catch { state=freshState(); }
if(state.date !== todayKey()){state.date=todayKey();state.completed=[];state.custom=[];}
function save(){localStorage.setItem("lifechangers-v1",JSON.stringify(state));}
function levelInfo(){const level=Math.floor(state.xp/100)+1;return {level,progress:state.xp%100,rank:level<3?"Iniciante":level<5?"Explorador":level<8?"Evoluindo":"Veterano"};}
function allMissions(){return [...BASE_MISSIONS,...state.custom];}
function render(){
 const info=levelInfo(), completed=state.completed.length, total=allMissions().length;
 document.querySelector("#rankName").textContent=info.rank;document.querySelector("#levelLabel").textContent=`NÍVEL ${info.level}`;
 document.querySelector("#xpLabel").textContent=`${info.progress} / 100 XP`;document.querySelector("#xpBar").style.width=info.progress+"%";
 document.querySelector("#totalXp").textContent=state.xp;document.querySelector("#coins").textContent=state.coins;document.querySelector("#completedCount").textContent=completed;
 document.querySelector("#missionProgress").textContent=`${completed}/${total} feitas`;
 document.querySelector("#missionList").innerHTML=allMissions().map(m=>{const done=state.completed.includes(m.id);return `<article class="mission ${done?"done":""}"><div class="mission-icon">${m.icon||"⭐"}</div><div><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.category||"Personalizada")} · ${escapeHtml(m.desc||"Missão criada por você.")}</p></div><span class="xp-tag">+${m.xp} XP</span><label><input type="checkbox" data-mission="${String(m.id)}" ${done?"checked":""}> ${done?"Concluída":"Marcar como concluída"}</label></article>`}).join("");
 document.querySelector("#statsGrid").innerHTML=ATTRIBUTES.map(([icon,name,desc])=>`<article class="stat-card"><div class="stat-icon">${icon}</div><div><strong>${name}</strong><small>${desc}</small></div></article>`).join("");
 const summary={completed,level:info.level,careDone:state.careDone};
 document.querySelector("#achievementList").innerHTML=ACHIEVEMENTS.map(([icon,name,desc,check])=>{const unlocked=check(summary);return `<article class="achievement ${unlocked?"":"locked"}"><div class="medal">${icon}</div><strong>${name} ${unlocked?"✓":"🔒"}</strong><p>${desc}</p></article>`}).join("");
 document.querySelector("#profileRank").textContent=info.rank;document.querySelector("#profileLevel").textContent=`Nível ${info.level}`;
 document.querySelector("#profileXp").textContent=state.xp;document.querySelector("#profileCoins").textContent=state.coins;document.querySelector("#profileDone").textContent=completed;
 document.querySelector("#rewardList").innerHTML=state.rewards.map((r,i)=>`<div class="reward"><span>${escapeHtml(r.name)} · ${r.claimed?"Resgatada":"100 moedas"}</span><button data-reward="${i}" ${r.claimed||state.coins<100?"disabled":""}>${r.claimed?"Concluído":"Resgatar"}</button></div>`).join("");
 save();
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200);}
document.querySelector("#missionList").addEventListener("change",e=>{
 const id=e.target.dataset.mission;if(!id)return;
 const m=allMissions().find(x=>String(x.id)===id);if(!m)return;
 if(e.target.checked&&!state.completed.includes(m.id)){state.completed.push(m.id);state.xp+=m.xp;state.coins+=Math.max(5,Math.round(m.xp/5));if(m.id==="care")state.careDone=true;toast(`Missão concluída! +${m.xp} XP`);}
 else if(!e.target.checked&&state.completed.includes(m.id)){state.completed=state.completed.filter(x=>x!==m.id);state.xp=Math.max(0,state.xp-m.xp);state.coins=Math.max(0,state.coins-Math.max(5,Math.round(m.xp/5)));if(m.id==="care")state.careDone=false;}
 render();
});
document.querySelector("#customMissionForm").addEventListener("submit",e=>{e.preventDefault();const input=document.querySelector("#customMission"),name=input.value.trim();if(!name)return;state.custom.push({id:"custom-"+Date.now(),name,desc:"Missão personalizada.",category:"Sua missão",icon:"⭐",xp:15});input.value="";render();toast("Nova missão adicionada!");});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b===btn));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${btn.dataset.view}`));}));
document.querySelector("#addReward").addEventListener("click",()=>{const input=document.querySelector("#rewardName"),name=input.value.trim();if(!name)return;state.rewards.push({name,claimed:false});input.value="";render();toast("Recompensa criada!");});
document.querySelector("#rewardList").addEventListener("click",e=>{const i=e.target.dataset.reward;if(i===undefined)return;const r=state.rewards[Number(i)];if(r&&!r.claimed&&state.coins>=100){state.coins-=100;r.claimed=true;render();toast("Recompensa resgatada!");}});
document.querySelector("#resetBtn").addEventListener("click",()=>{if(confirm("Tem certeza que deseja apagar seu progresso deste dispositivo?")){state=freshState();render();toast("Progresso reiniciado.");}});
render();
let installPrompt;const installBtn=document.querySelector("#installBtn");
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false;});
installBtn.addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true;});
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
