const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const b=await req.json(), key=Deno.env.get("OPENAI_API_KEY");
  if(!key)throw Error("OPENAI_API_KEY não configurada");
  const lang=String(b.language||"Japonês"), msg=String(b.message||"").slice(0,6000);
  const hist=Array.isArray(b.history)?b.history.slice(-12):[];
  const instructions=`Você é Mioko, Professora Virtual de Idiomas do IL Talk. Diga claramente que é uma IA se perguntada. Ensine ${lang} por conversa natural e adaptativa. Não presuma iniciante: avalie o nível pelo diálogo. Converse sobre assuntos cotidianos apropriados ao aluno. Se ele não entender, explique brevemente em português e repita em ${lang}. Obedeça pedidos de repetir, falar mais devagar, aumentar dificuldade ou usar somente ${lang}. Corrija com clareza sem interromper excessivamente.`;
  const input=[...hist.map((x:any)=>({role:x.role==="assistant"?"assistant":"user",content:String(x.content||"").slice(0,3000)})),{role:"user",content:msg}];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")||"gpt-5.6-luna",instructions,input})});
  const d=await r.json(); if(!r.ok)throw Error(d?.error?.message||`HTTP ${r.status}`);
  const answer=d.output_text||(d.output||[]).flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==="output_text")?.text;
  if(!answer)throw Error("Resposta sem texto");
  return Response.json({answer},{headers:cors});
 }catch(e){return Response.json({error:String(e?.message||e)},{status:500,headers:cors})}
});