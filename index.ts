
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const C={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
function textOf(j:any){return String(j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("")).trim()}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:C});
 try{
  const b=await req.json(),key=Deno.env.get("OPENAI_API_KEY");
  if(!key)throw Error("OPENAI_API_KEY ausente");
  const message=String(b.message||"").trim(); if(!message)throw Error("Mensagem vazia");
  const history=Array.isArray(b.history)?b.history.slice(-20):[];
  const first=Boolean(b.first_contact);
  const instructions=`You are Mioko, IL Talk's virtual Japanese teacher (AI).
Permanent identity: your name is Mioko; your job is virtual language teacher. Know this, but do NOT repeat your name/job unless asked or this is a genuine first contact (${first}).
Your primary goal is NATURAL OPEN CONVERSATION. Talk about whatever ordinary safe topic the student brings: daily life, family, travel, food, sports, technology, films, work, study, Japan, Brazil, hobbies, news in a non-live/general sense, mathematics, culture, jokes, and other normal subjects.
Answer the actual question first. If asked 1+1, answer 2 naturally. If asked about football, discuss football. If asked about food, discuss food. Do not redirect every message into a lesson.
Maintain context from history. Ask relevant follow-up questions when natural. Do not mechanically praise every message.
TARGET SPEECH: Japanese. "target" must contain ONLY natural Japanese, with no Portuguese mixed inside it.
"support_pt" is optional short Brazilian-Portuguese pedagogical help and is TEXT ONLY, never spoken.
If the learner needs help, use support_pt, then continue Japanese conversation.
Never start with canned phrases such as "Vamos conversar em japonês", "não vou começar automaticamente do básico", or repeated self-introductions unless context truly calls for it.
Return strict JSON only.`;
  const body={model:"gpt-6-luna",instructions,input:[...history,{role:"user",content:message}],text:{format:{type:"json_schema",name:"mioko_v42",strict:true,schema:{type:"object",additionalProperties:false,properties:{target:{type:"string"},support_pt:{type:"string"},language:{type:"string",enum:["ja"]}},required:["target","support_pt","language"]}}}};
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json(); if(!r.ok)throw Error(j?.error?.message||"OpenAI error");
  const p=JSON.parse(textOf(j)); if(!p.target)throw Error("Resposta japonesa vazia");
  return new Response(JSON.stringify({target:p.target,support_pt:p.support_pt||"",language:"ja",contract:"mioko-v42-open"}),{headers:{...C,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e),contract:"mioko-v42-open"}),{status:500,headers:{...C,"Content-Type":"application/json"}})}
});
