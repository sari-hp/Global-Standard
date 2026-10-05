// ========================================
// 下層ページ用（js/script.js は承認済みトップの成果物のため分ける）
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  initAccordion();
  initInquiryType();
  initForms();
});

// ========================================
// Inquiry Type（サービスの「お申し込みはこちら」から来たときに研修を選んでおく。制作前チェック No.30）
// ========================================
function initInquiryType() {
  const select = document.querySelector("#type");
  if (!select) return;

  const type = new URLSearchParams(window.location.search).get("type");
  if (type && select.querySelector(`option[value="${CSS.escape(type)}"]`)) {
    select.value = type;
  }
}

// ========================================
// Form Validation（入力→完了の2画面。エラーは各項目の下に赤字。制作前チェック No.31）
// 静的版は入力が正しければ完了ページへ移動する（送信は WordPress 化で実装）
// ========================================
function initForms() {
  const forms = document.querySelectorAll(".js-form");
  if (!forms.length) return;

  const messages = {
    required: (label) => `${label}を入力してください。`,
    select: (label) => `${label}を選択してください。`,
    agree: () => "個人情報保護方針への同意が必要です。",
    email: () => "メールアドレスの形式で入力してください。（例）info@example.com",
    tel: () => "電話番号は数字とハイフンで入力してください。（例）0312345678",
    kana: () => "フリガナは全角カタカナで入力してください。",
  };

  const labelOf = (field) => {
    const label = field.form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.trim() : "";
  };

  const check = (field) => {
    const value = field.type === "checkbox" ? "" : field.value.trim();
    if (field.type === "checkbox") return field.checked ? "" : messages.agree();
    if (field.required && !value) return field.tagName === "SELECT" ? messages.select(labelOf(field)) : messages.required(labelOf(field));
    if (!value) return "";
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return messages.email();
    if (field.type === "tel" && !/^[0-9０-９-－]{10,13}$/.test(value)) return messages.tel();
    if (field.dataset.kana && !/^[ァ-ヶー　\s]+$/.test(value)) return messages.kana();
    return "";
  };

  const show = (field, message) => {
    const error = document.getElementById(`${field.id}-error`);
    if (error) error.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  forms.forEach((form) => {
    const fields = form.querySelectorAll("input, select, textarea");
    let submitted = false;

    // 一度送信を押したあとは、入力のたびにエラーを更新する
    fields.forEach((field) => {
      const update = () => {
        if (submitted) show(field, check(field));
      };
      field.addEventListener("input", update);
      field.addEventListener("change", update);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
      let firstInvalid = null;
      fields.forEach((field) => {
        const message = check(field);
        show(field, message);
        if (message && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      window.location.href = form.getAttribute("action");
    });
  });
}

// ========================================
// Accordion（よくある質問。details/summary を使い、JSなしでも開閉できる）
// ========================================
function initAccordion() {
  const items = document.querySelectorAll(".js-accordion");
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timing = { duration: 300, easing: "ease-out" };

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const body = item.querySelector(".js-accordion-body");
    if (!summary || !body) return;

    summary.addEventListener("click", (e) => {
      // 動きを減らす設定・アニメーション非対応のときは details の標準の開閉に任せる
      if (reduceMotion.matches || typeof body.animate !== "function") return;
      e.preventDefault();
      if (item.classList.contains("is-closing")) return;

      if (item.open) {
        item.classList.add("is-closing");
        const close = body.animate([{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], timing);
        close.onfinish = () => {
          item.open = false;
          item.classList.remove("is-closing");
        };
      } else {
        item.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], timing);
      }
    });
  });
}
