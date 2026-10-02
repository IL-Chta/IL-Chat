
(()=>{
const L={ja:["Japonês","ja-JP"],en:["Inglês","en-US"],es:["Espanhol","es-ES"],fr:["Francês","fr-FR"],ko:["Coreano","ko-KR"],pt:["Português","pt-BR"]};
const A={"japonês":"ja","japones":"ja","日本語":"ja","ja":"ja","inglês":"en","ingles":"en","english":"en","en":"en","espanhol":"es","español":"es","es":"es","francês":"fr","frances":"fr","français":"fr","fr":"fr","coreano":"ko","한국어":"ko","ko":"ko","português":"pt","portugues":"pt","pt":"pt"};
let cur=localStorage.getItem("ilTalkTargetLanguage")||"ja";
const norm=v=>A[String(v||"").trim().toLowerCase()]||null;
const set=v=>{let n=norm(v);if(n){cur=n;localStorage.setItem("ilTalkTargetLanguage",n);dispatchEvent(new CustomEvent("iltalk:language",{detail:{code:n,name:L[n][0],locale:L[n][1]}}));}};
document.addEventListener("change",e=>{if(e.target.matches?.("select"))set(e.target.value)});
document.addEventListener("click",e=>{let x=e.target.closest?.("[data-language],[data-lang]");if(x)set(x.dataset.language||x.dataset.lang)});
window.ILTalkLanguage={get:()=>({code:cur,name:L[cur][0],locale:L[cur][1]}),set,languages:L};
const patch=()=>{let sb=window.supabaseClient||window.sb||window.supabase,f=sb?.functions;if(!f?.invoke||f.__v40)return false;let old=f.invoke.bind(f);f.invoke=(name,o={})=>old(name,name==="il-ai"?{...o,body:{...(o.body||{}),target_language:cur}}:o);f.__v40=1;return true};
if(!patch()){let n=0,t=setInterval(()=>{if(patch()||++n>40)clearInterval(t)},250)}
})();
