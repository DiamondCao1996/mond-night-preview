// Separate versioned storage: opening templates never writes or changes legacy records.
export const BOARD_KEY='mond-boards-v1';
export const DEFAULT_THEMES={zh:['身体与照顾','家与日常','工作与学习','关系与陪伴','休息与快乐','成长与意义'],en:['Body & care','Home & daily life','Work & learning','Relationships','Rest & joy','Growth & meaning'],sv:['Kropp & omsorg','Hem & vardag','Arbete & lärande','Relationer','Vila & glädje','Utveckling & mening']};
export function loadBoards(storage=globalThis.localStorage){
 try {const x=JSON.parse(storage.getItem(BOARD_KEY));if(!x||x.version!==1||!Array.isArray(x.visions)||!Array.isArray(x.actions))return empty();
 return {version:1,visions:x.visions.filter(v=>v&&/^theme-[0-5]$/.test(v.id)&&typeof v.title==='string'&&typeof v.text==='string'),actions:x.actions.filter(a=>a&&typeof a.id==='string'&&/^theme-[0-5]$/.test(a.visionId)&&typeof a.text==='string').map(a=>({...a,completed:a.completed===true})),reflection:typeof x.reflection==='string'?x.reflection:'',desiredSelf:typeof x.desiredSelf==='string'?x.desiredSelf:'',cadence:x.cadence==='daily'?'daily':'weekly'};
 }catch{return empty();}
}
const empty=()=>({version:1,visions:[],actions:[],reflection:'',desiredSelf:'',cadence:'weekly'});
export function themes(model,lang='en'){return DEFAULT_THEMES[lang].map((title,i)=>({id:`theme-${i}`,title,text:'',...model.visions.find(v=>v.id===`theme-${i}`)}));}
export function progress(model,visionId){const list=model.actions.filter(a=>!visionId||a.visionId===visionId);return {done:list.filter(a=>a.completed).length,total:list.length};}
export function updateBoard(model,operation,payload={},confirmDelete=()=>false){
 const next=structuredClone(model);
 if(operation==='vision'){if(!/^theme-[0-5]$/.test(payload.id))throw Error('Unknown theme');next.visions=next.visions.filter(v=>v.id!==payload.id);next.visions.push({id:payload.id,title:String(payload.title).trim().slice(0,120),text:String(payload.text).slice(0,4000)});}
 else if(operation==='deleteVision'){if(!confirmDelete())return model;next.visions=next.visions.filter(v=>v.id!==payload.id);next.actions=next.actions.filter(a=>a.visionId!==payload.id);}
 else if(operation==='action'){if(!/^theme-[0-5]$/.test(payload.visionId)||!String(payload.text||'').trim())throw Error('A small step needs words and a theme');const old=next.actions.find(a=>a.id===payload.id);const action={id:old?.id||payload.id||globalThis.crypto.randomUUID(),visionId:payload.visionId,text:String(payload.text).trim().slice(0,1000),completed:old?.completed??false};next.actions=next.actions.filter(a=>a.id!==action.id);next.actions.push(action);}
 else if(operation==='complete'){const action=next.actions.find(a=>a.id===payload.id);if(action)action.completed=payload.completed===true;}
 else if(operation==='deleteAction'){if(!confirmDelete())return model;next.actions=next.actions.filter(a=>a.id!==payload.id);}
 else if(operation==='reflection'){for(const key of ['reflection','desiredSelf'])next[key]=String(payload[key]||'').slice(0,4000);next.cadence=payload.cadence==='daily'?'daily':'weekly';}
 else throw Error('Unknown operation');
 return next;
}
export function persistBoard(model,storage=globalThis.localStorage){storage.setItem(BOARD_KEY,JSON.stringify(model));return model;}
