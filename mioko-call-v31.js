
(()=>{const $=s=>document.querySelector(s),box=$("#miokoCallV31"),incoming=$("#mc31Incoming"),av=$("#mc31Avatar"),cap=$("#mc31Caption"),st=$("#mc31Status");let last="こんばんは。みおこ先生です。今日は日本語を勉強しましょう。";
async function speak(t){last=t||last;cap.textContent=last;st.textContent="Mioko-sensei está falando…";try{const {data,error}=await window.supabaseClient.functions.invoke("il-tts",{body:{text:last,language:"ja"}});if(error)throw error;const b=data?.audio_base64||data?.audio;if(!b)throw Error("áudio não retornado");const a=new Audio("data:"+(data?.mime_type||"audio/mpeg")+";base64,"+b);av.classList.add("speaking");a.onended=()=>{av.classList.remove("speaking");st.textContent="Chamada em andamento • digite para conversar.";};a.onerror=()=>av.classList.remove("speaking");await a.play()}catch(e){av.classList.remove("speaking");st.textContent="Voz depende da função il-tts publicada no Supabase."}}
window.miokoIncomingCall=()=>{box.hidden=false;incoming.hidden=false;st.textContent="Mioko-sensei está chamando…"};
$("#mc31Answer")?.addEventListener("click",()=>{incoming.hidden=true;speak(last)});
$("#mc31Decline")?.addEventListener("click",()=>box.hidden=true);$("#mc31End")?.addEventListener("click",()=>box.hidden=true);
$("#mc31Repeat")?.addEventListener("click",()=>speak(last));$("#mc31Type")?.addEventListener("click",()=>{box.hidden=true;window.miokoVideoOpen?.()});
document.addEventListener("click",e=>{const t=e.target.closest("button,a,[role=button]");if(!t)return;const x=(t.textContent||"").toLowerCase();if((x.includes("mioko")&&x.includes("chamada"))||x.includes("ligar para mioko"))window.miokoIncomingCall()});
const chat=$("#miokoV29Chat");if(chat)new MutationObserver(()=>{const a=chat.querySelectorAll(".miokoV29Msg.ai"),m=a[a.length-1];if(m){last=m.textContent.replace(/^Mioko:\s*/,"");cap.textContent=last}}).observe(chat,{childList:true});
})();
