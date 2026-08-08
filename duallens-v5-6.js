const $=id=>document.getElementById(id),canvas=$("liveCanvas"),ctx=canvas.getContext("2d");
const state={layout:"stacked",leftImage:null,rightImage:null,leftMode:"readable",rightMode:"readable",leftZoom:1.18,rightZoom:1.18};
async function fonts(){if(document.fonts?.load)await Promise.all([document.fonts.load('900 58px "Roboto Condensed"'),document.fonts.ready]).catch(()=>{})}
function rr(x,y,w,h,r,fill,stroke,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function wrap(t,m,f){ctx.font=f;const words=String(t||"").trim().split(/\s+/).filter(Boolean),rows=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>m&&line){rows.push(line);line=word}else line=test}if(line)rows.push(line);return rows}
function text(t,x,y,m,lh,f,c,n=99,a="left"){ctx.font=f;ctx.fillStyle=c;ctx.textAlign=a;wrap(t,m,f).slice(0,n).forEach((r,i)=>ctx.fillText(r,x,y+i*lh));ctx.textAlign="left"}
function logo(x,y,s=1){ctx.fillStyle="#185fe6";ctx.beginPath();ctx.arc(x-25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ef3038";ctx.beginPath();ctx.arc(x+25*s,y,26*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(7,18,41,.65)";ctx.beginPath();ctx.ellipse(x,y,15*s,26*s,0,0,Math.PI*2);ctx.fill()}
function image(img,x,y,w,h,mode="full",zoom=1){
  if(!img){
    rr(x,y,w,h,16,"#f8fafc","#cbd5e1",2);
    ctx.textAlign="center";
    ctx.font="800 20px Arial";
    ctx.fillStyle="#667085";
    ctx.fillText("Upload screenshot",x+w/2,y+h/2);
    ctx.textAlign="left";
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,16);
  ctx.clip();
  ctx.fillStyle="#fff";
  ctx.fillRect(x,y,w,h);

  if(mode==="full"){
    // Full mode preserves the entire screenshot at zoom 1.0.
    // Higher zoom enlarges it while keeping the TOP-LEFT anchored.
    const pad=10;
    const sw=w-pad*2;
    const sh=h-pad*2;

    const fitScale=Math.min(
      sw/img.naturalWidth,
      sh/img.naturalHeight
    );

    const scale=fitScale*zoom;
    const dw=img.naturalWidth*scale;
    const dh=img.naturalHeight*scale;

    // Keep the TOP-LEFT of the screenshot locked in place.
    // As zoom increases, the image grows down and to the right,
    // preserving the tweet text/header at the top.
    const dx=x+pad;
    const dy=y+pad;

    ctx.drawImage(
      img,
      0,0,img.naturalWidth,img.naturalHeight,
      dx,dy,dw,dh
    );
  }else{
    // Readable mode remains width-fill + zoom.
    const baseScale=w/img.naturalWidth;
    const scale=baseScale*zoom;
    const dw=img.naturalWidth*scale;
    const dh=img.naturalHeight*scale;
    const dx=x+(w-dw)/2;
    const dy=y+(h-dh)/2;

    ctx.drawImage(
      img,
      0,0,img.naturalWidth,img.naturalHeight,
      dx,dy,dw,dh
    );
  }

  ctx.restore();
}
function meter(score,x,y,w){const n=10,g=6,sw=(w-g*(n-1))/n;for(let i=0;i<n;i++){const t=i/(n-1),r=Math.round(24+(239-24)*t),gg=Math.round(95+(48-95)*t),b=Math.round(230+(56-230)*t);rr(x+i*(sw+g),y,sw,28,4,`rgb(${r},${gg},${b})`)}rr(x+w+14,y-2,82,34,17,"#071229");ctx.textAlign="center";ctx.font='900 18px "Roboto Condensed",Arial';ctx.fillStyle="#fff";ctx.fillText(Number(score).toFixed(1)+"/10",x+w+55,y+22);ctx.textAlign="left"}
function renderSideBySide(){
  const W=1080,H=1350;
  ctx.clearRect(0,0,W,H);

  // Warm editorial off-white base.
  ctx.fillStyle="#faf9f6";
  ctx.fillRect(0,0,W,H);

  // Soft blue/red backsplash.
  const leftGlow=ctx.createRadialGradient(0,520,20,0,520,700);
  leftGlow.addColorStop(0,"rgba(24,95,230,.13)");
  leftGlow.addColorStop(.55,"rgba(24,95,230,.055)");
  leftGlow.addColorStop(1,"rgba(24,95,230,0)");
  ctx.fillStyle=leftGlow;
  ctx.fillRect(0,0,W,H);

  const rightGlow=ctx.createRadialGradient(W,520,20,W,520,700);
  rightGlow.addColorStop(0,"rgba(239,48,56,.13)");
  rightGlow.addColorStop(.55,"rgba(239,48,56,.055)");
  rightGlow.addColorStop(1,"rgba(239,48,56,0)");
  ctx.fillStyle=rightGlow;
  ctx.fillRect(0,0,W,H);

  // Subtle contour / halftone texture.
  ctx.save();
  ctx.globalAlpha=.075;
  ctx.lineWidth=1.5;

  ctx.strokeStyle="#185fe6";
  for(let r=120;r<=610;r+=58){
    ctx.beginPath();
    ctx.arc(20,150,r,0,Math.PI*2);
    ctx.stroke();
  }

  ctx.strokeStyle="#ef3038";
  for(let r=120;r<=610;r+=58){
    ctx.beginPath();
    ctx.arc(1060,150,r,0,Math.PI*2);
    ctx.stroke();
  }

  ctx.globalAlpha=.045;
  ctx.fillStyle="#185fe6";
  for(let yy=24;yy<260;yy+=20){
    for(let xx=18;xx<180;xx+=20){
      const dx=xx-18,dy=yy-24;
      if(dx+dy<300){
        ctx.beginPath();
        ctx.arc(xx,yy,2.2,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle="#ef3038";
  for(let yy=24;yy<260;yy+=20){
    for(let xx=900;xx<1065;xx+=20){
      const dx=1065-xx,dy=yy-24;
      if(dx+dy<300){
        ctx.beginPath();
        ctx.arc(xx,yy,2.2,0,Math.PI*2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // Brand/header.
  logo(318,76,1.15);

  ctx.fillStyle="#071229";
  ctx.font='900 74px "Roboto Condensed",Arial';
  ctx.fillText("DualLens",388,102);

  ctx.font='800 17px Arial';
  ctx.fillStyle="#344054";
  ctx.fillText("SAME STORY. DIFFERENT LENS.",388,136);

  ctx.lineWidth=4;
  ctx.strokeStyle="#185fe6";
  ctx.beginPath();
  ctx.moveTo(130,128);
  ctx.lineTo(292,128);
  ctx.stroke();

  ctx.strokeStyle="#ef3038";
  ctx.beginPath();
  ctx.moveTo(805,128);
  ctx.lineTo(965,128);
  ctx.stroke();

  // Headline.
  text(
    $("headline").value.trim().toUpperCase(),
    540,
    245,
    970,
    76,
    '900 italic 82px "Roboto Condensed",Arial',
    "#071229",
    2,
    "center"
  );

  // Perspective distance.
  ctx.textAlign="center";
  ctx.font='900 19px "Roboto Condensed",Arial';
  ctx.fillStyle="#071229";
  ctx.fillText("PERSPECTIVE DISTANCE",540,390);

  ctx.strokeStyle="#aeb8c8";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(175,380);
  ctx.lineTo(390,380);
  ctx.moveTo(690,380);
  ctx.lineTo(905,380);
  ctx.stroke();

  meter($("distanceScore").value,285,410,410);

  ctx.font='900 20px "Roboto Condensed",Arial';
  ctx.fillStyle="#344054";
  ctx.fillText($("distanceCaption").value.trim().toUpperCase(),540,472);

  // Lens cards: same width, more usable vertical area.
  const lx=22,rx=558,cy=500,cw=500,ch=748;

  rr(lx,cy,cw,ch,24,"#fff","#185fe6",3);
  rr(rx,cy,cw,ch,24,"#fff","#ef3038",3);

  // Lens headers.
  rr(lx,cy,cw,78,24,"#185fe6");
  ctx.fillStyle="#185fe6";
  ctx.fillRect(lx,cy+50,cw,28);

  rr(rx,cy,cw,78,24,"#ef3038");
  ctx.fillStyle="#ef3038";
  ctx.fillRect(rx,cy+50,cw,28);

  ctx.textAlign="left";
  ctx.font='900 italic 39px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText(($("leftLabel").value||"LEFT LENS").toUpperCase(),lx+28,cy+51);
  ctx.fillText(($("rightLabel").value||"RIGHT LENS").toUpperCase(),rx+28,cy+51);

  // Screenshots now use almost the full card area.
  const imageXPad=10;
  const imageY=cy+90;
  const imageH=596;

  image(
    state.leftImage,
    lx+imageXPad,
    imageY,
    cw-imageXPad*2,
    imageH,
    state.leftMode,
    state.leftZoom
  );

  image(
    state.rightImage,
    rx+imageXPad,
    imageY,
    cw-imageXPad*2,
    imageH,
    state.rightMode,
    state.rightZoom
  );

  // Handles sit close to screenshots instead of floating in large whitespace.
  ctx.font='900 24px Arial';
  ctx.fillStyle="#185fe6";
  ctx.fillText(
    ($("leftName").value||"Left source")+"  ↗",
    lx+cw/2,
    cy+718
  );

  ctx.fillStyle="#ef3038";
  ctx.fillText(
    ($("rightName").value||"Right source")+"  ↗",
    rx+cw/2,
    cy+718
  );

  // Compare badge remains centered over the gutter.
  rr(491,826,98,78,39,"#071229","#ffffff",2);
  ctx.fillStyle="#fff";
  ctx.font='900 23px "Roboto Condensed",Arial';
  ctx.fillText("VS",540,874);

  // Footer.
  ctx.fillStyle="#071229";
  ctx.fillRect(0,1285,W,65);

  ctx.strokeStyle="#185fe6";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(35,1317);
  ctx.lineTo(390,1317);
  ctx.stroke();

  ctx.strokeStyle="#ef3038";
  ctx.beginPath();
  ctx.moveTo(690,1317);
  ctx.lineTo(1045,1317);
  ctx.stroke();

  ctx.textAlign="center";
  ctx.font='900 28px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText("duallens.ai",540,1326);

  ctx.textAlign="left";
}

function drawStackScreenshot(img,x,y,w,h,mode="readable",zoom=1){
  if(!img){
    rr(x,y,w,h,18,"#fff","#cbd5e1",2);
    ctx.textAlign="center";
    ctx.font="800 22px Arial";
    ctx.fillStyle="#667085";
    ctx.fillText("Upload screenshot",x+w/2,y+h/2);
    ctx.textAlign="left";
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,18);
  ctx.clip();
  ctx.fillStyle="#fff";
  ctx.fillRect(x,y,w,h);

  if(mode==="full"){
    // Fit entire screenshot at zoom 1.0.
    // Allow zooming in while keeping the TOP-LEFT anchored.
    const pad=8;
    const sw=w-pad*2;
    const sh=h-pad*2;

    const fitScale=Math.min(
      sw/img.naturalWidth,
      sh/img.naturalHeight
    );

    const scale=fitScale*zoom;
    const dw=img.naturalWidth*scale;
    const dh=img.naturalHeight*scale;

    const dx=x+pad;
    const dy=y+pad;

    ctx.drawImage(
      img,
      0,0,img.naturalWidth,img.naturalHeight,
      dx,dy,dw,dh
    );
  }else{
    const scale=(w/img.naturalWidth)*zoom;
    const dw=img.naturalWidth*scale;
    const dh=img.naturalHeight*scale;
    const dx=x+(w-dw)/2;
    const dy=y+(h-dh)/2;

    ctx.drawImage(
      img,
      0,0,img.naturalWidth,img.naturalHeight,
      dx,dy,dw,dh
    );
  }

  ctx.restore();
}
function renderStacked(){
  const W=1080,H=1440;
  canvas.width=W;
  canvas.height=H;
  ctx.clearRect(0,0,W,H);

  // Editorial off-white base + soft blue/red backsplash.
  ctx.fillStyle="#faf9f6";
  ctx.fillRect(0,0,W,H);

  const lg=ctx.createRadialGradient(0,460,20,0,460,640);
  lg.addColorStop(0,"rgba(24,95,230,.12)");
  lg.addColorStop(.58,"rgba(24,95,230,.045)");
  lg.addColorStop(1,"rgba(24,95,230,0)");
  ctx.fillStyle=lg;
  ctx.fillRect(0,0,W,H);

  const rg=ctx.createRadialGradient(W,460,20,W,460,640);
  rg.addColorStop(0,"rgba(239,48,56,.12)");
  rg.addColorStop(.58,"rgba(239,48,56,.045)");
  rg.addColorStop(1,"rgba(239,48,56,0)");
  ctx.fillStyle=rg;
  ctx.fillRect(0,0,W,H);

  // Subtle contours.
  ctx.save();
  ctx.globalAlpha=.055;
  ctx.lineWidth=1.5;
  ctx.strokeStyle="#185fe6";
  for(let r=120;r<=560;r+=58){
    ctx.beginPath();ctx.arc(0,145,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.strokeStyle="#ef3038";
  for(let r=120;r<=560;r+=58){
    ctx.beginPath();ctx.arc(W,145,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();

  // Compact brand/header.
  logo(338,48,.82);
  ctx.fillStyle="#071229";
  ctx.font='900 52px "Roboto Condensed",Arial';
  ctx.fillText("DualLens",394,68);

  ctx.font='800 12px Arial';
  ctx.fillStyle="#344054";
  ctx.fillText("SAME STORY. DIFFERENT LENS.",394,90);

  // Headline tightened upward slightly.
  text(
    $("headline").value.trim().toUpperCase(),
    540,
    142,
    980,
    56,
    '900 italic 60px "Roboto Condensed",Arial',
    "#071229",
    2,
    "center"
  );

  // Perspective distance tightened.
  ctx.textAlign="center";
  ctx.font='900 14px "Roboto Condensed",Arial';
  ctx.fillStyle="#071229";
  ctx.fillText("PERSPECTIVE DISTANCE",540,228);

  meter($("distanceScore").value,320,246,340);

  ctx.font='900 15px "Roboto Condensed",Arial';
  ctx.fillStyle="#344054";
  ctx.fillText($("distanceCaption").value.trim().toUpperCase(),540,296);

  // LEFT LENS banner.
  const x=18;
  const w=1044;
  const shotX=20;
  const shotW=1040;
  const shotH=438;
  let y=318;

  rr(x,y,w,56,18,"#185fe6");
  ctx.fillStyle="#185fe6";
  ctx.fillRect(x,y+36,w,20);

  ctx.textAlign="left";
  ctx.font='900 italic 31px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText(($("leftLabel").value||"LEFT LENS").toUpperCase(),x+24,y+38);

  // Screenshot nearly edge-to-edge, no inner white card look.
  y+=58;
  drawStackScreenshot(
    state.leftImage,
    shotX,
    y,
    shotW,
    shotH,
    state.leftMode,
    state.leftZoom
  );

  // Source handle close to image.
  y+=shotH+8;
  ctx.textAlign="center";
  ctx.font='900 23px Arial';
  ctx.fillStyle="#185fe6";
  ctx.fillText(($("leftName").value||"Left source")+"  ↗",540,y);

  // Professional VS divider with less dead space.
  y+=30;
  ctx.strokeStyle="rgba(7,18,41,.18)";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(90,y);
  ctx.lineTo(455,y);
  ctx.moveTo(625,y);
  ctx.lineTo(990,y);
  ctx.stroke();

  rr(484,y-22,112,44,22,"#071229","#ffffff",2);
  ctx.font='900 21px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText("VS",540,y+7);

  // RIGHT LENS banner.
  y+=30;

  rr(x,y,w,56,18,"#ef3038");
  ctx.fillStyle="#ef3038";
  ctx.fillRect(x,y+36,w,20);

  ctx.textAlign="left";
  ctx.font='900 italic 31px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText(($("rightLabel").value||"RIGHT LENS").toUpperCase(),x+24,y+38);

  // Screenshot nearly edge-to-edge.
  y+=58;
  drawStackScreenshot(
    state.rightImage,
    shotX,
    y,
    shotW,
    shotH,
    state.rightMode,
    state.rightZoom
  );

  y+=shotH+8;
  ctx.textAlign="center";
  ctx.font='900 23px Arial';
  ctx.fillStyle="#ef3038";
  ctx.fillText(($("rightName").value||"Right source")+"  ↗",540,y);

  // Minimal footer.
  ctx.fillStyle="#071229";
  ctx.fillRect(0,H-42,W,42);

  ctx.strokeStyle="#185fe6";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(25,H-21);
  ctx.lineTo(400,H-21);
  ctx.stroke();

  ctx.strokeStyle="#ef3038";
  ctx.beginPath();
  ctx.moveTo(680,H-21);
  ctx.lineTo(1055,H-21);
  ctx.stroke();

  ctx.font='900 21px "Roboto Condensed",Arial';
  ctx.fillStyle="#fff";
  ctx.fillText("duallens.ai",540,H-13);

  ctx.textAlign="left";
}
function render(){
  if(state.layout==="stacked"){
    renderStacked();
  }else{
    canvas.width=1080;canvas.height=1350;
    renderSideBySide();
  }
}

function load(input,side){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{state[side+"Image"]=img;render()};img.src=r.result};r.readAsDataURL(f)}
async function blob(type="image/png",q){await fonts();render();return new Promise(res=>canvas.toBlob(res,type,q))}
function download(b,n){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function saveJpeg(){const b=await blob("image/jpeg",.94),f=new File([b],"duallens-lens-card.jpg",{type:"image/jpeg"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens Lens Card",files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.jpg")}
async function share(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}download(b,"duallens-lens-card.png")}
async function copy(){const b=await blob();try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})])}catch{download(b,"duallens-lens-card.png")}}
async function postX(){const b=await blob(),f=new File([b],"duallens-lens-card.png",{type:"image/png"});try{if(navigator.canShare?.({files:[f]})){await navigator.share({title:"DualLens",text:$("postCopy").value,files:[f]});return}}catch(e){if(e.name==="AbortError")return}window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent($("postCopy").value),"_blank")}
async function preview(){await fonts();render();$("phoneCopy").textContent=$("postCopy").value;$("phoneImage").src=canvas.toDataURL("image/png");$("previewDialog").showModal()}
["headline","distanceScore","distanceCaption","leftLabel","rightLabel","leftName","rightName"].forEach(id=>$(id).addEventListener("input",()=>{$("distanceOutput").value=Number($("distanceScore").value).toFixed(1)+" / 10";render()}));


function setLayout(layout){
  state.layout=layout;
  $("stackedLayoutBtn").classList.toggle("active",layout==="stacked");
  $("sideLayoutBtn").classList.toggle("active",layout==="side");
  render();
}
$("stackedLayoutBtn").addEventListener("click",()=>setLayout("stacked"));
$("sideLayoutBtn").addEventListener("click",()=>setLayout("side"));

function setImageMode(side,mode){
  state[side+"Mode"]=mode;
  $(side+"ReadableBtn").classList.toggle("active",mode==="readable");
  $(side+"FullBtn").classList.toggle("active",mode==="full");
  render();
}
$("leftReadableBtn").addEventListener("click",()=>setImageMode("left","readable"));
$("leftFullBtn").addEventListener("click",()=>setImageMode("left","full"));
$("rightReadableBtn").addEventListener("click",()=>setImageMode("right","readable"));
$("rightFullBtn").addEventListener("click",()=>setImageMode("right","full"));
$("leftZoom").addEventListener("input",e=>{state.leftZoom=Number(e.target.value);render();});
$("rightZoom").addEventListener("input",e=>{state.rightZoom=Number(e.target.value);render();});

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
