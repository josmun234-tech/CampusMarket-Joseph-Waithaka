// =========================================================
// CampusMarket — main.js
// Currently minimal on purpose: the syllabus introduces
// JavaScript in Week 2, form validation/events after that,
// and AJAX/JSON + PHP later. This file is where that logic
// will live as the app grows — don't create new JS files
// per week, keep adding to this one (and split into modules
// under js/ once it gets large).
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Minimal placeholder behaviour so the page isn't inert:
  // clicking "Add to cart" bumps the header cart counter.
  // This is NOT the real cart (that's a later milestone) —
  // it has no persistence, no backend call, and resets on reload.
  const cartCountEl = document.getElementById("cart-count");
  let cartCount = 0;

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      cartCount += 1;
      cartCountEl.textContent = cartCount;
    });
  });
});
