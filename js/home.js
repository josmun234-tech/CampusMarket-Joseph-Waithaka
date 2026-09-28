const homeProducts = window.campusMarketProducts;
const homeSearchForm = document.getElementById('home-search');
const homeSearchInput = document.getElementById('home-search-input');
const homeProductGrid = document.getElementById('home-product-grid');
const homeResultCount = document.getElementById('home-result-count');
const homeEmptyState = document.getElementById('home-empty-state');
const homeCategoryButtons = document.querySelectorAll('[data-home-category]');
let selectedHomeCategory = 'all';

document.querySelectorAll('[data-count-category]').forEach(countElement => {
  const category = countElement.dataset.countCategory;
  const count = category === 'all'
    ? homeProducts.length
    : homeProducts.filter(product => product.category === category).length;
  countElement.textContent = String(count).padStart(2, '0');
});

function makeMarketplaceListing(product) {
  const item = document.createElement('li');
  item.className = 'market-listing';

  const imageLink = document.createElement('a');
  imageLink.className = 'market-listing-image-link';
  imageLink.href = 'catalog.html#catalog';
  imageLink.setAttribute('aria-label', `Browse ${product.name} in the catalog`);

  const image = document.createElement('img');
  image.className = 'market-listing-image';
  image.src = product.image;
  image.alt = product.name;
  image.loading = 'lazy';
  imageLink.append(image);

  const details = document.createElement('div');
  details.className = 'market-listing-details';

  const category = document.createElement('p');
  category.className = 'market-listing-category';
  category.textContent = product.categoryLabel;

  const title = document.createElement('h3');
  title.className = 'market-listing-title';
  title.textContent = product.name;

  const price = document.createElement('p');
  price.className = 'market-listing-price';
  price.textContent = product.price ? `KSh ${product.price.toLocaleString()}` : 'FREE';

  const footer = document.createElement('div');
  footer.className = 'market-listing-footer';
  const seller = document.createElement('span');
  seller.className = 'market-seller';
  seller.textContent = `Listed by ${product.seller}`;
  const browseLink = document.createElement('a');
  browseLink.href = 'catalog.html#catalog';
  browseLink.className = 'market-listing-link';
  browseLink.textContent = 'View item';

  footer.append(seller, browseLink);
  details.append(category, title, price, footer);
  item.append(imageLink, details);
  return item;
}

function renderMarketplaceListings() {
  const query = homeSearchInput.value.trim().toLowerCase();
  const matchingProducts = homeProducts.filter(product => {
    const matchesCategory = selectedHomeCategory === 'all' || product.category === selectedHomeCategory;
    const searchableText = `${product.name} ${product.categoryLabel} ${product.seller}`.toLowerCase();
    return matchesCategory && searchableText.includes(query);
  });

  homeProductGrid.replaceChildren();
  matchingProducts.forEach(product => homeProductGrid.append(makeMarketplaceListing(product)));
  homeResultCount.textContent = String(matchingProducts.length);
  homeEmptyState.hidden = matchingProducts.length > 0;
}

homeCategoryButtons.forEach(button => {
  button.addEventListener('click', function() {
    selectedHomeCategory = this.dataset.homeCategory;
    homeCategoryButtons.forEach(categoryButton => {
      const isSelected = categoryButton === this;
      categoryButton.classList.toggle('is-selected', isSelected);
      categoryButton.setAttribute('aria-pressed', String(isSelected));
    });
    renderMarketplaceListings();
  });
});

homeSearchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  renderMarketplaceListings();
});

homeSearchInput.addEventListener('input', renderMarketplaceListings);
renderMarketplaceListings();