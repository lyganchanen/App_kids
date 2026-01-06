/*
  Логика:
  - Генерируем от 1 до 20 изображений из набора /icons/icon1.png ... icon6.png
  - Случайные позиции в пределах #image-zone, чтобы картинка полностью помещалась
  - 5 категорий размеров (от очень маленькой до большой)
  - Для равномерности распределяем количество по 5 категориям (насколько возможно)
  - Внизу генерируем 5 кнопок: одна с правильным числом, четыре — случайные уникальные
  - Клик по правильной кнопке -> новая генерация
*/

// Конфигурация
const ICON_PATHS = [
  "icons/icon1.png",
  "icons/icon2.png",
  "icons/icon3.png",
  "icons/icon4.png",
  "icons/icon5.png",
  "icons/icon6.png"
];

// Диапазон количества картинок
const MIN_IMAGES = 1;
const MAX_IMAGES = 20;

// 5 категорий размеров (в процентах от высоты зоны)
const SIZE_CATEGORIES_VH = [6, 10, 14, 18, 22]; // очень маленькая -> большая

// Ссылки на элементы DOM
const imageZone = document.getElementById("image-zone");
const buttonsContainer = document.getElementById("buttons");

// Состояние
let currentCount = 0;

// Вспомогательные функции
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

/*
  Равномерное распределение количества картинок по 5 категориям размеров.
  Пример: n = 13 => [3,3,3,2,2] (или аналогично, чтобы сумма равнялась n)
*/
function distributeCountsEvenly(n, categories) {
  const base = Math.floor(n / categories);
  const remainder = n % categories;
  const result = new Array(categories).fill(base);
  for (let i = 0; i < remainder; i++) {
    result[i] += 1;
  }
  return shuffle(result); // слегка перемешаем, чтобы размер не шёл ступенькой
}

/*
  Создаёт одну картинку с абсолютным позиционированием.
  Гарантирует, что картинка целиком помещается в рабочей зоне.
*/
function createImageElement(src, vhSize) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "image-item";

  // Переводим высоту из vh в пиксели
  const zoneHeightPx = imageZone.clientHeight;
  const zoneWidthPx = imageZone.clientWidth;
  const targetHeightPx = zoneHeightPx * (vhSize / 100);

  // Чтобы рассчитать позиции, нужно знать размеры. Сначала поставим временно невидимой.
  img.style.visibility = "hidden";
  img.style.height = `${vhSize}vh`;

  // Вставляем в DOM для получения натуральной ширины после масштабирования
  imageZone.appendChild(img);

  // Как только загрузится, позиционируем
  img.onload = () => {
    const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
    const targetWidthPx = targetHeightPx * aspectRatio;

    // Случайная позиция, но так, чтобы картинка не выходила за пределы
    const maxLeftPx = Math.max(zoneWidthPx - targetWidthPx, 0);
    const maxTopPx = Math.max(zoneHeightPx - targetHeightPx, 0);

    const leftPx = Math.random() * maxLeftPx;
    const topPx = Math.random() * maxTopPx;

    img.style.left = `${leftPx}px`;
    img.style.top = `${topPx}px`;
    img.style.visibility = "visible";
  };

  // Если ошибка загрузки — удаляем элемент, чтобы не было "битых" картинок
  img.onerror = () => {
    img.remove();
  };

  return img;
}

/*
  Генерация сцены:
  - выбираем случайное количество
  - очищаем зону
  - распределяем по размерным категориям
  - создаём изображения
  - генерируем кнопки
*/
function generateScene() {
  // Случайное количество картинок
  currentCount = randomInt(MIN_IMAGES, MAX_IMAGES);

  // Очистка зоны изображений
  imageZone.innerHTML = "";

  // Распределение количества по 5 размерам
  const perCategory = distributeCountsEvenly(currentCount, SIZE_CATEGORIES_VH.length);

  // Для каждой категории создаём соответствующее количество картинок
  for (let c = 0; c < SIZE_CATEGORIES_VH.length; c++) {
    const sizeVh = SIZE_CATEGORIES_VH[c];
    for (let i = 0; i < perCategory[c]; i++) {
      const src = ICON_PATHS[randomInt(0, ICON_PATHS.length - 1)];
      const imgEl = createImageElement(src, sizeVh);
      // createImageElement сам добавляет элемент в imageZone
    }
  }

  // Генерация кнопок
  renderButtons();
}

/*
  Генерация пяти кнопок:
  - одна правильная (currentCount)
  - четыре уникальных неправильных из диапазона [1..20], не совпадающих с правильной
*/
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
      const isCorrect = val === currentCount;
      if (isCorrect) {
        // Правильный ответ — перегенерируем сцену
        generateScene();
      } else {
        // Неправильный — можешь добавить визуальный отклик при желании
        btn.style.filter = "brightness(0.8)";
        setTimeout(() => (btn.style.filter = ""), 200);
      }
    });

    buttonsContainer.appendChild(btn);
  });
}

/*
  Инициализация после загрузки страницы.
  Обновляем сцену при ресайзе (чтобы позиции вписывались в новый размер).
*/
function init() {
  generateScene();
  window.addEventListener("resize", () => {
    // При изменении размеров перегенерируем сцену для корректной вёрстки
    generateScene();
  });
}

document.addEventListener("DOMContentLoaded", init);
