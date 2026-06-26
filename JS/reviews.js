// * reviews.html
function openReviewModal() {
  alert(
    "Здесь будет открываться форма/модалка 'Оставить отзыв' со звездочками и отправкой модератору на бэкенд!",
  );
}

// Функция получения живого рейтинга
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

    // Обновляем Авито
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
      "Не удалось получить живые отзывы, работают стандартные заглушки:",
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

// Запускаем парсинг сразу после загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
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

const burger = document.querySelector(".burger-menu-btn");
const headerTop = document.querySelector(".header-top");

window.addEventListener("scroll", () => {
  // Если ширина экрана мобильная
  if (window.innerWidth <= 768) {
    // Высота шапки, после которой кнопка должна прилипнуть
    const triggerHeight = headerTop.offsetHeight;

    if (window.scrollY > triggerHeight) {
      burger.classList.add("floating");
    } else {
      burger.classList.remove("floating");
    }
  }
});
