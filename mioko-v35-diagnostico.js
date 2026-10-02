
(()=>{const $=s=>document.querySelector(s),b=$("#miokoV35DiagBtn"),o=$("#miokoV35DiagOut");
async function run(){
 o.hidden=false;o.textContent="Testando a função il-ai publicada…";
 const report={time:new Date().toISOString(),page:location.href,supabaseClient:!!window.supabaseClient};
 try{
  if(!window.supabaseClient?.functions)throw Error("Supabase não inicializado nesta página");
  const probe="こんばんは。日本語だけで短く答えてください。";
  const {data,error}=await window.supabaseClient.functions.invoke("il-ai",{body:{message:probe,language:"ja",mode:"diagnostic_v35",diagnostic:true}});
  report.il_ai_error=error?String(error.message||error):null;report.il_ai_response=data??null;
  const ja=data?.japanese||data?.ja||data?.speech_ja||"";
  const pt=data?.portuguese||data?.pt||data?.explanation_pt||"";
  report.v34_contract=!!(ja||pt);
  report.result=report.v34_contract?"Backend novo reconhecido (campos japanese/portuguese).":"ATENÇÃO: backend não retornou o contrato V34; provavelmente a função publicada ainda é antiga/diferente.";
 }catch(e){report.exception=String(e?.message||e)}
 o.textContent=JSON.stringify(report,null,2);
}
b?.addEventListener("click",run);
})();
