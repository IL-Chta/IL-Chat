
(()=>{const $=s=>document.querySelector(s),input=$("#miokoV33Input"),send=$("#miokoV33Send"),cap=$("#mv30Caption"),avatar=$("#mv30Avatar"),ptBox=$("#miokoV34Explain"),pt=$("#miokoV34Pt");let history=[];
async function tts(japanese){
 if(!japanese)return;
 try{const {data,error}=await window.supabaseClient.functions.invoke("il-tts",{body:{text:japanese,language:"ja"}});if(error)throw error;const b=data?.audio_base64||data?.audio;if(!b)throw Error("Áudio não retornado");const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b);avatar?.classList.add("speaking");a.onended=()=>avatar?.classList.remove("speaking");a.onerror=()=>avatar?.classList.remove("speaking");await a.play()}catch(e){avatar?.classList.remove("speaking");console.error(e)}
}
async function ask(){
 const msg=input?.value.trim();if(!msg)return;input.value="";send.disabled=true;cap.textContent="みおこ先生は考えています…";ptBox.hidden=true;
 try{
  if(!window.supabaseClient?.functions)throw Error("Supabase não inicializado");
  history.push({role:"user",content:msg});
  const {data,error}=await window.supabaseClient.functions.invoke("il-ai",{body:{message:msg,history:history.slice(-10),language:"ja",mode:"language_teacher_v34"}});
  if(error)throw error;
  let ja=data?.japanese||data?.ja||data?.speech_ja||"";
  // V36: não usamos reply genérico como fala, pois pode conter idiomas misturados.
  if(!ja && data?.reply) throw Error("Backend antigo detectado: resposta sem campo japanese. Publique a il-ai da V36.");
  const explanation=data?.portuguese||data?.pt||data?.explanation_pt||"";
  if(!ja)throw Error("Resposta japonesa vazia");
  history.push({role:"assistant",content:ja+(explanation?`\n[PT] ${explanation}`:"")});
  cap.textContent=ja;
  if(explanation){pt.textContent=explanation;ptBox.hidden=false}
  await tts(ja); // português nunca entra no TTS
 }catch(e){cap.textContent="Erro ao falar com a Mioko: "+(e?.message||e)}
 finally{send.disabled=false;input?.focus()}
}
send?.addEventListener("click",ask);input?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}});
})();
