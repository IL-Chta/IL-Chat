
(()=>{const $=s=>document.querySelector(s),input=$("#miokoV33Input"),send=$("#miokoV33Send"),cap=$("#mv30Caption"),avatar=$("#mv30Avatar");
let history=[],last="";
async function tts(text){
 try{
  const {data,error}=await window.supabaseClient.functions.invoke("il-tts",{body:{text,language:"ja"}});
  if(error)throw error;const b=data?.audio_base64||data?.audio;if(!b)throw Error("Áudio não retornado");
  const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b);avatar?.classList.add("speaking");
  a.onended=()=>avatar?.classList.remove("speaking");a.onerror=()=>avatar?.classList.remove("speaking");await a.play();
 }catch(e){avatar?.classList.remove("speaking");console.error("Mioko TTS:",e)}
}
async function ask(){
 const msg=input?.value.trim();if(!msg)return;
 input.value="";send.disabled=true;cap.textContent="みおこ先生は考えています…";
 try{
  if(!window.supabaseClient?.functions)throw Error("Supabase não inicializado");
  history.push({role:"user",content:msg});
  const {data,error}=await window.supabaseClient.functions.invoke("il-ai",{body:{message:msg,history:history.slice(-10),language:"ja",mode:"language_teacher"}});
  if(error)throw error;const reply=data?.reply||data?.text||data?.answer||data?.output;if(!reply)throw Error("Resposta vazia");
  last=reply;history.push({role:"assistant",content:reply});cap.textContent=reply;await tts(reply);
 }catch(e){cap.textContent="Erro ao falar com a Mioko: "+(e?.message||e)}
 finally{send.disabled=false;input?.focus()}
}
send?.addEventListener("click",ask);input?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}});
window.miokoV33Ask=ask;
})();
