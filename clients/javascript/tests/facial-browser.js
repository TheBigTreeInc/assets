'use strict';
const checks=[],api=ModularPortraits;
function check(ok,message){checks.push({passed:!!ok,message});if(!ok)throw Error(message);}
function pixels(renderer,value){return renderer.render(value,{size:128}).getContext('2d').getImageData(0,0,128,128).data;}
function different(a,b){return a.some((v,i)=>v!==b[i]);}
async function run(){
 const renderer=await api.Renderer.load('../packs/all-options/pack.json'),pack=renderer.pack,value=api.normalizeIdentity(pack);
 let count=0;
 for(const face of pack.slots.face.options)for(const eyes of pack.slots.eyes.options.filter(o=>o.asset))for(const nose of pack.slots.nose.options.filter(o=>o.asset))for(const mouth of pack.slots.mouth.options.filter(o=>o.asset)){
  const identity=structuredClone(value);Object.assign(identity.choices,{face:face.id,eyes:eyes.id,nose:nose.id,mouth:mouth.id});const rendered=renderer.render(identity,{size:32});check(rendered.width===32,'Mixed facial combination '+(++count));
 }
 check(count===448,'All 448 explicit face/eye/nose/mouth combinations render');
 for(const slot of ['eyes','nose','mouth']){
  const changed=structuredClone(value);changed.choices[slot]=pack.slots[slot].options.find(o=>o.id.startsWith('cyberpunk')).id;
  const before=pixels(renderer,value),after=pixels(renderer,changed);check(different(before,after),slot+' choice changes rendered pixels');
  const untouched=api.deserialize(pack,api.serialize(pack,changed));for(const key of Object.keys(value.choices))if(key!==slot)check(untouched.choices[key]===value.choices[key],slot+' preserves '+key);
 }
 const colored=structuredClone(value);colored.colors.iris='#ff3030';check(different(pixels(renderer,value),pixels(renderer,colored)),'Eye color changes iris pixels');
 for(const face of pack.slots.face.options)for(const hair of pack.slots.hair.options)for(const outfit of pack.slots.outfit.options){const identity=structuredClone(value);Object.assign(identity.choices,{face:face.id,hair:hair.id,outfit:outfit.id});check(renderer.render(identity,{size:32}).width===32,'Unrestricted head/hair/clothing combination');}
 for(const [slot,data] of Object.entries(pack.slots))for(const option of data.options){const identity=structuredClone(value);identity.choices[slot]=option.id;check(renderer.render(identity,{size:32}).width===32,'Every option selectable: '+slot+'/'+option.id);}
 let updated=null;const editor=ModularPortraitEditor.mount(document.getElementById('editor'),renderer,value,{allowedOptions:{outfit:['cyberpunk-jacket']},onChange:v=>updated=v});
 check(editor.getIdentity().choices.outfit==='cyberpunk-jacket','Game can restrict clothing menu independently');check(document.querySelector('select[aria-label="Clothing"]').options.length===1,'Only allowed clothing is shown');
 const nose=document.querySelector('select[aria-label="Nose"]');nose.value='cyberpunk-broad';nose.dispatchEvent(new Event('change'));check(updated.choices.nose==='cyberpunk-broad','Nose editor control updates identity');
 const saved=api.serialize(pack,updated);localStorage.setItem('facial-test-only',saved);check(JSON.stringify(api.deserialize(pack,localStorage.getItem('facial-test-only')))===JSON.stringify(updated),'Mixed facial appearance browser storage round trip');localStorage.removeItem('facial-test-only');editor.destroy();
 renderer.render(updated,{canvas:document.getElementById('portrait'),size:256});
 document.getElementById('results').textContent=JSON.stringify(checks,null,2);document.body.dataset.result='passed';
}
run().catch(error=>{document.getElementById('results').textContent=error.stack+'\n'+JSON.stringify(checks,null,2);document.body.dataset.result='failed';});
