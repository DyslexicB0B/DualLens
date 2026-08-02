const $=id=>document.getElementById(id);
const canvas=$("exportCanvas"),ctx=canvas.getContext("2d");

function lines(id){return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean)}
function pairs(names,links){const n=lines(names),l=lines(links);return n.map((name,i)=>({name,link:l[i]||""}))}
function point(text,side){const row=document.createElement("div");row.className="point";const b=document.createElement("span");b.className="badge";const t=document.createElement("span");t.textContent=text;row.append(b,t);return row}
function chips(target,pairList,side){const el=$(target);el.innerHTML="";pairList.forEach(p=>{const c=document.createElement("span");c.className=`chip ${side}`;c.textContent=p.name;el.append(c)})}
function mode(side){const pane=$(side+"Pane"),m=$(side+"Mode").value,img=$(side+"Image"),txt=$(side+"Text");pane.classList.toggle("mixed",m==="mixed");txt.classList.toggle("hidden",m==="image");img.classList.toggle("hidden",m==="text"||!img.src)}
function render(){
  $("cardCategory").textContent=$("category").value.toUpperCase();
  $("cardHeadline").textContent=$("headline").value;
  $("cardLeftLabel").textContent=$("leftLabel").value.toUpperCase();
  $("cardRightLabel").textContent=$("rightLabel").value.toUpperCase();
  const l=$("leftText"),r=$("rightText");l.innerHTML="";r.innerHTML="";
  lines("leftPoints").slice(0,3).forEach(x=>l.append(point(x,"left")));
  lines("rightPoints").slice(0,3).forEach(x=>r.append(point(x,"right")));
  chips("leftSources",pairs("leftSourceNames","leftSourceLinks"),"blue");
  chips("rightSources",pairs("rightSourceNames","rightSourceLinks"),"red");
  mode("left");mode("right");
}
function upload(input,side){const f=input.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{$(side+"Image").src=reader.result;$(side+"Mode").value="image";render()};reader.readAsDataURL(f)}
function remove(side){$(side+"Image").removeAttribute("src");$(side+"Mode").value="text";render()}
function wrap(text,max,font){ctx.font=font;const words=String(text||"").split(/\s+/).filter(Boolean),rows=[];let line="";for(const w of words){const test=line?line+" "+w:w;if(ctx.measureText(test).width>max&&line){rows.push(line);line=w}else line=test}if(line)rows.push(line);return rows}
function drawWrap(text,x,y,max,lh,font,color,limit=99,align="left"){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;const rows=wrap(text,max,font).slice(0,limit);rows.forEach((row,i)=>ctx.fillText(row,x,y+i*lh));ctx.textAlign="left";return rows.length*lh}
function drawImg(img,x,y,w,h){if(!img.complete||!img.naturalWidth)return;const ir=img.naturalWidth/img.naturalHeight,br=w/h;let dw,dh;if(ir>br){dw=w;dh=w/ir}else{dh=h;dw=h*ir}ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function drawPoints(items,x,y,w,h,color){const rh=h/3;items.slice(0,3).forEach((it,i)=>{const top=y+i*rh;if(i){ctx.fillStyle="#e5e7eb";ctx.fillRect(x,top,w,2)}ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+28,top+rh/2,20,0,Math.PI*2);ctx.fill();drawWrap(it,x+62,top+rh/2-14,w-65,34,"900 29px Arial","#0f172a",3)})}
function renderCanvas(){
  const W=1080,H=1350,m=60,inner=W-m*2,gap=52,col=(inner-gap)/2,lx=m,rx=m+col+gap;
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#0a67ff";ctx.fillRect(0,0,W/2,14);ctx.fillStyle="#f02d2d";ctx.fillRect(W/2,0,W/2,14);
  ctx.font="900 16px Arial";ctx.fillStyle="#667085";ctx.textAlign="center";ctx.fillText($("category").value.toUpperCase(),W/2,65);
  drawWrap($("headline").value,W/2,125,inner,66,"900 60px Arial","#0f172a",3,"center");
  const hy=340;ctx.fillStyle="#0a67ff";ctx.fillRect(lx,hy,col,58);ctx.fillStyle="#f02d2d";ctx.fillRect(rx,hy,col,58);
  ctx.fillStyle="#fff";ctx.font="900 26px Arial";ctx.textAlign="center";ctx.fillText($("leftLabel").value.toUpperCase(),lx+col/2,hy+38);ctx.fillText($("rightLabel").value.toUpperCase(),rx+col/2,hy+38);ctx.textAlign="left";
  ctx.fillStyle="#c7cdd6";ctx.fillRect(W/2,420,2,620);
  const cy=420,ch=620;
  const lm=$("leftMode").value,rm=$("rightMode").value,li=$("leftImage"),ri=$("rightImage");
  if(lm==="text")drawPoints(lines("leftPoints"),lx,cy,col,ch,"#0a67ff");
  else if(lm==="image")drawImg(li,lx,cy,col,ch);
  else{drawPoints(lines("leftPoints"),lx,cy,col,210,"#0a67ff");drawImg(li,lx,cy+230,col,390)}
  if(rm==="text")drawPoints(lines("rightPoints"),rx,cy,col,ch,"#f02d2d");
  else if(rm==="image")drawImg(ri,rx,cy,col,ch);
  else{drawPoints(lines("rightPoints"),rx,cy,col,210,"#f02d2d");drawImg(ri,rx,cy+230,col,390)}
  ctx.fillStyle="#d6dce5";ctx.fillRect(m,1080,inner,2);
  drawWrap(pairs("leftSourceNames","leftSourceLinks").map(p=>p.name).join(" • "),lx,1125,col,24,"700 17px Arial","#0a67ff",3);
  drawWrap(pairs("rightSourceNames","rightSourceLinks").map(p=>p.name).join(" • "),rx,1125,col,24,"700 17px Arial","#f02d2d",3);
  ctx.fillStyle="#d6dce5";ctx.fillRect(m,1242,inner,2);ctx.textAlign="center";ctx.font="900 22px Arial";ctx.fillStyle="#0f172a";ctx.fillText("DUALLENS",W/2,1285);ctx.font="700 13px Arial";ctx.fillStyle="#667085";ctx.fillText("Same story. Different lens.",W/2,1310);ctx.textAlign="left";
}
["category","headline","leftLabel","rightLabel","leftMode","rightMode","leftPoints","rightPoints","leftSourceNames","rightSourceNames","leftSourceLinks","rightSourceLinks"].forEach(id=>{$(id).addEventListener("input",render);$(id).addEventListener("change",render)});
$("leftImageInput").addEventListener("change",e=>upload(e.target,"left"));
$("rightImageInput").addEventListener("change",e=>upload(e.target,"right"));
$("removeLeftImage").addEventListener("click",()=>remove("left"));
$("removeRightImage").addEventListener("click",()=>remove("right"));
$("copyBtn").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("postCopy").value)}catch{$("postCopy").select();document.execCommand("copy")}});
$("previewBtn").addEventListener("click",()=>{renderCanvas();$("phoneCopy").textContent=$("postCopy").value;$("phoneImage").src=canvas.toDataURL("image/png");$("phoneDialog").showModal()});
$("closePhoneBtn").addEventListener("click",()=>$("phoneDialog").close());
$("exportBtn").addEventListener("click",()=>{renderCanvas();canvas.toBlob(blob=>{if(!blob){alert("Export failed");return}const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="duallens-card.png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)},"image/png")});
render();
