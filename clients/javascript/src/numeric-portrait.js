(function(root,factory){const api=factory(root.ModularPortraits||(typeof require==='function'?require('./portrait-kit.js'):null));if(typeof module==='object'&&module.exports)module.exports=api;root.NumericPortraits=api;})(globalThis,function(core){
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v)),object=v=>v&&typeof v==='object'&&!Array.isArray(v),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const integer=(n,max=2147483647)=>Number.isInteger(n)&&n>=0&&n<=max;
 function exact(value,keys,label){if(!object(value)||Object.keys(value).length!==keys.length||keys.some(k=>!own(value,k)))throw Error('Invalid '+label+' fields.');}
 function hex(n){if(!integer(n,0xffffff))throw Error('RGB must be an integer from 0 to 16777215.');return '#'+n.toString(16).padStart(6,'0');}
 function rgb(value){if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error('Expected six-digit hex colour.');return parseInt(value.slice(1),16);}
 function catalogValid(catalog){if(!object(catalog)||catalog.schema!=='modular-portraits.numeric-catalog/v1'||!integer(catalog.catalogId)||catalog.catalogId<1||catalog.format!==1||!object(catalog.packs))throw Error('Unsupported numeric catalog.');for(const [number,pack] of Object.entries(catalog.packs)){if(!/^[1-9][0-9]*$/.test(number)||!integer(Number(number))||!object(pack.slots)||!Array.isArray(pack.colors))throw Error('Invalid numeric collection.');for(const mapping of Object.values(pack.slots)){if(!object(mapping)||!Object.keys(mapping).length)throw Error('Empty component mapping.');const ids=Object.values(mapping);if(ids.some(n=>!integer(n))||new Set(ids).size!==ids.length)throw Error('Ambiguous component IDs.');}}return catalog;}
 function entry(catalog,id){catalogValid(catalog);if(!integer(id)||!own(catalog.packs,String(id)))throw Error('Unknown numeric collection.');return catalog.packs[String(id)];}
 function packId(catalog,pack){catalogValid(catalog);const found=Object.entries(catalog.packs).find(([,p])=>p.id===pack.id&&p.revision===pack.revision&&p.assetVersion===pack.assetVersion);if(!found)throw Error('Pack does not match the pinned numeric catalog.');return Number(found[0]);}
 function encode(catalog,pack,value){const number=packId(catalog,pack),table=entry(catalog,number),appearance=core.normalizeIdentity(pack,value,{strict:true});const parts={},colors={};for(const [slot,id] of Object.entries(appearance.choices)){if(!own(table.slots[slot]||{},id))throw Error('Component has no stable numeric ID.');parts[slot]=table.slots[slot][id];}for(const key of table.colors)colors[key]=rgb(appearance.colors[key]);return {format:1,catalog:catalog.catalogId,pack:number,parts,colors};}
 function validate(catalog,value){exact(value,['format','catalog','pack','parts','colors'],'numeric appearance');if(value.format!==1||value.catalog!==catalog.catalogId||!integer(value.catalog))throw Error('Unsupported numeric format or catalog.');const table=entry(catalog,value.pack);exact(value.parts,Object.keys(table.slots),'component');exact(value.colors,table.colors,'colour');for(const [slot,id] of Object.entries(value.parts))if(!integer(id)||!Object.values(table.slots[slot]).includes(id))throw Error('Unknown numeric '+slot+' component.');for(const color of Object.values(value.colors))hex(color);return table;}
 function decode(catalog,pack,value){const table=validate(catalog,value);if(packId(catalog,pack)!==value.pack)throw Error('Appearance belongs to another collection.');const choices={},colors={};for(const [slot,id] of Object.entries(value.parts))choices[slot]=Object.entries(table.slots[slot]).find(([,n])=>n===id)[0];for(const [key,n] of Object.entries(value.colors))colors[key]=hex(n);return core.normalizeIdentity(pack,{choices,colors},{strict:true});}
 function serialize(catalog,code){validate(catalog,code);return JSON.stringify(code);}
 function deserialize(catalog,text){if(typeof text!=='string'||text.length>16384)throw Error('Appearance is invalid or too large.');const code=JSON.parse(text);validate(catalog,code);return clone(code);}
 async function loadCatalog(url){const response=await fetch(url);if(!response.ok)throw Error('Could not load numeric catalog.');return catalogValid(await response.json());}
 class System{
  constructor(renderer,catalog,{backgroundProvider=null}={}){this.renderer=renderer;this.pack=renderer.pack;this.catalog=clone(catalogValid(catalog));this.packNumber=packId(catalog,this.pack);this.backgroundProvider=backgroundProvider;const table=entry(catalog,this.packNumber);for(const [slot,data] of Object.entries(this.pack.slots))if(!table.slots[slot]||data.options.some(o=>!own(table.slots[slot],o.id)))throw Error('Incomplete numeric mapping.');}
  static async load(manifestURL,{catalogURL,catalog,backgroundProvider=null}={}){const [renderer,loaded]=await Promise.all([core.Renderer.load(manifestURL),catalog?Promise.resolve(catalog):loadCatalog(catalogURL)]);return new System(renderer,loaded,{backgroundProvider});}
  defaultAppearance(){return encode(this.catalog,this.pack,core.normalizeIdentity(this.pack));}
  normalize(code){return encode(this.catalog,this.pack,decode(this.catalog,this.pack,code));}
  fromLegacy(value){return encode(this.catalog,this.pack,value);}
  toLegacy(code){return decode(this.catalog,this.pack,code);}
  choices(slot){const mapping=entry(this.catalog,this.packNumber).slots[slot];if(!mapping)throw Error('Unknown component slot.');return this.pack.slots[slot].options.map(o=>({id:mapping[o.id],label:o.label,hasAsset:!!o.asset}));}
  randomAppearance(rng=Math.random){return encode(this.catalog,this.pack,core.randomIdentity(this.pack,rng));}
  render(code,{canvas=null,size=256,context={},background}={}){
   const identity=this.toLegacy(code);const chosen=background!==undefined?background:this.backgroundProvider?this.backgroundProvider({context,appearance:clone(code)}):this.pack.background??null;
   if(chosen&&typeof chosen.then==='function')throw Error('Background provider must return a preloaded image, colour or null synchronously.');
   if(chosen===null||typeof chosen==='string')return this.renderer.render(identity,{size,canvas,background:chosen});
   const portrait=this.renderer.render(identity,{size,background:null}),target=canvas||this.renderer.canvas(size);target.width=size;target.height=size;const ctx=target.getContext('2d');ctx.clearRect(0,0,size,size);
   if(typeof chosen==='string'){rgb(chosen);ctx.fillStyle=chosen;ctx.fillRect(0,0,size,size);}
   else if(chosen){const image=chosen.image||chosen,width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Background must be a loaded image or six-digit hex colour.');const scale=Math.max(size/width,size/height);ctx.drawImage(image,(size-width*scale)/2,(size-height*scale)/2,width*scale,height*scale);}
   ctx.drawImage(portrait,0,0);return target;
  }
  toDataURL(code,options){return this.render(code,options).toDataURL('image/png');}
 }
 return {rgb,hex,catalogValid,packId,entry,encode,decode,validate,serialize,deserialize,loadCatalog,System};
});
