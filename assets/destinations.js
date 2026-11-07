import {revealView} from './engine/routes.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
// Move the original nodes, never copy or rebuild controls with attached listeners.
export function moveControl(node,host){if(node&&host&&node.parentNode!==host)host.append(node);}
const words={
 zh:['首页','陪伴与关怀','设置','按自己的节奏，有需要时再靠近一点。','连接、偏好与自己的起点，都放在这里。','设备与偏好','进阶 · 数据、导入导出与科学说明','← 返回设置','回到首页','此刻想聊聊自己的感受？','记录感受','打开工具箱'],
 en:['Home','Care & companion','Settings','At your pace. A little company when you need it.','Connection, preferences and your own starting point, together here.','Device & preferences','Advanced · Data, import / export & science','← Back to settings','Back home','How is this moment feeling?','Log a feeling','Open Toolbox'],
 sv:['Hem','Omsorg & sällskap','Inställningar','I din takt. Lite sällskap när du behöver det.','Anslutning, inställningar och din egen utgångspunkt finns här.','Enhet & inställningar','Avancerat · Data, import / export & vetenskap','← Till inställningar','Till startsidan','Hur känns den här stunden?','Logga en känsla','Öppna verktygslådan']
};
let previousHash;
const homeSlots=new WeakMap();
function placeHomeControl(node,host,home){
 if(!node)return;
 if(!homeSlots.has(node)&&node.closest('#home-view')){const slot=document.createComment('original home control');node.before(slot);homeSlots.set(node,slot);}
 const slot=homeSlots.get(node);
 if(home&&slot?.parentNode)slot.after(node);else moveControl(node,host);
}
export function refineDestinations(lang,view,raw){
 const t=words[lang]||words.en,$=id=>document.getElementById(id),settings=$('settings-controls');
 // Minimal document harnesses and older cached HTML may lack the new hosts.
 if(!settings?.append)return;
 // Own the final destination after legacy routers and asynchronous setup finish.
 if(view==='settings'||view==='home')revealView($(`${view}-view`));
 for(const [id,label] of [['home',t[0]],['settings',t[2]]]){const b=document.querySelector(`nav [data-view="${id}"]`);if(b){const labelNode=b.querySelector('span:last-child');labelNode.setAttribute('translate','no');labelNode.textContent=label;}}
 document.querySelectorAll('nav [data-view]').forEach(b=>{const active=b.dataset.view===view;b.setAttribute('aria-label',b.querySelector('span:last-child')?.textContent||b.dataset.view);b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const groups=[['device',t[5]],['baseline',lang==='zh'?'个人基线':lang==='sv'?'Personlig baslinje':'Personal baseline'],['music',lang==='zh'?'音乐与聆听':lang==='sv'?'Musik & lyssnande':'Music & listening'],['support',lang==='zh'?'适合此刻的支持':lang==='sv'?'Stöd för stunden':'Support for this moment'],['preferences',lang==='zh'?'建议与显示偏好':lang==='sv'?'Förslag & visning':'Suggestion & display preferences']];
 for(const [id,label]of groups){let group=$(`settings-${id}`);if(!group){group=document.createElement('section');group.id=`settings-${id}`;const heading=document.createElement('h2');group.append(heading);settings.append(group);}group.querySelector('h2').textContent=label;}
 for(const selector of ['.animal-picker','.companion-setup','.permission-note'])moveControl(document.querySelector(selector),$('settings-device'));
 moveControl(document.querySelector('.support-settings'),$('settings-preferences'));
 moveControl($('quiet-mobile'),$('settings-preferences'));
 placeHomeControl(document.querySelector('.baseline-card'),$('settings-baseline'),view==='home');
 // Settings owns the original utilities; focused launches borrow them temporarily.
 for(const [id,group,routes] of [['music-card','music',['music']],['support-card','support',['context','pause']]]){
  const node=$(id),focused=node?.parentNode?.id==='tool-focus-view'&&routes.includes(raw);
  if(!focused)moveControl(node,$(`settings-${group}`));
 }
 const care=$('care-intro');
 if(care)care.innerHTML=`<p>${t[3]}</p><div class="subnav"><a href="#feel">${t[10]}</a><a href="#tools">${t[11]}</a></div>`;
 $('settings-intro').innerHTML=`<p>${t[4]}</p><div class="subnav"><a href="#device">${t[5]}</a><a href="#baseline">${lang==='zh'?'个人基线':lang==='sv'?'Personlig baslinje':'Personal baseline'}</a><a href="#factors">${t[6]}</a><a href="#home">${t[8]}</a></div>`;
 const advanced=['factors','factors-view','advanced'].includes(raw);$('factors-view').hidden=!advanced;settings.hidden=advanced;
 if(advanced){let back=$('settings-return');if(!back){back=document.createElement('a');back.id='settings-return';back.className='tool-return';back.href='#settings';$('settings-intro').append(back);}back.textContent=t[7];}
 if(view==='settings'){$('page-title').textContent=t[2];$('section-kicker').textContent='MOND';}
 if(previousHash!==location.hash){previousHash=location.hash;const careAlias=['companion','companion-view','care','care-view'].includes(raw);const target=careAlias?$('home-care'):$('main');target?.focus({preventScroll:true});if(careAlias)target?.scrollIntoView?.({block:'nearest',behavior:'auto'});if(raw==='baseline')$('open-baseline')?.focus({preventScroll:true});if(['device','devices','device-view','preferences'].includes(raw))$(`settings-${raw==='preferences'?'preferences':'device'}`)?.scrollIntoView?.({block:'start'});}
}
