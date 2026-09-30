# Petrol Station Manager

A simple, responsive web app to manage a petrol station: fuel stock, purchases, daily sales, customer credit and invoices, suppliers, expenses and reports.

## Built with
- **HTML5** – page structure (`index.html`)
- **Tailwind CSS** (CDN) – all styling and the responsive layout, written with Tailwind utilities and `@apply` component classes inside `index.html` (there is no separate CSS file)
- **JavaScript (vanilla, no frameworks)** – all app logic (`js/app.js`)
- Google Fonts (Inter, Bricolage Grotesque)
- Data is stored in the browser with `localStorage` (no backend yet)

## Features
Dashboard with sales chart (7 days / monthly / yearly) and low-stock alert, Fuel & Stock, Purchases (Petrol and Diesel on one invoice), Daily Sales (meter readings), Customers with credit limits, profiles and invoices, Payments, Suppliers with profiles, Expenses, Daily and Monthly reports with print, Settings (backup / restore).

## Run locally
Open `index.html` in a browser (internet is needed for the Tailwind CDN script and fonts), or use the VS Code **Live Server** extension (right click `index.html` > Open with Live Server).

## Project structure
```
petrol-station-manager/
  index.html
  js/app.js
  README.md
  .gitignore
```

## Note
Data lives only in your browser. Use Settings > Backup to copy your data somewhere safe.
