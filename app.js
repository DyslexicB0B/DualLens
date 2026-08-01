const $=id=>document.getElementById(id);
const canvas=$("exportCanvas"),ctx=canvas.getContext("2d");
let aiMode="topic";

/*
  Secure AI connection:
  Replace the empty URL below with your Cloudflare Worker or serverless endpoint.
  Never place an OpenAI API key in this public GitHub Pages project.
*/
const AI_ENDPOINT="";

const editIds=["headlineEdit","factsEdit","leftHeadingEdit","rightHeadingEdit","leftPointsEdit","rightPointsEdit","sourceLineEdit"];
const dataIds=["engagementHook","sourceNames","sourceLinks","draftName","format"];

function text(id){return $(id).innerText.trim()}
function linesFromText(id){return text(id).split("\n").map(v=>v.trim()).filter(Boolean)}
function inputLines(id){return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean)}
function sourcePairs(){
  const names=inputLines("sourceNames"),links=inputLines("sourceLinks");
  return names.map((name,i)=>({name,link:links[i]||""}));
}
function values(){
  const data={};
  editIds.forEach(id=>data[id]=$(id).innerText);
  dataIds.forEach(id=>data[id]=$(id).value);
  return data;
}
function apply(data){
  editIds.forEach(id=>{if(data[id]!==undefined)$(id).innerText=data[id]});
  dataIds.forEach(id=>{if(data[id]!==undefined)$(id).value=data[id]});
  renderAll();
}
function wrap(textValue,max,font){
  ctx.font=font;
  const words=String(textValue||"").trim().split(/\s+/).filter(Boolean),out=[];
  let line="";
  words.forEach(word=>{
    const test=line?`${line} ${word}`:word;
    if(ctx.measureText(test).width>max&&line){out.push(line);line=word}else line=test;
  });
  if(line)out.push(line);
  return out;
}
function drawWrapped(textValue,x,y,max,lh,font,color,maxLines=99){
  ctx.font=font;ctx.fillStyle=color;
  const rows=wrap(textValue,max,font).slice(0,maxLines);
  rows.forEach((row,i)=>ctx.fillText(row,x,y+i*lh));
  return rows.length*lh;
}
function drawLineItems(items,x,y,max,fontSize,lineGap,color,maxItems){
  let cy=y;
  const font=`600 ${fontSize}px Arial`;
  items.slice(0,maxItems).forEach(item=>{
    const rows=wrap(item,max-30,font).slice(0,2);
    ctx.fillStyle=color;ctx.fillRect(x,cy-11,7,7);
    ctx.fillStyle="#111";ctx.font=font;
    rows.forEach((row,i)=>ctx.fillText(row,x+20,cy+i*(fontSize+6)));
    cy+=rows.length*(fontSize+6)+lineGap;
  });
}
function setCanvasSize(){
  const sizes={landscape:[1600,900],square:[1080,1080],portrait:[1080,1350]};
  const [w,h]=sizes[$("format").value];
  canvas.width=w;canvas.height=h;
  $("sizeBadge").textContent=`${w} × ${h}`;
}
function renderCanvas(){
  setCanvasSize();
  const W=canvas.width,H=canvas.height,land=W>H,s=Math.min(W/1600,H/900);
  const margin=land?58*s:44*(W/1080),innerW=W-margin*2;
  let y=margin;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);

  ctx.fillStyle="#111";ctx.font=`900 ${24*s}px Arial`;
  ctx.fillText("DUALLENS",margin,y+18*s);

  y+=65*s;
  const headlineSize=land?52*s:38*(W/1080);
  const headlineH=drawWrapped(text("headlineEdit"),margin,y,innerW,headlineSize*1.08,`900 ${headlineSize}px Arial`,"#111",land?2:3);
  y+=headlineH+26*s;

  ctx.font=`900 ${15*s}px Arial`;ctx.fillStyle="#111";ctx.fillText("WHAT WE KNOW",margin,y);
  y+=18*s;ctx.fillRect(margin,y,innerW,4*s);y+=31*s;

  const facts=linesFromText("factsEdit");
  drawLineItems(facts,margin,y,innerW,18*s,10*s,"#111",land?3:4);
  y+=Math.min(facts.length,land?3:4)*43*s+20*s;

  const gap=34*s,col=(innerW-gap)/2,leftX=margin,rightX=margin+col+gap;
  ctx.font=`900 ${21*s}px Arial`;ctx.fillStyle="#1769ff";ctx.fillText(text("leftHeadingEdit").toUpperCase(),leftX,y);
  ctx.fillStyle="#ff3b30";ctx.fillText(text("rightHeadingEdit").toUpperCase(),rightX,y);

  y+=16*s;ctx.fillStyle="#1769ff";ctx.fillRect(leftX,y,col,5*s);ctx.fillStyle="#ff3b30";ctx.fillRect(rightX,y,col,5*s);
  y+=39*s;

  drawLineItems(linesFromText("leftPointsEdit"),leftX,y,col,17*s,12*s,"#1769ff",land?4:5);
  drawLineItems(linesFromText("rightPointsEdit"),rightX,y,col,17*s,12*s,"#ff3b30",land?4:5);

  const footerY=H-margin;
  ctx.fillStyle="#111";ctx.fillRect(margin,footerY-34*s,innerW,2*s);
  ctx.font=`700 ${13*s}px Arial`;ctx.fillStyle="#444";
  ctx.fillText(text("sourceLineEdit"),margin,footerY-10*s);
}
function updateSourceLine(){
  const src=sourcePairs().slice(0,6).map((s,i)=>`[${i+1}] ${s.name}`).join("   ");
  if(document.activeElement!==$("sourceLineEdit"))$("sourceLineEdit").innerText=src;
}
function updateTweet(){
  const src=sourcePairs().map((s,i)=>`[${i+1}] ${s.name}${s.link?": "+s.link:""}`).join("\n");
  $("tweetCopy").value=`${text("headlineEdit")}\n\n${text("leftHeadingEdit")} and ${text("rightHeadingEdit")} see this differently. Here are both perspectives side by side.\n\n${$("engagementHook").value.trim()}\n\nSources:\n${src}`;
}
function updateScores(){
  const h=text("headlineEdit").length;
  const headline=h>=30&&h<=85?100:h>=20&&h<=105?80:55;
  const facts=Math.min(100,linesFromText("factsEdit").length*25);
  const a=linesFromText("leftPointsEdit").length,b=linesFromText("rightPointsEdit").length;
  const balance=(a&&b)?Math.max(40,100-Math.abs(a-b)*20):20;
  const sources=Math.min(100,sourcePairs().filter(s=>s.link).length*25);
  const overall=Math.round((headline+facts+balance+sources)/4);
  $("headlineScore").textContent=headline;$("factsScore").textContent=facts;
  $("balanceScore").textContent=balance;$("sourceScore").textContent=sources;$("overallScore").textContent=overall;
}
function renderAll(){
  updateSourceLine();renderCanvas();updateTweet();updateScores();
}
function renderDrafts(){
  const wrap=$("draftList"),drafts=JSON.parse(localStorage.getItem("duallensV5Drafts")||"[]");
  wrap.innerHTML="";
  if(!drafts.length){wrap.innerHTML="<span class='status'>No saved drafts yet.</span>";return}
  drafts.forEach((draft,i)=>{
    const row=document.createElement("div");row.className="draft-item";
    const load=document.createElement("button");load.className="ghost draft-load";load.textContent=draft.draftName||"Untitled";
    load.addEventListener("click",()=>apply(draft));
    const del=document.createElement("button");del.className="ghost draft-delete";del.textContent="×";
    del.addEventListener("click",()=>{
      drafts.splice(i,1);localStorage.setItem("duallensV5Drafts",JSON.stringify(drafts));renderDrafts();
    });
    row.append(load,del);wrap.append(row);
  });
}
function saveDraft(){
  const drafts=JSON.parse(localStorage.getItem("duallensV5Drafts")||"[]");
  drafts.unshift({...values(),savedAt:new Date().toISOString()});
  localStorage.setItem("duallensV5Drafts",JSON.stringify(drafts.slice(0,25)));
  $("message").textContent="Draft saved in this browser.";
  renderDrafts();
}
async function generateWithAI(){
  const input=$("aiInput").value.trim();
  if(!input){$("aiStatus").textContent="Enter a topic, headline, or article link.";return}
  if(!AI_ENDPOINT){
    $("aiStatus").textContent="The interface is ready. Connect the secure AI endpoint to generate stories.";
    return;
  }

  $("generateBtn").disabled=true;$("generateBtn").textContent="Generating…";$("aiStatus").textContent="";
  try{
    const response=await fetch(AI_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        mode:aiMode,
        input,
        context:$("aiContext").value.trim(),
        perspectiveStyle:$("perspectiveStyle").value
      })
    });
    if(!response.ok)throw new Error("Generation failed");
    const data=await response.json();
    apply({
      headlineEdit:data.headline||"",
      factsEdit:(data.sharedFacts||[]).join("\n"),
      leftHeadingEdit:data.leftHeading||"PERSPECTIVE A",
      rightHeadingEdit:data.rightHeading||"PERSPECTIVE B",
      leftPointsEdit:(data.leftPoints||[]).join("\n"),
      rightPointsEdit:(data.rightPoints||[]).join("\n"),
      sourceNames:(data.sources||[]).map(s=>s.name).join("\n"),
      sourceLinks:(data.sources||[]).map(s=>s.url).join("\n"),
      engagementHook:data.engagementHook||"Which side makes the stronger case—and what are we missing?"
    });
    $("aiStatus").textContent="Draft generated. Review every claim and source before publishing.";
  }catch{
    $("aiStatus").textContent="The AI service could not be reached.";
  }finally{
    $("generateBtn").disabled=false;$("generateBtn").textContent="Generate first draft";
  }
}
function openXPreview(){
  renderCanvas();
  $("previewImage").src=canvas.toDataURL("image/png");
  $("previewPostText").textContent=$("tweetCopy").value.split("\n\nSources:")[0];
  $("xPreviewModal").classList.remove("hidden");
}
editIds.forEach(id=>$(id).addEventListener("input",renderAll));
dataIds.forEach(id=>{$(id).addEventListener("input",renderAll);$(id).addEventListener("change",renderAll)});
document.querySelectorAll(".mode-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");aiMode=btn.dataset.mode;
}));
$("generateBtn").addEventListener("click",generateWithAI);
$("saveBtn").addEventListener("click",saveDraft);
$("previewBtn").addEventListener("click",openXPreview);
$("closePreviewBtn").addEventListener("click",()=>$("xPreviewModal").classList.add("hidden"));
$("xPreviewModal").addEventListener("click",e=>{if(e.target===$("xPreviewModal"))$("xPreviewModal").classList.add("hidden")});
$("downloadBtn").addEventListener("click",()=>{
  renderCanvas();
  const a=document.createElement("a");
  a.download=`duallens-${$("format").value}.png`;
  a.href=canvas.toDataURL("image/png");
  a.click();
  $("message").textContent="PNG sent to your Downloads folder.";
});
$("copyTweetBtn").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("tweetCopy").value)}
  catch{$("tweetCopy").select();document.execCommand("copy")}
  $("message").textContent="X post text copied.";
});
renderDrafts();renderAll();
