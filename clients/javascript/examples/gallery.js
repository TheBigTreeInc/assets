'use strict';
const gallery=document.getElementById('gallery'),portraits=[];
async function run(){
 for(const id of ['everyday-illustrated','dominion-pixel']){
  const renderer=await ModularPortraits.Renderer.load('../packs/'+id+'/pack.json');
  const section=document.createElement('section');section.className='gallery-section';const heading=document.createElement('h2');heading.textContent=renderer.pack.label;section.append(heading);const grid=document.createElement('div');grid.className='gallery';section.append(grid);gallery.append(section);
  for(let i=0;i<renderer.pack.slots.face.options.length;i++)for(let j=0;j<2;j++){
   const identity=ModularPortraits.normalizeIdentity(renderer.pack);identity.choices.face=renderer.pack.slots.face.options[i].id;identity.choices.hair=j?renderer.pack.slots.hair.options[2].id:'swept';identity.choices.glasses=j?'glasses':'none';
   if(id==='dominion-pixel'&&j){identity.choices.mask='mask';identity.choices.implant='implant';}
   if(id==='everyday-illustrated'&&j)identity.choices.outfit='collar';
   identity.colors.skin=['#c78e68','#98634b','#e7c8aa','#b17a59'][i];identity.colors.hair=['#67442f','#25262b','#aeb2b5','#4f6173'][i];identity.colors.hairAccent=['#a67d57','#61514b','#d1d6d9','#9c7bba'][i];
   const canvas=renderer.render(identity,{size:256});const figure=document.createElement('figure'),caption=document.createElement('figcaption');caption.textContent=renderer.pack.slots.face.options[i].label+(j?' · accessories':' · natural');figure.append(canvas,caption);grid.append(figure);portraits.push({canvas,label:renderer.pack.label+' / '+caption.textContent});
  }
 }
 document.getElementById('status').textContent='Two art packs loaded · '+portraits.length+' assembled examples.';
}
document.getElementById('download-gallery').addEventListener('click',()=>{
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.ceil(portraits.length/4)*290;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f5ef';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='11px Segoe UI';ctx.fillStyle='#233c34';portraits.forEach((p,i)=>{const x=i%4*256,y=Math.floor(i/4)*290;ctx.drawImage(p.canvas,x,y);ctx.fillText(p.label,x+8,y+274,240);});const link=document.createElement('a');link.download='portrait-art-packs.png';link.href=canvas.toDataURL('image/png');link.click();
});
run().catch(e=>document.getElementById('status').textContent=e.message);
