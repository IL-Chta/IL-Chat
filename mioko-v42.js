
(()=>{
 localStorage.setItem("ilTalkTargetLanguage","ja");
 window.ILTalkV42={releasedLanguage:"ja",mode:"open_conversation"};
 const patch=()=>{
   const sb=window.supabaseClient||window.sb||window.supabase;
   const f=sb?.functions;
   if(!f?.invoke||f.__v42)return false;
   const old=f.invoke.bind(f);
   f.invoke=(name,o={})=>{
     if(name==="il-ai"){
       o={...o,body:{...(o.body||{}),
         target_language:"ja",
         conversation_mode:"open",
         course_language:"ja",
         client_contract:"mioko-v42"
       }};
     }
     return old(name,o);
   };
   f.__v42=1; return true;
 };
 if(!patch()){let n=0,t=setInterval(()=>{if(patch()||++n>60)clearInterval(t)},250)}
})();
