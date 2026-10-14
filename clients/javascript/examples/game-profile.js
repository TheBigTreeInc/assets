'use strict';
// No framework or game-specific integration is required.
(async()=>{
 const kit=ModularPortraits;
 const renderer=await kit.Renderer.load('../packs/all-options/pack.json');
 const character={id:'example-character',name:'Alex',appearance:kit.normalizeIdentity(renderer.pack)};
 character.appearance.choices.face='everyday-face-2';
 character.appearance.choices.hair='everyday-curly';
 character.appearance.choices.outfit='everyday-collar';
 character.appearance.choices.glasses='everyday-glasses';
 function draw(){
  document.getElementById('avatar').src=renderer.toDataURL(character.appearance,{size:256});
  document.getElementById('avatar').alt=character.name+' portrait';
  document.getElementById('name').textContent=character.name;
  document.getElementById('appearance').textContent=JSON.stringify(character.appearance,null,2);
 }
 for(const slot of ['face','eyes','nose','mouth','hair','outfit'])document.getElementById('change-'+slot).onclick=()=>{const choices=renderer.pack.slots[slot].options.map(o=>o.id);character.appearance.choices[slot]=choices[(choices.indexOf(character.appearance.choices[slot])+1)%choices.length];draw();};
 document.getElementById('save').onclick=()=>{try{localStorage.setItem('portrait-kit-example:all-options',kit.serialize(renderer.pack,character.appearance));document.getElementById('status').textContent='Appearance saved.';}catch(e){document.getElementById('status').textContent=e.message;}};
 document.getElementById('load').onclick=()=>{try{const text=localStorage.getItem('portrait-kit-example:all-options');if(!text)throw Error('Save an appearance first.');character.appearance=kit.deserialize(renderer.pack,text);draw();document.getElementById('status').textContent='Appearance loaded.';}catch(e){document.getElementById('status').textContent=e.message;}};
 draw();document.getElementById('status').textContent='Ready. Change facial features, hair or clothing to update the picture.';
})().catch(e=>document.getElementById('status').textContent=e.message);
