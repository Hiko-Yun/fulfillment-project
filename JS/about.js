// --- ЛОГИКА ПЛАВАЮЩЕГО МЕНЮ ---
const navMenu = document.querySelector(".header-nav");
const menuInitialTop = navMenu.offsetTop;

window.addEventListener("scroll", () => {
  if (window.scrollY > menuInitialTop + 100) {
    navMenu.classList.add("floating");
  } else {
    navMenu.classList.remove("floating");
  }
});

// --- ФУНКЦИЯ СКЛОНЕНИЯ (обязательно нужна!) ---
function getReviewsWord(number) {
  let n = Math.abs(number) % 100;
  let n1 = n % 10;
  if (n > 10 && n < 20) return "отзывов";
  if (n1 > 1 && n1 < 5) return "отзыва";
  if (n1 === 1) return "отзыв";
  return "отзывов";
}

// --- ЛОГИКА ЖИВЫХ ОТЗЫВОВ ---
async function fetchLiveRatings() {
  try {
    const response = await fetch("api-reviews.php");
    if (!response.ok) throw new Error("Ошибка ответа сервера");
    const data = await response.json();

    if (data.yandex) {
      document.getElementById("live-ya-rating").innerText =
        `★ ${data.yandex.rating}`;
      document.getElementById("live-ya-reviews").innerText =
        `${data.yandex.reviews} ${getReviewsWord(data.yandex.reviews)}`;
    }

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
    console.error("Не удалось получить живые отзывы:", error);
  }
}

// !!! ВОТ ЭТОЙ СТРОКИ У ТЕБЯ НЕ ХВАТАЛО !!!
document.addEventListener("DOMContentLoaded", () => {
  fetchLiveRatings();
});
