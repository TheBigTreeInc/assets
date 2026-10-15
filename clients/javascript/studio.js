'use strict';
(async()=>{
 const $=id=>document.getElementById(id),api=Portraits,system=await api.System.load('portraits/index.json');
 const status=text=>$('status').textContent=text;
 const draw=value=>{system.render(value,{canvas:$('portrait'),size:512});system.render(value,{canvas:$('card'),size:128});system.render(value,{canvas:$('icon'),size:64});$('code').value=api.encode(system.registry,value);$('parts').textContent=JSON.stringify(value,null,2);};
 const initial=system.defaultAppearance();Object.assign(initial.parts,{head:8,hair:5,eyes:6,nose:5,mouth:6,clothing:2});
 const wizard=PortraitWizard.mount($('controls'),system,initial,{onChange:draw});draw(wizard.getAppearance());
 const action=(id,fn)=>$(id).onclick=async()=>{try{await fn();}catch(e){status(e.message);}};
 const download=(blob,name)=>{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 action('randomize',()=>wizard.setAppearance(system.randomAppearance()));
 action('save',()=>{localStorage.setItem('portrait-code-v1',api.encode(system.registry,wizard.getAppearance()));status('Portrait saved.');});
 action('restore',()=>{wizard.setAppearance(localStorage.getItem('portrait-code-v1'));status('Portrait restored.');});
 action('export-code',()=>{download(new Blob([api.encode(system.registry,wizard.getAppearance())],{type:'text/plain'}),'portrait-code.txt');status('Portrait code exported.');});
 action('export-png',async()=>{const blob=await new Promise(resolve=>system.render(wizard.getAppearance(),{size:512}).toBlob(resolve));if(!blob)throw Error('PNG export failed.');download(blob,'portrait.png');status('Portrait exported.');});
 $('import-code').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>7000)throw Error('Portrait code is too large.');wizard.setAppearance((await file.text()).trim());status('Portrait restored from code.');}catch(e){status(e.message);}finally{event.target.value='';}};
 document.querySelectorAll('.actions button,.exports button,.exports input').forEach(b=>b.disabled=false);status('Ready. All styles can be mixed.');
})().catch(e=>document.getElementById('status').textContent=e.message);
