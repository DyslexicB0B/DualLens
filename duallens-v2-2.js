const $ = (id) => document.getElementById(id);
const canvas = $("liveCanvas");
const ctx = canvas.getContext("2d");

const PAGE = {
  left:  { x: 58,  y: 300, w: 438, maxH: 820 },
  right: { x: 584, y: 300, w: 438, maxH: 820 }
};

function lensState() {
  return {
    image: null,
    fit: "smart",
    scale: 1,
    offsetX: 0,
    offsetY: 0
  };
}

const state = {
  left: lensState(),
  right: lensState(),
  activeSide: null,
  pointers: new Map(),
  dragStart: null,
  pinchStart: null,
  lastTapAt: 0,
  lastTapSide: null
};

function wrap(text, maxWidth, font) {
  ctx.font = font;
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const rows = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      rows.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) rows.push(line);
  return rows;
}

function drawText(text, x, y, maxWidth, lineHeight, font, color, maxLines = 99, align = "left") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;

  wrap(text, maxWidth, font).slice(0, maxLines).forEach((row, index) => {
    ctx.fillText(row, x, y + index * lineHeight);
  });

  ctx.textAlign = "left";
}

function roundedRect(x, y, w, h, radius, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function baseGeometry(side) {
  const lens = state[side];
  const img = lens.image;
  const page = PAGE[side];

  if (!img || !img.naturalWidth) {
    return { w: page.w, h: 620, scale: 1 };
  }

  if (lens.fit === "full") {
    const scale = Math.min(page.w / img.naturalWidth, page.maxH / img.naturalHeight);
    return {
      w: img.naturalWidth * scale,
      h: img.naturalHeight * scale,
      scale
    };
  }

  // "Match width": fill the full column width without cropping horizontally.
  const scale = page.w / img.naturalWidth;
  return {
    w: page.w,
    h: Math.min(img.naturalHeight * scale, page.maxH),
    scale
  };
}

function clampCrop(side) {
  const lens = state[side];
  const img = lens.image;
  const page = PAGE[side];
  if (!img) return;

  const base = baseGeometry(side);
  const drawW = img.naturalWidth * base.scale * lens.scale;
  const drawH = img.naturalHeight * base.scale * lens.scale;
  const viewportW = base.w;
  const viewportH = base.h;

  if (drawW <= viewportW) {
    lens.offsetX = 0;
  } else {
    const maxX = (drawW - viewportW) / 2;
    lens.offsetX = Math.max(-maxX, Math.min(maxX, lens.offsetX));
  }

  // Top-aligned screenshots: allow vertical movement only when image exceeds viewport.
  if (drawH <= viewportH) {
    lens.offsetY = 0;
  } else {
    const minY = -(drawH - viewportH);
    lens.offsetY = Math.max(minY, Math.min(0, lens.offsetY));
  }
}

function imageViewport(side) {
  const page = PAGE[side];
  const base = baseGeometry(side);

  return {
    x: page.x + (page.w - base.w) / 2,
    y: page.y,
    w: base.w,
    h: base.h
  };
}

function drawScreenshot(side) {
  const lens = state[side];
  const img = lens.image;
  const view = imageViewport(side);
  const accent = side === "left" ? "#185fe6" : "#ef3038";

  if (!img || !img.naturalWidth) {
    roundedRect(view.x, view.y, view.w, view.h, 18, "rgba(255,255,255,.72)", `${accent}55`, 2);
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(view.x + 12, view.y + 12, view.w - 24, view.h - 24);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#667085";
    ctx.font = "800 22px Arial";
    ctx.fillText(`Upload ${side} screenshot`, view.x + view.w / 2, view.y + view.h / 2);
    ctx.textAlign = "left";
    return view;
  }

  clampCrop(side);

  const base = baseGeometry(side);
  const totalScale = base.scale * lens.scale;
  const drawW = img.naturalWidth * totalScale;
  const drawH = img.naturalHeight * totalScale;

  const drawX = view.x + (view.w - drawW) / 2 + lens.offsetX;
  const drawY = view.y + lens.offsetY;

  // Soft shadow behind the screenshot itself; no tall outer card.
  ctx.save();
  ctx.shadowColor = "rgba(15,23,42,.18)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  roundedRect(view.x, view.y, view.w, view.h, 18, "#fff", null);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(view.x, view.y, view.w, view.h, 18);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(view.x, view.y, view.w, view.h);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  roundedRect(view.x, view.y, view.w, view.h, 18, null, `${accent}66`, 2);

  if (state.activeSide === side) {
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(view.x + 4, view.y + 4, view.w - 8, view.h - 8);
    ctx.restore();
  }

  return view;
}

function render() {
  const W = 1080;
  const H = 1350;

  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, 0);
  bg.addColorStop(0, "#dfeaff");
  bg.addColorStop(.48, "#faf6ef");
  bg.addColorStop(1, "#ffe2e2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const leftGlow = ctx.createRadialGradient(90, 650, 20, 90, 650, 520);
  leftGlow.addColorStop(0, "rgba(24,95,230,.20)");
  leftGlow.addColorStop(1, "rgba(24,95,230,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, W, H);

  const rightGlow = ctx.createRadialGradient(990, 650, 20, 990, 650, 520);
  rightGlow.addColorStop(0, "rgba(239,48,56,.20)");
  rightGlow.addColorStop(1, "rgba(239,48,56,0)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#185fe6";
  ctx.beginPath();
  ctx.arc(W / 2 - 18, 48, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef3038";
  ctx.beginPath();
  ctx.arc(W / 2 + 18, 48, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.font = "900 40px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("DualLens", W / 2, 67);

  ctx.font = "900 13px Arial";
  ctx.fillStyle = "#667085";
  ctx.fillText("SAME STORY. DIFFERENT LENS.", W / 2, 94);

  drawText(
    $("headline").value.trim().toUpperCase(),
    W / 2,
    135,
    980,
    58,
    "900 54px Arial",
    "#0d1730",
    3,
    "center"
  );

  ctx.font = "900 19px Arial";
  ctx.fillStyle = "#185fe6";
  ctx.fillText("LEFT LENS", PAGE.left.x + PAGE.left.w / 2, 270);
  ctx.fillStyle = "#ef3038";
  ctx.fillText("RIGHT LENS", PAGE.right.x + PAGE.right.w / 2, 270);

  const leftView = drawScreenshot("left");
  const rightView = drawScreenshot("right");

  // Source pills sit directly below each image, regardless of image height.
  const leftChipY = Math.min(leftView.y + leftView.h + 16, 1165);
  const rightChipY = Math.min(rightView.y + rightView.h + 16, 1165);

  roundedRect(PAGE.left.x, leftChipY, PAGE.left.w, 48, 24, "#fff", "rgba(24,95,230,.45)", 2);
  roundedRect(PAGE.right.x, rightChipY, PAGE.right.w, 48, 24, "#fff", "rgba(239,48,56,.45)", 2);

  ctx.font = "900 18px Arial";
  ctx.fillStyle = "#185fe6";
  ctx.fillText($("leftName").value.trim() || "Left source", PAGE.left.x + PAGE.left.w / 2, leftChipY + 31);
  ctx.fillStyle = "#ef3038";
  ctx.fillText($("rightName").value.trim() || "Right source", PAGE.right.x + PAGE.right.w / 2, rightChipY + 31);

  // Center divider is independent of screenshot heights.
  ctx.strokeStyle = "#b6beca";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, PAGE.left.y);
  ctx.lineTo(W / 2, 1165);
  ctx.stroke();

  roundedRect(W / 2 - 32, 650 - 32, 64, 64, 32, "#fff", "#b6beca", 2);
  ctx.font = "900 23px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("VS", W / 2, 658);

  ctx.font = "900 26px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("DualLens", W / 2, 1290);
  ctx.textAlign = "left";
}

function loadImage(input, side) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    $("message").textContent = "Please choose an image.";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      state[side].image = img;
      state[side].fit = "smart";
      state[side].scale = 1;
      state[side].offsetX = 0;
      state[side].offsetY = 0;
      state.activeSide = side;

      document.querySelectorAll(`.fit-btn[data-side="${side}"]`).forEach((button) => {
        button.classList.toggle("active", button.dataset.fit === "smart");
      });

      render();
      $("message").textContent =
        `${side === "left" ? "Left" : "Right"} screenshot loaded and aligned to the top.`;
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function sideAt(point) {
  for (const side of ["left", "right"]) {
    const view = imageViewport(side);
    if (
      point.x >= view.x &&
      point.x <= view.x + view.w &&
      point.y >= view.y &&
      point.y <= view.y + view.h
    ) {
      return side;
    }
  }
  return null;
}

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resetCrop(side) {
  state[side].scale = 1;
  state[side].offsetX = 0;
  state[side].offsetY = 0;
  render();
}

canvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);
  const side = sideAt(point);

  if (!side || !state[side].image) return;

  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  state.pointers.set(event.pointerId, point);
  state.activeSide = side;
  canvas.classList.add("dragging");

  const now = Date.now();
  if (state.lastTapSide === side && now - state.lastTapAt < 320) {
    resetCrop(side);
    state.lastTapAt = 0;
    state.lastTapSide = null;
    return;
  }

  state.lastTapAt = now;
  state.lastTapSide = side;

  if (state.pointers.size === 1) {
    state.dragStart = {
      point,
      offsetX: state[side].offsetX,
      offsetY: state[side].offsetY
    };
  } else if (state.pointers.size === 2) {
    const points = [...state.pointers.values()];
    state.pinchStart = {
      distance: pointerDistance(points[0], points[1]),
      scale: state[side].scale
    };
  }

  render();
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.pointers.has(event.pointerId) || !state.activeSide) return;

  event.preventDefault();
  const point = canvasPoint(event);
  state.pointers.set(event.pointerId, point);

  const side = state.activeSide;
  const lens = state[side];

  if (state.pointers.size >= 2 && state.pinchStart) {
    const points = [...state.pointers.values()];
    const distance = pointerDistance(points[0], points[1]);
    const factor = distance / Math.max(1, state.pinchStart.distance);
    lens.scale = Math.max(.55, Math.min(4, state.pinchStart.scale * factor));
    clampCrop(side);
    render();
    return;
  }

  if (state.pointers.size === 1 && state.dragStart) {
    lens.offsetX = state.dragStart.offsetX + (point.x - state.dragStart.point.x);
    lens.offsetY = state.dragStart.offsetY + (point.y - state.dragStart.point.y);
    clampCrop(side);
    render();
  }
});

function endPointer(event) {
  state.pointers.delete(event.pointerId);

  if (state.pointers.size < 2) {
    state.pinchStart = null;
  }

  if (state.pointers.size === 0) {
    state.dragStart = null;
    canvas.classList.remove("dragging");
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener("wheel", (event) => {
  const side = sideAt(canvasPoint(event));
  if (!side || !state[side].image) return;

  event.preventDefault();
  state.activeSide = side;

  const lens = state[side];
  const factor = Math.exp(-event.deltaY * .0015);
  lens.scale = Math.max(.55, Math.min(4, lens.scale * factor));
  clampCrop(side);
  render();
}, { passive: false });

canvas.addEventListener("dblclick", (event) => {
  const side = sideAt(canvasPoint(event));
  if (side && state[side].image) resetCrop(side);
});

function canvasBlob() {
  state.activeSide = null;
  render();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "duallens-comparison.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function share() {
  const blob = await canvasBlob();
  if (!blob) return;

  const file = new File([blob], "duallens-comparison.png", { type: "image/png" });

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "DualLens",
        text: $("postCopy").value.trim(),
        files: [file]
      });
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
  }

  downloadBlob(blob);
}

async function copyImage() {
  const blob = await canvasBlob();
  if (!blob) return;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    $("message").textContent = "Image copied.";
  } catch {
    downloadBlob(blob);
    $("message").textContent = "Image copy is unavailable here, so the PNG was downloaded.";
  }
}

function openX() {
  window.open(
    "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent($("postCopy").value.trim()),
    "_blank",
    "noopener,noreferrer"
  );
}

async function download() {
  const blob = await canvasBlob();
  if (blob) downloadBlob(blob);
}

function preview() {
  state.activeSide = null;
  render();
  $("phoneCopy").textContent = $("postCopy").value;
  $("phoneImage").src = canvas.toDataURL("image/png");
  $("previewDialog").showModal();
}

["headline", "leftName", "rightName", "leftUrl", "rightUrl"].forEach((id) => {
  $(id).addEventListener("input", () => {
    $("leftLiveLink").href = $("leftUrl").value || "#";
    $("rightLiveLink").href = $("rightUrl").value || "#";
    render();
  });
});

document.querySelectorAll(".fit-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const side = button.dataset.side;

    document.querySelectorAll(`.fit-btn[data-side="${side}"]`).forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    state[side].fit = button.dataset.fit;
    resetCrop(side);
    state.activeSide = side;
    render();
  });
});

$("leftImageInput").addEventListener("change", (event) => loadImage(event.target, "left"));
$("rightImageInput").addEventListener("change", (event) => loadImage(event.target, "right"));
$("shareBtn").addEventListener("click", share);
$("copyImageBtn").addEventListener("click", copyImage);
$("openXBtn").addEventListener("click", openX);
$("downloadBtn").addEventListener("click", download);
$("previewBtn").addEventListener("click", preview);
$("closePreviewBtn").addEventListener("click", () => $("previewDialog").close());

$("leftLiveLink").href = $("leftUrl").value;
$("rightLiveLink").href = $("rightUrl").value;
render();
