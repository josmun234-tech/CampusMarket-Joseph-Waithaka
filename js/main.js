document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const searchForm = document.getElementById("product-search-form");
  const searchInput = document.getElementById("site-search");
  const cards = [...document.querySelectorAll(".product-card")];
  const countEl = document.getElementById("result-count");
  const categoryButtons = [...document.querySelectorAll(".category-filter")];

  let cartCount = 0;
  let activeCategory = "all";

  const updateCart = () => {
    if (cartCountEl) cartCountEl.textContent = String(cartCount);
  };

  const updateResults = () => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let visible = 0;

    cards.forEach((card) => {
      const cardText = (card.dataset.search || card.textContent).toLowerCase();
      const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
      const matchesQuery = !query || cardText.includes(query);
      const isVisible = matchesCategory && matchesQuery;

      card.hidden = !isVisible;
      if (isVisible) visible += 1;
    });

    if (countEl) countEl.textContent = String(visible);
  };

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      cartCount += 1;
      updateCart();

      const originalText = button.textContent;
      button.textContent = "Added";
      button.disabled = true;
      button.setAttribute("aria-live", "polite");

      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 700);
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      activeCategory = button.dataset.category || "all";

      categoryButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });

      updateResults();
    });
  });

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateResults();
    });

    searchInput.addEventListener("input", updateResults);
  }

  updateCart();
  updateResults();
});
