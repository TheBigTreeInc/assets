const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../src/portraits.js'),core=require('../src/portrait-kit.js');
const root=path.resolve(__dirname,'../../..'),index=JSON.parse(fs.readFileSync(path.join(root,'portraits/index.json'),'utf8'));
const items=Object.fromEntries(index.categories.flatMap(c=>c.items.map(p=>[p,JSON.parse(fs.readFileSync(path.join(root,'portraits',p),'utf8'))])));
const registry=api.compile(index,items),system=new api.System(null,registry),base=system.defaultAppearance();

test('Headwear and neckwear are independent and old codes retain their exact value',()=>{
 const previous=structuredClone(index);
 previous.categories=previous.categories.filter(c=>!['headwear','neckwear'].includes(c.key));
 previous.colors=previous.colors.filter(c=>!['headwear','neckwear'].includes(c.key));
 previous.layers=previous.layers.filter(l=>!['headwear','neckwear'].includes(l.slot));
 const oldRegistry=api.compile(previous,items),oldSystem=new api.System(null,oldRegistry);
 const oldCode=api.encode(oldRegistry,oldSystem.defaultAppearance()),restored=api.decode(registry,oldCode);
 assert.equal(restored.parts.headwear,0);assert.equal(restored.parts.neckwear,0);
 assert.equal(api.encode(registry,restored),oldCode);
 const chosen=structuredClone(restored);chosen.parts.hair=8;chosen.parts.headwear=1;chosen.parts.neckwear=1;
 chosen.colors.headwear=0xff99bb;chosen.colors.neckwear=0x123456;
 assert.deepEqual(api.decode(registry,api.encode(registry,chosen)),chosen);
 assert.equal(chosen.parts.clothing,restored.parts.clothing);
 assert.throws(()=>api.decode(oldRegistry,api.encode(registry,chosen)),/Unknown/);
});
test('Canonical registry compiles directly to renderer without a second catalog',()=>{assert.equal(core.validatePack(registry.pack).length,new Set(Object.values(items).map(i=>i.render.image)).size);assert.equal(Object.values(items).length,index.categories.reduce((n,c)=>n+c.items.length,0));});
test('One decimal value restores every permanent ID and RGB colour',()=>{const value=structuredClone(base);Object.assign(value.parts,{head:10,eyes:7,nose:6,mouth:7,hair:5,scars:1,facialHair:1});value.colors.iris=0x123456;const code=api.encode(registry,value);assert.match(code,/^[1-9][0-9]+$/);assert.deepEqual(api.decode(registry,code),value);assert.deepEqual(api.decode(registry,BigInt(code)),value);assert.throws(()=>api.decode(registry,Number(code)));});
test('All 4480 facial combinations have distinct codes and roundtrip',()=>{const codes=new Set();for(let head=1;head<=10;head++)for(let eyes=1;eyes<=8;eyes++)for(let nose=1;nose<=7;nose++)for(let mouth=1;mouth<=8;mouth++){const v=structuredClone(base);Object.assign(v.parts,{head,eyes,nose,mouth});const c=api.encode(registry,v);assert.deepEqual(api.decode(registry,c),v);codes.add(c);}assert.equal(codes.size,4480);});
test('Labels, tags, filters, ordering and new items do not change old codes',()=>{const i=structuredClone(index),m=structuredClone(items),p=i.categories[0].items[0];m[p].name='New label';m[p].order=500;m[p].tags=['other'];i.categories.reverse();i.colors.reverse();for(const c of i.categories)c.items.reverse();const extra='items/head/00000019.json';m[extra]={...structuredClone(m[p]),id:19};i.categories.find(c=>c.key==='head').items.push(extra);const r=api.compile(i,m);assert.deepEqual(api.decode(r,api.encode(registry,base)),base);assert.equal(api.encode(r,base),api.encode(registry,base));const v=structuredClone(base);v.parts.head=19;assert.equal(api.decode(r,api.encode(r,v)).parts.head,19);});
test('Additional optional categories do not change existing codes',()=>{const i=structuredClone(index);i.categories.push({id:Math.max(...i.categories.map(c=>c.id))+1,key:'tattoos',label:'Tattoos',nullable:true,default:0,items:[]});const r=api.compile(i,items),code=api.encode(registry,base);assert.equal(api.decode(r,code).parts.tattoos,0);assert.equal(api.encode(r,api.decode(r,code)),code);});
test('Unknown IDs fail instead of changing the portrait silently',()=>{const v=structuredClone(base);v.parts.head=19;assert.throws(()=>api.encode(registry,v),/Unknown head/);v.parts.head=1;v.parts.unknown=1;assert.throws(()=>api.encode(registry,v),/Unknown category/);});
test('Retired IDs can render and decode but leave the picker',()=>{const m=structuredClone(items);m['items/head/00000001.json'].retired=true;const r=api.compile(index,m),s=new api.System(null,r);assert.equal(api.decode(r,api.encode(registry,base)).parts.head,base.parts.head);assert(!s.choices('head').some(c=>c.id===1));});
test('Malformed, truncated, reordered and trailing codes fail',()=>{const bytes=Buffer.from(BigInt(api.encode(registry,base)).toString(16),'hex'),asCode=b=>BigInt('0x'+b.toString('hex')).toString();for(const c of ['0','01','-1','1.2','1e100','x',null,123])assert.throws(()=>api.decode(registry,c));assert.throws(()=>api.decode(registry,asCode(bytes.subarray(0,-1))));assert.throws(()=>api.decode(registry,asCode(Buffer.concat([bytes,Buffer.from([0])]))));const bad=Buffer.from(bytes);bad[0]=2;assert.throws(()=>api.decode(registry,asCode(bad)));bad[0]=1;bad[3]=0;assert.throws(()=>api.decode(registry,asCode(bad)));});
test('None is zero, colours are exact 24-bit integers, IDs are not dropdown positions',()=>{const v=structuredClone(base);for(const c of index.categories)if(c.nullable)v.parts[c.key]=0;for(const c of index.colors)v.colors[c.key]=c.id%2?0:0xffffff;assert.deepEqual(api.decode(registry,api.encode(registry,v)),v);assert.equal(api.rgb('#123456'),0x123456);assert.equal(api.hex(0x000001),'#000001');assert.throws(()=>api.hex(0x1000000));assert.throws(()=>api.rgb('red'));});
test('Optional default colours have a canonical omitted representation',()=>{const i=structuredClone(index);i.colors.push({id:Math.max(...i.colors.map(c=>c.id))+1,key:'tattoo',label:'Tattoo',required:false,default:'#000000'});const r=api.compile(i,items),code=api.encode(registry,base);assert.equal(api.decode(r,code).colors.tattoo,0);assert.equal(api.encode(r,api.decode(r,code)),code);});

test('Four added clothing IDs are selectable and roundtrip without changing legacy codes',()=>{
 const clothing=index.categories.find(c=>c.key==='clothing');
 const before=clothing.items.slice(0,11);
 assert.deepEqual(before,Array.from({length:11},(_,i)=>`items/clothing/${String(i+1).padStart(8,'0')}.json`));
 const names=['Ranger leather jerkin','Tailored waistcoat','Scholar-mage mantle','Futuristic utility jacket'];
 for(let id=12;id<=15;id++){
  const p=`items/clothing/${String(id).padStart(8,'0')}.json`;
  assert(clothing.items.includes(p));assert.equal(items[p].id,id);assert.equal(items[p].name,names[id-12]);
  assert.equal(items[p].render.profile,'pixel');assert.equal(items[p].category,'clothing');
  const appearance=structuredClone(base);appearance.parts.clothing=id;appearance.colors.clothing=0x4268ac;
  const code=api.encode(registry,appearance);assert.deepEqual(api.decode(registry,code),appearance);
  assert.equal(system.choices('clothing').find(c=>c.id===id).label,names[id-12]);
 }
});
