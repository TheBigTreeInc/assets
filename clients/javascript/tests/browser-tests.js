'use strict';
const results=[],api=ModularPortraits;
function check(ok,message){results.push({passed:!!ok,message});if(!ok)throw Error(message);}
function hash(canvas){let result=2166136261;for(const x of canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data)result=Math.imul(result^x,16777619);return result>>>0;}
async function run(){
 let combinations=0;
 for(const id of ['everyday-illustrated','dominion-pixel']){
  const renderer=await api.Renderer.load('../packs/'+id+'/pack.json');
  const identity=api.normalizeIdentity(renderer.pack);
  let variants=[identity];
  for(const [key,slot] of Object.entries(renderer.pack.slots))variants=variants.flatMap(value=>slot.options.map(o=>({...value,choices:{...value.choices,[key]:o.id}})));
  for(const value of variants){const canvas=renderer.render(value,{size:64});check(canvas.width===64,'Rendered '+id+' combination '+(++combinations));}
  const first=hash(renderer.render(identity));const colored=structuredClone(identity);colored.colors.hair='#f02020';check(hash(renderer.render(colored))!==first,'Hair color changes rendered pixels: '+id);
  const other=structuredClone(identity);other.choices.face=renderer.pack.slots.face.options[1].id;check(hash(renderer.render(other))!==first,'Face choice changes rendered pixels: '+id);
  other.choices.glasses='glasses';check(hash(renderer.render(other))!==hash(renderer.render(other,{base:true})),'Accessory overlay is independent of base portrait: '+id);
  const blob=await renderer.toBlob(other,{size:128,background:null});check(blob.type==='image/png'&&blob.size>1000,'Actual PNG export: '+id);
  const url=URL.createObjectURL(blob),image=new Image();image.src=url;await image.decode();check(image.naturalWidth===128,'PNG export decodes at requested size: '+id);URL.revokeObjectURL(url);
  let changed=null;const editor=ModularPortraitEditor.mount(document.getElementById('editor'),renderer,identity,{onChange:value=>changed=value});
  const select=document.querySelector('#editor select');select.value=renderer.pack.slots.face.options[1].id;select.dispatchEvent(new Event('change',{bubbles:true}));check(changed.choices.face===select.value,'Editor changes appearance: '+id);editor.destroy();
  renderer.render(other,{canvas:document.getElementById('final'),size:256});
 }
 check(combinations===132,'All 132 component combinations rendered');
 const renderer=await api.Renderer.load('../packs/everyday-illustrated/pack.json');const identity=api.randomIdentity(renderer.pack,()=>.8);
 const key='portrait-kit-test-only';localStorage.setItem(key,api.serialize(renderer.pack,identity));check(JSON.stringify(api.deserialize(renderer.pack,localStorage.getItem(key)))===JSON.stringify(identity),'Browser storage appearance round trip');localStorage.removeItem(key);
 document.getElementById('results').textContent='PASS — '+results.length+' checks, '+combinations+' combinations.\n'+JSON.stringify(results,null,2);
 document.body.dataset.result='passed';
}
document.getElementById('download-results').addEventListener('click',()=>{const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify(results,null,2)],{type:'application/json'}));link.download='browser-checks.json';link.click();});
run().catch(error=>{document.getElementById('results').textContent='FAIL — '+error.stack+'\n'+JSON.stringify(results,null,2);document.body.dataset.result='failed';});
