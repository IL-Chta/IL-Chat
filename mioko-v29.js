
(() => {
  const $=s=>document.querySelector(s);
  const panel=$("#miokoV29Panel"), chat=$("#miokoV29Chat"), input=$("#miokoV29Input"),
        send=$("#miokoV29Send"), speak=$("#miokoV29Speak"), status=$("#miokoV29Status");
  let last="", history=[];
  const open=()=>{panel.hidden=false; setTimeout(()=>input?.focus(),30)};
  document.addEventListener("click",e=>{
    const t=e.target.closest("button,a,[role=button]");
    if(!t)return;
    const label=(t.textContent||"").toLowerCase();
    if(label.includes("mioko")||label.includes("professora virtual")||label.includes("começar aula")) open();
  });
  $("#miokoV29Close")?.addEventListener("click",()=>panel.hidden=true);
  const add=(who,text,cls)=>{const d=document.createElement("div");d.className="miokoV29Msg "+cls;d.innerHTML="<b>"+who+":</b> ";d.append(document.createTextNode(text));chat.append(d);chat.scrollTop=chat.scrollHeight};
  async function ask(){
    const text=input.value.trim(); if(!text)return;
    add("Você",text,"me"); input.value=""; send.disabled=true; status.textContent="Mioko está preparando a aula…";
    history.push({role:"user",content:text});
    try{
      if(!window.supabaseClient?.functions) throw new Error("Supabase não inicializado");
      const {data,error}=await window.supabaseClient.functions.invoke("il-ai",{body:{
        mode:"language_teacher", language:"ja", message:text, history:history.slice(-10),
        teacher:"Mioko", instructions:"Ensine japonês de forma natural. Corrija gentilmente. Explique em português quando necessário. Sempre inclua japonês em escrita japonesa e romanização quando útil. Adapte-se ao nível do aluno."
      }});
      if(error) throw error;
      const reply=data?.reply||data?.text||data?.answer||data?.output;
      if(!reply) throw new Error("Resposta vazia do il-ai");
      last=reply; history.push({role:"assistant",content:reply}); add("Mioko",reply,"ai");
      status.textContent="Resposta recebida. 🔊 para ouvir.";
    }catch(err){
      status.textContent="IA ainda não conectada: "+(err?.message||err);
    }finally{send.disabled=false}
  }
  send?.addEventListener("click",ask);
  input?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}});
  speak?.addEventListener("click",async()=>{
    if(!last)return;
    status.textContent="Gerando voz da Mioko…";
    try{
      if(!window.supabaseClient?.functions) throw new Error("Supabase não inicializado");
      const {data,error}=await window.supabaseClient.functions.invoke("il-tts",{body:{text:last,language:"ja"}});
      if(error)throw error;
      const b64=data?.audio_base64||data?.audio;
      if(!b64)throw new Error("Áudio não retornado");
      const audio=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b64);
      document.documentElement.classList.add("mioko-speaking");
      audio.onended=()=>document.documentElement.classList.remove("mioko-speaking");
      await audio.play(); status.textContent="Mioko está falando…";
    }catch(err){status.textContent="Voz ainda não conectada: "+(err?.message||err)}
  });
})();
