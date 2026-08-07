const $=id=>document.getElementById(id),canvas=$("liveCanvas"),ctx=canvas.getContext("2d");
const state={leftImage:null,rightImage:null};
async function fonts(){if(document.fonts?.load)await Promise.all([document.fonts.load('900 58px "Roboto Condensed"'),document.fonts.ready]).catch(()=>{})}
function rr(x,y,w,h,r,fill,stroke,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function wrap(t,m,f){ctx.font=f;const words=String(t||"").trim().split(/\s+/).filter(Boolean),rows=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>m&&line){rows.push(line);line=word}else line=test}if(line)rows.push(line);return rows}
function text(t,x,y,m,lh,f,c,n=99,a="left"){ctx.font=f;ctx.fillStyle=c;ctx.textAlign=a;wrap(t,m,f).slice(0,n).forEach((r,i)=>ctx.fillText(r,x,y+i*lh));ctx.textAlign="left"}
function logo(x,y,s=1){ctx.fillStyle="#185fe6";ctx.beginPath();ctx.arc(x-25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ef3038";ctx.beginPath();ctx.arc(x+25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(7,18,41,.65)";ctx.beginPath();ctx.ellipse(x,y,15*s,26*s,0,0,Math.PI*2);ctx.fill()}
function image(img,x,y,w,h){
  if(!img){
    rr(x,y,w,h,16,"#f8fafc","#cbd5e1",2);
    ctx.textAlign="center";
    ctx.font="800 20px Arial";
    ctx.fillStyle="#667085";
    ctx.fillText("Upload screenshot",x+w/2,y+h/2);
    ctx.textAlign="left";
    return;
  }

  // True full-image fit for BOTH lens cards.
  // A small safe margin guarantees no edge is clipped.
  const safePad=12;
  const safeX=x+safePad;
  const safeY=y+safePad;
  const safeW=w-safePad*2;
  const safeH=h-safePad*2;

  const scale=Math.min(
    safeW/img.naturalWidth,
    safeH/img.naturalHeight
  );

  const drawW=img.naturalWidth*scale;
  const drawH=img.naturalHeight*scale;
  const drawX=safeX+(safeW-drawW)/2;
  const drawY=safeY+(safeH-drawH)/2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,16);
  ctx.clip();

  ctx.fillStyle="#fff";
  ctx.fillRect(x,y,w,h);

  ctx.drawImage(
    img,
    0,0,img.naturalWidth,img.naturalHeight,
    drawX,drawY,drawW,drawH
  );

  ctx.restore();
}
function meter(score,x,y,w){const n=10,g=6,sw=(w-g*(n-1))/n;for(let i=0;i<n;i++){const t=i/(n-1),r=Math.round(24+(239-24)*t),gg=Math.round(95+(48-95)*t),b=Math.round(230+(56-230)*t);rr(x+i*(sw+g),y,sw,28,4,`rgb(${r},${gg},${b})`)}rr(x+w+14,y-2,82,34,17,"#071229");ctx.textAlign="center";ctx.font='900 18px "Roboto Condensed",Arial';ctx.fillStyle="#fff";ctx.fillText(Number(score).toFixed(1)+"/10",x+w+55,y+22);ctx.textAlign="left"}
function render(){
  const W=1080,H=1350;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.globalAlpha=.045;
  ctx.strokeStyle="#185fe6";
  ctx.lineWidth=2;
  for(let r=130;r<=520;r+=65){
    ctx.beginPath();ctx.arc(50,180,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.strokeStyle="#ef3038";
  for(let r=130;r<=520;r+=65){
    ctx.beginPath();ctx.arc(1030,180,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();

  logo(290,58,1.15);
  ctx.fillStyle="#071229";
  ctx.font='900 74px "Roboto Condensed",Arial';
  ctx.fillText("DualLens",360,84);
  ctx.font='800 17px Arial';
  ctx.fillStyle="#344054";
  ctx.fillText("SAME STORY. DIFFERENT LENS.",360,118);

  ctx.lineWidth=4;
  ctx.strokeStyle="#185fe6";
  ctx.beginPath();ctx.moveTo(125,110);ctx.lineTo(285,110);ctx.stroke();
  ctx.strokeStyle="#ef3038";
  ctx.beginPath();ctx.moveTo(795,110);ctx.lineTo(955,110);ctx.stroke();

  text(
    $("headline").value.trim().toUpperCase(),
    540,205,970,76,
    '900 italic 82px "Roboto Condensed",Arial',
    "#071229",2,"center"
  );

  ctx.textAlign="center";
  ctx.font='900 19px "Roboto Condensed",Arial';
  ctx.fillStyle="#071229";
  ctx.fillText("PERSPECTIVE DISTANCE",540,355);

  ctx.strokeStyle="#aeb8c8";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(175,345);ctx.lineTo(390,345);
  ctx.moveTo(690,345);ctx.lineTo(905,345);
  ctx.stroke();

  meter($("distanceScore").value,285,375,410);

  ctx.font='900 20px "Roboto Condensed",Arial';
  ctx.fillStyle="#344054";
  ctx.fillText($("distanceCaption").value.trim().toUpperCase(),540,438);

  const lx=28,rx=552,cy=468,cw=500,ch=760;
  rr(lx,cy,cw,ch,24,"#fff","#185fe6",3);
  rr(rx,cy,cw,ch,24,"#fff","#ef3038",3);

  rr(lx,cy,cw,78,24,"#185fe6");
  ctx.fillStyle="#185fe6";ctx.fillRect(lx,cy+50,cw,28);
  rr(rx,cy,cw,78,24,"#ef3038");
  ctx.fillStyle="#ef3038";ctx.fillRect(rx,cy+50,cw,28);

  ctx.textAlign="center";
  ctx.font='900 italic 39px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText("LEFT LENS",lx+cw/2,cy+51);
  ctx.fillText("RIGHT LENS",rx+cw/2,cy+51);

  const imageY=cy+100;
  const imageH=560;
  image(state.leftImage,lx+18,imageY,cw-36,imageH);
  image(state.rightImage,rx+18,imageY,cw-36,imageH);

  ctx.font='900 24px Arial';
  ctx.fillStyle="#185fe6";
  ctx.fillText(($("leftName").value||"Left source")+"  ↗",lx+cw/2,cy+718);
  ctx.fillStyle="#ef3038";
  ctx.fillText(($("rightName").value||"Right source")+"  ↗",rx+cw/2,cy+718);

  rr(489,770,102,102,51,"#fff","#aeb8c8",2);
  ctx.fillStyle="#071229";
  ctx.font='900 22px "Roboto Condensed",Arial';
  ctx.fillText("COMPARE",540,810);
  ctx.font='800 15px Arial';
  ctx.fillText("TWO VIEWS",540,837);

  ctx.fillStyle="#071229";
  ctx.fillRect(0,1285,W,65);

  ctx.strokeStyle="#185fe6";
  ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(35,1317);ctx.lineTo(390,1317);ctx.stroke();
  ctx.strokeStyle="#ef3038";
  ctx.beginPath();ctx.moveTo(690,1317);ctx.lineTo(1045,1317);ctx.stroke();

  ctx.textAlign="center";
  ctx.font='900 28px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText("duallens.ai",540,1326);
  ctx.textAlign="left";
}
function load(input,side){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{state[side+"Image"]=img;render()};img.src=r.result};r.readAsDataURL(f)}
async function blob(type="image/png",q){await fonts();render();return new Promise(res=>canvas.toBlob(res,type,q))}
function download(b,n){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function saveJpeg(){const b=await blob("image/jpeg",.94),f=new File([b],"duallens-lens-card.jpg",{type:"image/jpeg"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens Lens Card",files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.jpg")}
async function share(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.png")}
async function copy(){const b=await blob();try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})])}catch{download(b,"duallens-lens-card.png")}}
async function postX(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent($("postCopy").value),"_blank")}
async function preview(){await fonts();render();$("phoneCopy").textContent=$("postCopy").value;$("phoneImage").src=canvas.toDataURL("image/png");$("previewDialog").showModal()}
["headline","distanceScore","distanceCaption","leftName","rightName"].forEach(id=>$(id).addEventListener("input",()=>{$("distanceOutput").value=Number($("distanceScore").value).toFixed(1)+" / 10";render()}));

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
