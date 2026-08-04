const $=id=>document.getElementById(id),canvas=$("liveCanvas"),ctx=canvas.getContext("2d");
const state={leftImage:null,rightImage:null};
async function fonts(){if(document.fonts?.load)await Promise.all([document.fonts.load('900 58px "Roboto Condensed"'),document.fonts.ready]).catch(()=>{})}
function rr(x,y,w,h,r,fill,stroke,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function wrap(t,m,f){ctx.font=f;const words=String(t||"").trim().split(/\s+/).filter(Boolean),rows=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>m&&line){rows.push(line);line=word}else line=test}if(line)rows.push(line);return rows}
function text(t,x,y,m,lh,f,c,n=99,a="left"){ctx.font=f;ctx.fillStyle=c;ctx.textAlign=a;wrap(t,m,f).slice(0,n).forEach((r,i)=>ctx.fillText(r,x,y+i*lh));ctx.textAlign="left"}
function logo(x,y,s=1){ctx.fillStyle="#185fe6";ctx.beginPath();ctx.arc(x-25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ef3038";ctx.beginPath();ctx.arc(x+25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(7,18,41,.65)";ctx.beginPath();ctx.ellipse(x,y,15*s,26*s,0,0,Math.PI*2);ctx.fill()}
function image(img,x,y,w,h){if(!img){rr(x,y,w,h,16,"#f8fafc","#cbd5e1",2);ctx.textAlign="center";ctx.font="800 20px Arial";ctx.fillStyle="#667085";ctx.fillText("Upload screenshot",x+w/2,y+h/2);ctx.textAlign="left";return}const s=w/img.naturalWidth,dw=w,dh=img.naturalHeight*s,dx=x,dy=y+(h-dh)/2;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.clip();ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.drawImage(img,dx,dy,dw,dh);ctx.restore()}
function meter(score,x,y,w){const n=10,g=6,sw=(w-g*(n-1))/n;for(let i=0;i<n;i++){const t=i/(n-1),r=Math.round(24+(239-24)*t),gg=Math.round(95+(48-95)*t),b=Math.round(230+(56-230)*t);rr(x+i*(sw+g),y,sw,28,4,`rgb(${r},${gg},${b})`)}rr(x+w+14,y-2,82,34,17,"#071229");ctx.textAlign="center";ctx.font='900 18px "Roboto Condensed",Arial';ctx.fillStyle="#fff";ctx.fillText(Number(score).toFixed(1)+"/10",x+w+55,y+22);ctx.textAlign="left"}
function render(){const W=1080,H=1350;ctx.clearRect(0,0,W,H);ctx.fillStyle="#071229";ctx.fillRect(0,0,W,128);logo(270,64,1.05);ctx.fillStyle="#fff";ctx.font='900 64px "Roboto Condensed",Arial';ctx.fillText("DualLens",340,82);ctx.font="800 16px Arial";ctx.fillStyle="#cbd5e1";ctx.fillText("SAME STORY. DIFFERENT LENS.",340,111);ctx.fillStyle="#f8fafc";ctx.fillRect(0,128,W,H-128);rr(426,148,228,38,19,"#071229");ctx.textAlign="center";ctx.font='900 17px "Roboto Condensed",Arial';ctx.fillStyle="#fff";ctx.fillText("LENS CARD",540,174);text($("headline").value.toUpperCase(),540,240,970,63,'900 58px "Roboto Condensed",Arial',"#071229",2,"center");ctx.font="800 15px Arial";ctx.fillStyle="#475467";ctx.fillText("PERSPECTIVE DISTANCE",540,322);ctx.strokeStyle="#aeb8c8";ctx.beginPath();ctx.moveTo(115,314);ctx.lineTo(365,314);ctx.moveTo(715,314);ctx.lineTo(965,314);ctx.stroke();meter($("distanceScore").value,290,342,400);ctx.font='900 17px "Roboto Condensed",Arial';ctx.fillStyle="#475467";ctx.fillText($("distanceCaption").value.toUpperCase(),540,400);
const lx=24,rx=556,cy=430,cw=500,ch=580;rr(lx,cy,cw,ch,24,"#eaf1ff","#185fe6",2);rr(rx,cy,cw,ch,24,"#fff0f1","#ef3038",2);rr(lx,cy,cw,68,24,"#185fe6");ctx.fillStyle="#185fe6";ctx.fillRect(lx,cy+44,cw,24);rr(rx,cy,cw,68,24,"#ef3038");ctx.fillStyle="#ef3038";ctx.fillRect(rx,cy+44,cw,24);ctx.font='900 30px "Roboto Condensed",Arial';ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText("LEFT LENS",lx+cw/2,cy+44);ctx.fillText("RIGHT LENS",rx+cw/2,cy+44);image(state.leftImage,lx+18,cy+88,cw-36,420);image(state.rightImage,rx+18,cy+88,cw-36,420);ctx.font="900 18px Arial";
ctx.fillStyle="#185fe6";
ctx.fillText(($("leftName").value||"Left source")+"  ↗",lx+cw/2,cy+548);
ctx.fillStyle="#ef3038";
ctx.fillText(($("rightName").value||"Right source")+"  ↗",rx+cw/2,cy+548);rr(492,680,96,96,48,"#fff","#aeb8c8",2);ctx.fillStyle="#071229";ctx.font='900 19px "Roboto Condensed",Arial';ctx.fillText("COMPARE",540,718);ctx.font="800 13px Arial";ctx.fillText("TWO VIEWS",540,742);
rr(40,1035,1000,122,22,"#fff","#d0d5dd",1.5);ctx.textAlign="left";ctx.font='900 20px "Roboto Condensed",Arial';ctx.fillStyle="#071229";ctx.fillText("NARRATIVE SUMMARY",150,1072);text($("leftSummary").value,150,1102,820,24,"17px Arial","#344054",2);text($("rightSummary").value,150,1140,820,24,"17px Arial","#344054",2);rr(40,1175,1000,94,20,"#eef4ff","#8fb3ff",1.5);ctx.font='900 21px "Roboto Condensed",Arial';ctx.fillStyle="#0b3b8f";ctx.fillText("SEE BOTH SIDES. DECIDE FOR YOURSELF.",90,1213);ctx.font="17px Arial";ctx.fillStyle="#344054";ctx.fillText("Read the original posts. Understand the full story.",90,1242);ctx.fillStyle="#071229";ctx.fillRect(0,1290,W,60);ctx.textAlign="center";ctx.font='900 22px "Roboto Condensed",Arial';ctx.fillStyle="#4d8dff";ctx.fillText("duallens.ai",540,1328);ctx.textAlign="left"}

function profileUrlFromHandle(handle){
  const clean = String(handle || "").trim().replace(/^@/,"");
  return clean ? `https://x.com/${encodeURIComponent(clean)}` : "#";
}
function load(input,side){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{state[side+"Image"]=img;render()};img.src=r.result};r.readAsDataURL(f)}
async function blob(type="image/png",q){await fonts();render();return new Promise(res=>canvas.toBlob(res,type,q))}
function download(b,n){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function saveJpeg(){const b=await blob("image/jpeg",.94),f=new File([b],"duallens-lens-card.jpg",{type:"image/jpeg"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens Lens Card",files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.jpg")}
async function share(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.png")}
async function copy(){const b=await blob();try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})])}catch{download(b,"duallens-lens-card.png")}}
async function postX(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent($("postCopy").value),"_blank")}
async function preview(){await fonts();render();$("phoneCopy").textContent=$("postCopy").value;$("phoneImage").src=canvas.toDataURL("image/png");$("previewDialog").showModal()}
["headline","distanceScore","distanceCaption","leftName","rightName","leftSummary","rightSummary"].forEach(id=>$(id).addEventListener("input",()=>{$("distanceOutput").value=Number($("distanceScore").value).toFixed(1)+" / 10";render()}));

$("leftImageInput").addEventListener("change",e=>load(e.target,"left"));$("rightImageInput").addEventListener("change",e=>load(e.target,"right"));$("shareBtn").addEventListener("click",share);$("saveJpegBtn").addEventListener("click",saveJpeg);$("copyImageBtn").addEventListener("click",copy);$("openXBtn").addEventListener("click",postX);$("downloadBtn").addEventListener("click",async()=>download(await blob(),"duallens-lens-card.png"));$("previewBtn").addEventListener("click",preview);$("closePreviewBtn").addEventListener("click",()=>$("previewDialog").close());
canvas.addEventListener("click",(event)=>{
  const rect=canvas.getBoundingClientRect();
  const x=(event.clientX-rect.left)*(canvas.width/rect.width);
  const y=(event.clientY-rect.top)*(canvas.height/rect.height);

  // Handle row zones inside each lens card.
  if(y>=955 && y<=1015){
    if(x>=24 && x<=524){
      window.open(profileUrlFromHandle($("leftName").value),"_blank","noopener,noreferrer");
    }else if(x>=556 && x<=1056){
      window.open(profileUrlFromHandle($("rightName").value),"_blank","noopener,noreferrer");
    }
  }
});

fonts().then(render);
