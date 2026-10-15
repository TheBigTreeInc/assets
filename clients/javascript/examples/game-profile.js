"use strict";
(async()=>{
 const api=NumericPortraits;
 // Jobs belong to this example game; they are never part of portable appearance.
 const backgrounds={101:"#dbe9df",102:"#e7dbc5",103:"#cddceb"};
 const system=await api.System.load("../packs/portraits/pack.json",{
  catalogURL:"../catalogs/library-5.json",
  backgroundProvider:({context})=>backgrounds[context.jobId]||"#e7ecdf"
 });
 const character={id:1,name:"Alex",jobId:101,appearance:system.defaultAppearance()};
 function draw(){
  document.getElementById("avatar").src=system.toDataURL(character.appearance,{size:256,context:{jobId:character.jobId}});
  document.getElementById("name").textContent=character.name;
  document.getElementById("appearance").textContent=api.serialize(system.catalog,character.appearance);
 }
 for(const slot of ["face","eyes","nose","mouth","hair","clothing"]){
  document.getElementById("change-"+slot).onclick=()=>{
   const choices=system.choices(slot).map(o=>o.id);
   character.appearance.parts[slot]=choices[(choices.indexOf(character.appearance.parts[slot])+1)%choices.length];draw();
  };
 }
 document.getElementById("job").onchange=event=>{character.jobId=Number(event.target.value);draw();};
 document.getElementById("save").onclick=()=>{try{localStorage.setItem("portrait-library-v5-example",api.serialize(system.catalog,character.appearance));document.getElementById("status").textContent="Appearance saved.";}catch(e){document.getElementById("status").textContent=e.message;}};
 document.getElementById("load").onclick=()=>{try{character.appearance=api.deserialize(system.catalog,localStorage.getItem("portrait-library-v5-example"));draw();document.getElementById("status").textContent="Appearance loaded.";}catch(e){document.getElementById("status").textContent=e.message;}};
 draw();document.getElementById("status").textContent="Ready. Job changes only the backdrop; appearance stays the same.";
})().catch(e=>document.getElementById("status").textContent=e.message);
