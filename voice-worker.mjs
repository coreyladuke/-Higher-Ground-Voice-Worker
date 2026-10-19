/** Higher Ground HG-020: private prototype audio-transcription Worker.
 * Secrets never belong in a GitHub HTML file. AI binding: AI.
 * This performs speech-to-text only; it does not generate coaching or award XP.
 */
const ORIGIN = 'https://coreyladuke.github.io';
const AUDIO_BYTES_MAX = 3500000;
const TYPES = ['audio/mp4','audio/webm','audio/ogg','audio/mpeg','audio/wav','audio/x-wav','audio/aac','audio/x-m4a'];
function headers(req){return req.headers.get('Origin')===ORIGIN?{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}:null;}
function reply(req, data, code=200){return new Response(JSON.stringify(data),{status:code,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(headers(req)||{})}});}
function toBase64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
export default {async fetch(req, env){
 const cors=headers(req);
 if(!cors)return reply(req,{error:'This test accepts requests only from Higher Ground.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 const path=new URL(req.url).pathname;
 if(path==='/health'&&req.method==='GET')return reply(req,{ready:!!env.AI?.run,model:'whisper-large-v3-turbo',prototype:true});
 if(path!=='/v1/transcribe'||req.method!=='POST')return reply(req,{error:'Not found'},404);
 const secret=String(env.HG_VOICE_TOKEN||'');
 if(secret.length<24||req.headers.get('Authorization')!==`Bearer ${secret}`)return reply(req,{error:'Incorrect private test code. Configure HG_VOICE_TOKEN in Cloudflare.'},401);
 if(!env.AI?.run)return reply(req,{error:'Workers AI binding AI is missing. Add AI binding in Cloudflare Worker settings.'},503);
 const type=(req.headers.get('Content-Type')||'').split(';')[0].toLowerCase().trim();
 if(!TYPES.includes(type))return reply(req,{error:'Unsupported recording format: '+type},415);
 const clen=Number(req.headers.get('Content-Length')||'0');
 if(clen>AUDIO_BYTES_MAX)return reply(req,{error:'Audio is too large. Record a shorter answer.'},413);
 let bytes;
 try{const data=await req.arrayBuffer();bytes=new Uint8Array(data);if(bytes.byteLength<200||bytes.byteLength>AUDIO_BYTES_MAX)throw Error('Audio size limit');}
 catch(_){return reply(req,{error:'Recording was empty or exceeded 3.5MB.'},413)}
 try{
  const model=await env.AI.run('@cf/openai/whisper-large-v3-turbo',{audio:toBase64(bytes),task:'transcribe',language:'en'});
  const text=String(model?.text||model?.response?.text||'').trim();
  if(!text)return reply(req,{error:'The model did not hear any recognizable speech. Try speaking a little closer.'},422);
  return reply(req,{text:text.slice(0,4000),provider:'Cloudflare Whisper Large v3 Turbo',audioStoredByThisWorker:false});
 }catch(e){return reply(req,{error:'Cloudflare transcription unavailable. Check AI binding, free allocation, and audio format.',detail:String(e?.message||e).slice(0,200)},503)}
}};
