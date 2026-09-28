Full Name: Joseph Mungai Waithaka
Admission Number: CIT-223-066/2024
Live Site: https://cool-wisp-7283cc.netlify.app

# CampusMarket — CCS 2314 Semester Project

CampusMarket is a responsive, client-side student marketplace. It includes a searchable product catalog, category filters, a wraparound featured-product gallery, a localStorage cart, checkout validation, demo authentication, and a profile/order view.

## Project Files

- `index.html`: marketplace home page
- `catalog.html`: product catalog, filter, gallery, cart, and checkout
- `login.html`: sign-in and registration forms
- `profile.html`: profile, order history, and account editing
- `css/style.css`: shared catalog and cart styles
- `css/catalog-dark.css`: dark theme scoped to the full catalog experience
- `css/marketplace.css`: landing-page marketplace layout
- `js/products.js`: shared product records used on the landing page and catalog
- `js/home.js`: landing-page search, category filters, and listing cards
- `js/main.js`: catalog filtering, gallery, cart, and checkout logic
- `js/auth.js`, `js/login.js`, `js/profile.js`: authentication and account-page behavior
- `images/`: bundled product photos used by the catalog and gallery

The landing page listings, catalog cards, and featured gallery all use `window.campusMarketProducts` from `js/products.js`. Category filters and search select a subset of that shared array, keeping the image and category data aligned across pages.

## Run and Test

Open `index.html` in a browser to search listings and filter by department. Use **Browse all** to open the full catalog. Product photos are bundled in `images/`, and local asset links are relative. Cart, demo-account, and order data are stored in the browser's localStorage; this is a front-end demonstration, not a secure production checkout.

Demo sign-in: `student@campus.edu` / `password123`.

For a static deployment, connect this repository to the instructor-approved provider, leave the build command blank, and use the repository root as the publish directory. The Netlify URL above must be accessible without team protection; test it in a fresh, signed-out browser tab before submitting. Confirm the required hosting provider and the instructor's "static feature" before final submission.
