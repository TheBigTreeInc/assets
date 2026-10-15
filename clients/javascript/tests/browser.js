'use strict';
(async()=>{
 const checks=[],check=(passed,name)=>{checks.push({passed:!!passed,name});if(!passed)throw Error(name);};
 const api=NumericPortraits,sys=await api.System.load('../packs/portraits/pack.json',{catalogURL:'../catalogs/library-2.json'}),code=sys.defaultAppearance();code.colors.iris=api.rgb('#123456');
 const png=sys.toDataURL(code);check(sys.toDataURL(api.deserialize(sys.catalog,api.serialize(sys.catalog,code)))===png,'Exact numeric save/render restoration');
 check(sys.choices('eyewear',{type:'glasses'}).length===1,'Glasses is an eyewear type');check(sys.choices('hair',{tags:['pixel']}).length===2,'Style tags filter hairstyles');
 let count=0;const hashes=new Set();
 for(const face of sys.choices('face'))for(const eyes of sys.choices('eyes'))for(const nose of sys.choices('nose'))for(const mouth of sys.choices('mouth')){
  const value=structuredClone(code);Object.assign(value.parts,{face:face.id,eyes:eyes.id,nose:nose.id,mouth:mouth.id});const image=sys.toDataURL(value,{size:64});hashes.add(image);count++;
 }
 check(count===448&&hashes.size===448,'448 distinct face/eyes/nose/mouth combinations render');
 for(const category of ['hair','clothing','eyewear','faceCovering','augmentation'])for(const choice of sys.choices(category)){const value=structuredClone(code);value.parts[category]=choice.id;check(sys.toDataURL(value,{size:128}).startsWith('data:image/png'),'Renders '+category+' '+choice.label);}
 const original=api.serialize(sys.catalog,code);sys.backgroundProvider=({context})=>context.jobId===101?'#ffffff':'#000000';
 check(sys.toDataURL(code,{context:{jobId:101}})!==sys.toDataURL(code,{context:{jobId:102}}),'Game job changes background');check(api.serialize(sys.catalog,code)===original,'Job leaves numeric appearance unchanged');
 check(sys.render(code,{background:null}).getContext('2d').getImageData(0,0,1,1).data[3]===0,'Transparent background');
 const mount=document.getElementById('wizard'),wizard=PortraitWizard.mount(mount,sys,code),tab=name=>Array.from(mount.querySelectorAll('[role=tab]')).find(b=>b.textContent===name).click();
 check(mount.querySelectorAll('[role=tab]').length===5,'Five guided tabs');
 check(mount.querySelector('input[aria-label="Eyes color"]').closest('.wizard-part').querySelector('select').getAttribute('aria-label')==='Eyes','Eye colour beside eyes');
 tab('Hair');const select=mount.querySelector('select');select.value='0';select.dispatchEvent(new Event('change'));check(wizard.getAppearance().parts.hair===0,'Bald numeric choice');check(!mount.querySelector('input[type=color]'),'Bald hides hair colours');
 const undo=()=>Array.from(mount.querySelectorAll('button')).find(b=>b.textContent==='Undo').click();undo();check(wizard.getAppearance().parts.hair===code.parts.hair,'Undo restores hairstyle');
 tab('Details');check(Array.from(mount.querySelectorAll('select')).map(s=>s.getAttribute('aria-label')).join(',')==='Eyewear,Face covering,Augmentation','Neutral accessory categories');
 wizard.destroy();sys.render(code,{canvas:document.getElementById('preview'),size:256});document.getElementById('results').textContent=JSON.stringify(checks,null,2);document.body.dataset.result='passed';
})().catch(e=>{document.getElementById('results').textContent+='\nFAIL '+e.stack;document.body.dataset.result='failed';});
