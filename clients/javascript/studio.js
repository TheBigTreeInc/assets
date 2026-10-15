'use strict';
(async()=>{
 const $=id=>document.getElementById(id),api=NumericPortraits;
 const system=await api.System.load('packs/portraits/pack.json',{catalogURL:'catalogs/library-3.json'});
 const status=text=>$('status').textContent=text;
 const draw=code=>{system.render(code,{canvas:$('portrait'),size:512});system.render(code,{canvas:$('card'),size:128});system.render(code,{canvas:$('icon'),size:64});};
 const initial=system.defaultAppearance();Object.assign(initial.parts,{hair:5,eyes:5,mouth:5,clothing:4});
 const wizard=PortraitWizard.mount($('controls'),system,initial,{onChange:draw});draw(wizard.getAppearance());
 const key='portrait-library:3';
 const action=(id,fn)=>$(id).onclick=async()=>{try{await fn();}catch(e){status(e.message);}};
 const download=(blob,name)=>{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 action('randomize',()=>wizard.setAppearance(system.randomAppearance()));
 action('save',()=>{localStorage.setItem(key,api.serialize(system.catalog,wizard.getAppearance()));status('Appearance saved.');});
 action('restore',()=>{wizard.setAppearance(api.deserialize(system.catalog,localStorage.getItem(key)));status('Appearance restored.');});
 action('export-json',()=>{download(new Blob([api.serialize(system.catalog,wizard.getAppearance())],{type:'application/json'}),'portrait-appearance.json');status('Appearance exported.');});
 action('export-png',async()=>{const blob=await new Promise(resolve=>system.render(wizard.getAppearance(),{size:512}).toBlob(resolve));if(!blob)throw Error('PNG export failed.');download(blob,'portrait.png');status('Portrait exported.');});
 $('import-json').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>16384)throw Error('Appearance file is too large.');wizard.setAppearance(api.deserialize(system.catalog,await file.text()));status('Appearance imported.');}catch(e){status(e.message);}finally{event.target.value='';}};
 document.querySelectorAll('.actions button,.exports button,.exports input').forEach(b=>b.disabled=false);status('Ready. Every part belongs to the same library.');
})().catch(e=>document.getElementById('status').textContent=e.message);
