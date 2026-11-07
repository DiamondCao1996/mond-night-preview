import {WORKBOOK_TOOLS} from './workbook.js';
// Public launch inventory; none requires connecting a sensor.
export const TOOLS=[
 {route:'feel',icon:'♡',titles:['情绪罗盘','Emotion compass','Känslokompass'],descriptions:['慢慢找到贴近此刻的词。','Find words close to this moment.','Hitta ord för den här stunden.']},
 {route:'forest',icon:'♧',titles:['FOREST · 森林','FOREST','FOREST'],descriptions:['让每一片感受都有地方停留。','A place for every feeling to rest.','En plats där varje känsla får vila.']},
 {route:'safe-space',icon:'⌂',titles:['内在安全空间','Safe space within','En trygg plats inom dig'],descriptions:['用颜色、画面与触感陪伴自己。','Explore color, imagery and texture.','Utforska färg, bilder och textur.']},
 {route:'box-breathing',icon:'◻',titles:['盒式呼吸','Box breathing','Fyrkantsandning'],descriptions:['跟随舒适的节奏，随时停下。','Follow a comfortable pace; stop freely.','Följ en behaglig takt; stanna när du vill.']},
 {route:'relax',icon:'❀',titles:['渐进式肌肉放松','Progressive muscle relaxation','Progressiv muskelavslappning'],descriptions:['轻轻留意身体的松与紧。','Gently notice tension and release.','Lägg varsamt märke till spänning och avslappning.']},
 {route:'pause',icon:'☁',titles:['小小暂停','A little pause','En liten paus'],descriptions:['按自己的节奏休息一下。','Rest at your own pace.','Vila i din egen takt.']},
 {route:'music',icon:'♫',titles:['声音角落','Listening corner','Lyssnarhörna'],descriptions:['自主播放、音量和停止控制。','Choose sound, volume and when to stop.','Välj ljud, volym och när du vill sluta.']},
 {route:'context',icon:'✎',titles:['此刻的照顾','Care for this moment','Omsorg för stunden'],descriptions:['活动、感受与可选的温柔建议。','Activity, feelings and optional suggestions.','Aktivitet, känslor och valfria förslag.']},
 {route:'baseline',icon:'〰',titles:['安静参照','Quiet baseline','Lugn baslinje'],descriptions:['可选的传感器参照；无需连接也能浏览。','Optional sensor reference; explore without connecting.','Valfri sensorreferens; utforska utan anslutning.']}
];

TOOLS.push(...WORKBOOK_TOOLS);
export const TOOL_GROUPS=[{id:'calm',titles:['让身体慢下来','Slow down','Varva ner']},{id:'steady',titles:['先稳住此刻','Steady this moment','Stadga stunden']},{id:'reconnect',titles:['找回一点连接','Reconnect gently','Återknyt varsamt']},{id:'reflect',titles:['留一点空间回望','Room to reflect','Utrymme för reflektion']}];
const groups={feel:'reconnect',forest:'reconnect','safe-space':'steady','box-breathing':'calm',relax:'calm',pause:'calm',music:'calm',context:'reconnect',baseline:'reflect'};
for(const t of TOOLS)t.group ||= groups[t.route];
TOOLS.push({route:'review',group:'reflect',icon:'▤',titles:['内在盘点','Inner review','Inre reflektion'],descriptions:['一周的感受，慢慢看。','Notice a week at your pace.','Se tillbaka på veckan i din takt.']},{route:'vision',group:'reflect',icon:'☆',titles:['愿景板','Vision board','Visionskort'],descriptions:['为想要的日常留一扇窗。','A window onto the daily life you want.','Ett fönster mot vardagen du önskar.']},{route:'actions',group:'reflect',icon:'↗',titles:['行动板','Action board','Handlingsplan'],descriptions:['只留一个做得到的小步骤。','One small, feasible step.','Ett litet möjligt steg.']});
