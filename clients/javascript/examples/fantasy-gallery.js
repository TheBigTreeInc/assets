"use strict";
(async()=>{
 const api=NumericPortraits,system=await api.System.load('../packs/portraits/pack.json',{catalogURL:'../catalogs/library-4.json'});
 const presets=[['Long waves',1,5,0,0,'#704d31','#577256'],['Braided crown',2,6,0,1,'#c5a46e','#76634a'],['Tied back & beard',3,7,1,1,'#503b2d','#52627b'],['Silver wanderer',2,5,1,0,'#bcb7ad','#727345'],['Braided traveller',3,6,0,0,'#382b25','#775c63'],['Scarred adventurer',1,7,0,1,'#a36d45','#5b7468']];
 for(const [label,face,hair,facialHair,scars,hairColor,clothingColor] of presets){const code=system.defaultAppearance();Object.assign(code.parts,{face,hair,facialHair,scars,eyes:5,mouth:5,clothing:4});Object.assign(code.colors,{hair:api.rgb(hairColor),hairAccent:api.rgb('#b9a78b'),facialHair:api.rgb(hairColor),clothing:api.rgb(clothingColor)});const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');canvas.setAttribute('aria-label',label);system.render(code,{canvas,size:512,background:'#e7ecdf'});caption.textContent=label;figure.append(canvas,caption);document.getElementById('gallery').append(figure);}
 document.getElementById('status').textContent='Ready. All parts are in the same portrait library.';
})().catch(e=>document.getElementById('status').textContent=e.message);
