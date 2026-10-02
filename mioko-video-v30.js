
(()=>{const $=s=>document.querySelector(s),video=$("#miokoVideoV30"),avatar=$("#mv30Avatar"),cap=$("#mv30Caption");
let last="こんばんは。みおこ先生です。日本語を一緒に勉強しましょう。";
window.miokoVideoOpen=()=>{video.hidden=false};
$("#mv30Close")?.addEventListener("click",()=>video.hidden=true);
$("#mv30Text")?.addEventListener("click",()=>{video.hidden=true;window.miokoVideoOpen?.()});
document.addEventListener("click",e=>{const t=e.target.closest("button,a,[role=button]");if(!t)return;const s=(t.textContent||"").toLowerCase();if(s.includes("video")&&s.includes("mioko"))window.miokoVideoOpen()});
async function say(text){last=text||last;cap.textContent=last;
 try{
  const {data,error}=await window.supabaseClient.functions.invoke("il-tts",{body:{text:last,language:"ja"}});
  if(error)throw error; const b64=data?.audio_base64||data?.audio;if(!b64)throw new Error("sem áudio");
  const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b64);
  avatar.classList.add("speaking");a.onended=()=>avatar.classList.remove("speaking");a.onerror=()=>avatar.classList.remove("speaking");await a.play();
 }catch(e){avatar.classList.remove("speaking")}
}
$("#mv30Repeat")?.addEventListener("click",()=>say(last));
// Quando a Mioko responder no chat, espelha a última fala na tela de vídeo.
const chat=$("#miokoV29Chat"); if(chat)new MutationObserver(()=>{const msgs=chat.querySelectorAll(".miokoV29Msg.ai");const x=msgs[msgs.length-1];if(x){last=x.textContent.replace(/^Mioko:\s*/,"");cap.textContent=last}}).observe(chat,{childList:true});
})();
