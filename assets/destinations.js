// Move the original nodes, never copy or rebuild controls with attached listeners.
export function moveControl(node,host){if(node&&host&&node.parentNode!==host)host.append(node);}
const words={
 zh:['安心角落','陪伴与关怀','设置','按自己的节奏，有需要时再靠近一点。','连接、偏好与自己的起点，都放在这里。','设备与偏好','进阶 · 数据、导入导出与科学说明','← 返回设置','回到首页','此刻想聊聊自己的感受？','记录感受','打开工具箱'],
 en:['Your corner','Care & companion','Settings','At your pace. A little company when you need it.','Connection, preferences and your own starting point, together here.','Device & preferences','Advanced · Data, import / export & science','← Back to settings','Back home','How is this moment feeling?','Log a feeling','Open Toolbox'],
 sv:['Din hörna','Omsorg & sällskap','Inställningar','I din takt. Lite sällskap när du behöver det.','Anslutning, inställningar och din egen utgångspunkt finns här.','Enhet & inställningar','Avancerat · Data, import / export & vetenskap','← Till inställningar','Till startsidan','Hur känns den här stunden?','Logga en känsla','Öppna verktygslådan']
};
let previousHash;
export function refineDestinations(lang,view,raw){
 const t=words[lang]||words.en,$=id=>document.getElementById(id),settings=$('settings-controls');
 // Minimal document harnesses and older cached HTML may lack the new hosts.
 if(!settings?.append)return;
 for(const [id,label] of [['home',t[0]],['companion',t[1]],['settings',t[2]]]){const b=document.querySelector(`nav [data-view="${id}"]`);if(b)b.querySelector('span:last-child').textContent=label;}
 document.querySelectorAll('nav [data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 for(const selector of ['.animal-picker','.support-settings','.baseline-card','.companion-detail','.permission-note'])moveControl(document.querySelector(selector),settings);
 moveControl($('quiet-mobile'),settings);
 moveControl($('support-card'),$('companion-view'));
 // Listening remains a Toolbox utility, with its original audio and handlers.
 let library=$('tool-library');if(!library){library=document.createElement('div');library.id='tool-library';library.hidden=true;$('main').append(library);}moveControl($('music-card'),library);
 let care=$('care-intro');if(!care){care=document.createElement('div');care.id='care-intro';$('companion-view').prepend(care);}
 care.innerHTML=`<p>${t[3]}</p><article class="card"><h2>${t[9]}</h2><div class="subnav"><a href="#feel">${t[10]}</a><a href="#tools">${t[11]}</a><a href="#home">${t[8]}</a></div></article>`;
 $('settings-intro').innerHTML=`<p>${t[4]}</p><div class="subnav"><a href="#device">${t[5]}</a><a href="#baseline">${lang==='zh'?'个人基线':lang==='sv'?'Personlig baslinje':'Personal baseline'}</a><a href="#factors">${t[6]}</a><a href="#home">${t[8]}</a></div>`;
 const advanced=['factors','factors-view','advanced'].includes(raw);$('factors-view').hidden=!advanced;settings.hidden=advanced;
 if(advanced){let back=$('settings-return');if(!back){back=document.createElement('a');back.id='settings-return';back.className='tool-return';back.href='#settings';$('settings-intro').append(back);}back.textContent=t[7];}
 if(view==='settings'||view==='companion'){$('page-title').textContent=view==='settings'?t[2]:t[1];$('section-kicker').textContent='MOND';}
 if(previousHash!==location.hash){previousHash=location.hash;$('main').focus({preventScroll:true});if(raw==='baseline')$('open-baseline')?.focus({preventScroll:true});}
}
