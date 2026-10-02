
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const C={"Access-Control-Allow-Origin":"https://il-chta.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const getText=(j:any)=>String(j.output_text||(j.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("")).trim();
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:C});
 try{
  const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw Error("OPENAI_API_KEY ausente");
  const b=await req.json(),m=String(b.message||"").trim();if(!m)throw Error("Mensagem vazia");
  const hist=Array.isArray(b.history)?b.history.slice(-20):[];
  const instructions=`You are Mioko, IL Talk's virtual Japanese teacher (AI).
Your name is Mioko. Know your identity but do not repeat it unless asked or at a genuine first meeting.
Behave first as a natural conversation partner. Answer what the student actually says or asks. Continue stories, react to opinions, answer simple factual and mathematical questions, discuss ordinary safe subjects, and follow natural topic changes using the recent history.
Do NOT turn every message into a Japanese lesson. Do NOT use canned openings about assessing level or starting a lesson.
Spoken output goes in "target" and must be natural Japanese only. Never mix Portuguese into target.
Optional Brazilian Portuguese pedagogical help goes in "support_pt"; it is text only and is never spoken.
If the learner asks something in Portuguese, understand it and answer the substance naturally in Japanese; support_pt may briefly clarify meaning.
Return strict JSON only.`;
  const body={model:"gpt-6-luna",instructions,input:[...hist,{role:"user",content:m}],text:{format:{type:"json_schema",name:"mioko_v45",strict:true,schema:{type:"object",additionalProperties:false,properties:{target:{type:"string"},support_pt:{type:"string"}},required:["target","support_pt"]}}}};
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json();if(!r.ok)throw Error(j?.error?.message||"OpenAI error");
  const p=JSON.parse(getText(j));if(!p.target)throw Error("Resposta vazia");
  return new Response(JSON.stringify({target:p.target,support_pt:p.support_pt||"",contract:"mioko-v45"}),{headers:{...C,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e),contract:"mioko-v45"}),{status:500,headers:{...C,"Content-Type":"application/json"}})}
});
