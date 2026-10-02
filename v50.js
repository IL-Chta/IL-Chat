const $=s=>document.querySelector(s);
let history=JSON.parse(localStorage.getItem("mioko-v50-history")||"[]");
const log=$("#log"), ep=$("#endpoint");
ep.value=localStorage.getItem("mioko-v50-endpoint")||"";
function show(t,ok=false){log.className=ok?"ok":"bad";log.textContent=t}
$("#clear").onclick=()=>{history=[];localStorage.removeItem("mioko-v50-history");show("Histórico apagado.",true)}
$("#send").onclick=async()=>{
 const endpoint=ep.value.trim(), message=$("#q").value.trim();
 if(!endpoint)return show("ERRO: informe o endpoint real da Edge Function il-ai.");
 if(!message)return show("ERRO: escreva uma pergunta.");
 localStorage.setItem("mioko-v50-endpoint",endpoint);
 show("Enviando pergunta real para a IA...");
 try{
   const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message,history:history.slice(-20)})});
   const raw=await r.text(); let data; try{data=JSON.parse(raw)}catch{throw Error("Resposta não-JSON: "+raw)}
   if(!r.ok||data.error)throw Error(data.error||("HTTP "+r.status+" — "+raw));
   const answer=String(data.answer||data.output||data.reply||"").trim();
   if(!answer)throw Error("A função respondeu, mas não trouxe answer/output/reply. RAW: "+raw);
   history.push({role:"user",content:message},{role:"assistant",content:answer});
   history=history.slice(-20);localStorage.setItem("mioko-v50-history",JSON.stringify(history));
   show("MIOKO (resposta bruta da IA):\n\n"+answer+"\n\n---\nHTTP "+r.status+" • contrato: "+(data.contract||"não informado"),true);
 }catch(e){show("FALHA REAL DA CONEXÃO/IA:\n\n"+(e.message||e))}
};