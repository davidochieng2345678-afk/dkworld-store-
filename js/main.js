// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  displayProducts("productsContainer"); // Show all products
  loadProductPage();                     // Load individual product if on product page
});

// ======================
// MENU TOGGLE
// ======================
function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isVisible = menu.style.display === "flex";
    menu.style.display = isVisible ? "none" : "flex";
    if (!isVisible) menu.style.flexDirection = "column";
  });
}

// ======================
// STORAGE HELPERS
// ======================
function getProducts() {
  try {
    return JSON.parse(localStorage.getItem("products")) || [];
  } catch (e) {
    console.error("Failed to parse products from localStorage", e);
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// ======================
// ADD PRODUCT
// ======================
function addProduct(product) {
  const products = getProducts();

  product.id = Date.now();                  // Unique ID
  product.createdAt = new Date().toISOString(); // Timestamp

  products.push(product);
  saveProducts(products);

  alert("✅ Product added successfully!");
}

// ======================
// DISPLAY PRODUCTS
// ======================
function displayProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = getProducts();
  container.innerHTML = "";

  // Remove old JSON-LD scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  let html = "";

  products.forEach(p => {
    const productImages = (p.images && p.images.length > 0) ? p.images : [p.image];
    const stockColor = p.stock > 0 ? 'green' : 'red';
    const stockText = p.stock > 0 ? 'In Stock' : 'Out of Stock';

    // Convert YouTube link to embed URL if exists
    let videoEmbed = "";
    if (p.video) {
      const videoId = p.video.split("v=")[1]?.split("&")[0] || "";
      if (videoId) {
        videoEmbed = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="margin-bottom:10px; border-radius:8px;"></iframe>`;
      }
    }

    html += `
      <div class="product" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px; position:relative;">
        <img src="${productImages[0]}" alt="${p.name}" style="width:100%; max-width:300px; display:block; margin-bottom:10px; border-radius:8px;">
        ${videoEmbed}
        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
        <p style="color:${stockColor};">${stockText}</p>
        <p style="font-size:14px;">${p.description || ""}</p>
        <button onclick="addToCart(${p.id})" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;

    // Add JSON-LD schema
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "sku": p.sku || "",
      "description": p.description || "",
      "image": productImages,
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

  container.innerHTML = html;
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

  // Product HTML
  container.innerHTML = `
    <div class="product-page" style="background:white; padding:20px; border-radius:12px;">
      <h2>${product.name}</h2>

      ${product.images?.length
        ? product.images.map(img => `<img src="${img}" width="200" style="margin:5px; border-radius:8px;">`).join("")
        : `<img src="${product.image}" width="200" style="margin:5px; border-radius:8px;">`
      }

      ${product.video ? `
        <div class="video" style="margin:10px 0;">
          <iframe width="100%" height="300" src="${product.video}" frameborder="0" allowfullscreen></iframe>
        </div>
      ` : ""}

      <p><strong>Price:</strong> KES ${product.price}</p>
      <p><strong>SKU:</strong> ${product.sku || "N/A"}</p>
      <p><strong>Stock:</strong> <span style="color:${product.stock > 0 ? 'green':'red'};">${product.stock > 0 ? 'In Stock':'Out of Stock'}</span></p>

      <p>${product.description || ""}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>

      ${product.faq?.length ? `
        <h3>FAQs</h3>
        ${product.faq.map(f => `<p><strong>${f.question}</strong><br>${f.answer}</p>`).join("")}
      ` : ""}
    </div>
  `;

  // Schema.org structured data
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.sku || "",
    "description": product.description || "",
    "image": product.images || [product.image],
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
// ADVANCED CART (IMAGE + QUANTITY)
// ======================

// Add a product to the cart
function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProducts().find(p => p.id == productId);
  if (!product) return alert("Product not found!");

  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  displayCart("cartContainer");
  updateCartCount();
}

// Display cart contents
function displayCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = `<p style="text-align:center;">Your cart is empty 🛒</p>`;
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    container.innerHTML += `
      <div style="display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #ddd;">
        <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
        <div style="flex:1;">
          <strong>${item.name}</strong><br>
          KES ${item.price} × ${item.quantity} = <b>KES ${itemTotal}</b>
        </div>
        <div>
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <button onclick="updateQuantity(${index}, 1)">+</button>
          <button onclick="removeFromCart(${index})" style="background:red; color:white;">X</button>
        </div>
      </div>
    `;
  });

  container.innerHTML += `
    <h3>Total: KES ${total}</h3>
    <button onclick="checkoutWhatsApp()" style="background:#25D366; color:white; padding:10px; border:none;">
      Checkout via WhatsApp
    </button>
  `;
}

// Update item quantity
function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);

  saveCart(cart);
  displayCart("cartContainer");
  updateCartCount();
}

// Remove item from cart
function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);

  saveCart(cart);
  displayCart("cartContainer");
  updateCartCount();
}

// Checkout via WhatsApp
function checkoutWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) return alert("Your cart is empty!");

  let total = 0;
  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `- ${item.name} × ${item.quantity} (KES ${itemTotal})%0A`;
  });

  message += `%0ATotal: KES ${total}%0A`;
  const url = `https://wa.me/254710346425?text=${message}`;
  window.open(url, "_blank");
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Initialize cart display on page load
document.addEventListener("DOMContentLoaded", () => {
  displayCart("cartContainer");
  updateCartCount();
});

// ======================
// WHATSAPP CHECKOUT
// ======================
function checkoutWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) return alert("Your cart is empty!");

  let total = 0;
  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";

  cart.forEach(item => {
    const itemTotal = item.price * (item.quantity || 1); // include quantity if available
    total += itemTotal;
    message += `- ${item.name} × ${item.quantity || 1} (KES ${itemTotal})%0A`;
  });

  message += `%0ATotal: KES ${total}%0A%0APlease guide me on payment and delivery.`;

  const phoneNumber = "254710346425"; // DK World Kenya number
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(url, "_blank");
}

// ======================
// ADD PRODUCT FROM FORM
// ======================
function addProductFromForm() {
  const product = {
    name: document.getElementById("name").value.trim(),
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value.trim(),
    images: document.getElementById("images").value
              .split(",")
              .map(img => img.trim())
              .filter(Boolean),
    video: document.getElementById("video").value.trim(),
    sku: document.getElementById("sku").value.trim(),
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value.trim(),
    description: document.getElementById("description").value.trim(),
    faq: [
      {
        question: document.getElementById("faqQ1").value.trim(),
        answer: document.getElementById("faqA1").value.trim()
      },
      {
        question: document.getElementById("faqQ2").value.trim(),
        answer: document.getElementById("faqA2").value.trim()
      }
    ]
  };

  addProduct(product);
}

// ======================
// ADMIN PRODUCT MANAGEMENT
// ======================

function displayAdminProducts() {
  const container = document.getElementById("existingProducts");
  if (!container) return;

  const products = getProducts();
  container.innerHTML = "";

  products.forEach(product => {
    container.innerHTML += `
      <div class="product-admin" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px;">
        <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">

          <!-- IMAGE -->
          <img src="${product.images?.[0] || product.image}" 
               style="width:80px; height:80px; object-fit:cover; border-radius:8px;">

          <!-- VIDEO -->
          ${product.video ? `
            <iframe width="120" height="80"
                    src="${convertToEmbedURL(product.video)}"
                    frameborder="0" allowfullscreen>
            </iframe>
          ` : ""}

          <!-- DETAILS -->
          <div style="flex:1;">
            <h3>${product.name}</h3>
            <p><strong>KES ${product.price}</strong></p>
            <p>SKU: ${product.sku || "N/A"}</p>
            <p>Stock: ${product.stock}</p>
          </div>

          <!-- ACTION BUTTONS -->
          <div>
            <button onclick="editProduct(${product.id})">Edit</button>
            <button onclick="deleteProduct(${product.id})" style="background-color:#EF4444; color:white;">Delete</button>
          </div>

        </div>
      </div>
    `;
  });
}

// Delete a product
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  alert("Product deleted!");
  displayAdminProducts();
}

// Edit a product
function editProduct(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return alert("Product not found!");

  // Prefill form
  [
    ["name", product.name],
    ["price", product.price],
    ["image", product.image],
    ["images", product.images?.join(",") || ""],
    ["video", product.video || ""],
    ["sku", product.sku],
    ["stock", product.stock],
    ["category", product.category],
    ["description", product.description || ""],
    ["faqQ1", product.faq?.[0]?.question || ""],
    ["faqA1", product.faq?.[0]?.answer || ""],
    ["faqQ2", product.faq?.[1]?.question || ""],
    ["faqA2", product.faq?.[1]?.answer || ""]
  ].forEach(([id, value]) => document.getElementById(id).value = value);

  // Override Add button
  const addBtn = document.querySelector("button[onclick='addProductFromForm()']");
  addBtn.textContent = "Update Product";
  addBtn.onclick = () => updateProductFromForm(id);
}

// Update product
function updateProductFromForm(id) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return alert("Product not found!");

  products[index] = {
    ...products[index],
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value,
    images: document.getElementById("images").value.split(",").map(i => i.trim()).filter(Boolean),
    video: document.getElementById("video").value,
    sku: document.getElementById("sku").value,
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    faq: [
      { question: document.getElementById("faqQ1").value, answer: document.getElementById("faqA1").value },
      { question: document.getElementById("faqQ2").value, answer: document.getElementById("faqA2").value }
    ]
  };

  saveProducts(products);
  alert("Product updated!");
  resetForm();
  displayAdminProducts();
}

// Reset form
function resetForm() {
  [
    "name","price","image","images","video","sku","stock","category","description",
    "faqQ1","faqA1","faqQ2","faqA2"
  ].forEach(id => {
    document.getElementById(id).value = id === "category" ? "Websites" : "";
  });

  const addBtn = document.querySelector("button[onclick]");
  addBtn.textContent = "Add Product";
  addBtn.setAttribute("onclick", "addProductFromForm()");
}

// Initialize
document.addEventListener("DOMContentLoaded", displayAdminProducts);
  


// ======================
// PRODUCT FILTERS
// ======================
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function filterAndDisplayProducts() {
  const allProducts = getProducts();
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchText) || (p.description || "").toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  displayProductsFiltered("productsContainer", filtered);
}

// New display function that accepts filtered products
function displayProductsFiltered(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="product">
        <img src="${p.images?.[0] || p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
        <p style="color: ${p.stock > 0 ? 'green' : 'red'};">
          ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>
        <p style="font-size: 14px;">${p.description || ""}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;
  });
}

// Event listeners
searchInput.addEventListener("input", filterAndDisplayProducts);
categoryFilter.addEventListener("change", filterAndDisplayProducts);

// Optional: show all products on page load using filter function
document.addEventListener("DOMContentLoaded", filterAndDisplayProducts);

// ======================
// FILTER & SEARCH
// ======================
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const clearFiltersBtn = document.getElementById("clearFilters");
const productsContainer = document.getElementById("productsContainer");

function filterAndDisplayProducts() {
  if (!productsContainer) return;

  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = getProducts().filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                          (p.description || "").toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  productsContainer.innerHTML = filtered.map(p => `
    <div class="product" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px; position:relative;">
      <img src="${p.images?.[0] || p.image}" alt="${p.name}" style="width:100%; max-width:300px; display:block; margin-bottom:10px; border-radius:8px;">
      ${p.video ? `<iframe width="100%" height="200" src="${convertToEmbedURL(p.video)}" frameborder="0" allowfullscreen style="margin-bottom:10px; border-radius:8px;"></iframe>` : ""}
      <h3>${p.name}</h3>
      <p><strong>KES ${p.price}</strong></p>
      <p style="color:${p.stock > 0 ? 'green' : 'red'};">${p.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
      <p>${p.description || ""}</p>
      <button onclick="addToCart(${p.id})" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
      <br><br>
      <a href="product.html?id=${p.id}">View</a>
    </div>
  `).join("");
}

// Event listeners
searchInput?.addEventListener("input", filterAndDisplayProducts);
categoryFilter?.addEventListener("change", filterAndDisplayProducts);
clearFiltersBtn?.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  filterAndDisplayProducts();
});

// ======================
// CART MANAGEMENT
// ======================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = total;
}

function displayCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    container.innerHTML = `<p class="empty">Your cart is empty.</p>`;
    updateCartCount();
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, index) => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <img src="${item.image || item.images?.[0]}" alt="${item.name}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>KES ${item.price} × ${item.quantity} = KES ${item.price * item.quantity}</p>
        </div>
        <div class="cart-actions">
          <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML += `
    <div class="total">Total: KES ${total}</div>
    <button class="checkout-btn" onclick="checkoutWhatsApp()">Checkout via WhatsApp</button>
  `;

  updateCartCount();
}

function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart("cartContainer");
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart("cartContainer");
}

// ======================
// WHATSAPP CHECKOUT
// ======================
function checkoutWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) return showToast("Your cart is empty!");

  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";
  const total = cart.reduce((sum, item) => {
    message += `- ${item.name} × ${item.quantity} (KES ${item.price * item.quantity})%0A`;
    return sum + item.price * item.quantity;
  }, 0);

  message += `%0ATotal: KES ${total}%0A%0APlease guide me on payment and delivery.`;
  const phoneNumber = "254710346425";
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}

// ======================
// TOAST NOTIFICATIONS
// ======================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.innerText = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#000",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "5px",
    zIndex: 1000
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ======================
// INITIALIZE
// ======================
document.addEventListener("DOMContentLoaded", () => {
  filterAndDisplayProducts();
  updateCartCount();
});

