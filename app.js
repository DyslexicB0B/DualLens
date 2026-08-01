const $ = (id) => document.getElementById(id);

const canvas = $("previewCanvas");
const ctx = canvas.getContext("2d");

const defaults = {
  storyLabel: "TODAY'S STORY",
  headline: "Congress debates a new national immigration proposal",
  leftHeading: "SUPPORTERS",
  rightHeading: "CRITICS",
  leftPoints: `Strengthens border enforcement
Clarifies asylum standards
Adds resources for processing
May reduce illegal crossings`,
  rightPoints: `Could limit humanitarian access
May separate families
Adds enforcement costs
Could affect labor markets`,
  commonGround: "Both sides agree the current system is overwhelmed and needs clearer rules, faster processing, and better enforcement.",
  whyMatters: "The outcome could affect border operations, employers, asylum seekers, local governments, and federal spending.",
  sources: "AP • Reuters • Congressional summary"
};

const fieldIds = [
  "storyLabel",
  "headline",
  "leftHeading",
  "rightHeading",
  "leftPoints",
  "rightPoints",
  "commonGround",
  "whyMatters",
  "sources",
  "format",
  "labelStyle"
];

function setCanvasSize() {
  const sizes = {
    portrait: [1080, 1350],
    square: [1080, 1080],
    landscape: [1600, 900]
  };

  const [width, height] = sizes[$("format").value];
  canvas.width = width;
  canvas.height = height;
  $("sizeBadge").textContent = `${width} × ${height}`;
}

function roundedRect(x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;

  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function drawWrapped(text, x, y, maxWidth, lineHeight, font, color, maxLines = 99) {
  ctx.font = font;
  ctx.fillStyle = color;

  const lines = wrapText(text, maxWidth, font).slice(0, maxLines);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function getHeadings() {
  const style = $("labelStyle").value;

  if (style === "leftRight") return ["LEFT LENS", "RIGHT LENS"];
  if (style === "forAgainst") return ["ARGUMENTS FOR", "ARGUMENTS AGAINST"];

  return [
    $("leftHeading").value || "PERSPECTIVE A",
    $("rightHeading").value || "PERSPECTIVE B"
  ];
}

function drawBulletList(items, x, y, maxWidth, fontSize, lineGap, bulletColor, maxItems) {
  const font = `500 ${fontSize}px Arial, sans-serif`;
  let cursorY = y;

  items.slice(0, maxItems).forEach((item) => {
    const lines = wrapText(item, maxWidth - 42, font).slice(0, 2);

    ctx.fillStyle = bulletColor;
    ctx.beginPath();
    ctx.arc(x + 8, cursorY - 8, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#172033";
    ctx.font = font;

    lines.forEach((line, index) => {
      ctx.fillText(line, x + 32, cursorY + index * (fontSize + 8));
    });

    cursorY += lines.length * (fontSize + 8) + lineGap;
  });
}

function render() {
  setCanvasSize();

  const width = canvas.width;
  const height = canvas.height;
  const landscape = width > height;
  const scale = width / 1080;

  const colors = {
    navy: "#111827",
    text: "#172033",
    muted: "#667085",
    border: "#d7dce5",
    blue: "#246bce",
    blueSoft: "#eef5ff",
    red: "#c94a4a",
    redSoft: "#fff1f1",
    green: "#20865b",
    greenSoft: "#eef9f3",
    goldSoft: "#fff8e8"
  };

  const pad = Math.round(54 * scale);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f4f6f9";
  ctx.fillRect(0, 0, width, height);

  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  roundedRect(cardX, cardY, cardW, cardH, 28 * scale, "#ffffff", colors.border);

  const innerX = cardX + 44 * scale;
  const innerW = cardW - 88 * scale;
  let y = cardY + 48 * scale;

  ctx.fillStyle = colors.navy;
  ctx.font = `700 ${32 * scale}px Arial, sans-serif`;
  ctx.fillText("DUALLENS", innerX, y);

  ctx.fillStyle = colors.muted;
  ctx.font = `600 ${16 * scale}px Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("SAME STORY • DIFFERENT PERSPECTIVES", innerX + innerW, y - 3 * scale);
  ctx.textAlign = "left";

  y += 48 * scale;
  ctx.strokeStyle = colors.navy;
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(innerX, y);
  ctx.lineTo(innerX + innerW, y);
  ctx.stroke();

  y += 50 * scale;
  ctx.fillStyle = colors.muted;
  ctx.font = `700 ${18 * scale}px Arial, sans-serif`;
  ctx.fillText(($("storyLabel").value || "TODAY'S STORY").toUpperCase(), innerX, y);

  y += 56 * scale;
  const headlineSize = landscape ? 42 : 44;
  const headlineHeight = drawWrapped(
    $("headline").value,
    innerX,
    y,
    innerW,
    headlineSize * 1.18 * scale,
    `700 ${headlineSize * scale}px Arial, sans-serif`,
    colors.navy,
    landscape ? 2 : 3
  );

  y += headlineHeight + 34 * scale;

  const [leftTitle, rightTitle] = getHeadings();
  const gap = 24 * scale;
  const colW = (innerW - gap) / 2;
  const panelH = landscape ? 300 * scale : 390 * scale;

  roundedRect(innerX, y, colW, panelH, 24 * scale, colors.blueSoft, "#c9dcf7");
  roundedRect(innerX + colW + gap, y, colW, panelH, 24 * scale, colors.redSoft, "#f0cccc");

  ctx.fillStyle = colors.blue;
  ctx.font = `700 ${22 * scale}px Arial, sans-serif`;
  ctx.fillText(leftTitle.toUpperCase(), innerX + 28 * scale, y + 48 * scale);

  ctx.fillStyle = colors.red;
  ctx.fillText(rightTitle.toUpperCase(), innerX + colW + gap + 28 * scale, y + 48 * scale);

  const leftItems = $("leftPoints").value.split("\n").map((s) => s.trim()).filter(Boolean);
  const rightItems = $("rightPoints").value.split("\n").map((s) => s.trim()).filter(Boolean);

  drawBulletList(
    leftItems,
    innerX + 28 * scale,
    y + 100 * scale,
    colW - 56 * scale,
    20 * scale,
    18 * scale,
    colors.blue,
    landscape ? 4 : 5
  );

  drawBulletList(
    rightItems,
    innerX + colW + gap + 28 * scale,
    y + 100 * scale,
    colW - 56 * scale,
    20 * scale,
    18 * scale,
    colors.red,
    landscape ? 4 : 5
  );

  y += panelH + 26 * scale;

  const commonH = landscape ? 132 * scale : 160 * scale;
  roundedRect(innerX, y, innerW, commonH, 22 * scale, colors.greenSoft, "#cde7d8");

  ctx.fillStyle = colors.green;
  ctx.font = `700 ${20 * scale}px Arial, sans-serif`;
  ctx.fillText("COMMON GROUND", innerX + 28 * scale, y + 42 * scale);

  drawWrapped(
    $("commonGround").value,
    innerX + 28 * scale,
    y + 78 * scale,
    innerW - 56 * scale,
    27 * scale,
    `500 ${19 * scale}px Arial, sans-serif`,
    colors.text,
    landscape ? 2 : 3
  );

  y += commonH + 20 * scale;

  const mattersH = landscape ? 126 * scale : 150 * scale;
  roundedRect(innerX, y, innerW, mattersH, 22 * scale, colors.goldSoft, "#ecddaf");

  ctx.fillStyle = "#8a6415";
  ctx.font = `700 ${20 * scale}px Arial, sans-serif`;
  ctx.fillText("WHY IT MATTERS", innerX + 28 * scale, y + 42 * scale);

  drawWrapped(
    $("whyMatters").value,
    innerX + 28 * scale,
    y + 78 * scale,
    innerW - 56 * scale,
    27 * scale,
    `500 ${19 * scale}px Arial, sans-serif`,
    colors.text,
    landscape ? 2 : 3
  );

  const footerY = cardY + cardH - 54 * scale;

  ctx.fillStyle = colors.muted;
  ctx.font = `500 ${15 * scale}px Arial, sans-serif`;
  ctx.fillText(`Sources: ${$("sources").value}`, innerX, footerY);

  ctx.textAlign = "right";
  ctx.fillStyle = colors.navy;
  ctx.font = `700 ${15 * scale}px Arial, sans-serif`;
  ctx.fillText("COMPARE BEFORE YOU DECIDE", innerX + innerW, footerY);
  ctx.textAlign = "left";
}

fieldIds.forEach((id) => {
  $(id).addEventListener("input", render);
  $(id).addEventListener("change", render);
});

$("resetBtn").addEventListener("click", () => {
  Object.entries(defaults).forEach(([key, value]) => {
    $(key).value = value;
  });

  $("format").value = "portrait";
  $("labelStyle").value = "custom";
  $("message").textContent = "Example restored.";
  render();
});

$("downloadBtn").addEventListener("click", () => {
  render();

  const link = document.createElement("a");
  link.download = `duallens-${$("format").value}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  $("message").textContent = "Your PNG was sent to your browser's Downloads folder.";
});

render();
