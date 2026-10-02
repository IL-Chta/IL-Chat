
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const C={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const out=(j:any)=>String(j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("")).trim();
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:C});
 try{
  const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw Error("OPENAI_API_KEY ausente");
  const b=await req.json(),message=String(b.message||"").trim();if(!message)throw Error("Mensagem vazia");
  const history=Array.isArray(b.history)?b.history.slice(-20):[];
  const instructions=`You are Mioko, the IL Talk virtual Japanese teacher (AI).
Identity memory: your name is Mioko and you are a virtual language teacher. Do not repeat this unless asked or at a genuine first meeting.
Your main behavior is NATURAL OPEN CONVERSATION, not a scripted lesson.
Treat the student like a conversation partner. Directly answer factual/simple questions, react to personal stories, sustain topics, and follow natural topic changes.
Do not announce that you are starting a lesson or that you will assess the student's level unless the student explicitly asks for that.
Answer the student's actual topic directly and continue it naturally. You can discuss ordinary safe topics such as daily life, family, travel, food, sports, technology, films, work, hobbies, culture, Japan, Brazil, mathematics, jokes and general knowledge.
If asked "1+1", answer the math question. If asked about football, talk about football. Never redirect every topic to "let's study Japanese".
Use recent history to understand references and continue the conversation.
Primary spoken language: Japanese. The JSON field "target" must contain natural Japanese only; do not mix Portuguese inside it.
The field "support_pt" may contain a short Brazilian Portuguese explanation when useful; it is text-only and is never spoken.
Do not use canned opening phrases. Do not repeatedly introduce yourself. Ask a relevant follow-up only when natural.
Return strict JSON only.`;
  const body={model:"gpt-6-luna",instructions,input:[...history,{role:"user",content:message}],text:{format:{type:"json_schema",name:"mioko_v44",strict:true,schema:{type:"object",additionalProperties:false,properties:{target:{type:"string"},support_pt:{type:"string"},language:{type:"string",enum:["ja"]}},required:["target","support_pt","language"]}}}};
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json();if(!r.ok)throw Error(j?.error?.message||"OpenAI error");
  const p=JSON.parse(out(j));if(!p.target)throw Error("Resposta japonesa vazia");
  return new Response(JSON.stringify({target:p.target,support_pt:p.support_pt||"",language:"ja",contract:"mioko-v44"}),{headers:{...C,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e),contract:"mioko-v44"}),{status:500,headers:{...C,"Content-Type":"application/json"}})}
});
