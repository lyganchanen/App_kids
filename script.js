// === Конфигурация ===
const ICON_COUNT = 10; // сколько картинок у тебя в папке icons
const ICON_PATHS = Array.from({ length: ICON_COUNT }, (_, i) => `icons/icon${i + 1}.png`);

const MIN_IMAGES = 1;
const MAX_IMAGES = 20;

// 5 категорий размеров (в процентах от высоты зоны)
const SIZE_CATEGORIES_VH = [6, 10, 14, 18, 22];

// DOM элементы
const imageZone = document.getElementById("image-zone");
const buttonsContainer = document.getElementById("buttons");

let currentCount = 0;

// === Вспомогательные функции ===
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
  for (let i = 0; i < remainder; i++) {
    result[i] += 1;
  }
  return shuffle(result);
}

// Проверка пересечения с учётом отступа
function isOverlapping(rect, placedRects, margin) {
  return placedRects.some(r =>
    !(rect.right + margin < r.left ||
      rect.left - margin > r.right ||
      rect.bottom + margin < r.top ||
      rect.top - margin > r.bottom)
  );
}

// Создание картинки с проверкой пересечений
function createImageElement(src, vhSize, placedRects) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "image-item";
  img.style.height = `${vhSize}vh`;
  img.style.position = "absolute";
  img.style.visibility = "hidden";

  imageZone.appendChild(img);

  img.onload = () => {
    const zoneHeightPx = imageZone.clientHeight;
    const zoneWidthPx = imageZone.clientWidth;
    const targetHeightPx = zoneHeightPx * (vhSize / 100);
    const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
    const targetWidthPx = targetHeightPx * aspectRatio;

    let leftPx, topPx, rect, tries = 0;
    const margin = 5;

    do {
      leftPx = Math.random() * Math.max(zoneWidthPx - targetWidthPx, 0);
      topPx = Math.random() * Math.max(zoneHeightPx - targetHeightPx, 0);
      rect = {
        left: leftPx,
        top: topPx,
        right: leftPx + targetWidthPx,
        bottom: topPx + targetHeightPx
      };
      tries++;
    } while (isOverlapping(rect, placedRects, margin) && tries < 100);

    img.style.left = `${leftPx}px`;
    img.style.top = `${topPx}px`;
    img.style.visibility = "visible";

    placedRects.push(rect);
  };

  img.onerror = () => {
    img.remove();
  };
}

// === Генерация сцены ===
function generateScene() {
  currentCount = randomInt(MIN_IMAGES, MAX_IMAGES);
  imageZone.innerHTML = "";

  const perCategory = distributeCountsEvenly(currentCount, SIZE_CATEGORIES_VH.length);
  const placedRects = [];

  for (let c = 0; c < SIZE_CATEGORIES_VH.length; c++) {
    const sizeVh = SIZE_CATEGORIES_VH[c];
    for (let i = 0; i < perCategory[c]; i++) {
      const src = ICON_PATHS[randomInt(0, ICON_PATHS.length - 1)];
      createImageElement(src, sizeVh, placedRects);
    }
  }

  renderButtons();
}

// === Генерация кнопок ===
function renderButtons() {
  buttonsContainer.innerHTML = "";

  const candidates = new Set();
  candidates.add(currentCount);
  while (candidates.size < 5) {
    candidates.add(randomInt(MIN_IMAGES, MAX_IMAGES));
  }

  const values = shuffle([...candidates]);
  values.forEach((val) => {
    const btn = document.createElement("button");
    btn.className = "count-btn";

    const label = document.createElement("span");
    label.textContent = String(val);
    btn.appendChild(label);

    btn.addEventListener("click", () => {
      if (val === currentCount) {
        generateScene();
      } else {
        btn.style.filter = "brightness(0.8)";
        setTimeout(() => (btn.style.filter = ""), 200);
      }
    });

    buttonsContainer.appendChild(btn);
  });
}

// === Инициализация ===
function init() {
  generateScene();
  window.addEventListener("resize", () => {
    generateScene();
  });
}

document.addEventListener("DOMContentLoaded", init);
