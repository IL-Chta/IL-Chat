
(()=>{
 const state={history:JSON.parse(localStorage.getItem("miokoV45History")||"[]").slice(-24),busy:false};
 const q=s=>document.querySelector(s);
 function save(){localStorage.setItem("miokoV45History",JSON.stringify(state.history.slice(-24)))}
 function currentInput(){return q("#text")||q("#miokoText")||q('textarea[placeholder*="mensagem" i]')||q('input[placeholder*="mensagem" i]')}
 function chat(){return q("#chat")||q("#miokoChat")||q(".chat")}
 function bubble(who,text){
   const c=chat(); if(!c)return;
   const d=document.createElement("div");d.className="msg "+(who==="user"?"user":"ai");
   d.innerHTML="<b>"+(who==="user"?"Você":"Mioko IA")+"</b><p></p>";d.querySelector("p").textContent=text;c.appendChild(d);c.scrollTop=c.scrollHeight;
 }
 async function invokeAI(message){
   const body={message,history:state.history.slice(-20),target_language:"ja",mode:"open_conversation",client_contract:"mioko-v45"};
   const candidates=[window.supabaseClient,window.sb,window._supabase].filter(Boolean);
   for(const sb of candidates){
     if(sb?.functions?.invoke){
       const {data,error}=await sb.functions.invoke("il-ai",{body});if(error)throw error;return data;
     }
   }
   // If the project's existing app exposes a Supabase client later, wait briefly once.
   await new Promise(r=>setTimeout(r,400));
   for(const sb of [window.supabaseClient,window.sb,window._supabase].filter(Boolean)){
     if(sb?.functions?.invoke){const {data,error}=await sb.functions.invoke("il-ai",{body});if(error)throw error;return data}
   }
   throw Error("Supabase/il-ai não conectado nesta página.");
 }
 async function speak(text){
   if(!text)return;
   // Prefer the existing V38 TTS function if its client is available.
   for(const sb of [window.supabaseClient,window.sb,window._supabase].filter(Boolean)){
     if(sb?.functions?.invoke)try{
       const {data,error}=await sb.functions.invoke("il-tts",{body:{text,language:"ja"}});
       if(!error){
         const b=data?.audio_base64||data?.audio;
         if(b){const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b);await a.play();return}
       }
     }catch(e){}
   }
   // Guaranteed no-server fallback: Japanese browser voice.
   if("speechSynthesis" in window){
     const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=1;u.pitch=1;
     const vs=speechSynthesis.getVoices(),jp=vs.find(v=>/^ja/i.test(v.lang));if(jp)u.voice=jp;
     speechSynthesis.cancel();speechSynthesis.speak(u);
   }
 }
 async function send(){
   if(state.busy)return;
   const inp=currentInput(),message=String(inp?.value||"").trim();if(!message)return;
   state.busy=true;if(inp)inp.value="";bubble("user",message);
   state.history.push({role:"user",content:message});save();
   try{
     const data=await invokeAI(message);
     const ja=String(data?.target||data?.japanese||data?.reply||"").trim();
     const pt=String(data?.support_pt||data?.portuguese||"").trim();
     if(!ja)throw Error(data?.error||"A Mioko não devolveu texto.");
     bubble("ai",ja);state.history.push({role:"assistant",content:ja});save();
     if(pt)bubble("ai","🇧🇷 "+pt);
     await speak(ja);
   }catch(e){
     bubble("ai","⚠️ "+String(e?.message||e));
   }finally{state.busy=false}
 }
 // Capture send before old handlers can turn the request into a canned lesson.
 document.addEventListener("click",e=>{
   const b=e.target.closest?.("#send,#miokoSend,[data-mioko-send]");
   if(b){e.preventDefault();e.stopImmediatePropagation();send()}
 },true);
 document.addEventListener("keydown",e=>{
   const inp=currentInput();if(e.key==="Enter"&&!e.shiftKey&&e.target===inp){e.preventDefault();e.stopImmediatePropagation();send()}
 },true);
 window.MiokoV45={send,state};
})();
