// ===== Config =====
const ICON_COUNT = 10; // number of images in /icons folder
const ICON_PATHS = Array.from({ length: ICON_COUNT }, (_, i) => `icons/icon${i + 1}.png`);

const MIN_IMAGES = 1;
const MAX_IMAGES = 20;

// 5 size categories in vh (relative to image zone height)
const SIZE_CATEGORIES_VH = [6, 10, 14, 18, 22];

// DOM elements
const imageZone = document.getElementById("image-zone");
const buttonsContainer = document.getElementById("buttons");

let currentCount = 0;

// ===== Utilities =====
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function distributeCountsEvenly(n, categories) {
  const base = Math.floor(n / categories);
  const remainder = n % categories;
  const result = new Array(categories).fill(base);
  for (let i = 0; i < remainder; i++) result[i] += 1;
  return shuffle(result);
}

function isOverlapping(rect, placedRects, margin) {
  return placedRects.some(r =>
    !(rect.right + margin < r.left ||
      rect.left - margin > r.right ||
      rect.bottom + margin < r.top ||
      rect.top - margin > r.bottom)
  );
}

// ===== Image creation with spacing =====
function placeImage(src, vhSize, placedRects) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "image-item";
  img.style.height = `${vhSize}vh`;
  img.style.position = "absolute";
  img.style.visibility = "hidden";

  imageZone.appendChild(img);

  const onReady = () => {
    const zoneH = imageZone.clientHeight;
    const zoneW = imageZone.clientWidth;
    const targetH = zoneH * (vhSize / 100);

    // Natural sizes may be 0 if metadata is missing; guard with defaults
    const natW = img.naturalWidth || 100;
    const natH = img.naturalHeight || 100;
    const aspect = natW / natH;
    const targetW = targetH * aspect;

    let leftPx, topPx, rect;
    let tries = 0;
    const margin = 5;
    const maxLeft = Math.max(zoneW - targetW, 0);
    const maxTop = Math.max(zoneH - targetH, 0);

    // Try to find a non-overlapping position; if fails, place anyway to ensure visibility
    do {
      leftPx = Math.random() * maxLeft;
      topPx = Math.random() * maxTop;
      rect = { left: leftPx, top: topPx, right: leftPx + targetW, bottom: topPx + targetH };
      tries++;
    } while (isOverlapping(rect, placedRects, margin) && tries < 200);

    img.style.left = `${leftPx}px`;
    img.style.top = `${topPx}px`;
    img.style.visibility = "visible";

    placedRects.push(rect);
  };

  // Fire when loaded; if it errors or loads too slowly, still compute layout after a small delay
  img.onload = onReady;
  img.onerror = () => {
    // Remove broken image to avoid gaps
    img.remove();
  };
  // Fallback: ensure layout runs even if onload doesn't fire quickly
  setTimeout(() => {
    if (document.body.contains(img) && img.style.visibility === "hidden") onReady();
  }, 300);
}

// ===== Scene generation =====
function generateScene() {
  try {
    currentCount = randomInt(MIN_IMAGES, MAX_IMAGES);

    // Clear image zone
    imageZone.innerHTML = "";

    const perCategory = distributeCountsEvenly(currentCount, SIZE_CATEGORIES_VH.length);
    const placedRects = [];

    // Create images per category
    for (let c = 0; c < SIZE_CATEGORIES_VH.length; c++) {
      const sizeVh = SIZE_CATEGORIES_VH[c];
      for (let i = 0; i < perCategory[c]; i++) {
        const src = ICON_PATHS[randomInt(0, ICON_PATHS.length - 1)];
        placeImage(src, sizeVh, placedRects);
      }
    }

    renderButtons();
  } catch (e) {
    // Minimal in-app fallback to ensure buttons still render
    currentCount = 0;
    imageZone.innerHTML = "";
    renderButtons();
  }
}

// ===== Buttons generation =====
function renderButtons() {
  buttonsContainer.innerHTML = "";

  // Ensure we always have a valid currentCount for options
  const answer = currentCount >= MIN_IMAGES ? currentCount : randomInt(MIN_IMAGES, MAX_IMAGES);

  const candidates = new Set([answer]);
  while (candidates.size < 5) candidates.add(randomInt(MIN_IMAGES, MAX_IMAGES));

  const values = shuffle([...candidates]);

  values.forEach((val) => {
    const btn = document.createElement("button");
    btn.className = "count-btn";

    const label = document.createElement("span");
    label.textContent = String(val);
    btn.appendChild(label);

    btn.addEventListener("click", () => {
      if (val === answer) {
        generateScene();
      } else {
        btn.style.filter = "brightness(0.8)";
        setTimeout(() => (btn.style.filter = ""), 200);
      }
    });

    buttonsContainer.appendChild(btn);
  });
}

// ===== Init =====
function init() {
  generateScene();
  window.addEventListener("resize", () => {
    generateScene();
  });
}

document.addEventListener("DOMContentLoaded", init);
