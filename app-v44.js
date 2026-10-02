
(()=>{
const $=s=>document.querySelector(s);
let history=JSON.parse(localStorage.getItem("ilTalkHistoryV43")||"[]").slice(-30);
let voice=true;

function add(cls,text,save=true){
 const chat=$("#chat"); if(!chat)return;
 const d=document.createElement("div"); d.className="msg "+cls;
 d.innerHTML="<b>"+(cls==="user"?"Você":"Mioko IA")+"</b><p></p>";
 d.querySelector("p").textContent=text; chat.appendChild(d); chat.scrollTop=chat.scrollHeight;
 if(save){history.push({role:cls==="user"?"user":"assistant",content:text});history=history.slice(-30);localStorage.setItem("ilTalkHistoryV43",JSON.stringify(history))}
}
function speaking(on){document.querySelectorAll(".miokoAvatar").forEach(x=>x.classList.toggle("speaking",on));document.querySelectorAll(".miokoState").forEach(x=>x.textContent=on?"Falando agora…":"Pronta para conversar")}
async function say(text){
 if(!voice||!text)return;
 const sb=window.supabaseClient;
 if(sb?.functions){
  try{
   const {data,error}=await sb.functions.invoke("il-tts",{body:{text,language:"ja"}});
   if(error)throw error; const b=data?.audio_base64||data?.audio;
   if(b){const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b);speaking(true);a.onended=()=>speaking(false);a.onerror=()=>speaking(false);await a.play();return}
  }catch(e){console.warn("il-tts indisponível; usando voz do navegador",e)}
 }
 if("speechSynthesis" in window){
  const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=1.02;
  u.onstart=()=>speaking(true);u.onend=()=>speaking(false);u.onerror=()=>speaking(false);
  speechSynthesis.cancel();speechSynthesis.speak(u);
 }
}
async function callAI(message){
 const body={message,history:history.slice(-20),target_language:"ja",language:"ja",mode:"open_conversation",first_contact:history.length<=1,client_contract:"mioko-v44"};
 const sb=window.supabaseClient;
 if(sb?.functions){
   const {data,error}=await sb.functions.invoke("il-ai",{body});
   if(error)throw error; return data;
 }
 const ep=(window.IL_TALK_CONFIG||{}).AI_ENDPOINT;
 if(ep){
   const r=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const data=await r.json();if(!r.ok)throw Error(data?.error||("HTTP "+r.status));return data;
 }
 throw Error("A IA ainda não está conectada: configure o Supabase ou AI_ENDPOINT em config.js.");
}
async function send(raw){
 const m=String(raw??$("#text")?.value??"").trim();if(!m)return;
 add("user",m,true); if($("#text"))$("#text").value="";
 add("ai","考えています…",false);
 const chat=$("#chat"),thinking=chat?.lastElementChild;
 try{
   const d=await callAI(m);
   const ja=String(d?.target||d?.japanese||d?.answer||d?.reply||"").trim();
   const pt=String(d?.support_pt||d?.portuguese||"").trim();
   if(!ja)throw Error(d?.error||"Resposta vazia");
   thinking?.remove(); add("ai",ja,true);
   if(pt)add("ai","🇧🇷 Apoio: "+pt,false);
   await say(ja);
 }catch(e){
   if(thinking)thinking.querySelector("p").textContent="Conexão da Mioko: "+(e?.message||e);
 }
}
$("#enter")?.addEventListener("click",()=>{$("#login")?.classList.add("hide");$("#app")?.classList.remove("hide")});
$("#exitCourse")?.addEventListener("click",()=>{$("#app")?.classList.add("hide");$("#login")?.classList.remove("hide");speechSynthesis?.cancel?.();scrollTo(0,0)});
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-mode]").forEach(x=>x.classList.remove("active"));b.classList.add("active")}));
$("#begin")?.addEventListener("click",()=>send("こんにちは。今日は自由に会話したいです。自然に話しかけてください。"));
$("#send")?.addEventListener("click",()=>send());
$("#text")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
document.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.q)));
$("#voice")?.addEventListener("click",e=>{voice=!voice;e.currentTarget.textContent=voice?"🔊 Voz ligada":"🔇 Voz desligada";if(!voice)speechSynthesis?.cancel?.()});
$("#mic")?.addEventListener("click",()=>alert("O microfone é opcional. Continue conversando por texto."));
$("#photo")?.addEventListener("click",()=>$("#photoIn")?.click());
$("#file")?.addEventListener("click",()=>$("#fileIn")?.click());
})();
