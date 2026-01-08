// ===== Конфигурация =====
const ICON_COUNT = 10;
const ICON_PATHS = Array.from({ length: ICON_COUNT }, (_, i) => `icons/icon${i + 1}.png`);

const MIN_IMAGES = 1;
const MAX_IMAGES = 20;
const SIZE_CATEGORIES_VH = [6, 10, 14, 18, 22];

const imageZone = document.getElementById("image-zone");
const buttonsContainer = document.getElementById("buttons");

let currentCount = 0;
let currentImages = []; // сохраняем ссылки на картинки

// ===== Вспомогательные =====
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

// ===== Размещение картинки =====
// ===== Размещение картинки =====
function placeImage(src, vhSize, occupiedCells, gridSize = 40) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "image-item hidden"; // скрыта изначально
  img.style.height = `${vhSize}vh`;

  const zoneH = imageZone.clientHeight;
  const zoneW = imageZone.clientWidth;
  const targetH = zoneH * (vhSize / 100);

  const natW = img.naturalWidth || 100;
  const natH = img.naturalHeight || 100;
  const aspect = natW / natH;
  const targetW = targetH * aspect;

  const cellW = zoneW / gridSize;
  const cellH = zoneH / gridSize;

  const cellsX = Math.ceil(targetW / cellW);
  const cellsY = Math.ceil(targetH / cellH);

  let gx = 0, gy = 0, found = false;
  for (let attempt = 0; attempt < 500 && !found; attempt++) {
    gx = randomInt(0, gridSize - cellsX);
    gy = randomInt(0, gridSize - cellsY);

    let overlap = false;
    for (let y = gy; y < gy + cellsY; y++) {
      for (let x = gx; x < gx + cellsX; x++) {
        if (occupiedCells[y] && occupiedCells[y][x]) {
          overlap = true;
          break;
        }
      }
      if (overlap) break;
    }

    if (!overlap) {
      found = true;
      for (let y = gy; y < gy + cellsY; y++) {
        if (!occupiedCells[y]) occupiedCells[y] = [];
        for (let x = gx; x < gx + cellsX; x++) {
          occupiedCells[y][x] = true;
        }
      }
    }
  }

  const leftPx = gx * cellW + randomInt(-5, 5);
  const topPx = gy * cellH + randomInt(-5, 5);

  img.style.left = `${leftPx}px`;
  img.style.top = `${topPx}px`;

  // 🔹 вот здесь добавляем обработчик клика
  img.addEventListener("click", () => {
    img.style.transition = "opacity 0.5s ease";
    img.style.opacity = "0";
    setTimeout(() => img.remove(), 500);
  });


  imageZone.appendChild(img);
  currentImages.push(img);
}

// ===== Генерация сцены =====
function generateScene() {
  currentCount = randomInt(MIN_IMAGES, MAX_IMAGES);
  imageZone.innerHTML = "";
  currentImages = [];

  const perCategory = distributeCountsEvenly(currentCount, SIZE_CATEGORIES_VH.length);
  const occupiedCells = [];

  for (let c = 0; c < SIZE_CATEGORIES_VH.length; c++) {
    const sizeVh = SIZE_CATEGORIES_VH[c];
    for (let i = 0; i < perCategory[c]; i++) {
      const src = ICON_PATHS[randomInt(0, ICON_PATHS.length - 1)];
      placeImage(src, sizeVh, occupiedCells);
    }
  }

  animateImages(); // анимация появления
  renderButtons();
}

// ===== Анимация появления =====
function animateImages() {
  currentImages.forEach((img, idx) => {
    setTimeout(() => {
      img.classList.remove("hidden");
      img.classList.add("fade-in");
    }, idx * (3000 / currentImages.length)); // равномерно за 3 сек
  });
}

// ===== Генерация кнопок =====
function renderButtons() {
  buttonsContainer.innerHTML = "";

  const answer = currentCount;
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
        imageZone.style.backgroundColor = "lightgreen";
        setTimeout(() => {
          imageZone.style.backgroundColor = "";
          generateScene();
        }, 1000);
      } else {
        imageZone.style.backgroundColor = "lightcoral";
        setTimeout(() => {
          imageZone.style.backgroundColor = "";
          // вернуть все картинки
          imageZone.innerHTML = "";
          currentImages.forEach(img => imageZone.appendChild(img));
        }, 1000);
      }
    });

    buttonsContainer.appendChild(btn);
  });
}

// ===== Инициализация =====
function init() {
  generateScene();
  window.addEventListener("resize", () => {
    generateScene();
  });
}
document.addEventListener("DOMContentLoaded", init);
