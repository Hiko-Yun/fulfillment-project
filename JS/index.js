// --- 1. ЛУПА / ЗУМ НА КАРТЕ ---
const viewport = document.getElementById("viewport");
const container = document.getElementById("heroContainer");

viewport.addEventListener("mousemove", (e) => {
  if (
    document.querySelector(".art-overlay.is-visible") ||
    document.querySelector(".modal-overlay.is-open")
  )
    return;
  const { left, top, width, height } = viewport.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 100;
  const y = ((e.clientY - top) / height) * 100;
  container.style.transformOrigin = `${x}% ${y}%`;
  container.style.transform = "scale(2)";
});

viewport.addEventListener("mouseleave", () => {
  if (!document.querySelector(".art-overlay.is-visible")) {
    container.style.transform = "scale(1)";
    container.style.transformOrigin = "center center";
  }
});

// --- 2. МОДАЛКИ КАРТИНОК С КАРТЫ ---
function openArtModal(modalId, event) {
  if (event) event.stopPropagation();
  container.style.transform = "scale(1)";
  container.style.transformOrigin = "center center";
  const modal = document.getElementById(modalId);
  modal.classList.add("is-visible");
  document.body.style.overflow = "hidden";
}

function closeArtModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("is-visible");
  document.body.style.overflow = "";
}

// --- 3. МОДАЛКА ЗАКАЗА ЗВОНКА (ОТКРЫТИЕ/ЗАКРЫТИЕ) ---
const callModal = document.getElementById("call-modal");
// Меняем здесь: ищем все кнопки
const openCallBtns = document.querySelectorAll(
  ".callback-trigger, .open-modal-btn",
);
const closeCallBtn = document.getElementById("close-modal-btn");

// Вешаем событие на каждую найденную кнопку
openCallBtns.forEach((btn) => {
  btn.addEventListener("click", function (event) {
    event.preventDefault();
    callModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });
});

// Остальной код (закрытие, маска телефона) остается БЕЗ ИЗМЕНЕНИЙ
closeCallBtn.addEventListener("click", function () {
  callModal.classList.remove("is-open");
  document.body.style.overflow = "";
});

callModal.addEventListener("click", function (event) {
  if (event.target === callModal) {
    callModal.classList.remove("is-open");
    document.body.style.overflow = "";
  }
});

// Закрытие ВСЕХ окон по кнопке ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".art-overlay")
      .forEach((m) => m.classList.remove("is-visible"));
    callModal.classList.remove("is-open");
    document.body.style.overflow = "";
  }
});

// --- 4. УМНАЯ МАСКА ТЕЛЕФОНА (Защита от ввода букв) ---
const phoneInput = document.getElementById("modal-phone");

phoneInput.addEventListener("input", function (e) {
  let input = e.target.value.replace(/\D/g, "");
  let formatted = "";
  if (!input) {
    e.target.value = "";
    return;
  }
  if (input[0] === "7" || input[0] === "8") {
    input = input.substring(1);
  }

  formatted = "+7 ";
  if (input.length > 0) {
    formatted += "(" + input.substring(0, 3);
  }
  if (input.length >= 3) {
    formatted += ") ";
  }
  if (input.length > 3) {
    formatted += input.substring(3, 6);
  }
  if (input.length >= 6) {
    formatted += "-";
  }
  if (input.length > 6) {
    formatted += input.substring(6, 8);
  }
  if (input.length >= 8) {
    formatted += "-";
  }
  if (input.length > 8) {
    formatted += input.substring(8, 10);
  }
  e.target.value = formatted;
});

phoneInput.addEventListener("keydown", function (e) {
  if (e.key === "Backspace" && e.target.value.length <= 4) {
    e.target.value = "";
  }
});

// --- 5. ЛОГИКА ДЛЯ ПЛАШКИ КУКИ ---
const cookieBanner = document.getElementById("cookie-notice");
const cookieAccept = document.getElementById("cookie-accept");

if (localStorage.getItem("cookie-accepted") === "true") {
  cookieBanner.style.display = "none";
}

cookieAccept.addEventListener("click", function () {
  cookieBanner.style.display = "none";
  localStorage.setItem("cookie-accepted", "true");
});

// --- 6. СКРОЛЛ И ВАЛИДАЦИЯ EMAIL ---
function ScrollToCalc() {
  document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
}

function ValidateBusinessEmail() {
  const email = document.querySelector("#userEmail").value;
  const privacyCheck = document.querySelector("#privacy-check");

  if (!email.includes("@") || !email.includes(".")) {
    alert("Пожалуйста, введите корректный email адрес");
    return;
  }

  if (!privacyCheck.checked) {
    alert(
      "Пожалуйста, ознакомьтесь и согласитесь с политикой конфиденциальности",
    );
    return;
  }

  alert(
    "Спасибо! Наш менеджер свяжется с вами и подберет решение для вашего бизнеса.",
  );
}

// --- 7. Бургер и меню для мобильной версии ---
function toggleMobileMenu() {
  const nav = document.querySelector(".header-nav");
  const isOpen = nav.classList.toggle("open");

  // Если меню открыто — запрещаем скролл, если закрыто — разрешаем
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// Закрытие при клике по любой ссылке внутри меню
document.querySelectorAll(".header-nav ul li a").forEach((link) => {
  link.addEventListener("click", () => {
    const nav = document.querySelector(".header-nav");
    nav.classList.remove("open");
    document.body.style.overflow = "";
  });
}); 

// --- 8. ФУНКЦИИ ПАРСИНГА РЕАЛЬНЫХ ОТЗЫВОВ (ОБЪЕДИНЕННАЯ И ОЧИЩЕННАЯ) ---
async function fetchLiveRatings() {
  try {
    const response = await fetch("api-reviews.php");
    if (!response.ok) throw new Error("Ошибка ответа сервера");
    const data = await response.json();

    // Обновляем Яндекс
    if (data.yandex) {
      document.getElementById("live-ya-rating").innerText =
        `★ ${data.yandex.rating}`;
      document.getElementById("live-ya-reviews").innerText =
        `${data.yandex.reviews} ${getReviewsWord(data.yandex.reviews)}`;
    }

    // Обновляем Авито с проверкой на прочерки
    if (data.avito) {
      if (data.avito.rating === "—" || data.avito.reviews === "—") {
        document.getElementById("live-avito-rating").innerText = "★ —";
        document.getElementById("live-avito-reviews").innerText = "нет отзывов";
      } else {
        document.getElementById("live-avito-rating").innerText =
          `★ ${data.avito.rating}`;
        document.getElementById("live-avito-reviews").innerText =
          `${data.avito.reviews} ${getReviewsWord(data.avito.reviews)}`;
      }
    }
  } catch (error) {
    console.error(
      "Не удалось получить живые отзывы, работают стандартные заглушки из HTML:",
      error,
    );
  }
}

// Умное склонение слова "отзыв"
function getReviewsWord(number) {
  let n = Math.abs(number) % 100;
  let n1 = n % 10;
  if (n > 10 && n < 20) return "отзывов";
  if (n1 > 1 && n1 < 5) return "отзыва";
  if (n1 === 1) return "отзыв";
  return "отзывов";
}

// --- 9. ЕДИНЫЙ ИНИЦИАЛИЗАТОР ИВЕНТОВ ПОСЛЕ ЗАГРУЗКИ DOM ---
document.addEventListener("DOMContentLoaded", () => {
  // Инициализация аккордеона FAQ
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      item.classList.toggle("is-active");
    });
  });

  // Запуск парсинга отзывов
  fetchLiveRatings();
});
// --- ЛОГИКА ПЛАВАЮЩЕГО (ДОГОНЯЮЩЕГО) МЕНЮ ---
const navMenu = document.querySelector(".header-nav");
// Запоминаем начальную точку, где меню стоит в шапке по умолчанию
const menuInitialTop = navMenu.offsetTop;

window.addEventListener("scroll", () => {
  // Проверяем, на сколько пикселей пользователь прокрутил страницу вниз
  if (window.scrollY > menuInitialTop + 100) {
    // Если ушли вниз — включаем режим полета
    navMenu.classList.add("floating");
  } else {
    // Если вернулись в самый верх — сажаем меню обратно на его законное место
    navMenu.classList.remove("floating");
  }
});
// --- ЛОГИКА СЛАЙДЕРОВ ДО / ПОСЛЕ ---
const sliders = document.querySelectorAll(".before-after-slider");

sliders.forEach((slider) => {
  const range = slider.querySelector(".slider-range");
  const beforeImg = slider.querySelector(".img-before");
  const line = slider.querySelector(".slider-line");

  range.addEventListener("input", (e) => {
    const value = e.target.value;

    // Меняем ширину картинки "ДО"
    beforeImg.style.width = `${value}%`;
    // Передвигаем вертикальную разделительную линию
    line.style.left = `${value}%`;
  });
});
// --- ЛОГИКА ИНТЕРАКТИВНОГО КАЛЬКУЛЯТОРА ---
const rangeItems = document.getElementById("range-items");
const rangeVolume = document.getElementById("range-volume");
const serviceChecking = document.getElementById("service-checking");
const serviceMarking = document.getElementById("service-marking");
const serviceBubble = document.getElementById("service-bubble");

// Элементы вывода данных
const valItems = document.getElementById("range-items-val");
const valVolume = document.getElementById("range-volume-val");
const resBase = document.getElementById("res-base");
const resServices = document.getElementById("res-services");
const resDiscount = document.getElementById("res-discount");
const resTotal = document.getElementById("res-total");

// Логика визуального переключения табов маркетплейсов
const marketOptions = document.querySelectorAll(".market-option");
marketOptions.forEach((option) => {
  option.addEventListener("click", function () {
    marketOptions.forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");
    calculatePrice();
  });
});

function calculatePrice() {
  const count = parseInt(rangeItems.value);
  const volume = parseFloat(rangeVolume.value);

  // Обновляем циферки рядом с ползунками
  valItems.innerText = count.toLocaleString("ru-RU");
  valVolume.innerText = volume.toFixed(1);

  // 1. Считаем базовый тариф (зависит от объема единицы товара)
  // Допустим, обработка базовой единицы стоит 25 руб + коэффициент от объема
  let basePerItem = 25 + volume * 2;
  let baseTotal = count * basePerItem;

  // 2. Считаем доп. услуги (цена за шт * количество)
  let servicesTotal = 0;
  if (serviceChecking.checked) servicesTotal += count * 7; // Проверка брака: 7р/шт
  if (serviceMarking.checked) servicesTotal += count * 5; // Маркировка: 5р/шт
  if (serviceBubble.checked) servicesTotal += count * 15; // Пупырка: 15р/шт

  // 3. Система скидок за объем (Объемный опт)
  let discount = 0;
  if (count >= 1000 && count < 3000) {
    discount = (baseTotal + servicesTotal) * 0.05; // 5% скидка
  } else if (count >= 3000 && count < 5000) {
    discount = (baseTotal + servicesTotal) * 0.1; // 10% скидка
  } else if (count >= 5000) {
    discount = (baseTotal + servicesTotal) * 0.15; // 15% скидка
  }

  // Итоговая сумма
  let total = baseTotal + servicesTotal - discount;

  // Выводим все красиво на экран форматированным текстом
  resBase.innerText = `${Math.round(baseTotal).toLocaleString("ru-RU")} ₽`;
  resServices.innerText = `${Math.round(servicesTotal).toLocaleString("ru-RU")} ₽`;
  resDiscount.innerText = `-${Math.round(discount).toLocaleString("ru-RU")} ₽`;
  resTotal.innerText = `${Math.round(total).toLocaleString("ru-RU")} ₽`;
}

// Навешиваем события изменения на все инпуты
[
  rangeItems,
  rangeVolume,
  serviceChecking,
  serviceMarking,
  serviceBubble,
].forEach((input) => {
  input.addEventListener("input", calculatePrice);
  input.addEventListener("change", calculatePrice);
});

// Запускаем первичный расчет при инициализации страницы
calculatePrice();
