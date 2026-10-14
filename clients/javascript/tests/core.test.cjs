const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const kit=require('../src/portrait-kit.js'),bridge=require('../integrations/dominion-bridge.js');
const root=path.resolve(__dirname,'..');
const packs=['everyday-illustrated','dominion-pixel'].map(id=>JSON.parse(fs.readFileSync(path.join(root,'packs',id,'pack.json'))));
test('both manifests validate and every referenced component exists',()=>{for(const pack of packs){const files=kit.validatePack(pack);for(const file of files)assert.ok(fs.existsSync(path.join(root,'packs',pack.id,file)));}});
test('appearance round trip preserves choices/colors and strips game authority',()=>{for(const pack of packs){const value=kit.randomIdentity(pack,()=>.7);value.name='Private name';value.stats={money:999};value.inventory=['weapon'];const loaded=kit.deserialize(pack,kit.serialize(pack,value));assert.deepEqual(loaded.choices,value.choices);assert.deepEqual(loaded.colors,value.colors);assert.equal(loaded.name,undefined);assert.equal(loaded.stats,undefined);assert.equal(loaded.inventory,undefined);}});
test('unknown packs, versions, component IDs and colors reject visibly',()=>{const pack=packs[0],value=kit.normalizeIdentity(pack);for(const bad of [{...value,pack:'unknown'},{...value,schema:'v999'},{...value,revision:999},{...value,choices:{...value.choices,face:'../../face.png'}},{...value,colors:{...value.colors,skin:'url(secret)'}}])assert.throws(()=>kit.serialize(pack,bad));assert.throws(()=>kit.deserialize(pack,'x'.repeat(16385)));});
test('pack paths cannot escape the pack directory or choose remote assets',()=>{for(const asset of ['../secret.png','https://example.com/head.png','/head.png']){const pack=structuredClone(packs[0]);pack.slots.face.options[0].asset=asset;assert.throws(()=>kit.validatePack(pack));}});
test('malformed choice containers and zero revisions fail visibly',()=>{for(const value of [{choices:[]},{colors:'red'},{revision:0},{schema:''}])assert.throws(()=>kit.normalizeIdentity(packs[0],value));});
test('colors recolor grayscale while retaining alpha and authored chroma',()=>{const data=new Uint8ClampedArray([128,128,128,255,0,255,255,255,255,255,255,0]);kit.recolor(data,'#ff0000','#ff0000',{preserveChroma:true});assert.ok(data[0]>data[1]);assert.deepEqual([...data.slice(4,8)],[0,255,255,255]);assert.equal(data[11],0);});
test('DOMINION selection and its palette IDs round trip through JavaScript',()=>{const pack=packs[1];const appearance={style_family:'dominion-modular-foundation-v1',portrait_archetype:'modular_head_04',hair:'modular_crop',torso:'modular_jacket',goggle_package:'modular_goggles',lower_face_package:'modular_respirator',detail_package:'modular_implant',skin_color_id:5,hair_primary_color_id:14,hair_accent_color_id:16,outfit_primary_color_id:3,outfit_accent_color_id:2};const web=bridge.fromDominion(pack,{format:'dominion-appearance-v1',appearance});const restored=bridge.toDominionPreset(pack,web);for(const [key,value] of Object.entries(appearance))assert.equal(restored.appearance[key],value);assert.equal(restored.appearance.nose_package,'nose_original');assert.equal(restored.format,'dominion-appearance-v1');assert.throws(()=>bridge.toDominionPreset(packs[0],{}));web.colors.skin='#010203';assert.throws(()=>bridge.toDominionPreset(pack,web));});
test('96 cyberpunk and 36 everyday component combinations are expressible',()=>{assert.deepEqual(packs.map(p=>Object.entries(p.slots).filter(([key])=>!['eyes','nose','mouth'].includes(key)).reduce((n,[key,s])=>n*s.options.length,1)),[36,96]);});

test('everyday appearance converts to Godot without crossing style families',()=>{
 const pack=JSON.parse(fs.readFileSync(path.join(root,'packs/everyday-illustrated/pack.json'),'utf8'));
 const bridge=require('../integrations/dominion-bridge.js');
 const appearance=kit.normalizeIdentity(pack);appearance.choices.hair='curly';appearance.choices.outfit='collar';appearance.choices.glasses='glasses';
 // Palette export deliberately uses only supported swatches.
 for(const key of Object.keys(appearance.colors))appearance.colors[key]=pack.colors[key].swatches[3].toLowerCase();
 const preset=bridge.toDominionPreset(pack,appearance);
 assert.equal(preset.appearance.style_family,'everyday-illustrated-v1');assert.equal(preset.appearance.torso,'everyday_collar');
 assert.deepEqual(bridge.fromDominion(pack,preset),appearance);
});
