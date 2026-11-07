import {EMOTION_WHEEL,findEmotion} from './emotionWheel.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {loadFirstAid,saveFirstAid} from './store.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {localDate} from './emotionLog.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
const bilingual=(zh,en)=>({zh,en});
export const FIRST_AID_DEFAULTS={
 intensity:3,
 leafShapeByNode:{anger:'sharp',anxious:'curled',sadness:'drooping',low:'soft',fear:'curled',disgust:'jagged',joy:'round',surprise:'round'},
 leafWeightByIntensity:{1:'light',2:'light',3:'light',4:'heavy',5:'heavy'},
 textureByCore:{anger:'burning',fear:'constricted',sadness:'heavy',low:'mushy',disgust:'knotted'},
 sizeByIntensity:{1:'bubbles',2:'starfish',3:'lamb',4:'lamb',5:'whale'},
 boxBreathingRounds:4
};
const intensityFor=entry=>Number.isInteger(entry?.intensity)&&entry.intensity>=1&&entry.intensity<=5?entry.intensity:FIRST_AID_DEFAULTS.intensity;
function defaultContext(entry){
 const path=entry?.path||[],ids=[...new Set(path.flatMap(n=>trailFor(n.id)||[n.id]))];
 return {path,ids,core:findEmotion(ids[0])};
}
export function defaultsForForest(entry){
 const {path,ids,core}=defaultContext(entry),node=path.at(-1),known=findEmotion(node?.id);
 return {shape:[...ids].reverse().map(id=>FIRST_AID_DEFAULTS.leafShapeByNode[id]).find(Boolean)||'round',weight:FIRST_AID_DEFAULTS.leafWeightByIntensity[intensityFor(entry)],color:core?.color||'#a4b6a0',name:node?.zh||known?.zh||node?.en||known?.en||'一片叶子'};
}
export function defaultsForSafeSpace(entry){
 const {core}=defaultContext(entry),before=intensityFor(entry);
 return {before,color:core?.color||'#a4b6a0',size:FIRST_AID_DEFAULTS.sizeByIntensity[before],texture:FIRST_AID_DEFAULTS.textureByCore[core?.id]||'hollow'};
}
export function applyForestDefaults(entry){return {leaf:defaultsForForest(entry),...(entry?.id?{emotionId:entry.id}:{}),emotionPath:entry?.path||[]};}
export function applySafeSpaceDefaults(entry){const defaults=defaultsForSafeSpace(entry);return {...defaults,after:defaults.before,strategyId:'safe-space-within',...(entry?.id?{emotionId:entry.id}:{})};}
// Only primary is the main CTA; alternative and dismiss are quiet text links.
export function invitationView(entry){const invitation=invitationForEntry(entry);return invitation?{primary:invitation.primary,alternative:invitation.alternatives[0]||null,dismiss:true}:null;}
export const FIRST_AID_TRIGGER={
 minIntensity:4,defaultCoreIds:['fear','anger','disgust','sadness','low'],strategyByNodeId:{},
 forestAnyIntensity:{strategyId:'forest-leaves',alternatives:['safe-space-within'],coreIds:['anger','fear','disgust'],nodeIds:['aggressive'],includeDescendants:true,anyIntensity:true},
 defaultInvitation:{strategyId:'safe-space-within',alternatives:['forest-leaves'],coreIds:['fear','anger','disgust','sadness','low'],minIntensity:4}
};
export const FIRST_AID_STRATEGIES=[{
 id:'safe-space-within',title:bilingual('情绪急救角','Safe Space Within'),
 questions:[bilingual('此刻，你的感受像什么颜色？','What color does your feeling take right now?'),bilingual('它在你心里占据多大的空间？','How much space does it take up inside you?'),bilingual('如果伸手去触碰，它会是什么质感？','If you could touch it, what texture would it have?')],
 steps:[bilingual('之前：选择 1–5 滴水，表示此刻的难受程度。','Before: choose 1–5 drops for your distress right now.'),bilingual('给云朵涂上感受的颜色。','Color the clouds with your feeling.'),bilingual('选择感受占据的空间。','Choose the space your feeling takes up.'),bilingual('选择一种质感，或写下自己的词。','Choose a texture, or use your own word.'),bilingual('之后：再次选择 1–5 滴水。','After: choose 1–5 drops again.')],
 textures:[['bumpy','起伏不平','〰'],['hollow','空洞','◯'],['constricted','紧缩束缚','⊏⊐'],['stuck','卡住','⊣'],['spinning','眩晕混乱','🌀'],['mushy','软塌无力','☁'],['heavy','下坠沉重','↓'],['knotted','打结纠缠','🪢'],['burning','灼烧','♨']].map(([id,zh,icon])=>({id,zh,en:id,icon})),
 sizes:[['whale','鲸鱼','Whale'],['lamb','小羊','Lamb'],['starfish','海星','Starfish'],['bubbles','气泡','Bubbles']].map(([id,zh,en])=>({id,zh,en})),
 colors:['#d88985','#e5af72','#e5d889','#9fbc9e','#8fb8cf','#b3a0c8','#9cabc0','#b6ada0']
}];
function trailFor(id,nodes=EMOTION_WHEEL,trail=[]){
 for(const node of nodes){const next=[...trail,node.id];if(node.id===id)return next;const found=trailFor(id,node.children,next);if(found)return found;}return null;
}
export function invitationForEntry(entry){
 const path=entry?.path;if(!Array.isArray(path)||!path.length)return null;
 const trails=path.map(n=>trailFor(n.id)||[]),ids=[...new Set(trails.flat())];
 const resolve=id=>FIRST_AID_STRATEGIES.find(s=>s.id===id);
 const invitation=config=>{const primary=resolve(config.strategyId);return primary?{primary,alternatives:(config.alternatives||[]).map(resolve).filter(Boolean)}:null;};
 for(const id of [...ids].reverse())if(Object.hasOwn(FIRST_AID_TRIGGER.strategyByNodeId,id))return invitation({strategyId:FIRST_AID_TRIGGER.strategyByNodeId[id]});
 const core=trails[0][0],forest=FIRST_AID_TRIGGER.forestAnyIntensity,normal=FIRST_AID_TRIGGER.defaultInvitation;
 if(forest.coreIds.includes(core)||trails.some(t=>forest.includeDescendants?t.some(id=>forest.nodeIds.includes(id)):forest.nodeIds.includes(t.at(-1))))return invitation(forest);
 if(normal.coreIds.includes(core)&&Number.isInteger(entry.intensity)&&entry.intensity>=normal.minIntensity)return invitation(normal);
 return null;
}
export const shouldOfferFirstAid=entry=>!!invitationForEntry(entry);
export const strategyForEntry=entry=>invitationForEntry(entry)?.primary||null;
export {loadFirstAid};
export function saveFirstAidExercise(input){
 const strategy=FIRST_AID_STRATEGIES.find(s=>s.id===input.strategyId);
 if(strategy?.id!=='safe-space-within'||!['before','after'].every(k=>Number.isInteger(input[k])&&input[k]>=1&&input[k]<=5)||!/^#[0-9a-f]{6}$/i.test(input.color)||!strategy.sizes.some(s=>s.id===input.size)||!(strategy.textures.some(t=>t.id===input.texture)||(input.texture==='custom'&&input.textureCustom?.trim())))throw new TypeError('Complete each reflection before saving.');
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

const pairs=rows=>rows.map(([zh,en])=>bilingual(zh,en));
const poem=pairs([
 ['当情绪如风暴般涌来，你或许会想推开、压抑，甚至与之抗争。','When emotions surge like a storm, you may want to push them away, suppress them, or even fight them.'],
 ['但在森林里，每一片叶子，卷曲的、尖锐的、黯淡的、沉重的，都被允许安然存在。','But in the forest, every leaf—curled, sharp, dull, or heavy—is allowed to exist in peace.'],
 ['在这里，你将用画笔和文字，与情绪对话，描摹它们的形状、色彩与故事。','Here, you will use a brush and words to speak with your emotions, tracing their shapes, colors, and stories.'],
 ['学会以一颗接纳的心，稳稳托住这些叶子，让它们在你的森林中找到安放之地。','Learn to hold these leaves steadily with an accepting heart, letting them find a resting place in your forest.'],
 ['接纳不是终点，而是一道新的门。','Acceptance is not the end, but a new doorway.'],
 ['透过觉察、倾听与自我关怀，你会看见情绪背后未被满足的渴望，以及深埋的信念。','Through awareness, listening, and self-care, you will see the unmet longings behind your emotions and the deeply buried beliefs.'],
 ['从蝴蝶般的轻拍，到大地的承托；','From butterfly-like gentle tapping to the support of the earth;'],
 ['从宁静的呼吸，到未来的拥抱；','From peaceful breathing to the embrace of the future;'],
 ['每一种方式，都是一条通往自我疗愈的路径。','Each way is a path toward self-healing.'],
 ['在这片森林里，你并不需要成为别的人。','In this forest, you do not need to become someone else.'],
 ['你只需让叶子安放，让呼吸流动，','You only need to let the leaves rest and your breath flow,'],
 ['你就会发现，自己已被大地稳稳托住。','And you will discover that the earth is already holding you steadily.']
]);
const compassion=bilingual('亲爱的自己，你已经看见这一切了。谢谢你勇敢地走到这里。','Dear self, you have seen all of this now. Thank you for bravely coming this far.');
const acceptance=bilingual('我练习做一棵不评判的树，叶子不是我，它只是被我觉察的当下。','I practice being a tree that does not judge. The leaf is not me; it is simply the present moment I am noticing.');
FIRST_AID_STRATEGIES.push({
 id:'forest-leaves',title:bilingual('森林接纳所有的叶子','The forest holds every leaf'),
 subtitle:bilingual('森林接纳所有的叶子 — FOREST情绪觉察','The forest holds every leaf — FOREST emotional awareness'),
 introduction:bilingual('此刻，情绪的风吹过我的森林。停下脚步，深呼吸三次，让每片飘落的叶子在掌心停留，感受它的温度与重量。','Now, the wind of emotion blows through my forest. Pause, take three deep breaths, and let each falling leaf rest in your palm. Feel its temperature and weight.'),
 poem,excerpt:poem.slice(0,2),
 steps:pairs([
 ['把你的情绪画成一片片叶子。','Draw your emotions as leaves.'],
 ['是什么事情或行为，触发了这份情绪？','What event or behavior triggered this emotion?'],
 ['这情绪背后，有什么是我想要却没被满足的？','Behind this emotion, what do I want that has not been met?'],
 ['我心底在相信着什么想法？','What idea am I believing deep down?'],
 ['这个想法，最早是从哪里开始生长的？','Where did this idea first begin to grow?'],
 ['回归森林，自我关怀','Return to the forest, care for yourself']
 ]).map((s,i)=>({...s,label:['FEELING','OCCURENCE','REQUIREMENT','ETHOS','SOURCE','TEND'][i]})),
 feelingHints:pairs([
 ['① 它的形状','① Its shape'],['也许像焦虑——边缘卷曲；','Perhaps like anxiety—curled edges;'],['也许像愤怒——尖利锐刺。','Perhaps like anger—sharp spikes.'],
 ['② 它是轻盈小巧，还是沉甸甸的？','② Is it light and small, or heavy?'],['③ 它此刻呈现什么色彩？','③ What color does it have right now?'],['④ 它的名字是 ______','④ Its name is ______']]),
 cloud:pairs([
 ['现在，请把你刚才画下的情绪叶子，轻轻放到接纳的云朵里，把它稳稳托住。','Now, gently place the emotion leaf you just drew into the cloud of acceptance, letting it be held steadily.'],
 ['接纳不是终点，\n在这里，你放下对抗，\n也为新的可能腾出了空间。','Acceptance is not the end.\nHere, you let go of resistance\nand make room for new possibilities.']]),
 tend:{title:bilingual('回归森林，自我关怀','Return to the forest, care for yourself'),compassion},
 butterfly:{title:bilingual('蝴蝶拍肩','Butterfly shoulder tapping'),steps:pairs([
 ['a. 双臂交叉，双手放在上臂靠近肩膀的位置。','a. Cross your arms and place your hands on your upper arms near your shoulders.'],
 ['b. 轻拍自己保持节奏缓慢而均匀（如心跳般）。','b. Tap yourself gently, keeping a slow, even rhythm (like a heartbeat).'],
 ['c. 在拍打的同时，做2-3次深呼吸。','c. While tapping, take 2–3 deep breaths.'],
 ['d. 在每次长呼气后，写下一句支持的话：','d. After each long exhale, write a supportive sentence:']])},
 leaflet:{title:bilingual('森林接纳所有叶子','The forest holds every leaf'),lines:pairs([
 ['每种情绪，就像树上长出的叶子。它们可能卷曲、尖锐、斑驳或柔软，但都属于这棵树。','Every emotion is like a leaf growing on a tree. They may be curled, sharp, mottled, or soft, but they all belong to this tree.'],
 ['想象自己是一棵树，脚像根扎入大地。觉察今天的情绪：它像哪种叶子？焦虑、愤怒、喜悦……','Imagine you are a tree, your feet rooted in the earth. Notice today’s emotion: what kind of leaf is it? Anxiety, anger, joy…'],
 ['在树上画下叶子，用颜色、形状表达你此刻的感受。可在旁写下情绪名字。','Draw leaves on the tree, using colors and shapes to express how you feel now. You may write the emotion’s name beside them.'],
 ['描摹接纳语句：“我练习做一棵不评判的树，叶子不是我，它只是被我觉察的当下。”','Trace the words of acceptance: “I practice being a tree that does not judge. The leaf is not me; it is simply the present moment I am noticing.”']]),acceptance},
 leafShapes:[['curled','卷曲','Curled'],['sharp','尖利','Sharp'],['round','圆润','Round'],['jagged','锯齿','Jagged'],['drooping','低垂','Drooping'],['soft','柔软','Soft']].map(([id,zh,en])=>({id,zh,en}))
},{
 id:'box-breathing',title:bilingual('4-4-4-4盒式呼吸法','4-4-4-4 box breathing'),seconds:4,cycles:[4,6],
 steps:pairs([
 ['吸气4秒：用鼻子平缓吸气，默数1-2-3-4。','Inhale for 4 seconds: breathe in gently through your nose, silently counting 1-2-3-4.'],
 ['屏息4秒：自然屏住呼吸，继续保持放松。','Hold for 4 seconds: hold your breath naturally, staying relaxed.'],
 ['呼气4秒：经嘴巴均匀呼气，感受身体逐渐放松。','Exhale for 4 seconds: breathe out evenly through your mouth, feeling your body gradually relax.'],
 ['屏息4秒：再次自然屏息，完成一个循环。','Hold for 4 seconds: hold your breath naturally again to complete one cycle.'],
 ['适用场景：压力大或思绪纷乱时，帮助恢复平静与清晰。需要快速专注、进入工作或学习状态前。','When to use: to help restore calm and clarity when stressed or your thoughts are scattered. Before you need to focus quickly or begin work or study.']]),
 recommendation:bilingual('建议循环4-6组。','Repeat for 4–6 cycles.')
});
export function saveForestExercise(input){
 const leaf=input?.leaf,forest=FIRST_AID_STRATEGIES.find(s=>s.id==='forest-leaves');
 if(!leaf||!forest.leafShapes.some(s=>s.id===leaf.shape)||!['light','heavy'].includes(leaf.weight)||!/^#[0-9a-f]{6}$/i.test(leaf.color)||typeof leaf.name!=='string'||!leaf.name.trim()||input.cloudReleased!==true)throw new TypeError('Complete the leaf, self-care, and cloud release before saving.');
 const record={id:globalThis.crypto?.randomUUID?.()||`forest-${Date.now()}-${Math.random().toString(36).slice(2)}`,utc:new Date().toISOString(),date:localDate(),strategyId:'forest-leaves',leaf:{shape:leaf.shape,weight:leaf.weight,color:leaf.color,name:leaf.name.trim().slice(0,120)},tend:true,cloudReleased:true};
 if(input.emotionId)record.emotionId=input.emotionId;
 for(const key of ['occurrence','requirement','ethos','source','tendNote'])if(typeof input[key]==='string'&&input[key].trim())record[key]=input[key].trim().slice(0,4000);
 if(input.butterfly)record.butterfly={note:String(input.butterfly.note||'').trim().slice(0,4000)};
 saveFirstAid([...loadFirstAid(),record]);return record;
}
export function deleteFirstAid(id){const entries=loadFirstAid().filter(e=>e.id!==id);saveFirstAid(entries);return entries;}
