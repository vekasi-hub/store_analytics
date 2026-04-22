// Store Analytics -- Ulesanne 1: Console Report
// RAM0541 / TypeScript
export {};

// INTERFACES

interface Supplier {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  location: string;
}

interface StockEntry {
  warehouseId: string;
  quantity: number;
}

interface Review {
  rating: number;
}

interface DiscountRule {
  category: string;
  percentage: number;
  minRating?: number;
}

type StockStatus = "OUT" | "LOW" | "IN_STOCK";

interface Product {
  id: string;
  name: string;
  category: string;
  supplierId: string;
  price: number;
  stock: StockEntry[];
  reviews: Review[];
  specs?: Record<string, string | number>;
}

// DATA

const suppliers: Supplier[] = [
  { id: "S1", name: "Nordic Devices" },
  { id: "S2", name: "Euro Accessories" },
  { id: "S3", name: "Baltic Books" },
];

const warehouses: Warehouse[] = [
  { id: "W1", location: "Tallinn" },
  { id: "W2", location: "Tartu" },
  { id: "W3", location: "Parnu" },
];

const discountRules: DiscountRule[] = [
  { category: "Electronics", percentage: 10, minRating: 4.0 },
  { category: "Accessories", percentage: 15 },
  { category: "Books",       percentage: 15, minRating: 4.0 },
];

const products: Product[] = [
  {
    id: "LAP-DEL-XPS15",
    name: "Dell XPS 15",
    category: "Electronics",
    supplierId: "S1",
    price: 1299.99,
    stock: [
      { warehouseId: "W1", quantity: 2 },
      { warehouseId: "W2", quantity: 1 },
      { warehouseId: "W3", quantity: 0 },
    ],
    reviews: [{ rating: 4 }, { rating: 5 }],
    specs: { cpu: "Intel i7", ram: 16, storage: 512, weight: 1.8 },
  },
  {
    id: "ACC-LOG-MX3",
    name: "Logitech MX Master 35",
    category: "Accessories",
    supplierId: "S2",
    price: 99.50,
    stock: [
      { warehouseId: "W1", quantity: 5 },
      { warehouseId: "W2", quantity: 3 },
      { warehouseId: "W3", quantity: 1 },
    ],
    reviews: [
      { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 },
      { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 },
      { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 5 },
    ],
  },
  {
    id: "BOOK-TS-BASICS",
    name: "TypeScript for Beginners",
    category: "Books",
    supplierId: "S3",
    price: 39.90,
    stock: [
      { warehouseId: "W1", quantity: 1 },
      { warehouseId: "W2", quantity: 0 },
      { warehouseId: "W3", quantity: 0 },
    ],
    reviews: [{ rating: 3 }, { rating: 3 }, { rating: 3 }],
    specs: { pages: 320, language: "EN" },
  },
  {
    id: "ACC-USB-C-HUB",
    name: "USB-C Hub 8-in-1",
    category: "Accessories",
    supplierId: "S2",
    price: 59.00,
    stock: [
      { warehouseId: "W1", quantity: 0 },
      { warehouseId: "W2", quantity: 0 },
      { warehouseId: "W3", quantity: 0 },
    ],
    reviews: [],
    specs: { ports: 8, usbVersion: "USB 3.2" },
  },
];

// CALCULATIONS

function getAvailable(stock: StockEntry[]): number {
  return stock.reduce((sum, entry) => sum + entry.quantity, 0);
}

function getStockStatus(available: number): StockStatus {
  if (available === 0) return "OUT";
  if (available <= 2)  return "LOW";
  return "IN_STOCK";
}

function getAverageRating(reviews: Review[]): string {
  if (reviews.length === 0) return "no reviews";
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(2);
}

function getSupplierName(supplierId: string): string {
  return suppliers.find(s => s.id === supplierId)?.name ?? "Unknown";
}

function getDiscountedPrice(product: Product, ratingStr: string): number | null {
  const rule = discountRules.find(r => r.category === product.category);
  if (rule === undefined) return null;
  if (rule.minRating !== undefined) {
    if (ratingStr === "no reviews") return null;
    if (parseFloat(ratingStr) < rule.minRating) return null;
  }
  const discounted = product.price * (1 - rule.percentage / 100);
  return Math.round(discounted * 100) / 100;
}

function formatSpecs(specs: Record<string, string | number>): string {
  return Object.entries(specs).map(([k, v]) => k + "=" + v).join(", ");
}

// REPORT

function printReport(): void {
  const wNames = warehouses.map(w => w.location).join(", ");
  console.log("Warehouses: " + wNames);
  console.log("");
  console.log("Products:");

  for (const product of products) {
    const available  = getAvailable(product.stock);
    const status     = getStockStatus(available);
    const rating     = getAverageRating(product.reviews);
    const supplier   = getSupplierName(product.supplierId);
    const discounted = getDiscountedPrice(product, rating);

    let line = "- " + product.name + " [" + product.id + "]";
    line += " | " + product.category;
    line += " | supplier: " + supplier;
    line += " | available: " + available + " (" + status + ")";
    line += " | rating: " + rating;

    if (product.specs !== undefined && Object.keys(product.specs).length > 0) {
      line += " | specs: " + formatSpecs(product.specs);
    }

    if (discounted !== null) {
      line += " | price: " + product.price.toFixed(2) + " -> " + discounted.toFixed(2);
    } else {
      line += " | price: " + product.price.toFixed(2);
    }

    console.log(line);
  }
}

printReport();
