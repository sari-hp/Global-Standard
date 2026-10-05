// ========================================
// Initialize
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  initHeaderMenu();
  initMainvisualSlider();
  initScrollReveal();
});

// ========================================
// Scroll Reveal（見出し・カード・画像が画面に入ったら下から浮き上がって表示。制作前チェック No.18）
// JS が動かない環境・「動きを減らす」設定では何も隠さず最初から表示する
// ========================================
function initScrollReveal() {
  const targets = document.querySelectorAll(".js-reveal");
  if (!targets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // 1回だけ
      });
    },
    { rootMargin: "0px 0px -10% 0px" } // 画面の下から1割入ったところで表示
  );

  targets.forEach((target) => {
    target.classList.add("is-reveal");
    observer.observe(target);
  });
}

// ========================================
// Header Menu（ハンバーガー。768px以下で使用）
// ========================================
function initHeaderMenu() {
  const toggle = document.querySelector(".js-menu-toggle");
  if (!toggle) return;

  const drawer = document.querySelector(".js-drawer");
  if (!drawer) return;

  const mql = window.matchMedia("(min-width: 769px)"); // sass の $breakpoints md と同じ

  const closeDrawer = () => {
    toggle.classList.remove("is-open");
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
    document.body.style.overflow = "";
    if (mql.matches) {
      drawer.removeAttribute("aria-hidden");
    } else {
      drawer.setAttribute("aria-hidden", "true");
    }
  };

  toggle.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    drawer.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // ドロワー内リンクで閉じる
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  // Escキーで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
      toggle.focus();
    }
  });

  // PC幅になったら閉じる（スクロールロック残留の防止）
  mql.addEventListener("change", closeDrawer);
  closeDrawer();
}

// ========================================
// Main Visual Slider（3枚をフェードで切り替え・5秒ごと。制作前チェック No.18）
// ========================================
function initMainvisualSlider() {
  const slider = document.querySelector(".js-mv-slider");
  if (!slider) return;

  const slides = slider.children;
  if (slides.length < 2) return;

  // 動きを減らす設定のときは切り替えない
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let current = 0;
  window.setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 5000);
}
