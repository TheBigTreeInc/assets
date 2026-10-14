(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GameAssetLibrary=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const safePath=p=>typeof p==='string'&&!p.startsWith('/')&&!/[\\:%?#]/.test(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..')&&/\.(png|json)$/.test(p);
  const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  async function read(response,limit){
    if(!response.ok)throw Error('Asset download failed.');
    if(response.body?.getReader){
      const reader=response.body.getReader(),parts=[];let size=0;
      for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Asset too large.');}parts.push(value);}
      const result=new Uint8Array(size);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result;
    }
    const data=new Uint8Array(await response.arrayBuffer());if(data.length>limit)throw Error('Asset too large.');return data;
  }
  function validateRelease(release,{id,version}){
    if(!release||release.schema!=='game-assets.release/v1'||release.id!==id||release.version!==version||!release.files||typeof release.files!=='object'||Array.isArray(release.files))throw Error('Unexpected asset release.');
    const files=Object.entries(release.files);let total=0;
    if(!release.files['pack.json']||files.length>64)throw Error('Incomplete release.');
    for(const [path,row] of files){if(!safePath(path)||!row||!Number.isInteger(row.size)||row.size<0||row.size>16777216||!/^[a-f0-9]{64}$/.test(row.sha256))throw Error('Invalid asset index.');total+=row.size;}
    if(total>67108864)throw Error('Pack too large.');return release;
  }
  async function downloadPack(baseURL,pin,{fetch:fetcher=globalThis.fetch,cacheStorage=globalThis.caches}={}){
    if(!/^[a-z0-9-]+$/.test(pin.id)||!/^\d+\.\d+\.\d+$/.test(pin.version)||!/^[a-f0-9]{64}$/.test(pin.sha256))throw Error('A trusted version and release hash are required.');
    const base=new URL(baseURL,globalThis.location?.href);if(base.protocol!=='https:'&&!(base.protocol==='http:'&&['127.0.0.1','localhost'].includes(base.hostname)))throw Error('HTTPS asset host required.');
    const prefix=new URL(`releases/${pin.id}/${pin.version}/`,base.href.replace(/\/?$/,'/'));
    const cache=cacheStorage?await cacheStorage.open('game-assets-'+pin.sha256):null;
    async function verified(path,expected,size){
      const url=new URL(path,prefix).href;let cached=cache?await cache.match(url):null;
      if(cached){try{const bytes=await read(cached,size);if(await hash(bytes)===expected)return bytes;}catch(_){} }
      const bytes=await read(await fetcher(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)}),size);
      if(await hash(bytes)!==expected)throw Error('Asset checksum mismatch.');
      if(cache)await cache.put(url,new Response(bytes));return bytes;
    }
    const bytes=await verified('release.json',pin.sha256,262144);
    const release=validateRelease(JSON.parse(new TextDecoder().decode(bytes)),pin),files=new Map();
    for(const [path,row] of Object.entries(release.files)){const data=await verified(path,row.sha256,row.size);if(data.length!==row.size)throw Error('Asset length mismatch.');files.set(path,data);}
    return {release,files};
  }
  async function loadRenderer(baseURL,pin,{fallbackURL,portraitAPI=globalThis.ModularPortraits,...options}={}){
    let result;
    try{
      const {files}=await downloadPack(baseURL,pin,options),pack=JSON.parse(new TextDecoder().decode(files.get('pack.json')));
      const names=portraitAPI.validatePack(pack);result=new portraitAPI.Renderer(pack,baseURL);const urls=[];
      try{
        for(const name of names){if(!files.has(name))throw Error('Unindexed portrait component.');const url=URL.createObjectURL(new Blob([files.get(name)],{type:'image/png'}));urls.push(url);const image=new Image();image.src=url;await image.decode();if(image.naturalWidth!==pack.canvas[0]||image.naturalHeight!==pack.canvas[1])throw Error('Wrong portrait canvas.');result.images.set(name,image);}
        result.ready=true;result.assetSource='library';return result;
      }finally{for(const url of urls)URL.revokeObjectURL(url);}
    }catch(error){if(result)result.dispose();if(!fallbackURL)throw error;result=await portraitAPI.Renderer.load(fallbackURL);result.assetSource='bundled';result.libraryError=error.message;return result;}
  }
  return {safePath,hash,validateRelease,downloadPack,loadRenderer};
});
