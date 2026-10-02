import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const C={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const textOf=(j:any)=>String(j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("")).trim();
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:C});
 try{
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)throw Error("OPENAI_API_KEY não configurada no Supabase");
  const b=await req.json(); const message=String(b.message||"").trim();
  const history=Array.isArray(b.history)?b.history.slice(-20):[];
  if(!message)throw Error("Mensagem vazia");
  const input=[...history,{role:"user",content:message}];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({
    model:"gpt-6-luna",
    instructions:"Você é Mioko, uma professora virtual de idiomas e uma assistente de IA inteligente. Nesta versão de diagnóstico, responda diretamente ao que o usuário perguntou. Converse naturalmente sobre assuntos cotidianos e gerais. Não inicie aula, não repita sua apresentação e não force japonês. Responda no idioma em que o usuário escrever, salvo se ele pedir outro idioma.",
    input
  })});
  const j=await r.json(); if(!r.ok)throw Error(j?.error?.message||("OpenAI HTTP "+r.status));
  const answer=textOf(j); if(!answer)throw Error("OpenAI retornou resposta sem texto");
  return new Response(JSON.stringify({answer,contract:"mioko-brain-v50",model:"gpt-6-luna"}),{headers:{...C,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e),contract:"mioko-brain-v50"}),{status:500,headers:{...C,"Content-Type":"application/json"}})}
});