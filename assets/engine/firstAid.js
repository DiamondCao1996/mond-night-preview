import {EMOTION_WHEEL,findEmotion} from './emotionWheel.js';
import {loadFirstAid,saveFirstAid} from './store.js';
import {localDate} from './emotionLog.js';
const bilingual=(zh,en)=>({zh,en});
export const FIRST_AID_TRIGGER={minIntensity:4,defaultCoreIds:['fear','anger','disgust','sadness','low'],strategyByNodeId:{}};
export const FIRST_AID_STRATEGIES=[{
 id:'safe-space-within',title:bilingual('情绪急救角','Safe Space Within'),
 questions:[bilingual('此刻，你的感受像什么颜色？','What color does your feeling take right now?'),bilingual('它在你心里占据多大的空间？','How much space does it take up inside you?'),bilingual('如果伸手去触碰，它会是什么质感？','If you could touch it, what texture would it have?')],
 steps:[bilingual('之前：选择 1–5 滴水，表示此刻的难受程度。','Before: choose 1–5 drops for your distress right now.'),bilingual('给云朵涂上感受的颜色。','Color the clouds with your feeling.'),bilingual('选择感受占据的空间。','Choose the space your feeling takes up.'),bilingual('选择一种质感，或写下自己的词。','Choose a texture, or use your own word.'),bilingual('之后：再次选择 1–5 滴水。','After: choose 1–5 drops again.')],
 textures:[['bumpy','起伏不平','〰'],['hollow','空洞','◯'],['constricted','紧缩束缚','⊏⊐'],['stuck','卡住','⊣'],['spinning','眩晕混乱','🌀'],['mushy','软塌无力','☁'],['heavy','下坠沉重','↓'],['knotted','打结纠缠','🪢'],['burning','灼烧','♨']].map(([id,zh,icon])=>({id,zh,en:id,icon})),
 sizes:[['whale','鲸鱼','Whale'],['lamb','小羊','Lamb'],['starfish','海星','Starfish'],['bubbles','气泡','Bubbles']].map(([id,zh,en])=>({id,zh,en})),
 colors:['#d88985','#e5af72','#e5d889','#9fbc9e','#8fb8cf','#b3a0c8','#9cabc0','#b6ada0']
}];
export function shouldOfferFirstAid(entry){
 const id=entry?.path?.[0]?.id;
 const core=EMOTION_WHEEL.find(n=>n.id===id||findEmotion(id,n.children));
 return Number.isInteger(entry?.intensity)&&entry.intensity>=FIRST_AID_TRIGGER.minIntensity&&FIRST_AID_TRIGGER.defaultCoreIds.includes(core?.id);
}
export function strategyForEntry(entry){
 if(!shouldOfferFirstAid(entry))return null;
 const ids=[];
 function ancestors(nodes,trail=[]){for(const n of nodes){const next=[...trail,n.id];if(n.id===entry.path[0].id)ids.push(...next);else ancestors(n.children,next);}}
 ancestors(EMOTION_WHEEL);ids.push(...entry.path.slice(1).map(n=>n.id));
 for(const id of ids.reverse())if(Object.hasOwn(FIRST_AID_TRIGGER.strategyByNodeId,id))return FIRST_AID_STRATEGIES.find(s=>s.id===FIRST_AID_TRIGGER.strategyByNodeId[id])||null;
 return FIRST_AID_STRATEGIES[0];
}
export {loadFirstAid};
export function saveFirstAidExercise(input){
 const strategy=FIRST_AID_STRATEGIES.find(s=>s.id===input.strategyId);
 if(!strategy||!['before','after'].every(k=>Number.isInteger(input[k])&&input[k]>=1&&input[k]<=5)||!strategy.colors.includes(input.color)||!strategy.sizes.some(s=>s.id===input.size)||!(strategy.textures.some(t=>t.id===input.texture)||(input.texture==='custom'&&input.textureCustom?.trim())))throw new TypeError('Complete each reflection before saving.');
 const utc=new Date().toISOString();
 const saved={id:globalThis.crypto?.randomUUID?.()||`first-aid-${Date.now()}-${Math.random().toString(36).slice(2)}`,utc,date:localDate(),strategyId:strategy.id,before:input.before,after:input.after,color:input.color,size:input.size,texture:input.texture};
 if(input.emotionId)saved.emotionId=input.emotionId;
 if(input.texture==='custom')saved.textureCustom=input.textureCustom.trim().slice(0,120);
 saveFirstAid([...loadFirstAid(),saved]);return saved;
}
export const FIRST_AID_COPY={
 en:{entry:'Safe space',intro:'A quiet corner. One small step at a time.',before:'Before',after:'After',next:'Continue',back:'Back',finish:'Finish & save',custom:'My own word',done:'Thank you for making room for yourself.',journal:'Back to journal',again:'Start a new reflection',history:'Your past reflections',empty:'Your reflections will stay in this browser.',invite:'Would you like to sit in the Safe Space for a moment?',yes:'Let’s go',no:'Not now',safety:'This is a self-reflection exercise, not professional care or a diagnosis. If you feel unsafe or in crisis, please contact local emergency services or a crisis line.',error:'Could not save. Please try again.'},
 'zh-CN':{entry:'情绪急救角',intro:'安静的小角落，一次走一小步。',before:'之前 / Before',after:'之后 / After',next:'继续',back:'返回',finish:'完成并保存',custom:'我自己的词',done:'谢谢你，为自己留出一点空间。',journal:'返回心情小记',again:'开始新的练习',history:'过去的练习',empty:'你的练习会保存在此浏览器。',invite:'要不要去情绪急救角坐一会？',yes:'好',no:'先不用',safety:'这是自我觉察练习，不能替代专业照护或诊断。如果你感到不安全或正处于危机，请联系当地急救或心理援助热线。中国大陆：急救 120；全国统一心理援助热线 12356。',error:'未能保存，请重试。'},
 sv:{entry:'En trygg plats',intro:'En lugn vrå. Ett litet steg i taget.',before:'Före',after:'Efter',next:'Fortsätt',back:'Tillbaka',finish:'Avsluta och spara',custom:'Mitt eget ord',done:'Tack för att du gav dig själv utrymme.',journal:'Till dagboken',again:'Börja en ny reflektion',history:'Tidigare reflektioner',empty:'Dina reflektioner sparas i denna webbläsare.',invite:'Vill du sitta en stund i en trygg vrå?',yes:'Ja, gärna',no:'Inte nu',safety:'Detta är en reflektionsövning, inte professionell vård eller en diagnos. Om du känner dig otrygg eller är i kris, kontakta lokal hjälp. Sverige: 112 vid nödsituation; 1177 för sjukvårdsrådgivning; Mind Självmordslinjen 90101.',error:'Kunde inte spara. Försök igen.'}
};
// Sources: 120 national medical emergency — https://bjca.miit.gov.cn/zwgk/tzgg/art/2022/art_8d4eb93ee3424f30826c97ee400e8937.html
// 12356 national mental-health aid line — https://www.gov.cn/zhengce/zhengceku/202412/content_6994470.htm (国卫医政函〔2024〕259号)
// 112 and 1177 — https://www.krisinformation.se/din-beredskap/skydd-och-hjalp/viktiga-telefonnummer/
// Mind Självmordslinjen 90101 — https://mind.se/stod-kunskap/prata-eller-chatta-med-volontar/sjalvmordslinjen/
