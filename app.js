const $=id=>document.getElementById(id);
const canvas=$("exportCanvas"),ctx=canvas.getContext("2d");
let leftImageData="",rightImageData="";

function lines(id){return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean)}
function sourcePairs(namesId,linksId){
  const names=lines(namesId),links=lines(linksId);
  return names.map((name,i)=>({name,link:links[i]||""}));
}
function makePoint(text,side){
  const row=document.createElement("div");row.className="point";
  const dot=document.createElement("div");dot.className=`icon-dot ${side==="left"?"left-dot":"right-dot"}`;
  const span=document.createElement("span");span.textContent=text;
  row.append(dot,span);return row;
}
function makeChips(targetId,pairs,side){
  const target=$(targetId);target.innerHTML="";
  pairs.forEach(src=>{
    const chip=document.createElement("span");chip.className=`source-chip ${side}`;chip.textContent=src.name;target.append(chip);
  });
}
function applyMode(side){
  const pane=$(side+"Pane"),mode=$(side+"Mode").value,img=$(side+"ImagePreview"),text=$(side+"TextContent");
  pane.classList.toggle("mixed",mode==="mixed");
  text.classList.toggle("hidden",mode==="image");
  img.classList.toggle("hidden",mode==="text" || !img.src);
  img.style.objectFit=$(side+"Fit").value;
}
function render(){
  $("cardCategory").textContent=$("category").value.toUpperCase();
  $("cardHeadline").textContent=$("headline").value;
  $("cardLeftLabel").textContent=$("leftLabel").value.toUpperCase();
  $("cardRightLabel").textContent=$("rightLabel").value.toUpperCase();

  const left=$("leftTextContent"),right=$("rightTextContent");
  left.innerHTML="";right.innerHTML="";
  lines("leftPoints").slice(0,3).forEach(t=>left.append(makePoint(t,"left")));
  lines("rightPoints").slice(0,3).forEach(t=>right.append(makePoint(t,"right")));

  makeChips("leftSourceFooter",sourcePairs("leftSourceNames","leftSourceLinks"),"left");
  makeChips("rightSourceFooter",sourcePairs("rightSourceNames","rightSourceLinks"),"right");
  applyMode("left");applyMode("right");
  $("saveStatus").textContent="Saved";
}
function loadImage(input,side){
  const file=input.files?.[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    if(side==="left")leftImageData=reader.result;else rightImageData=reader.result;
    $(side+"ImagePreview").src=reader.result;
    if($(side+"Mode").value==="text")$(side+"Mode").value="image";
    render();
  };
  reader.readAsDataURL(file);
}
function removeImage(side){
  if(side==="left")leftImageData="";else rightImageData="";
  $(side+"ImagePreview").removeAttribute("src");
  $(side+"Mode").value="text";
  render();
}
function wrapText(text,max,font){
  ctx.font=font;const words=String(text||"").split(/\s+/).filter(Boolean),rows=[];let line="";
  words.forEach(w=>{const test=line?line+" "+w:w;if(ctx.measureText(test).width>max&&line){rows.push(line);line=w}else line=test});
  if(line)rows.push(line);return rows;
}
function drawWrapped(text,x,y,max,lh,font,color,maxLines=99,align="left"){
  ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;
  const rows=wrapText(text,max,font).slice(0,maxLines);rows.forEach((r,i)=>ctx.fillText(r,x,y+i*lh));
  ctx.textAlign="left";return rows.length*lh;
}
function drawImageFit(img,x,y,w,h,fit){
  if(!img.complete||!img.naturalWidth)return;
  const ir=img.naturalWidth/img.naturalHeight,br=w/h;
  let dw,dh,dx,dy;
  if((fit==="cover"&&ir>br)||(fit==="contain"&&ir<br)){dh=h;dw=h*ir}
  else{dw=w;dh=w/ir}
  dx=x+(w-dw)/2;dy=y+(h-dh)/2;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,dx,dy,dw,dh);ctx.restore();
}
function drawPointList(items,x,y,w,h,side){
  const rowH=h/3,color=side==="left"?"#1769ff":"#ef2f2f";
  items.slice(0,3).forEach((item,i)=>{
    const top=y+i*rowH;
    if(i>0){ctx.fillStyle="#e5e7eb";ctx.fillRect(x,top,w,2)}
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+28,top+rowH/2,22,0,Math.PI*2);ctx.fill();
    drawWrapped(item,x+65,top+rowH/2-16,w-70,36,"800 30px Arial","#111827",3);
  });
}
function renderCanvas(){
  const W=1080,H=1350,margin=62,inner=W-margin*2;
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  ctx.font="900 16px Arial";ctx.fillStyle="#697386";ctx.fillText($("category").value.toUpperCase(),margin,80);

  ctx.fillStyle="#d9dee6";ctx.fillRect(margin,112,360,2);ctx.fillRect(W-margin-360,112,360,2);
  ctx.fillStyle="#1769ff";ctx.beginPath();ctx.arc(W/2-10,112,16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ef2f2f";ctx.beginPath();ctx.arc(W/2+10,112,16,0,Math.PI*2);ctx.fill();

  drawWrapped($("headline").value,W/2,170,inner,66,"900 60px Arial","#111827",3,"center");

  const colGap=52,col=(inner-colGap)/2,leftX=margin,rightX=margin+col+colGap,headY=365;
  ctx.font="900 27px Arial";ctx.fillStyle="#1769ff";ctx.fillText($("leftLabel").value.toUpperCase(),leftX,headY);
  ctx.fillStyle="#ef2f2f";ctx.fillText($("rightLabel").value.toUpperCase(),rightX,headY);
  ctx.fillStyle="#1769ff";ctx.fillRect(leftX,headY+18,col,6);ctx.fillStyle="#ef2f2f";ctx.fillRect(rightX,headY+18,col,6);
  ctx.fillStyle="#c4cad3";ctx.fillRect(W/2,headY+55,1,650);

  const contentY=headY+60,contentH=630;
  const leftMode=$("leftMode").value,rightMode=$("rightMode").value;
  const leftImg=$("leftImagePreview"),rightImg=$("rightImagePreview");

  if(leftMode==="text")drawPointList(lines("leftPoints"),leftX,contentY,col,contentH,"left");
  else if(leftMode==="image")drawImageFit(leftImg,leftX,contentY,col,contentH,$("leftFit").value);
  else{
    drawPointList(lines("leftPoints"),leftX,contentY,col,220,"left");
    drawImageFit(leftImg,leftX,contentY+240,col,390,$("leftFit").value);
  }

  if(rightMode==="text")drawPointList(lines("rightPoints"),rightX,contentY,col,contentH,"right");
  else if(rightMode==="image")drawImageFit(rightImg,rightX,contentY,col,contentH,$("rightFit").value);
  else{
    drawPointList(lines("rightPoints"),rightX,contentY,col,220,"right");
    drawImageFit(rightImg,rightX,contentY+240,col,390,$("rightFit").value);
  }

  ctx.fillStyle="#dce1e8";ctx.fillRect(margin,1100,inner,2);
  const leftSources=sourcePairs("leftSourceNames","leftSourceLinks").map(s=>s.name).join(" • ");
  const rightSources=sourcePairs("rightSourceNames","rightSourceLinks").map(s=>s.name).join(" • ");
  drawWrapped(leftSources,leftX,1140,col,24,"700 17px Arial","#1769ff",3);
  drawWrapped(rightSources,rightX,1140,col,24,"700 17px Arial","#ef2f2f",3);

  ctx.fillStyle="#dce1e8";ctx.fillRect(margin,1250,inner,2);
  ctx.font="900 22px Arial";ctx.fillStyle="#111827";ctx.textAlign="center";ctx.fillText("DUALLENS",W/2,1295);
  ctx.font="700 13px Arial";ctx.fillStyle="#697386";ctx.fillText("Same story. Different lens.",W/2,1320);ctx.textAlign="left";
}
["category","headline","leftLabel","rightLabel","leftMode","rightMode","leftPoints","rightPoints","leftSourceNames","rightSourceNames","leftSourceLinks","rightSourceLinks","leftFit","rightFit"]
.forEach(id=>{$(id).addEventListener("input",render);$(id).addEventListener("change",render)});
$("leftImageInput").addEventListener("change",e=>loadImage(e.target,"left"));
$("rightImageInput").addEventListener("change",e=>loadImage(e.target,"right"));
$("removeLeftImage").addEventListener("click",()=>removeImage("left"));
$("removeRightImage").addEventListener("click",()=>removeImage("right"));
$("copyBtn").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("postCopy").value)}catch{$("postCopy").select();document.execCommand("copy")}});
$("previewBtn").addEventListener("click",()=>{renderCanvas();$("phonePostCopy").textContent=$("postCopy").value;$("phoneImage").src=canvas.toDataURL("image/png");$("phoneDialog").showModal()});
$("closePhoneBtn").addEventListener("click",()=>$("phoneDialog").close());
$("exportBtn").addEventListener("click",()=>{
  renderCanvas();
  canvas.toBlob(blob=>{
    if(!blob)return alert("Export failed. Please try again.");
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="duallens-card.png";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },"image/png");
});
render();
