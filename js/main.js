  // ======================
// MENU TOGGLE
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
  }

  // Display products after DOM loaded
  displayProducts("productsContainer");
});

// ======================
// PRODUCTS STORAGE
// ======================
let products = [
  {
    id: 1,
    name: "DK World Website Template",
    price: 5000,
    sku: "DKW001",
    description: "Premium ready-to-use website for small businesses.",
    images: ["../images/product1.png"],
    video: "https://youtu.be/xyz123",
    stock: 10,
    category: "Websites",
    tags: ["website", "template", "digital product"],
    faq: [
      { question: "Can I customize this?", answer: "Yes, fully customizable." },
      { question: "Is support included?", answer: "Yes, 30 days free support." }
    ],
    createdAt: new Date().toISOString()
  }
];

function saveProduct(product) {
  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added!");
}

function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || products;
}

// ======================
// DISPLAY PRODUCTS
// ======================
function displayProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = getProducts();
  container.innerHTML = "";

  items.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.images[0]}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p>Price: KES ${p.price}</p>
        <button onclick="addToCart('${p.id}')">Add to Cart</button>
        <a href="product.html?id=${p.id}">View Details</a>
      </div>
    `;

    // JSON-LD Schema for SEO
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "sku": p.sku,
      "description": p.description,
      "image": p.images,
      "video": p.video || undefined,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KES",
        "price": p.price,
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": window.location.href
      },
      "review": p.faq.length > 0 ? {
        "@type": "Review",
        "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 },
        "author": { "@type": "Person", "name": "Happy Customer" }
      } : undefined
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// ======================
// CART FUNCTIONS
// ======================
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProducts().find(p => p.id == productId);
  if (!product) return alert("Product not found!");

  cart.push({ id: product.id, name: product.name, price: product.price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function displayCart(containerId) {
  const container = document.getElementById(containerId);
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    total += item.price;
    container.innerHTML += `<p>${item.name} - KES ${item.price}</p>`;
  });

  container.innerHTML += `<h3>Total: KES ${total}</h3>`;
}
