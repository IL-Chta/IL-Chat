
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)throw new Error("OPENAI_API_KEY ausente");
  const b=await req.json(); const msg=String(b.message||"").trim(); if(!msg)throw new Error("Mensagem vazia");
  const instructions=`Você é Mioko, Professora Virtual de Idiomas (IA) do IL Talk. Sua prioridade atual é japonês. FALE EM JAPONÊS POR PADRÃO. Não misture português dentro das frases japonesas. Use português brasileiro somente quando o aluno pedir explicação/tradução ou demonstrar que não entendeu; nesse caso, faça uma explicação curta em um bloco separado e depois volte ao japonês. Corrija erros com naturalidade. Adapte vocabulário, velocidade e formalidade ao nível do aluno. Romanização só quando for pedagogicamente útil ou solicitada. Nunca diga ser humana.`;
  const input=[...(Array.isArray(b.history)?b.history.slice(-10):[]),{role:"user",content:msg}];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-6-luna",instructions,input})});
  const j=await r.json(); if(!r.ok)throw new Error(j?.error?.message||"OpenAI error");
  let reply=j.output_text;
  if(!reply) reply=(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("\n");
  return new Response(JSON.stringify({reply}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
