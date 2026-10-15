(function(root,factory){const api=factory(root.ModularPortraits||(typeof require==='function'?require('./portrait-kit.js'):null));if(typeof module==='object'&&module.exports)module.exports=api;root.NumericPortraits=api;})(globalThis,function(core){
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v)),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const integer=(n,max=2147483647)=>Number.isInteger(n)&&n>=0&&n<=max;
 function exact(value,keys,label){if(!object(value)||Object.keys(value).length!==keys.length||keys.some(k=>!own(value,k)))throw Error('Invalid '+label+' fields.');}
 function hex(n){if(!integer(n,0xffffff))throw Error('RGB must be an integer from 0 to 16777215.');return '#'+n.toString(16).padStart(6,'0');}
 function rgb(value){if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error('Expected six-digit hex colour.');return parseInt(value.slice(1),16);}
 function catalogValid(c){if(!object(c)||c.schema!=='portrait-library.catalog/v2'||(!integer(c.library)||c.library<1)||!object(c.parts)||!object(c.categories)||!Array.isArray(c.colors))throw Error('Unsupported portrait library.');for(const [key,map] of Object.entries(c.parts)){if(!object(map)||!Object.keys(map).length||!own(c.categories,key))throw Error('Invalid category.');const values=Object.values(map);if(values.some(n=>!integer(n))||new Set(values).size!==values.length)throw Error('Ambiguous part IDs.');}return c;}
 function matches(c,pack){catalogValid(c);if(['id','revision','assetVersion'].some(k=>c.pack[k]!==pack[k]))throw Error('Pack does not match this library.');for(const [key,slot] of Object.entries(pack.slots))if(!c.parts[key]||slot.options.some(o=>!own(c.parts[key],o.id)))throw Error('Incomplete part catalog.');}
 function validate(c,code){catalogValid(c);exact(code,['format','library','parts','colors'],'appearance');if(code.format!==2||code.library!==c.library)throw Error('Unsupported appearance format or library.');exact(code.parts,Object.keys(c.parts),'parts');exact(code.colors,c.colors,'colours');for(const [key,n] of Object.entries(code.parts))if(!integer(n)||!Object.values(c.parts[key]).includes(n))throw Error('Unknown '+key+' part.');for(const n of Object.values(code.colors))hex(n);return code;}
 function encode(c,pack,selection){matches(c,pack);const value=core.normalizeIdentity(pack,selection,{strict:true}),parts={},colors={};for(const [key,id] of Object.entries(value.choices))parts[key]=c.parts[key][id];for(const key of c.colors)colors[key]=rgb(value.colors[key]);return validate(c,{format:2,library:c.library,parts,colors});}
 function decode(c,pack,code){matches(c,pack);validate(c,code);const choices={},colors={};for(const [key,n] of Object.entries(code.parts))choices[key]=Object.entries(c.parts[key]).find(([,id])=>id===n)[0];for(const [key,n] of Object.entries(code.colors))colors[key]=hex(n);return core.normalizeIdentity(pack,{choices,colors},{strict:true});}
 function serialize(c,code){validate(c,code);return JSON.stringify(code);}
 function deserialize(c,text){if(typeof text!=='string'||text.length>16384)throw Error('Invalid appearance file.');return clone(validate(c,JSON.parse(text)));}
 async function loadCatalog(url){const r=await fetch(url);if(!r.ok)throw Error('Could not load portrait catalog.');return catalogValid(await r.json());}
 class System{
  constructor(renderer,catalog,{backgroundProvider=null}={}){matches(catalog,renderer.pack);this.renderer=renderer;this.pack=renderer.pack;this.catalog=clone(catalog);this.backgroundProvider=backgroundProvider;}
  static async load(manifestURL,{catalogURL,catalog,backgroundProvider=null}={}){const [r,c]=await Promise.all([core.Renderer.load(manifestURL),catalog||loadCatalog(catalogURL)]);return new System(r,c,{backgroundProvider});}
  defaultAppearance(){return encode(this.catalog,this.pack,core.normalizeIdentity(this.pack));}
  normalize(code){return clone(validate(this.catalog,code));}
  choices(category,{tags=[],type}={}){if(!this.pack.slots[category])throw Error('Unknown category.');return this.pack.slots[category].options.filter(o=>(!type||o.type===type)&&tags.every(t=>o.tags.includes(t))).map(o=>({id:this.catalog.parts[category][o.id],label:o.label,type:o.type,tags:[...o.tags],hasAsset:!!o.asset}));}
  randomAppearance(rng=Math.random){return encode(this.catalog,this.pack,core.randomIdentity(this.pack,rng));}
  render(code,{canvas=null,size=256,context={},background}={}){
   const selection=decode(this.catalog,this.pack,code),chosen=background!==undefined?background:this.backgroundProvider?this.backgroundProvider({context,appearance:clone(code)}):this.pack.background??null;
   if(chosen===null||typeof chosen==='string')return this.renderer.render(selection,{size,canvas,background:chosen});
   if(chosen&&typeof chosen.then==='function')throw Error('Preload background images before rendering.');
   const portrait=this.renderer.render(selection,{size,background:null}),target=canvas||this.renderer.canvas(size);target.width=size;target.height=size;const ctx=target.getContext('2d'),image=chosen?.image||chosen,w=image?.naturalWidth||image?.width,h=image?.naturalHeight||image?.height;if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)throw Error('Background must be an image, colour or null.');const scale=Math.max(size/w,size/h);ctx.drawImage(image,(size-w*scale)/2,(size-h*scale)/2,w*scale,h*scale);ctx.drawImage(portrait,0,0);return target;
  }
  toDataURL(code,options){return this.render(code,options).toDataURL('image/png');}
 }
 return {rgb,hex,catalogValid,validate,encode,decode,serialize,deserialize,loadCatalog,System};
});
