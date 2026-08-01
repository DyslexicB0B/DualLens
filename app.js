const $=id=>document.getElementById(id);
const canvas=$("exportCanvas");
const ctx=canvas.getContext("2d");

const defaults={
  headlineFont:"Arial Black",
  bodyFont:"Arial",
  headlineSize:"64",
  category:"POLITICS",
  headline:"Trump Announces New Tariffs",
  leftLabel:"SUPPORTERS",
  rightLabel:"CRITICS",
  leftPoints:"Protects U.S. jobs\nBuilds domestic factories\nStrengthens national security",
  rightPoints:"Raises consumer prices\nHurts small businesses\nRisks trade retaliation",
  leftSourceNames:"Reuters\nWhite House\n@TradePolicy",
  rightSourceNames:"AP\nBrookings\n@EconomistJane",
  leftSourceLinks:"https://reuters.com/\nhttps://whitehouse.gov/\nhttps://x.com/TradePolicy",
  rightSourceLinks:"https://apnews.com/\nhttps://brookings.edu/\nhttps://x.com/EconomistJane",
  postCopy:"Same headline. Two completely different ways to see it.\n\nWhich lens makes the stronger case—and what are we missing?",
  draftName:"Untitled Card"
};

const fieldIds=Object.keys(defaults);

function lines(id){
  return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean);
}

function sourcePairs(namesId,linksId){
  const names=lines(namesId);
  const links=lines(linksId);
  return names.map((name,i)=>({name,link:links[i]||""}));
}

function createChips(targetId,pairs){
  const target=$(targetId);
  target.innerHTML="";
  pairs.forEach(source=>{
    const chip=document.createElement("span");
    chip.className="source-chip";
    chip.textContent=source.name;
    target.append(chip);
  });
}

function renderPreview(){
  const headlineFont=$("headlineFont").value;
  const bodyFont=$("bodyFont").value;
  const headlineSize=Number($("headlineSize").value);

  $("card").style.fontFamily=bodyFont;
  $("cardHeadline").style.fontFamily=headlineFont;
  $("cardHeadline").style.fontSize=`clamp(30px, ${headlineSize/16}vw, ${headlineSize}px)`;

  $("cardCategory").textContent=$("category").value.trim().toUpperCase();
  $("cardHeadline").textContent=$("headline").value.trim();
  $("cardLeftLabel").textContent=$("leftLabel").value.trim().toUpperCase()||"LENS A";
  $("cardRightLabel").textContent=$("rightLabel").value.trim().toUpperCase()||"LENS B";

  const left=lines("leftPoints").slice(0,3);
  const right=lines("rightPoints").slice(0,3);
  const rows=$("comparisonRows");
  rows.innerHTML="";

  for(let i=0;i<3;i++){
    const row=document.createElement("div");
    row.className="compare-row";

    const leftCell=document.createElement("div");
    leftCell.className="compare-cell";
    leftCell.textContent=left[i]||"";

    const divider=document.createElement("div");
    divider.className="compare-divider";

    const rightCell=document.createElement("div");
    rightCell.className="compare-cell";
    rightCell.textContent=right[i]||"";

    row.append(leftCell,divider,rightCell);
    rows.append(row);
  }

  createChips("leftSourceFooter",sourcePairs("leftSourceNames","leftSourceLinks"));
  createChips("rightSourceFooter",sourcePairs("rightSourceNames","rightSourceLinks"));
}

function wrapText(text,maxWidth,font){
  ctx.font=font;
  const words=String(text||"").trim().split(/\s+/).filter(Boolean);
  const rows=[];
  let line="";

  words.forEach(word=>{
    const test=line?`${line} ${word}`:word;
    if(ctx.measureText(test).width>maxWidth&&line){
      rows.push(line);
      line=word;
    }else{
      line=test;
    }
  });

  if(line)rows.push(line);
  return rows;
}

function drawWrapped(text,x,y,maxWidth,lineHeight,font,color,maxLines=99){
  ctx.font=font;
  ctx.fillStyle=color;
  const rows=wrapText(text,maxWidth,font).slice(0,maxLines);
  rows.forEach((row,i)=>ctx.fillText(row,x,y+i*lineHeight));
  return rows.length*lineHeight;
}

function renderCanvas(){
  const W=1080,H=1350,margin=70,innerW=W-margin*2;
  const headlineFont=$("headlineFont").value;
  const bodyFont=$("bodyFont").value;
  const headlineSize=Number($("headlineSize").value);

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,W,H);

  let y=75;
  ctx.font=`900 18px ${bodyFont}`;
  ctx.fillStyle="#6b7280";
  ctx.fillText($("category").value.trim().toUpperCase(),margin,y);

  y+=55;
  const headlineHeight=drawWrapped(
    $("headline").value.trim(),
    margin,
    y,
    innerW,
    headlineSize*1.08,
    `900 ${headlineSize}px ${headlineFont}`,
    "#111827",
    3
  );

  y+=headlineHeight+40;

  const gap=48;
  const col=(innerW-gap)/2;
  const leftX=margin;
  const rightX=margin+col+gap;

  ctx.font=`900 28px ${bodyFont}`;
  ctx.fillStyle="#1769ff";
  ctx.fillText(($("leftLabel").value||"LENS A").toUpperCase(),leftX,y);
  ctx.fillStyle="#ef4444";
  ctx.fillText(($("rightLabel").value||"LENS B").toUpperCase(),rightX,y);

  y+=18;
  ctx.fillStyle="#1769ff";
  ctx.fillRect(leftX,y,col,7);
  ctx.fillStyle="#ef4444";
  ctx.fillRect(rightX,y,col,7);

  const left=lines("leftPoints").slice(0,3);
  const right=lines("rightPoints").slice(0,3);
  const rowTop=y+48;
  const rowHeight=245;

  for(let i=0;i<3;i++){
    const top=rowTop+i*rowHeight;

    if(i>0){
      ctx.fillStyle="#e5e7eb";
      ctx.fillRect(margin,top-18,innerW,2);
    }

    ctx.fillStyle="#9ca3af";
    ctx.fillRect(margin+col+gap/2-1,top+8,1,rowHeight-62);

    drawWrapped(left[i]||"",leftX,top+58,col-20,46,`800 39px ${bodyFont}`,"#111827",3);
    drawWrapped(right[i]||"",rightX,top+58,col-20,46,`800 39px ${bodyFont}`,"#111827",3);
  }

  const footerY=1206;
  ctx.fillStyle="#111827";
  ctx.fillRect(margin,footerY,innerW,2);

  ctx.font=`900 14px ${bodyFont}`;
  ctx.fillStyle="#6b7280";
  ctx.fillText("LENS A SOURCES",leftX,footerY+38);
  ctx.fillText("LENS B SOURCES",rightX,footerY+38);

  drawWrapped(
    sourcePairs("leftSourceNames","leftSourceLinks").map(s=>s.name).join(" • "),
    leftX,
    footerY+72,
    col-10,
    25,
    `700 18px ${bodyFont}`,
    "#111827",
    2
  );

  drawWrapped(
    sourcePairs("rightSourceNames","rightSourceLinks").map(s=>s.name).join(" • "),
    rightX,
    footerY+72,
    col-10,
    25,
    `700 18px ${bodyFont}`,
    "#111827",
    2
  );
}

function populateSources(){
  $("dialogLeftTitle").textContent=$("leftLabel").value||"Lens A";
  $("dialogRightTitle").textContent=$("rightLabel").value||"Lens B";

  [
    ["dialogLeftLinks","leftSourceNames","leftSourceLinks"],
    ["dialogRightLinks","rightSourceNames","rightSourceLinks"]
  ].forEach(([wrapId,namesId,linksId])=>{
    const wrap=$(wrapId);
    wrap.innerHTML="";

    sourcePairs(namesId,linksId).forEach(source=>{
      const a=document.createElement("a");
      a.textContent=source.name;
      a.href=source.link||"#";
      a.target="_blank";
      a.rel="noopener noreferrer";
      wrap.append(a);
    });
  });
}

function values(){
  const data={};
  fieldIds.forEach(id=>data[id]=$(id).value);
  return data;
}

function apply(data){
  fieldIds.forEach(id=>{
    if(data[id]!==undefined)$(id).value=data[id];
  });
  renderPreview();
}

function renderDrafts(){
  const wrap=$("draftList");
  const drafts=JSON.parse(localStorage.getItem("duallensV9Drafts")||"[]");
  wrap.innerHTML="";

  if(!drafts.length){
    wrap.innerHTML="<span class='message'>No saved drafts yet.</span>";
    return;
  }

  drafts.forEach((draft,index)=>{
    const row=document.createElement("div");
    row.className="draft-item";

    const load=document.createElement("button");
    load.className="ghost draft-load";
    load.textContent=draft.draftName||"Untitled";
    load.addEventListener("click",()=>apply(draft));

    const del=document.createElement("button");
    del.className="ghost draft-delete";
    del.textContent="×";
    del.addEventListener("click",()=>{
      drafts.splice(index,1);
      localStorage.setItem("duallensV9Drafts",JSON.stringify(drafts));
      renderDrafts();
    });

    row.append(load,del);
    wrap.append(row);
  });
}

function saveDraft(){
  const drafts=JSON.parse(localStorage.getItem("duallensV9Drafts")||"[]");
  drafts.unshift({...values(),savedAt:new Date().toISOString()});
  localStorage.setItem("duallensV9Drafts",JSON.stringify(drafts.slice(0,25)));
  $("message").textContent="Draft saved on this device.";
  renderDrafts();
}

fieldIds
  .filter(id=>id!=="draftName")
  .forEach(id=>{
    $(id).addEventListener("input",renderPreview);
    $(id).addEventListener("change",renderPreview);
  });

$("saveBtn").addEventListener("click",saveDraft);

$("resetBtn").addEventListener("click",()=>{
  apply(defaults);
  $("message").textContent="Example restored.";
});

$("sourcesBtn").addEventListener("click",()=>{
  populateSources();
  $("sourcesDialog").showModal();
});

$("closeSourcesBtn").addEventListener("click",()=>$("sourcesDialog").close());

$("copyBtn").addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText($("postCopy").value);
  }catch{
    $("postCopy").select();
    document.execCommand("copy");
  }
  $("message").textContent="Post text copied.";
});

$("previewBtn").addEventListener("click",()=>{
  renderCanvas();
  $("phonePostCopy").textContent=$("postCopy").value;
  $("phoneImage").src=canvas.toDataURL("image/png");
  $("phoneModal").classList.remove("hidden");
});

$("closePhoneBtn").addEventListener("click",()=>$("phoneModal").classList.add("hidden"));

$("phoneModal").addEventListener("click",event=>{
  if(event.target===$("phoneModal"))$("phoneModal").classList.add("hidden");
});

$("exportBtn").addEventListener("click",()=>{
  renderCanvas();
  const link=document.createElement("a");
  link.download="duallens-perspective-card.png";
  link.href=canvas.toDataURL("image/png");
  link.click();
  $("message").textContent="PNG sent to your Downloads folder.";
});

renderDrafts();
renderPreview();
