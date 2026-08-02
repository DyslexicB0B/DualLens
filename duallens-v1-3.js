const $ = (id) => document.getElementById(id);

const canvas = $("exportCanvas");
const ctx = canvas.getContext("2d");

function updatePreview() {
  $("cardHeadline").textContent = $("headline").value.trim();
  $("cardLeftLabel").textContent = $("leftLabel").value.trim();
  $("cardRightLabel").textContent = $("rightLabel").value.trim();

  const leftUrl = $("leftSourceUrl").value.trim() || "#";
  const rightUrl = $("rightSourceUrl").value.trim() || "#";

  $("leftSourceChip").textContent =
    $("leftSourceLabel").value.trim() || "Left source";
  $("leftSourceChip").href = leftUrl;
  $("leftScreenshotLink").href = leftUrl;

  $("rightSourceChip").textContent =
    $("rightSourceLabel").value.trim() || "Right source";
  $("rightSourceChip").href = rightUrl;
  $("rightScreenshotLink").href = rightUrl;
}

function loadImage(input, side) {
  const file = input.files && input.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    $("message").textContent = "Please choose an image file.";
    input.value = "";
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    $("message").textContent =
      "That image is larger than 20 MB. Please use a smaller screenshot.";
    input.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onerror = () => {
    $("message").textContent =
      "The screenshot could not be opened. Please try another image.";
  };

  reader.onload = () => {
    const img = $(side + "PreviewImage");

    img.onload = () => {
      img.classList.remove("hidden");
      $(side + "Placeholder").classList.add("hidden");
      applyFit(side);
      $("message").textContent =
        side === "left"
          ? "Left screenshot uploaded."
          : "Right screenshot uploaded.";
    };

    img.onerror = () => {
      $("message").textContent =
        "The screenshot format could not be displayed. Try PNG or JPG.";
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function removeImage(side) {
  const img = $(side + "PreviewImage");
  img.removeAttribute("src");
  img.classList.add("hidden");
  $(side + "Placeholder").classList.remove("hidden");

  const input = $(side + "ImageInput");
  if (input) input.value = "";

  $("message").textContent =
    side === "left"
      ? "Left screenshot removed."
      : "Right screenshot removed.";
}

function applyFit(side) {
  const img = $(side + "PreviewImage");
  const fitSelect = $(side + "Fit");

  if (img && fitSelect) img.style.objectFit = fitSelect.value;
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;

  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const rows = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? line + " " + word : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      rows.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) rows.push(line);
  return rows;
}

function drawText(
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  font,
  color,
  maxLines = 99,
  align = "left"
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;

  wrapText(text, maxWidth, font)
    .slice(0, maxLines)
    .forEach((row, index) => {
      ctx.fillText(row, x, y + index * lineHeight);
    });

  ctx.textAlign = "left";
}

function roundedRect(x, y, width, height, radius, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);

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

function drawImageFit(img, x, y, width, height, mode) {
  if (!img.complete || !img.naturalWidth) return;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = width / height;
  let drawWidth;
  let drawHeight;

  if (
    (mode === "cover" && imageRatio > boxRatio) ||
    (mode === "contain" && imageRatio < boxRatio)
  ) {
    drawHeight = height;
    drawWidth = height * imageRatio;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 18);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, y, width, height);
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function renderCanvas() {
  const W = 1080;
  const H = 1350;
  const margin = 54;
  const inner = W - margin * 2;
  const gap = 86;
  const col = (inner - gap) / 2;
  const leftX = margin;
  const rightX = margin + col + gap;
  const top = 350;
  const frameHeight = 780;

  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, 0);
  bg.addColorStop(0, "#dfeaff");
  bg.addColorStop(0.48, "#faf6ef");
  bg.addColorStop(1, "#ffe2e2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#185fe6";
  ctx.beginPath();
  ctx.arc(W / 2 - 18, 60, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef3038";
  ctx.beginPath();
  ctx.arc(W / 2 + 18, 60, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.font = "900 42px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("DualLens", W / 2, 78);

  ctx.font = "900 14px Arial";
  ctx.fillStyle = "#667085";
  ctx.fillText("SAME STORY. DIFFERENT LENS.", W / 2, 108);

  drawText(
    $("headline").value.trim().toUpperCase(),
    W / 2,
    170,
    inner - 40,
    72,
    "900 66px Arial",
    "#0d1730",
    3,
    "center"
  );

  ctx.font = "900 23px Arial";
  ctx.fillStyle = "#185fe6";
  ctx.fillText(
    $("leftLabel").value.trim().toUpperCase(),
    leftX + col / 2,
    top - 26
  );

  ctx.fillStyle = "#ef3038";
  ctx.fillText(
    $("rightLabel").value.trim().toUpperCase(),
    rightX + col / 2,
    top - 26
  );

  ctx.textAlign = "left";

  roundedRect(
    leftX,
    top,
    col,
    frameHeight,
    22,
    "#fff",
    "rgba(24,95,230,.4)",
    3
  );

  roundedRect(
    rightX,
    top,
    col,
    frameHeight,
    22,
    "#fff",
    "rgba(239,48,56,.4)",
    3
  );

  const padding = 14;
  const chipHeight = 50;
  const imageHeight = frameHeight - chipHeight - padding * 3;

  const leftImage = $("leftPreviewImage");
  const rightImage = $("rightPreviewImage");

  if (leftImage.src) {
    drawImageFit(
      leftImage,
      leftX + padding,
      top + padding,
      col - padding * 2,
      imageHeight,
      $("leftFit").value
    );
  }

  if (rightImage.src) {
    drawImageFit(
      rightImage,
      rightX + padding,
      top + padding,
      col - padding * 2,
      imageHeight,
      $("rightFit").value
    );
  }

  roundedRect(
    leftX + padding,
    top + frameHeight - chipHeight - padding,
    col - padding * 2,
    chipHeight,
    24,
    "#fff",
    "rgba(24,95,230,.45)",
    2
  );

  roundedRect(
    rightX + padding,
    top + frameHeight - chipHeight - padding,
    col - padding * 2,
    chipHeight,
    24,
    "#fff",
    "rgba(239,48,56,.45)",
    2
  );

  ctx.textAlign = "center";
  ctx.font = "900 18px Arial";

  ctx.fillStyle = "#185fe6";
  ctx.fillText(
    $("leftSourceLabel").value.trim(),
    leftX + col / 2,
    top + frameHeight - 30
  );

  ctx.fillStyle = "#ef3038";
  ctx.fillText(
    $("rightSourceLabel").value.trim(),
    rightX + col / 2,
    top + frameHeight - 30
  );

  ctx.strokeStyle = "#b6beca";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, top + 20);
  ctx.lineTo(W / 2, top + frameHeight - 20);
  ctx.stroke();

  roundedRect(
    W / 2 - 34,
    top + frameHeight / 2 - 34,
    68,
    68,
    34,
    "#fff",
    "#b6beca",
    2
  );

  ctx.font = "900 24px Arial";
  ctx.fillStyle = "#0d1730";
  ctx.fillText("VS", W / 2, top + frameHeight / 2 + 8);

  ctx.font = "900 28px Arial";
  ctx.fillText("DualLens", W / 2, 1285);
  ctx.textAlign = "left";
}

async function canvasBlob() {
  renderCanvas();

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

async function copyPostText() {
  try {
    await navigator.clipboard.writeText($("postCopy").value);
    $("message").textContent = "Post text copied.";
  } catch {
    $("postCopy").select();
    document.execCommand("copy");
    $("message").textContent = "Post text copied.";
  }
}

async function copyImage() {
  const blob = await canvasBlob();

  if (!blob) {
    $("message").textContent = "Image copy failed.";
    return;
  }

  try {
    if (
      navigator.clipboard &&
      window.ClipboardItem &&
      navigator.clipboard.write
    ) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      $("message").textContent =
        "Image copied. Open X and paste it into a new post.";
      return;
    }
  } catch (error) {
    console.warn("Clipboard image copy failed:", error);
  }

  downloadBlob(blob);
  $("message").textContent =
    "Your browser cannot copy images directly, so the PNG was downloaded instead.";
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

async function exportPng() {
  const blob = await canvasBlob();

  if (!blob) {
    $("message").textContent = "Export failed. Please try again.";
    return;
  }

  downloadBlob(blob);
  $("message").textContent = "PNG sent to your Downloads folder.";
}

function openXComposer() {
  const text = $("postCopy").value.trim();
  const url =
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);

  window.open(url, "_blank", "noopener,noreferrer");

  $("message").textContent =
    "X opened with your text. Paste the copied image or attach the downloaded PNG.";
}

function showPhonePreview() {
  renderCanvas();
  $("phoneCopy").textContent = $("postCopy").value;
  $("phoneImage").src = canvas.toDataURL("image/png");
  $("phoneDialog").showModal();
}

[
  "headline",
  "leftLabel",
  "rightLabel",
  "leftSourceLabel",
  "rightSourceLabel",
  "leftSourceUrl",
  "rightSourceUrl",
].forEach((id) => {
  $(id).addEventListener("input", updatePreview);
});

$("leftFit").addEventListener("change", () => applyFit("left"));
$("rightFit").addEventListener("change", () => applyFit("right"));

$("leftImageInput").addEventListener("change", (event) =>
  loadImage(event.target, "left")
);

$("rightImageInput").addEventListener("change", (event) =>
  loadImage(event.target, "right")
);

$("removeLeftBtn").addEventListener("click", () => removeImage("left"));
$("removeRightBtn").addEventListener("click", () => removeImage("right"));

$("copyBtn").addEventListener("click", copyPostText);
$("copyImageBtn").addEventListener("click", copyImage);
$("openXBtn").addEventListener("click", openXComposer);
$("phonePreviewBtn").addEventListener("click", showPhonePreview);
$("closePhoneBtn").addEventListener("click", () => $("phoneDialog").close());
$("exportBtn").addEventListener("click", exportPng);

updatePreview();
