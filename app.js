const $=id=>document.getElementById(id);
const canvas=$("exportCanvas"),ctx=canvas.getContext("2d");

function lines(id){
  return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean);
}
function sourcePairs(nameId,linkId){
  const names=lines(nameId),links=lines(linkId);
  return names.map((name,i)=>({name,link:links[i]||""}));
}
function renderCard(){
  $("cardHeadline").textContent=$("headline").value.trim();
  $("cardLeftLabel").textContent=$("leftLabel").value.trim()||"LENS A";
  $("cardRightLabel").textContent=$("rightLabel").value.trim()||"LENS B";

  const left=lines("leftPoints").slice(0,3);
  const right=lines("rightPoints").slice(0,3);
  const rows=$("comparisonRows");
  rows.innerHTML="";

  for(let i=0;i<3;i++){
    const row=document.createElement("div");
    row.className="compare-row";

    const leftCell=document.createElement("div");
    leftCell.className="compare-cell left";
    leftCell.innerHTML=`<span class="compare-kicker blue">LENS A</span>${left[i]||""}`;

    const divider=document.createElement("div");
    divider.className="compare-divider";

    const rightCell=document.createElement("div");
    rightCell.className="compare-cell right";
    rightCell.innerHTML=`<span class="compare-kicker red">LENS B</span>${right[i]||""}`;

    row.append(leftCell,divider,rightCell);
    rows.append(row);
  }

  $("leftSourceFooter").textContent=sourcePairs("leftSourceNames","leftSourceLinks").map(s=>s.name).join(" • ");
  $("rightSourceFooter").textContent=sourcePairs("rightSourceNames","rightSourceLinks").map(s=>s.name).join(" • ");
}
function wrap(text,max,font){
  ctx.font=font;
  const words=String(text||"").trim().split(/\s+/).filter(Boolean);
  const out=[];let line="";
  words.forEach(word=>{
    const test=line?`${line} ${word}`:word;
    if(ctx.measureText(test).width>max&&line){out.push(line);line=word}else line=test;
  });
  if(line)out.push(line);
  return out;
}
function drawWrapped(text,x,y,max,lh,font,color,maxLines=99){
  ctx.font=font;ctx.fillStyle=color;
  const rows=wrap(text,max,font).slice(0,maxLines);
  rows.forEach((r,i)=>ctx.fillText(r,x,y+i*lh));
  return rows.length*lh;
}
function renderCanvas(){
  const W=1080,H=1350,margin=70,innerW=W-margin*2;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);

  let y=90;
  const headline=$("headline").value.trim();
  const h=drawWrapped(headline,margin,y,innerW,68,"900 64px Arial","#111",3);
  y+=h+45;

  const gap=48,col=(innerW-gap)/2,leftX=margin,rightX=margin+col+gap;
  ctx.font="900 28px Arial";
  ctx.fillStyle="#1769ff";ctx.fillText(($("leftLabel").value||"LENS A").toUpperCase(),leftX,y);
  ctx.fillStyle="#ff3b30";ctx.fillText(($("rightLabel").value||"LENS B").toUpperCase(),rightX,y);

  y+=18;
  ctx.fillStyle="#1769ff";ctx.fillRect(leftX,y,col,7);
  ctx.fillStyle="#ff3b30";ctx.fillRect(rightX,y,col,7);

  const left=lines("leftPoints").slice(0,3),right=lines("rightPoints").slice(0,3);
  const rowTop=y+45,rowH=250;

  for(let i=0;i<3;i++){
    const top=rowTop+i*rowH;
    if(i>0){ctx.fillStyle="#ddd";ctx.fillRect(margin,top-20,innerW,2);}
    ctx.fillStyle="#111";ctx.fillRect(margin+col+gap/2-1,top-5,2,rowH-35);

    ctx.font="900 18px Arial";ctx.fillStyle="#1769ff";ctx.fillText("LENS A",leftX,top+15);
    drawWrapped(left[i]||"",leftX,top+65,col-20,44,"800 38px Arial","#111",3);

    ctx.font="900 18px Arial";ctx.fillStyle="#ff3b30";ctx.fillText("LENS B",rightX,top+15);
    drawWrapped(right[i]||"",rightX,top+65,col-20,44,"800 38px Arial","#111",3);
  }

  const footerY=1215;
  ctx.fillStyle="#111";ctx.fillRect(margin,footerY,innerW,3);
  ctx.font="900 15px Arial";ctx.fillStyle="#666";
  ctx.fillText("LENS A SOURCES",leftX,footerY+38);
  ctx.fillText("LENS B SOURCES",rightX,footerY+38);

  ctx.font="700 18px Arial";ctx.fillStyle="#111";
  drawWrapped(sourcePairs("leftSourceNames","leftSourceLinks").map(s=>s.name).join(" • "),leftX,footerY+70,col-10,24,"700 18px Arial","#111",2);
  drawWrapped(sourcePairs("rightSourceNames","rightSourceLinks").map(s=>s.name).join(" • "),rightX,footerY+70,col-10,24,"700 18px Arial","#111",2);
}
function populateDialog(){
  $("dialogLeftTitle").textContent=$("leftLabel").value||"Lens A";
  $("dialogRightTitle").textContent=$("rightLabel").value||"Lens B";

  [["dialogLeftLinks","leftSourceNames","leftSourceLinks"],["dialogRightLinks","rightSourceNames","rightSourceLinks"]].forEach(([wrapId,nameId,linkId])=>{
    const wrap=$(wrapId);wrap.innerHTML="";
    sourcePairs(nameId,linkId).forEach(source=>{
      const a=document.createElement("a");
      a.textContent=source.name;
      a.href=source.link||"#";
      a.target="_blank";
      a.rel="noopener noreferrer";
      wrap.append(a);
    });
  });
}
["headline","leftLabel","rightLabel","leftPoints","rightPoints","leftSourceNames","rightSourceNames","leftSourceLinks","rightSourceLinks"]
  .forEach(id=>$(id).addEventListener("input",renderCard));

$("openSourcesBtn").addEventListener("click",()=>{
  populateDialog();
  $("sourceDialog").showModal();
});
$("closeDialogBtn").addEventListener("click",()=>$("sourceDialog").close());
$("exportBtn").addEventListener("click",()=>{
  renderCanvas();
  const a=document.createElement("a");
  a.download="duallens-perspective-card.png";
  a.href=canvas.toDataURL("image/png");
  a.click();
  $("message").textContent="PNG sent to your Downloads folder.";
});

renderCard();
