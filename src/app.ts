// Store Analytics -- Ulesanne 2: Interactive Web Application
// RAM0541 / TypeScript
export {};

// INTERFACES

type StockStatus = "OUT" | "LOW" | "IN_STOCK";
type SortField   = "name" | "price" | "available" | "status";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantities: number[];
  specs?: Record<string, string>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// PURE DOMAIN LOGIC

function getAvailable(quantities: number[]): number {
  return quantities.reduce((sum, q) => sum + q, 0);
}

function getStockStatus(available: number): StockStatus {
  if (available === 0) return "OUT";
  if (available <= 2)  return "LOW";
  return "IN_STOCK";
}

// LOCAL STORAGE

const STORAGE_KEY = "store_analytics_v1";

function loadProducts(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    const defaults = getDefaultProducts();
    saveProducts(defaults);
    return defaults;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Product[];
    }
  } catch (_) {
    // JSON corrupt -- fall through to defaults
  }
  return getDefaultProducts();
}

function saveProducts(list: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("LocalStorage write failed:", err);
  }
}

function getDefaultProducts(): Product[] {
  return [
    {
      id: "PROD-CLEAN-CODE",
      name: "Clean Code",
      category: "Books",
      price: 29.99,
      quantities: [12],
      specs: { pages: "350", language: "en" },
    },
    {
      id: "PROD-DELL-XPS",
      name: "Dell XPS 15",
      category: "Electronics",
      price: 1299.99,
      quantities: [2, 1, 0],
      specs: { cpu: "Intel i7", ram: "16GB", storage: "512GB" },
    },
    {
      id: "PROD-USB-HUB",
      name: "USB-C Hub 8-in-1",
      category: "Accessories",
      price: 59.00,
      quantities: [0, 0, 0],
      specs: { ports: "8", usbVersion: "USB 3.2" },
    },
    {
      id: "PROD-MX-MOUSE",
      name: "Logitech MX Master 3",
      category: "Accessories",
      price: 99.50,
      quantities: [5, 3, 1],
    },
  ];
}

// INPUT VALIDATION

function validateInput(
  name: string,
  category: string,
  priceStr: string,
  quantitiesStr: string
): ValidationResult {
  const errors: string[] = [];

  if (name.trim().length === 0) {
    errors.push("Name is required.");
  }
  if (category.trim().length === 0) {
    errors.push("Category is required.");
  }
  const price = parseFloat(priceStr);
  if (priceStr.trim().length === 0 || isNaN(price) || price < 0) {
    errors.push("Price must be a valid non-negative number.");
  }
  if (quantitiesStr.trim().length === 0) {
    errors.push("Warehouse quantities are required (e.g., 5, 3, 2).");
  } else {
    const parts = quantitiesStr.split(",").map(s => s.trim());
    for (const part of parts) {
      if (part.length === 0) {
        errors.push("Quantities cannot contain empty entries.");
        break;
      }
      const n = Number(part);
      if (!Number.isInteger(n) || n < 0) {
        errors.push("Each quantity must be a non-negative whole number.");
        break;
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

function parseSpecs(raw: string): Record<string, string> | undefined {
  if (raw.trim().length === 0) return undefined;
  const result: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      if (key.length > 0) result[key] = val;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function generateId(): string {
  return "PROD-" + Date.now().toString(36).toUpperCase();
}

// APPLICATION STATE

let products: Product[] = loadProducts();
let filterText: string   = "";
let sortField: SortField  = "name";

// DOM UTILITIES

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts?: { id?: string; className?: string; text?: string }
): HTMLElementTagNameMap[K] {
  const elem = document.createElement(tag);
  if (opts?.id)        elem.id = opts.id;
  if (opts?.className) elem.className = opts.className;
  if (opts?.text)      elem.textContent = opts.text;
  return elem;
}

function buildField(
  labelText: string,
  inputId: string,
  inputType: string,
  required: boolean,
  placeholder?: string
): HTMLDivElement {
  const wrapper = el("div", { className: "field" });
  const label = el("label", { text: labelText + (required ? " *" : "") });
  label.htmlFor = inputId;
  const input = el("input");
  input.type = inputType;
  input.id   = inputId;
  input.name = inputId;
  if (required)    input.required = true;
  if (placeholder) input.placeholder = placeholder;
  if (inputType === "number") {
    input.min  = "0";
    input.step = "0.01";
  }
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

// FILTERING AND SORTING

function getFilteredSorted(): Product[] {
  const lower  = filterText.toLowerCase();
  const result = filterText
    ? products.filter(p => p.name.toLowerCase().includes(lower))
    : [...products];

  const statusOrder: Record<StockStatus, number> = { IN_STOCK: 0, LOW: 1, OUT: 2 };

  result.sort((a, b): number => {
    switch (sortField) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "available":
        return getAvailable(b.quantities) - getAvailable(a.quantities);
      case "status": {
        const sa = statusOrder[getStockStatus(getAvailable(a.quantities))];
        const sb = statusOrder[getStockStatus(getAvailable(b.quantities))];
        return sa - sb;
      }
    }
  });
  return result;
}

// RENDER FUNCTIONS

function buildProductCard(product: Product): HTMLDivElement {
  const available = getAvailable(product.quantities);
  const status    = getStockStatus(available);

  const card = el("div", { className: "product-card" });
  card.dataset.id = product.id;

  card.appendChild(el("h3",  { text: product.name }));
  card.appendChild(el("p", { className: "card-category",  text: "Category: " + product.category }));
  card.appendChild(el("p", { className: "card-price",     text: "Price: $" + product.price.toFixed(2) }));
  card.appendChild(el("p", { className: "card-available", text: "Available: " + available }));

  const badge = el("span", {
    className: "status-badge status-" + status.toLowerCase(),
    text: "Status: " + status,
  });
  card.appendChild(badge);

  if (product.specs !== undefined) {
    const specsStr = Object.entries(product.specs).map(([k, v]) => k + "=" + v).join(", ");
    card.appendChild(el("p", { className: "card-specs", text: "Specs: " + specsStr }));
  }

  return card;
}

function renderProductList(): void {
  const container = document.querySelector<HTMLElement>("#product-list");
  if (container === null) return;

  while (container.firstChild !== null) {
    container.removeChild(container.firstChild);
  }

  const visible = getFilteredSorted();

  if (visible.length === 0) {
    container.appendChild(el("p", { className: "empty-msg", text: "No products found." }));
    return;
  }
  for (const product of visible) {
    container.appendChild(buildProductCard(product));
  }
}

// EVENT HANDLERS

function showErrors(errors: string[]): void {
  const box = document.querySelector<HTMLElement>("#form-errors");
  if (box === null) return;
  if (errors.length === 0) {
    box.innerHTML = "";
    box.classList.add("hidden");
    return;
  }
  box.innerHTML = "";
  for (const err of errors) {
    box.appendChild(el("p", { text: err }));
  }
  box.classList.remove("hidden");
}

function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;

  const name          = (form.elements.namedItem("name")       as HTMLInputElement).value;
  const category      = (form.elements.namedItem("category")   as HTMLInputElement).value;
  const priceStr      = (form.elements.namedItem("price")      as HTMLInputElement).value;
  const quantitiesStr = (form.elements.namedItem("quantities") as HTMLInputElement).value;
  const specsStr      = (form.elements.namedItem("specs")      as HTMLInputElement).value;

  const { valid, errors } = validateInput(name, category, priceStr, quantitiesStr);
  showErrors(errors);
  if (!valid) return;

  const quantities = quantitiesStr.split(",").map(s => parseInt(s.trim(), 10));

  const newProduct: Product = {
    id:         generateId(),
    name:       name.trim(),
    category:   category.trim(),
    price:      parseFloat(priceStr),
    quantities,
    specs:      parseSpecs(specsStr),
  };

  products.push(newProduct);
  saveProducts(products);
  renderProductList();
  form.reset();
  showErrors([]);
}

// BUILD UI SECTIONS

function buildHeader(): HTMLElement {
  const header = el("header");
  header.appendChild(el("h1", { text: "Store Analytics" }));
  return header;
}

function buildFormSection(): HTMLElement {
  const section = el("section", { className: "form-section" });
  section.appendChild(el("h2", { text: "Add Product" }));

  const form = el("form");
  form.id = "product-form";
  form.noValidate = true;

  form.appendChild(buildField("Name",     "name",     "text",   true,  "e.g., Dell XPS 15"));
  form.appendChild(buildField("Category", "category", "text",   true,  "e.g., Electronics"));
  form.appendChild(buildField("Price",    "price",    "number", true));
  form.appendChild(buildField(
    "Warehouse Quantities (comma-separated)",
    "quantities", "text", true, "e.g., 5, 3, 2"
  ));
  form.appendChild(buildField(
    "Specifications (key=value, key=value)",
    "specs", "text", false, "e.g., processor=Intel i7, ram=16GB"
  ));

  form.appendChild(el("div", { id: "form-errors", className: "error-box hidden" }));

  const btn = el("button", { className: "btn-add", text: "Add Product" });
  btn.type = "submit";
  form.appendChild(btn);

  form.addEventListener("submit", handleFormSubmit);
  section.appendChild(form);
  return section;
}

function buildControlsSection(): HTMLElement {
  const section = el("section", { className: "controls" });

  const filterGroup = el("div", { className: "control-group" });
  const filterLabel = el("label", { text: "Filter by name:" });
  filterLabel.htmlFor = "filter-input";
  const filterInput = el("input", { id: "filter-input" });
  filterInput.type        = "text";
  filterInput.placeholder = "Search products...";
  filterInput.addEventListener("input", () => {
    filterText = filterInput.value;
    renderProductList();
  });
  filterGroup.appendChild(filterLabel);
  filterGroup.appendChild(filterInput);

  const sortGroup = el("div", { className: "control-group" });
  const sortLabel = el("label", { text: "Sort by:" });
  sortLabel.htmlFor = "sort-select";
  const sortSelect = el("select", { id: "sort-select" });

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "name",      label: "Name"      },
    { value: "price",     label: "Price"     },
    { value: "available", label: "Available" },
    { value: "status",    label: "Status"    },
  ];
  for (const opt of sortOptions) {
    const option = el("option", { text: opt.label });
    option.value = opt.value;
    sortSelect.appendChild(option);
  }
  sortSelect.addEventListener("change", () => {
    sortField = sortSelect.value as SortField;
    renderProductList();
  });
  sortGroup.appendChild(sortLabel);
  sortGroup.appendChild(sortSelect);

  section.appendChild(filterGroup);
  section.appendChild(sortGroup);
  return section;
}

function buildProductSection(): HTMLElement {
  const section = el("section", { className: "product-section" });
  section.appendChild(el("div", { id: "product-list", className: "product-grid" }));
  return section;
}

// INIT

function init(): void {
  const app = document.querySelector<HTMLElement>("#app");
  if (app === null) {
    console.error("#app root element not found.");
    return;
  }

  const main = el("main");
  main.appendChild(buildFormSection());
  main.appendChild(buildControlsSection());
  main.appendChild(buildProductSection());

  app.appendChild(buildHeader());
  app.appendChild(main);

  renderProductList();
}

document.addEventListener("DOMContentLoaded", init);
