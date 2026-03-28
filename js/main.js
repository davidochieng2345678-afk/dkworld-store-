// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  displayProducts("productsContainer");
  loadProductPage();
});

// ======================
// MENU
// ======================
function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      if (menu.style.display === "flex") {
        menu.style.display = "none";
      } else {
        menu.style.display = "flex";
        menu.style.flexDirection = "column";
      }
    });
  }
}

// ======================
// STORAGE
// ======================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct(product) {
  let products = getProducts();

  product.id = Date.now();
  product.createdAt = new Date().toISOString();

  products.push(product);
  saveProducts(products);

  alert("Product added successfully!");
}

// ======================
// DISPLAY PRODUCTS
// ======================
function displayProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = getProducts();
  container.innerHTML = "";

  // Remove old schema
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  products.forEach(p => {
    container.innerHTML += `
      <div class="product">
        <img src="${p.images?.[0] || p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>KES ${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "sku": p.sku || "",
      "description": p.description || "",
      "image": p.images || [p.image],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KES",
        "price": p.price,
        "availability": p.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// ======================
// PRODUCT PAGE
// ======================
function loadProductPage() {
  const container = document.getElementById("product");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const product = getProducts().find(p => p.id == id);

  if (!product) {
    container.innerHTML = "<p style='color:red;'>Product not found</p>";
    return;
  }

  container.innerHTML = `
    <div style="background:white; padding:20px; border-radius:12px;">
      <h2>${product.name}</h2>

      ${product.images
        ? product.images.map(img => `<img src="${img}" width="200">`).join("")
        : `<img src="${product.image}" width="200">`
      }

      ${product.video ? `
        <div class="video">
          <iframe width="100%" height="300" src="${product.video}" frameborder="0" allowfullscreen></iframe>
        </div>
      ` : ""}

      <p><strong>Price:</strong> KES ${product.price}</p>
      <p><strong>SKU:</strong> ${product.sku || "N/A"}</p>
      <p><strong>Stock:</strong> ${product.stock > 0 ? "In Stock" : "Out of Stock"}</p>

      <p>${product.description || ""}</p>

      <button onclick="addToCart(${product.id})">Add to Cart</button>

      ${product.faq?.length ? `
        <h3>FAQs</h3>
        ${product.faq.map(f => `
          <p><strong>${f.question}</strong><br>${f.answer}</p>
        `).join("")}
      ` : ""}
    </div>
  `;

  // Clear old schema
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.sku,
    "description": product.description,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KES",
      "price": product.price,
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ======================
// CART
// ======================
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProducts().find(p => p.id == productId);

  if (!product) return alert("Product not found!");

  cart.push({
    id: product.id,
    name: product.name,
    price: product.price
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function displayCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price;
    container.innerHTML += `<p>${item.name} - KES ${item.price}</p>`;
  });

  container.innerHTML += `<h3>Total: KES ${total}</h3>`;
}

// ======================
// WHATSAPP CHECKOUT
// ======================
function checkoutWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";

  let total = 0;

  cart.forEach(item => {
    message += `- ${item.name} (KES ${item.price})%0A`;
    total += item.price;
  });

  message += `%0ATotal: KES ${total}%0A%0A`;
  message += "Please guide me on payment and delivery.";

  const phoneNumber = "254710346425"; // your number
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(url, "_blank");
}


function addProductFromForm() {
  const product = {
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value,
    images: document.getElementById("images").value.split(","),
    video: document.getElementById("video").value,
    sku: document.getElementById("sku").value,
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    faq: [
      {
        question: document.getElementById("faqQ1").value,
        answer: document.getElementById("faqA1").value
      },
      {
        question: document.getElementById("faqQ2").value,
        answer: document.getElementById("faqA2").value
      }
    ]
  };

  addProduct(product);
}
