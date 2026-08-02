const $=id=>document.getElementById(id);
const canvas=$("exportCanvas");
const ctx=canvas.getContext("2d");

function updatePreview(){
  $("cardHeadline").textContent=$("headline").value.trim();
  $("cardLeftLabel").textContent=$("leftLabel").value.trim();
  $("cardRightLabel").textContent=$("rightLabel").value.trim();

  $("leftSourceChip").textContent=$("leftSourceLabel").value.trim()||"Left source";
  $("leftSourceChip").href=$("leftSourceUrl").value.trim()||"#";

  $("rightSourceChip").textContent=$("rightSourceLabel").value.trim()||"Right source";
  $("rightSourceChip").href=$("rightSourceUrl").value.trim()||"#";
}

function loadImage(input,side){
  const file=input.files?.[0];
  if(!file)return;

  const reader=new FileReader();
  reader.onload=()=>{
    const img=$(side+"PreviewImage");
    img.src=reader.result;
    img.classList.remove("hidden");
    $(side+"Placeholder").classList.add("hidden");
    applyFit(side);
  };
  reader.readAsDataURL(file);
}

function removeImage(side){
  const img=$(side+"PreviewImage");
  img.removeAttribute("src");
  img.classList.add("hidden");
  $(side+"Placeholder").classList.remove("hidden");
}

function applyFit(side){
  $(side+"PreviewImage").style.objectFit=$(side+"Fit").value;
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

function drawWrapped(text,x,y,maxWidth,lineHeight,font,color,maxLines=99,align="left"){
  ctx.font=font;
  ctx.fillStyle=color;
  ctx.textAlign=align;
  const rows=wrapText(text,maxWidth,font).slice(0,maxLines);
  rows.forEach((row,i)=>ctx.fillText(row,x,y+i*lineHeight));
  ctx.textAlign="left";
  return rows.length*lineHeight;
}

function roundedRect(x,y,w,h,r,fill,stroke,lineWidth=1){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke()}
}

function drawImageFit(img,x,y,w,h,fit){
  if(!img.complete||!img.naturalWidth)return;
  const ir=img.naturalWidth/img.naturalHeight;
  const br=w/h;
  let dw,dh;
  if((fit==="cover"&&ir>br)||(fit==="contain"&&ir<br)){dh=h;dw=h*ir}
  else{dw=w;dh=w/ir}

  const dx=x+(w-dw)/2;
  const dy=y+(h-dh)/2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,18);
  ctx.clip();
  ctx.fillStyle="#fff";
  ctx.fillRect(x,y,w,h);
  ctx.drawImage(img,dx,dy,dw,dh);
  ctx.restore();
}

function renderCanvas(){
  const W=1080,H=1350,margin=54,inner=W-margin*2;
  const gap=86,col=(inner-gap)/2,leftX=margin,rightX=margin+col+gap;
  const cardTop=350,frameH=780;

  ctx.clearRect(0,0,W,H);

  const bg=ctx.createLinearGradient(0,0,W,0);
  bg.addColorStop(0,"#dfeaff");
  bg.addColorStop(.48,"#faf6ef");
  bg.addColorStop(.52,"#faf6ef");
  bg.addColorStop(1,"#ffe2e2");
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,W,H);

  const leftGlow=ctx.createRadialGradient(120,620,20,120,620,520);
  leftGlow.addColorStop(0,"rgba(24,95,230,.20)");
  leftGlow.addColorStop(1,"rgba(24,95,230,0)");
  ctx.fillStyle=leftGlow;
  ctx.fillRect(0,0,W,H);

  const rightGlow=ctx.createRadialGradient(960,620,20,960,620,520);
  rightGlow.addColorStop(0,"rgba(239,48,56,.20)");
  rightGlow.addColorStop(1,"rgba(239,48,56,0)");
  ctx.fillStyle=rightGlow;
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle="#185fe6";
  ctx.beginPath();ctx.arc(W/2-18,60,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ef3038";
  ctx.beginPath();ctx.arc(W/2+18,60,24,0,Math.PI*2);ctx.fill();

  ctx.textAlign="center";
  ctx.font="900 42px Arial";
  ctx.fillStyle="#0d1730";
  ctx.fillText("DualLens",W/2,78);

  ctx.font="900 14px Arial";
  ctx.fillStyle="#667085";
  ctx.fillText("SAME STORY. DIFFERENT LENS.",W/2,108);

  drawWrapped($("headline").value.trim().toUpperCase(),W/2,170,inner-40,72,"900 66px Arial","#0d1730",3,"center");

  ctx.font="900 23px Arial";
  ctx.fillStyle="#185fe6";
  ctx.fillText($("leftLabel").value.trim().toUpperCase(),leftX+col/2,cardTop-26);
  ctx.fillStyle="#ef3038";
  ctx.fillText($("rightLabel").value.trim().toUpperCase(),rightX+col/2,cardTop-26);
  ctx.textAlign="left";

  roundedRect(leftX,cardTop,col,frameH,22,"rgba(255,255,255,.96)","rgba(24,95,230,.40)",3);
  roundedRect(rightX,cardTop,col,frameH,22,"rgba(255,255,255,.96)","rgba(239,48,56,.40)",3);

  const pad=14,chipH=50,imageH=frameH-chipH-pad*3;
  const leftImg=$("leftPreviewImage"),rightImg=$("rightPreviewImage");

  if(leftImg.src) drawImageFit(leftImg,leftX+pad,cardTop+pad,col-pad*2,imageH,$("leftFit").value);
  else{
    roundedRect(leftX+pad,cardTop+pad,col-pad*2,imageH,16,"#f8fafc","#cbd5e1",2);
    ctx.textAlign="center";ctx.font="800 23px Arial";ctx.fillStyle="#667085";
    ctx.fillText("Upload left screenshot",leftX+col/2,cardTop+imageH/2);
    ctx.textAlign="left";
  }

  if(rightImg.src) drawImageFit(rightImg,rightX+pad,cardTop+pad,col-pad*2,imageH,$("rightFit").value);
  else{
    roundedRect(rightX+pad,cardTop+pad,col-pad*2,imageH,16,"#f8fafc","#cbd5e1",2);
    ctx.textAlign="center";ctx.font="800 23px Arial";ctx.fillStyle="#667085";
    ctx.fillText("Upload right screenshot",rightX+col/2,cardTop+imageH/2);
    ctx.textAlign="left";
  }

  roundedRect(leftX+pad,cardTop+frameH-chipH-pad,col-pad*2,chipH,24,"#fff","rgba(24,95,230,.45)",2);
  roundedRect(rightX+pad,cardTop+frameH-chipH-pad,col-pad*2,chipH,24,"#fff","rgba(239,48,56,.45)",2);

  ctx.textAlign="center";
  ctx.font="900 18px Arial";
  ctx.fillStyle="#185fe6";
  ctx.fillText($("leftSourceLabel").value.trim()||"Left source",leftX+col/2,cardTop+frameH-30);

  ctx.fillStyle="#ef3038";
  ctx.fillText($("rightSourceLabel").value.trim()||"Right source",rightX+col/2,cardTop+frameH-30);

  ctx.strokeStyle="#b6beca";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(W/2,cardTop+20);
  ctx.lineTo(W/2,cardTop+frameH-20);
  ctx.stroke();

  roundedRect(W/2-34,cardTop+frameH/2-34,68,68,34,"rgba(255,255,255,.96)","#b6beca",2);
  ctx.font="900 24px Arial";
  ctx.fillStyle="#0d1730";
  ctx.fillText("VS",W/2,cardTop+frameH/2+8);

  ctx.fillStyle="#185fe6";
  ctx.beginPath();ctx.arc(W/2-13,1235,17,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ef3038";
  ctx.beginPath();ctx.arc(W/2+13,1235,17,0,Math.PI*2);ctx.fill();

  ctx.font="900 28px Arial";
  ctx.fillStyle="#0d1730";
  ctx.fillText("DualLens",W/2,1285);
  ctx.textAlign="left";
}

function exportPng(){
  renderCanvas();
  canvas.toBlob(blob=>{
    if(!blob){
      $("message").textContent="Export failed. Please try again.";
      return;
    }
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="duallens-comparison.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
    $("message").textContent="PNG sent to your Downloads folder.";
  },"image/png");
}

["headline","leftLabel","rightLabel","leftSourceLabel","rightSourceLabel","leftSourceUrl","rightSourceUrl"]
  .forEach(id=>$(id).addEventListener("input",updatePreview));

$("leftFit").addEventListener("change",()=>applyFit("left"));
$("rightFit").addEventListener("change",()=>applyFit("right"));

$("leftImageInput").addEventListener("change",e=>loadImage(e.target,"left"));
$("rightImageInput").addEventListener("change",e=>loadImage(e.target,"right"));

$("removeLeftBtn").addEventListener("click",()=>removeImage("left"));
$("removeRightBtn").addEventListener("click",()=>removeImage("right"));

$("copyBtn").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("postCopy").value)}
  catch{$("postCopy").select();document.execCommand("copy")}
  $("message").textContent="Post text copied.";
});

$("phonePreviewBtn").addEventListener("click",()=>{
  renderCanvas();
  $("phoneCopy").textContent=$("postCopy").value;
  $("phoneImage").src=canvas.toDataURL("image/png");
  $("phoneDialog").showModal();
});

$("closePhoneBtn").addEventListener("click",()=>$("phoneDialog").close());
$("exportBtn").addEventListener("click",exportPng);

updatePreview();
