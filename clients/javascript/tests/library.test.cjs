const {test}=require('node:test');const assert=require('node:assert/strict');
const library=require('../src/asset-library.js');
const bytes=s=>new TextEncoder().encode(s);
async function fixture(){
 const file=bytes('{"schema":"test"}');const release={schema:'game-assets.release/v1',id:'test-pack',version:'1.0.1',files:{'pack.json':{size:file.length,sha256:await library.hash(file)}}};
 const data=bytes(JSON.stringify(release)),pin={id:release.id,version:release.version,sha256:await library.hash(data)};
 const entries=new Map(),cacheStorage={open:async()=>({match:async url=>entries.has(url)?new Response(entries.get(url)):undefined,put:async(url,res)=>entries.set(url,new Uint8Array(await res.arrayBuffer()))})};
 let requests=0;const fetch=async url=>{requests++;return new Response(url.endsWith('release.json')?data:file)};
 return {pin,fetch,cacheStorage,entries,requests:()=>requests};
}
test('downloads verified files; complete cache works offline',async()=>{const f=await fixture();const first=await library.downloadPack('https://assets.example/',f.pin,f);assert.equal(first.files.size,1);assert.equal(f.requests(),2);const second=await library.downloadPack('https://assets.example/',f.pin,{...f,fetch:async()=>{throw Error('offline')}});assert.deepEqual(second.files.get('pack.json'),first.files.get('pack.json'));});
test('corrupt cache is not accepted offline',async()=>{const f=await fixture();await library.downloadPack('https://assets.example/',f.pin,f);const key=[...f.entries.keys()].find(x=>x.endsWith('pack.json'));f.entries.set(key,bytes('broken'));await assert.rejects(library.downloadPack('https://assets.example/',f.pin,{...f,fetch:async()=>{throw Error('offline')}}));});
test('bad hash fails and renderer uses bundled fallback',async()=>{const f=await fixture();let fallback=false;const result=await library.loadRenderer('https://assets.example/',{...f.pin,sha256:'0'.repeat(64)},{...f,fallbackURL:'bundled.json',portraitAPI:{Renderer:{load:async url=>{assert.equal(url,'bundled.json');fallback=true;return {}}}}});assert.equal(result.assetSource,'bundled');assert.ok(fallback);});
test('rejects traversal, unsafe hosts and missing trusted pin',async()=>{for(const value of ['../x.png','a/../x.png','/x.png','a\\x.png','x.png?token','a//x.png','a/%2e.png'])assert.equal(library.safePath(value),false,value);const f=await fixture();await assert.rejects(library.downloadPack('http://remote.example/',f.pin,f));await assert.rejects(library.downloadPack('https://assets.example/',{...f.pin,sha256:''},f));});
test('version and identity must match the pinned release',async()=>{const f=await fixture();await assert.rejects(library.downloadPack('https://assets.example/',{...f.pin,version:'2.0.0'},f),/Unexpected asset release/);});
