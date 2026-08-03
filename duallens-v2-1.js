const $ = (id) => document.getElementById(id);
const canvas = $("liveCanvas");
const ctx = canvas.getContext("2d");

const FRAME = {
  left: { x: 68, y: 279, w: 415, h: 860 },
  right: { x: 597, y: 279, w: 415, h: 860 }
};

function newLensState() {
  return {
    image: null,
    fit: "smart",
    scale: 1,
    offsetX: 0,
    offsetY: 0
  };
}

const state = {
  left: newLensState(),
  right: newLensState(),
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
    const test = line ? line + " " + word : word;
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

function baseScaleFor(side) {
  const lens = state[side];
  const img = lens.image;
  const frame = FRAME[side];

  if (!img || !img.naturalWidth) return 1;

  const contain = Math.min(frame.w / img.naturalWidth, frame.h / img.naturalHeight);
  const cover = Math.max(frame.w / img.naturalWidth, frame.h / img.naturalHeight);

  return lens.fit === "full" ? contain : cover;
}

function resetCrop(side) {
  const lens = state[side];
  lens.scale = 1;
  lens.offsetX = 0;
  lens.offsetY = 0;
  render();
}

function clampCrop(side) {
  const lens = state[side];
  const img = lens.image;
  const frame = FRAME[side];
  if (!img) return;

  const totalScale = baseScaleFor(side) * lens.scale;
  const drawW = img.naturalWidth * totalScale;
  const drawH = img.naturalHeight * totalScale;

  if (drawW <= frame.w) {
    lens.offsetX = 0;
  } else {
    const maxX = (drawW - frame.w) / 2;
    lens.offsetX = Math.max(-maxX, Math.min(maxX, lens.offsetX));
  }

  if (drawH <= frame.h) {
    lens.offsetY = 0;
  } else {
    const maxY = (drawH - frame.h) / 2;
    lens.offsetY = Math.max(-maxY, Math.min(maxY, lens.offsetY));
  }
}

function drawLensImage(side) {
  const lens = state[side];
  const img = lens.image;
  const frame = FRAME[side];

  if (!img || !img.naturalWidth) {
    roundedRect(frame.x, frame.y, frame.w, frame.h, 16, "#f8fafc", "#cbd5e1", 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#667085";
    ctx.font = "800 22px Arial";
    ctx.fillText(`Upload ${side} screenshot`, frame.x + frame.w / 2, frame.y + frame.h / 2);
    ctx.textAlign = "left";
    return;
  }

  clampCrop(side);

  const totalScale = baseScaleFor(side) * lens.scale;
  const drawW = img.naturalWidth * totalScale;
  const drawH = img.naturalHeight * totalScale;
  const drawX = frame.x + (frame.w - drawW) / 2 + lens.offsetX;
  const drawY = frame.y + (frame.h - drawH) / 2 + lens.offsetY;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(frame.x, frame.y, frame.w, frame.h, 16);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  if (state.activeSide === side) {
    ctx.save();
    ctx.strokeStyle = side === "left" ? "rgba(24,95,230,.9)" : "rgba(239,48,56,.9)";
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(frame.x + 3, frame.y + 3, frame.w - 6, frame.h - 6);
    ctx.restore();
  }
}

function render() {
  const W = 1080;
  const H = 1350;
  const margin = 54;
  const gap = 74;
  const inner = W - margin * 2;
  const col = (inner - gap) / 2;
  const leftX = margin;
  const rightX = margin + col + gap;
  const top = 265;
  const cardH = 950;

  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, 0);
  bg.addColorStop(0, "#dfeaff");
  bg.addColorStop(0.48, "#faf6ef");
  bg.addColorStop(1, "#ffe2e2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const leftGlow = ctx.createRadialGradient(110, 650, 20, 110, 650, 520);
  leftGlow.addColorStop(0, "rgba(24,95,230,.22)");
  leftGlow.addColorStop(1, "rgba(24,95,230,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, W, H);

  const rightGlow = ctx.createRadialGradient(970, 650, 20, 970, 650, 520);
  rightGlow.addColorStop(0, "rgba(239,48,56,.22)");
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
    inner - 20,
    58,
    "900 54px Arial",
    "#0d1730",
    3,
    "center"
  );

  ctx.textAlign = "center";
  ctx.font = "900 19px Arial";
  ctx.fillStyle = "#185fe6";
  ctx.fillText("LEFT LENS", leftX + col / 2, top - 24);
  ctx.fillStyle = "#ef3038";
  ctx.fillText("RIGHT LENS", rightX + col / 2, top - 24);

  roundedRect(leftX, top, col, cardH, 22, "#fff", "rgba(24,95,230,.42)", 3);
  roundedRect(rightX, top, col, cardH, 22, "#fff", "rgba(239,48,56,.42)", 3);

  drawLensImage("left");
  drawLensImage("right");

  const chipH = 48;
  const chipY = top + cardH - chipH - 14;

  roundedRect(leftX + 14, chipY, col - 28, chipH, 24, "#fff", "rgba(24,95,230,.45)", 2);
  roundedRect(rightX + 14, chipY, col - 28, chipH, 24, "#fff", "rgba(239,48,56,.45)", 2);

  ctx.font = "900 18px Arial";
  ctx.fillStyle = "#185fe6";
  ctx.fillText($("leftName").value.trim() || "Left source", leftX + col / 2, top + cardH - 29);
  ctx.fillStyle = "#ef3038";
  ctx.fillText($("rightName").value.trim() || "Right source", rightX + col / 2, top + cardH - 29);

  ctx.strokeStyle = "#b6beca";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, top + 25);
  ctx.lineTo(W / 2, top + cardH - 25);
  ctx.stroke();

  roundedRect(W / 2 - 32, top + cardH / 2 - 32, 64, 64, 32, "#fff", "#b6beca", 2);
  ctx.font = "900 23px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("VS", W / 2, top + cardH / 2 + 8);

  ctx.font = "900 26px Arial";
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

      document.querySelectorAll(`.fit-btn[data-side="${side}"]`).forEach((button) => {
        button.classList.toggle("active", button.dataset.fit === "smart");
      });

      state.activeSide = side;
      render();
      $("message").textContent =
        `${side === "left" ? "Left" : "Right"} screenshot loaded. Drag it in the preview to position it.`;
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
    const frame = FRAME[side];
    if (
      point.x >= frame.x &&
      point.x <= frame.x + frame.w &&
      point.y >= frame.y &&
      point.y <= frame.y + frame.h
    ) {
      return side;
    }
  }

  return null;
}

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
    lens.scale = Math.max(0.5, Math.min(4, state.pinchStart.scale * factor));
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
  } else if (state.activeSide) {
    const remainingPoint = [...state.pointers.values()][0];
    state.dragStart = {
      point: remainingPoint,
      offsetX: state[state.activeSide].offsetX,
      offsetY: state[state.activeSide].offsetY
    };
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener("wheel", (event) => {
  const point = canvasPoint(event);
  const side = sideAt(point);

  if (!side || !state[side].image) return;

  event.preventDefault();
  state.activeSide = side;

  const lens = state[side];
  const zoomFactor = Math.exp(-event.deltaY * 0.0015);
  lens.scale = Math.max(0.5, Math.min(4, lens.scale * zoomFactor));
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
