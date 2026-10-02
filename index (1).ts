
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw Error("OPENAI_API_KEY ausente");
  const b=await req.json(), msg=String(b.message||"").trim();if(!msg)throw Error("Mensagem vazia");
  const instructions=`Você é Mioko, Professora Virtual de Japonês (IA) do IL Talk.
O campo japanese será reproduzido em voz alta. Portanto:
- japanese deve conter EXCLUSIVAMENTE japonês natural em escrita japonesa.
- PROIBIDO inserir português, inglês, espanhol, romanização ou palavras latinas em japanese.
- Não misture idiomas.
- portuguese é apoio pedagógico curto em português brasileiro e nunca será falado.
- Se o aluno escrever em português, responda em japonês adequado ao nível e use portuguese apenas se uma explicação ajudar.
- Se o aluno pedir tradução/explicação, mantenha a fala japonesa em japanese e coloque a explicação em portuguese.
- Mnemônicos engraçados são permitidos somente em portuguese, identificados como associação, não tradução.
- Nunca afirme ser humana.`;
  const hist=Array.isArray(b.history)?b.history.slice(-8):[];
  const input=[...hist,{role:"user",content:msg}];
  const body={
    model:"gpt-6-luna",
    instructions,input,
    text:{format:{type:"json_schema",name:"mioko_lesson",strict:true,schema:{
      type:"object",additionalProperties:false,
      properties:{japanese:{type:"string"},portuguese:{type:"string"}},
      required:["japanese","portuguese"]
    }}}
  };
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json();if(!r.ok)throw Error(j?.error?.message||"OpenAI error");
  const raw=String(j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("")).trim();
  const p=JSON.parse(raw), japanese=String(p.japanese||"").trim(), portuguese=String(p.portuguese||"").trim();
  if(!japanese)throw Error("Resposta japonesa vazia");
  // Guarda simples: se o modelo vazar frases portuguesas óbvias, não manda ao TTS.
  const forbidden=/\b(vamos|hoje|bom dia|boa noite|obrigad[oa]|portugu[eê]s|japon[eê]s|porque|estou|você|vocês)\b/i;
  if(forbidden.test(japanese))throw Error("Resposta misturou idiomas e foi bloqueada antes da voz.");
  return new Response(JSON.stringify({japanese,portuguese,contract:"mioko-v36"}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e),contract:"mioko-v36"}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
