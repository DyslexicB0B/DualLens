const $=id=>document.getElementById(id);
const canvas=$("previewCanvas"),ctx=canvas.getContext("2d");
let aiMode="topic";

/*
  AI SETUP
  --------
  Replace this with your secure serverless endpoint later.
  Example:
  const AI_ENDPOINT = "https://your-worker.example.workers.dev/generate";
*/
const AI_ENDPOINT="";

const defaults={
  format:"landscape",
  headline:"Congress debates a new national immigration proposal",
  leftHeading:"LEFT VIEW",rightHeading:"RIGHT VIEW",
  sharedFacts:"The proposal changes asylum processing rules\nIt adds funding for border operations\nCongress must approve the final legislation",
  leftPoints:"Strengthens border enforcement\nClarifies asylum standards\nAdds resources for processing\nMay reduce illegal crossings",
  rightPoints:"Could limit humanitarian access\nMay separate families\nAdds enforcement costs\nCould affect labor markets",
  leftSourceNames:"AP\nReuters",leftSourceLinks:"https://apnews.com/\nhttps://reuters.com/",
  rightSourceNames:"BBC\nNPR",rightSourceLinks:"https://bbc.com/\nhttps://npr.org/",
  engagementHook:"Which side makes the stronger case—and what are we missing?",
  draftName:"Untitled Story"
};
const ids=Object.keys(defaults);

function lines(id){return $(id).value.split("\n").map(v=>v.trim()).filter(Boolean)}
function sourcePairs(namesId,linksId){
  const names=lines(namesId),links=lines(linksId);
  return names.map((name,i)=>({name,link:links[i]||""}));
}
function values(){
  const data={};ids.forEach(id=>data[id]=$(id).value);return data;
}
function apply(data){
  ids.forEach(id=>{if(data[id]!==undefined)$(id).value=data[id]});
  renderAll();
}
function setSize(){
  const sizes={landscape:[1600,900],square:[1080,1080],portrait:[1080,1350]};
  const [w,h]=sizes[$("format").value];canvas.width=w;canvas.height=h;$("sizeBadge").textContent=`${w} × ${h}`;
}
function wrap(text,max,font){
  ctx.font=font;const words=String(text||"").trim().split(/\s+/).filter(Boolean),out=[];let line="";
  words.forEach(word=>{const test=line?line+" "+word:word;if(ctx.measureText(test).width>max&&line){out.push(line);line=word}else line=test});
  if(line)out.push(line);return out;
}
function drawWrap(text,x,y,max,lh,font,color,limit=99){
  ctx.font=font;ctx.fillStyle=color;const list=wrap(text,max,font).slice(0,limit);
  list.forEach((t,i)=>ctx.fillText(t,x,y+i*lh));return list.length*lh;
}
function drawLineList(items,x,y,max,fontSize,lineGap,color,maxItems,startNumber){
  const font=`600 ${fontSize}px Arial`;let cy=y;
  items.slice(0,maxItems).forEach((item,index)=>{
    const list=wrap(item,max-48,font).slice(0,2);
    ctx.fillStyle=color;ctx.fillRect(x,cy-14,8,8);
    ctx.fillStyle="#111";ctx.font=font;
    list.forEach((t,i)=>ctx.fillText(t,x+24,cy+i*(fontSize+7)));
    if(startNumber){
      ctx.textAlign="right";ctx.font=`800 ${Math.max(12,fontSize-5)}px Arial`;ctx.fillStyle=color;
      ctx.fillText(`[${startNumber+index}]`,x+max,cy);ctx.textAlign="left";
    }
    cy+=list.length*(fontSize+7)+lineGap;
  });
}
function renderCanvas(){
  setSize();
  const W=canvas.width,H=canvas.height,land=W>H;
  const sx=W/1600, sy=H/900, s=Math.min(sx,sy);
  const margin=land?56*s:42*(W/1080);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);

  const x=margin, innerW=W-margin*2;
  let y=margin;

  ctx.fillStyle="#111";ctx.font=`900 ${24*s}px Arial`;
  ctx.fillText("DUALLENS",x,y+18*s);

  ctx.strokeStyle="#111";ctx.lineWidth=5*s;
  ctx.beginPath();ctx.moveTo(x,y+38*s);ctx.lineTo(x+innerW,y+38*s);ctx.stroke();

  y+=84*s;
  const headlineSize=land?49*s:37*(W/1080);
  const headlineH=drawWrap($("headline").value,x,y,innerW,headlineSize*1.13,`900 ${headlineSize}px Arial`,"#111",land?2:3);
  y+=headlineH+24*s;

  const facts=lines("sharedFacts");
  ctx.fillStyle="#111";ctx.font=`900 ${15*s}px Arial`;ctx.fillText("WHAT WE KNOW",x,y);
  y+=26*s;
  ctx.strokeStyle="#111";ctx.lineWidth=2*s;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+innerW,y);ctx.stroke();
  y+=28*s;
  drawLineList(facts,x,y,innerW,17*s,10*s,"#111",land?3:4,0);

  const factsUsed=Math.min(facts.length,land?3:4);
  y+=factsUsed*42*s+20*s;

  const gap=32*s,col=(innerW-gap)/2;
  const leftX=x,rightX=x+col+gap;
  const titleY=y;

  ctx.fillStyle="#1769ff";ctx.font=`900 ${20*s}px Arial`;
  ctx.fillText(($("leftHeading").value||"PERSPECTIVE A").toUpperCase(),leftX,titleY);
  ctx.fillStyle="#ff3b30";
  ctx.fillText(($("rightHeading").value||"PERSPECTIVE B").toUpperCase(),rightX,titleY);

  y+=18*s;
  ctx.strokeStyle="#1769ff";ctx.lineWidth=5*s;
  ctx.beginPath();ctx.moveTo(leftX,y);ctx.lineTo(leftX+col,y);ctx.stroke();
  ctx.strokeStyle="#ff3b30";
  ctx.beginPath();ctx.moveTo(rightX,y);ctx.lineTo(rightX+col,y);ctx.stroke();

  y+=38*s;
  const left=lines("leftPoints"),right=lines("rightPoints");
  const maxPoints=land?4:5;
  drawLineList(left,leftX,y,col,16*s,12*s,"#1769ff",maxPoints,1);
  drawLineList(right,rightX,y,col,16*s,12*s,"#ff3b30",maxPoints,1+Math.min(left.length,maxPoints));

  const allSources=[...sourcePairs("leftSourceNames","leftSourceLinks"),...sourcePairs("rightSourceNames","rightSourceLinks")];
  const footerY=H-margin+4*s;
  ctx.strokeStyle="#111";ctx.lineWidth=2*s;
  ctx.beginPath();ctx.moveTo(x,footerY-34*s);ctx.lineTo(x+innerW,footerY-34*s);ctx.stroke();

  ctx.fillStyle="#444";ctx.font=`700 ${13*s}px Arial`;
  const src=allSources.slice(0,6).map((v,i)=>`[${i+1}] ${v.name}`).join("   ");
  ctx.fillText(src,x,footerY-9*s);
}
function updateTweet(){
  const h=$("headline").value.trim(),a=$("leftHeading").value.trim(),b=$("rightHeading").value.trim();
  const hook=$("engagementHook").value.trim();
  const sources=[...sourcePairs("leftSourceNames","leftSourceLinks"),...sourcePairs("rightSourceNames","rightSourceLinks")];
  $("tweetCopy").value=`${h}\n\n${a} and ${b} see this differently. Here are both perspectives side by side.\n\n${hook}\n\nSources:\n${sources.map((s,i)=>`[${i+1}] ${s.name}${s.link?": "+s.link:""}`).join("\n")}`;
}
function updateLinks(){
  [["leftLinks","leftSourceNames","leftSourceLinks"],["rightLinks","rightSourceNames","rightSourceLinks"]].forEach(([wrapId,namesId,linksId])=>{
    const wrap=$(wrapId);wrap.innerHTML="";
    sourcePairs(namesId,linksId).forEach((p,i)=>{
      const a=document.createElement("a");a.textContent=`[${i+1}] ${p.name}`;
      if(p.link){a.href=p.link;a.target="_blank";a.rel="noopener noreferrer"}else a.href="#";
      wrap.append(a);
    });
  });
}
function updateScores(){
  const hlen=$("headline").value.trim().length;
  const headline=hlen>=30&&hlen<=85?100:hlen>=20&&hlen<=105?80:55;
  const facts=Math.min(100,lines("sharedFacts").length*25);
  const a=lines("leftPoints").length,b=lines("rightPoints").length;
  const balance=(a&&b)?Math.max(40,100-Math.abs(a-b)*20):20;
  const sourceCount=[...sourcePairs("leftSourceNames","leftSourceLinks"),...sourcePairs("rightSourceNames","rightSourceLinks")].filter(s=>s.link).length;
  const sources=Math.min(100,sourceCount*25);
  const overall=Math.round((headline+facts+balance+sources)/4);
  $("headlineScore").textContent=headline;$("factsScore").textContent=facts;$("balanceScore").textContent=balance;
  $("sourceScore").textContent=sources;$("overallScore").textContent=overall;$("headlineCount").textContent=`${hlen}/120`;
}
function renderAll(){
  $("leftBoxTitle").textContent=$("leftHeading").value||"Perspective A";
  $("rightBoxTitle").textContent=$("rightHeading").value||"Perspective B";
  renderCanvas();updateTweet();updateLinks();updateScores();
}
function renderDrafts(){
  const wrap=$("draftList"),drafts=JSON.parse(localStorage.getItem("duallensV4Drafts")||"[]");wrap.innerHTML="";
  if(!drafts.length){wrap.innerHTML="<small>No saved drafts yet.</small>";return}
  drafts.forEach((d,i)=>{
    const row=document.createElement("div");row.className="draft-item";
    const load=document.createElement("button");load.className="ghost draft-load";load.textContent=d.draftName||"Untitled";
    load.addEventListener("click",()=>apply(d));
    const del=document.createElement("button");del.className="ghost draft-delete";del.textContent="×";
    del.addEventListener("click",()=>{drafts.splice(i,1);localStorage.setItem("duallensV4Drafts",JSON.stringify(drafts));renderDrafts()});
    row.append(load,del);wrap.append(row);
  });
}
function saveDraft(){
  const drafts=JSON.parse(localStorage.getItem("duallensV4Drafts")||"[]");
  drafts.unshift({...values(),savedAt:new Date().toISOString()});
  localStorage.setItem("duallensV4Drafts",JSON.stringify(drafts.slice(0,20)));
  $("message").textContent="Draft saved in this browser.";renderDrafts();
}
async function generateWithAI(){
  const input=$("aiInput").value.trim();
  if(!input){$("aiStatus").textContent="Enter a topic, headline, or article link first.";return}
  if(!AI_ENDPOINT){
    $("aiStatus").textContent="The AI panel is ready. The next step is connecting the secure AI endpoint.";
    return;
  }
  $("generateBtn").disabled=true;$("generateBtn").textContent="Generating…";$("aiStatus").textContent="";
  try{
    const res=await fetch(AI_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        mode:aiMode,input,context:$("aiContext").value.trim(),
        perspectiveStyle:$("perspectiveStyle").value
      })
    });
    if(!res.ok)throw new Error("AI request failed");
    const data=await res.json();apply(data);$("aiStatus").textContent="Story generated. Review every field before publishing.";
  }catch(err){
    $("aiStatus").textContent="The AI service could not be reached.";
  }finally{
    $("generateBtn").disabled=false;$("generateBtn").textContent="Generate story";
  }
}

ids.forEach(id=>{$(id).addEventListener("input",renderAll);$(id).addEventListener("change",renderAll)});
document.querySelectorAll(".mode-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");aiMode=btn.dataset.mode;
  const labels={topic:["Topic","Example: Should college athletes be paid?"],headline:["Headline","Paste a news headline"],article:["Article link","Paste a full article URL"]};
  $("aiInputLabel").textContent=labels[aiMode][0];$("aiInput").placeholder=labels[aiMode][1];
}));
$("generateBtn").addEventListener("click",generateWithAI);
$("saveBtn").addEventListener("click",saveDraft);
$("resetBtn").addEventListener("click",()=>{apply(defaults);$("message").textContent="Example restored."});
$("copyTweetBtn").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("tweetCopy").value)}catch{$("tweetCopy").select();document.execCommand("copy")}
  $("message").textContent="X post text copied.";
});
$("downloadBtn").addEventListener("click",()=>{
  renderCanvas();const a=document.createElement("a");a.download=`duallens-${$("format").value}.png`;a.href=canvas.toDataURL("image/png");a.click();
  $("message").textContent="PNG sent to your Downloads folder.";
});
renderDrafts();renderAll();
