'use strict';
// No framework or game-specific integration is required.
(async()=>{
 const kit=ModularPortraits;
 const renderer=await kit.Renderer.load('../packs/everyday-illustrated/pack.json');
 const character={id:'example-character',name:'Alex',appearance:kit.normalizeIdentity(renderer.pack)};
 character.appearance.choices.face='face-2';
 character.appearance.choices.hair='curly';
 character.appearance.choices.outfit='collar';
 character.appearance.choices.glasses='glasses';
 function draw(){
  document.getElementById('avatar').src=renderer.toDataURL(character.appearance,{size:256});
  document.getElementById('avatar').alt=character.name+' portrait';
  document.getElementById('name').textContent=character.name;
  document.getElementById('appearance').textContent=JSON.stringify(character.appearance,null,2);
 }
 document.getElementById('change-hair').onclick=()=>{const choices=renderer.pack.slots.hair.options.map(o=>o.id);character.appearance.choices.hair=choices[(choices.indexOf(character.appearance.choices.hair)+1)%choices.length];draw();};
 document.getElementById('change-face').onclick=()=>{const choices=renderer.pack.slots.face.options.map(o=>o.id);character.appearance.choices.face=choices[(choices.indexOf(character.appearance.choices.face)+1)%choices.length];draw();};
 document.getElementById('save').onclick=()=>{try{localStorage.setItem('portrait-kit-example',kit.serialize(renderer.pack,character.appearance));document.getElementById('status').textContent='Appearance saved.';}catch(e){document.getElementById('status').textContent=e.message;}};
 document.getElementById('load').onclick=()=>{try{const text=localStorage.getItem('portrait-kit-example');if(!text)throw Error('Save an appearance first.');character.appearance=kit.deserialize(renderer.pack,text);draw();document.getElementById('status').textContent='Appearance loaded.';}catch(e){document.getElementById('status').textContent=e.message;}};
 draw();document.getElementById('status').textContent='Ready. Change the face or hairstyle to update the picture.';
})().catch(e=>document.getElementById('status').textContent=e.message);
