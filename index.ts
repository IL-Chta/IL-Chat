
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw Error("OPENAI_API_KEY ausente");
  const b=await req.json(),msg=String(b.message||"").trim();if(!msg)throw Error("Mensagem vazia");
  const instructions=`Você é Mioko, Professora Virtual de Japonês (IA) do IL Talk.
Retorne SOMENTE JSON válido, sem markdown, exatamente com duas chaves:
{"japanese":"...","portuguese":"..."}
REGRAS:
1. japanese: SOMENTE japonês natural escrito em japonês. É a única parte que será falada pela voz.
2. Nunca coloque português, espanhol, inglês ou romanização dentro de japanese.
3. portuguese: explicação pedagógica curta em português brasileiro, apenas quando necessária ou pedida. Caso contrário, string vazia.
4. Não misture idiomas na mesma frase.
5. Adapte o japonês ao nível do aluno e corrija erros com naturalidade.
6. Associações engraçadas podem ser usadas na explicação em português, mas deixe claro que são mnemônicos e não traduções literais.
7. Nunca diga ser humana.`;
  const hist=Array.isArray(b.history)?b.history.slice(-8):[];
  const input=[...hist,{role:"user",content:msg}];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-6-luna",instructions,input})});
  const j=await r.json();if(!r.ok)throw Error(j?.error?.message||"OpenAI error");
  let raw=j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("");
  raw=String(raw||"").trim().replace(/^```json\s*/,"").replace(/```$/,"").trim();
  const parsed=JSON.parse(raw);
  const japanese=String(parsed.japanese||"").trim(),portuguese=String(parsed.portuguese||"").trim();
  if(!japanese)throw Error("Resposta japonesa vazia");
  return new Response(JSON.stringify({japanese,portuguese}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
